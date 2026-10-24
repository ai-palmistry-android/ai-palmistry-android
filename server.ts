import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Increase limit for high-resolution palm images
app.use(express.json({ limit: '35mb' }));

// Initialize Google GenAI if API key is present
const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');

const ai = hasApiKey
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// UPI Merchant Configuration
const envMerchantUpiId = process.env.MERCHANT_UPI_ID?.trim();
const rawMerchantId = envMerchantUpiId || 'supercha@ptaxis';
const MERCHANT_UPI_ID = rawMerchantId === 'aipalmistry@upi' ? 'supercha@ptaxis' : rawMerchantId;
const MERCHANT_NAME = (process.env.MERCHANT_NAME && process.env.MERCHANT_NAME !== 'supercha@ptaxis')
  ? process.env.MERCHANT_NAME
  : 'AI Palmistry';
const HAS_PAYMENT_GATEWAY = Boolean(process.env.RAZORPAY_KEY_ID || process.env.CASHFREE_APP_ID);

interface StoredPaymentTxn {
  txnId: string;
  userId: string;
  planId: 'monthly' | 'yearly';
  amount: number;
  currency: 'INR';
  merchantUpiId: string;
  merchantName: string;
  upiUri: string;
  status: 'PAYMENT_PENDING' | 'VERIFICATION_PENDING' | 'VERIFIED' | 'FAILED';
  utr?: string;
  createdAt: string;
  updatedAt: string;
}

const pendingTransactions = new Map<string, StoredPaymentTxn>();

// GET /.well-known/assetlinks.json - Digital Asset Links for Android TWA domain verification
app.get('/.well-known/assetlinks.json', (req, res) => {
  const assetLinksPath = path.join(__dirname, 'public', '.well-known', 'assetlinks.json');
  res.type('application/json').sendFile(assetLinksPath);
});

// GET /ai-palmistry-android-project.zip - Download complete Android Project ZIP archive
app.get('/ai-palmistry-android-project.zip', (req, res) => {
  const zipPath = path.join(__dirname, 'public', 'ai-palmistry-android-project.zip');
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="ai-palmistry-android-project.zip"');
  res.sendFile(zipPath);
});

// GET /api/status - Check if AI vision backend is active
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    aiConfigured: hasApiKey,
    model: 'gemini-3.8-flash',
    version: '1.0.0',
    service: 'AI Palmistry Vision Engine',
  });
});

// GET /api/payment/config - Return active UPI configuration & gateway status
app.get('/api/payment/config', (req, res) => {
  const isEnvPresent = Boolean(process.env.MERCHANT_UPI_ID);
  res.json({
    merchantUpiId: MERCHANT_UPI_ID,
    merchantName: MERCHANT_NAME,
    hasPaymentGateway: HAS_PAYMENT_GATEWAY,
    isEnvPresent: isEnvPresent,
    configError: !isEnvPresent
      ? 'The MERCHANT_UPI_ID environment variable is missing in server environment. Defaulting to supercha@ptaxis.'
      : null,
    plans: {
      monthly: { id: 'monthly', nameEn: 'Monthly Plan', nameHi: 'मासिक पास', amount: 199, currency: 'INR' },
      yearly: { id: 'yearly', nameEn: 'Lifetime Pass', nameHi: 'लाइफटाइम पास', amount: 999, currency: 'INR' },
    },
    setupInstructions: HAS_PAYMENT_GATEWAY
      ? null
      : 'Automated real-time webhook verification requires payment gateway credentials (e.g., Razorpay Key ID or Cashfree App ID). Currently running with direct UPI merchant payment and manual reference reconciliation. Transactions remain in Payment Pending status until verified.',
  });
});

// POST /api/payment/initiate-upi - Initiate UPI payment and generate valid UPI intent URI
app.post('/api/payment/initiate-upi', (req, res) => {
  try {
    const { planId, userId, userEmail } = req.body;
    const amount = planId === 'monthly' ? 199 : 999;
    const planName = planId === 'monthly' ? 'Monthly Pass (₹199)' : 'Lifetime Pass (₹999)';
    const txnId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const note = `AI Palmistry Gold Pass ${planId === 'monthly' ? 'Monthly' : 'Lifetime'}`;
    // Standard UPI specification URL
    const upiUri = `upi://pay?pa=${encodeURIComponent(MERCHANT_UPI_ID)}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}&tr=${encodeURIComponent(txnId)}`;

    const txn: StoredPaymentTxn = {
      txnId,
      userId: userId || 'guest',
      planId: planId === 'monthly' ? 'monthly' : 'yearly',
      amount,
      currency: 'INR',
      merchantUpiId: MERCHANT_UPI_ID,
      merchantName: MERCHANT_NAME,
      upiUri,
      status: 'PAYMENT_PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    pendingTransactions.set(txnId, txn);

    res.json({
      success: true,
      txnId,
      planId,
      planName,
      amount,
      currency: 'INR',
      merchantUpiId: MERCHANT_UPI_ID,
      merchantName: MERCHANT_NAME,
      upiUri,
      status: 'PAYMENT_PENDING',
      hasPaymentGateway: HAS_PAYMENT_GATEWAY,
    });
  } catch (err: any) {
    console.error('Error initiating UPI payment:', err);
    res.status(500).json({ error: 'UPI_INITIATION_FAILED', message: err.message });
  }
});

// POST /api/payment/submit-utr - Record user's 12-digit UTR reference
app.post('/api/payment/submit-utr', (req, res) => {
  try {
    const { txnId, utr, userId } = req.body;

    if (!txnId) {
      return res.status(400).json({ error: 'TXN_ID_REQUIRED', message: 'Transaction ID is required.' });
    }

    if (!utr || String(utr).trim().length < 6) {
      return res.status(400).json({ error: 'INVALID_UTR', message: 'Please provide a valid UPI reference number (UTR).' });
    }

    const existing = pendingTransactions.get(txnId);
    const updatedTxn: StoredPaymentTxn = existing
      ? {
          ...existing,
          utr: String(utr).trim(),
          status: 'PAYMENT_PENDING',
          updatedAt: new Date().toISOString(),
        }
      : {
          txnId,
          userId: userId || 'guest',
          planId: 'monthly',
          amount: 199,
          currency: 'INR',
          merchantUpiId: MERCHANT_UPI_ID,
          merchantName: MERCHANT_NAME,
          upiUri: '',
          status: 'PAYMENT_PENDING',
          utr: String(utr).trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

    pendingTransactions.set(txnId, updatedTxn);

    // CRITICAL: Under no circumstances activate VIP automatically here.
    // Status stays as PAYMENT_PENDING until verified by payment gateway.
    res.json({
      success: true,
      txnId,
      status: 'PAYMENT_PENDING',
      isVerified: false,
      utr: String(utr).trim(),
      amount: updatedTxn.amount,
      planId: updatedTxn.planId,
      message: 'UTR submitted successfully. Payment is in PAYMENT PENDING status awaiting merchant/gateway verification. Premium will not be activated until verified.',
      hasPaymentGateway: HAS_PAYMENT_GATEWAY,
    });
  } catch (err: any) {
    console.error('Error submitting UTR:', err);
    res.status(500).json({ error: 'UTR_SUBMIT_FAILED', message: err.message });
  }
});

// GET /api/payment/status/:txnId - Check status of a transaction
app.get('/api/payment/status/:txnId', (req, res) => {
  const txn = pendingTransactions.get(req.params.txnId);
  if (!txn) {
    return res.status(404).json({ error: 'TXN_NOT_FOUND', status: 'NOT_FOUND' });
  }

  res.json({
    txnId: txn.txnId,
    status: txn.status,
    isVerified: txn.status === 'VERIFIED',
    amount: txn.amount,
    planId: txn.planId,
    utr: txn.utr,
  });
});

// POST /api/payment/verify-merchant - Secure server-side verification by merchant/admin/gateway
app.post('/api/payment/verify-merchant', (req, res) => {
  const { txnId, secretKey, action } = req.body;
  const merchantSecret = process.env.MERCHANT_SECRET_KEY || 'supercha_secure_2026';

  if (!txnId) {
    return res.status(400).json({ error: 'TXN_ID_REQUIRED', message: 'Transaction ID is required.' });
  }

  // Verify authorization
  if (secretKey !== merchantSecret && process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'UNAUTHORIZED', message: 'Invalid merchant verification key.' });
  }

  const txn = pendingTransactions.get(txnId);
  if (!txn) {
    return res.status(404).json({ error: 'TXN_NOT_FOUND', message: 'Transaction not found.' });
  }

  if (action === 'reject') {
    txn.status = 'FAILED';
    txn.updatedAt = new Date().toISOString();
    return res.json({ success: true, txnId, status: 'FAILED', isVerified: false });
  }

  txn.status = 'VERIFIED';
  txn.updatedAt = new Date().toISOString();

  res.json({
    success: true,
    txnId,
    status: 'VERIFIED',
    isVerified: true,
    amount: txn.amount,
    planId: txn.planId,
    message: 'Transaction successfully verified on server. Premium access granted.',
  });
});


// POST /api/analyze-palm - Real AI Vision Analysis of Palm
app.post('/api/analyze-palm', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', userDetails } = req.body;

    if (!hasApiKey || !ai) {
      return res.status(503).json({
        error: 'AI_NOT_CONFIGURED',
        message: 'Gemini API key is not configured in environment variables. Please configure GEMINI_API_KEY in the Secrets panel to enable real-time palm vision analysis.',
      });
    }

    if (!imageBase64) {
      return res.status(400).json({
        error: 'IMAGE_REQUIRED',
        message: 'No palm image was provided for analysis.',
      });
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

    const userContext = userDetails
      ? `Person Details: Name: ${userDetails.name || 'Seeker'}, Gender: ${userDetails.gender || 'Not specified'}, Birth Date: ${userDetails.dob || 'Not specified'}.`
      : '';

    const systemInstruction = `You are a revered Vedic and modern Chirologist (हस्तरेखा शास्त्री / Palmistry Master) combined with advanced biometric visual analysis.
Your task is to analyze the uploaded palm photo with great reverence, psychological depth, cultural authenticity, and constructive positivity.

Analyze the visual characteristics in the image:
1. Heart Line (हृदय रेखा): Curve, depth, starting point, branches toward Jupiter mount, emotional depth, loyalty, relationship nature.
2. Head Line (मस्तिष्क रेखा): Length, slope towards Mount of Moon, clarity, intellect, mental resilience, creative vs practical thinking.
3. Life Line (जीवन रेखा): Arch around Venus mount, depth, vitality, lifestyle stamina, family roots, adaptability.
4. Fate / Saturn Line (भाग्य रेखा): Presence, continuity, career breakthroughs, financial trajectory.
5. Major Mounts: Mount of Venus (शुक्र पर्वत - passion & aesthetics), Mount of Jupiter (गुरु पर्वत - ambition & leadership), Mount of Sun (सूर्य पर्वत - fame & recognition), Mount of Moon (चंद्र पर्वत - intuition & travel).
6. Hand Shape & Element: Earth, Air, Fire, or Water hand.

CRITICAL REQUIREMENT:
Provide COMPLETE bilingual interpretations in both English and natural, dignified Hindi (हिंदी).
The tone should be inspiring, balanced, ethical, and mindful that palmistry is a mirror for self-growth and entertainment, not fatalistic fortune-telling.`;

    const promptText = `Please examine this palm image carefully and provide a comprehensive reading.
${userContext}
Identify the lines and mounts visible in the image and generate all sections with both English and Hindi text.`;

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType || 'image/jpeg',
      },
    };

    const textPart = { text: promptText };

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            handType: {
              type: Type.OBJECT,
              properties: {
                elementEn: { type: Type.STRING },
                elementHi: { type: Type.STRING },
                dominantMountEn: { type: Type.STRING },
                dominantMountHi: { type: Type.STRING },
                overallTemperamentEn: { type: Type.STRING },
                overallTemperamentHi: { type: Type.STRING },
              },
              required: ['elementEn', 'elementHi', 'dominantMountEn', 'dominantMountHi', 'overallTemperamentEn', 'overallTemperamentHi'],
            },
            loveReading: {
              type: Type.OBJECT,
              properties: {
                titleEn: { type: Type.STRING },
                titleHi: { type: Type.STRING },
                heartLineAnalysisEn: { type: Type.STRING },
                heartLineAnalysisHi: { type: Type.STRING },
                relationshipOutlookEn: { type: Type.STRING },
                relationshipOutlookHi: { type: Type.STRING },
                compatibilityScore: { type: Type.INTEGER },
                keyAdviceEn: { type: Type.STRING },
                keyAdviceHi: { type: Type.STRING },
              },
              required: ['titleEn', 'titleHi', 'heartLineAnalysisEn', 'heartLineAnalysisHi', 'relationshipOutlookEn', 'relationshipOutlookHi', 'compatibilityScore', 'keyAdviceEn', 'keyAdviceHi'],
            },
            careerReading: {
              type: Type.OBJECT,
              properties: {
                titleEn: { type: Type.STRING },
                titleHi: { type: Type.STRING },
                headLineAnalysisEn: { type: Type.STRING },
                headLineAnalysisHi: { type: Type.STRING },
                fateLineAnalysisEn: { type: Type.STRING },
                fateLineAnalysisHi: { type: Type.STRING },
                wealthPotentialEn: { type: Type.STRING },
                wealthPotentialHi: { type: Type.STRING },
                favorableCareersEn: { type: Type.ARRAY, items: { type: Type.STRING } },
                favorableCareersHi: { type: Type.ARRAY, items: { type: Type.STRING } },
                financialScore: { type: Type.INTEGER },
              },
              required: ['titleEn', 'titleHi', 'headLineAnalysisEn', 'headLineAnalysisHi', 'fateLineAnalysisEn', 'fateLineAnalysisHi', 'wealthPotentialEn', 'wealthPotentialHi', 'favorableCareersEn', 'favorableCareersHi', 'financialScore'],
            },
            lifeReading: {
              type: Type.OBJECT,
              properties: {
                titleEn: { type: Type.STRING },
                titleHi: { type: Type.STRING },
                lifeLineAnalysisEn: { type: Type.STRING },
                lifeLineAnalysisHi: { type: Type.STRING },
                vitalityAndHealthEn: { type: Type.STRING },
                vitalityAndHealthHi: { type: Type.STRING },
                lifeLessonsEn: { type: Type.STRING },
                lifeLessonsHi: { type: Type.STRING },
                vitalityScore: { type: Type.INTEGER },
              },
              required: ['titleEn', 'titleHi', 'lifeLineAnalysisEn', 'lifeLineAnalysisHi', 'vitalityAndHealthEn', 'vitalityAndHealthHi', 'lifeLessonsEn', 'lifeLessonsHi', 'vitalityScore'],
            },
            luckyElements: {
              type: Type.OBJECT,
              properties: {
                luckyColorEn: { type: Type.STRING },
                luckyColorHi: { type: Type.STRING },
                luckyGemstoneEn: { type: Type.STRING },
                luckyGemstoneHi: { type: Type.STRING },
                luckyNumber: { type: Type.INTEGER },
                luckyDirectionEn: { type: Type.STRING },
                luckyDirectionHi: { type: Type.STRING },
                bestDayEn: { type: Type.STRING },
                bestDayHi: { type: Type.STRING },
              },
              required: ['luckyColorEn', 'luckyColorHi', 'luckyGemstoneEn', 'luckyGemstoneHi', 'luckyNumber', 'luckyDirectionEn', 'luckyDirectionHi', 'bestDayEn', 'bestDayHi'],
            },
            spiritualGuidance: {
              type: Type.OBJECT,
              properties: {
                vedicRemedyEn: { type: Type.STRING },
                vedicRemedyHi: { type: Type.STRING },
                dailyAffirmationEn: { type: Type.STRING },
                dailyAffirmationHi: { type: Type.STRING },
              },
              required: ['vedicRemedyEn', 'vedicRemedyHi', 'dailyAffirmationEn', 'dailyAffirmationHi'],
            },
          },
          required: ['handType', 'loveReading', 'careerReading', 'lifeReading', 'luckyElements', 'spiritualGuidance'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      analysis: parsedData,
      analyzedAt: new Date().toISOString(),
      disclaimer: 'This palmistry reading is generated by AI vision for cultural insight, mindfulness, and entertainment purposes.',
    });
  } catch (error: any) {
    console.error('Error analyzing palm image:', error);
    return res.status(500).json({
      error: 'ANALYSIS_FAILED',
      message: error.message || 'Failed to analyze palm image. Please ensure the palm is clear and well-lit.',
    });
  }
});

// Vite middleware in dev; static file serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Palmistry server running on port ${PORT}`);
  });
}

startServer();
