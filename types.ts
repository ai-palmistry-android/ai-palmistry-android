export type Language = 'en' | 'hi';

export interface HandTypeAnalysis {
  elementEn: string;
  elementHi: string;
  dominantMountEn: string;
  dominantMountHi: string;
  overallTemperamentEn: string;
  overallTemperamentHi: string;
}

export interface LoveReading {
  titleEn: string;
  titleHi: string;
  heartLineAnalysisEn: string;
  heartLineAnalysisHi: string;
  relationshipOutlookEn: string;
  relationshipOutlookHi: string;
  compatibilityScore: number;
  keyAdviceEn: string;
  keyAdviceHi: string;
}

export interface CareerReading {
  titleEn: string;
  titleHi: string;
  headLineAnalysisEn: string;
  headLineAnalysisHi: string;
  fateLineAnalysisEn: string;
  fateLineAnalysisHi: string;
  wealthPotentialEn: string;
  wealthPotentialHi: string;
  favorableCareersEn: string[];
  favorableCareersHi: string[];
  financialScore: number;
}

export interface LifeReading {
  titleEn: string;
  titleHi: string;
  lifeLineAnalysisEn: string;
  lifeLineAnalysisHi: string;
  vitalityAndHealthEn: string;
  vitalityAndHealthHi: string;
  lifeLessonsEn: string;
  lifeLessonsHi: string;
  vitalityScore: number;
}

export interface LuckyElements {
  luckyColorEn: string;
  luckyColorHi: string;
  luckyGemstoneEn: string;
  luckyGemstoneHi: string;
  luckyNumber: number;
  luckyDirectionEn: string;
  luckyDirectionHi: string;
  bestDayEn: string;
  bestDayHi: string;
}

export interface SpiritualGuidance {
  vedicRemedyEn: string;
  vedicRemedyHi: string;
  dailyAffirmationEn: string;
  dailyAffirmationHi: string;
}

export interface PalmAnalysis {
  handType: HandTypeAnalysis;
  loveReading: LoveReading;
  careerReading: CareerReading;
  lifeReading: LifeReading;
  luckyElements: LuckyElements;
  spiritualGuidance: SpiritualGuidance;
}

export interface PalmReadingRecord {
  id: string;
  createdAt: string;
  thumbnail: string;
  handUsed: 'left' | 'right';
  analysis: PalmAnalysis;
  notes?: string;
  seekerName?: string;
}

export interface PaymentDetails {
  txnId: string;
  planId: 'monthly' | 'yearly';
  amount: number;
  currency: 'INR';
  merchantUpiId: string;
  merchantName: string;
  upiUri: string;
  status: 'PAYMENT_PENDING' | 'VERIFICATION_PENDING' | 'VERIFIED' | 'FAILED';
  utr?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  dob?: string;
  gender?: string;
  isPremium: boolean;
  isGuest: boolean;
  registeredAt: string;
  pendingPayment?: PaymentDetails | null;
}

export type ActiveTab = 'home' | 'reading' | 'history' | 'premium' | 'profile';

