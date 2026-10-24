/**
 * Generates a clean high-resolution palm illustration data URL for test scans.
 */
export const SAMPLE_PALM_IMAGE_DATA_URL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="%231a1a24" />
      <stop offset="100%" stop-color="%230b0b0e" />
    </radialGradient>
    <radialGradient id="palmSkin" cx="48%" cy="55%" r="50%">
      <stop offset="0%" stop-color="%23e8c39e" />
      <stop offset="60%" stop-color="%23d4a373" />
      <stop offset="100%" stop-color="%23b07d50" />
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <rect width="600" height="800" fill="url(%23bgGrad)" />

  <!-- Constellation circles -->
  <circle cx="300" cy="400" r="280" fill="none" stroke="%23d4af37" stroke-width="1" stroke-dasharray="4,8" opacity="0.3" />
  <circle cx="300" cy="400" r="240" fill="none" stroke="%23d4af37" stroke-width="0.5" opacity="0.2" />

  <!-- Hand Contour Silhouette -->
  <!-- Wrist -->
  <path d="M 210 760 C 210 700 215 650 200 600
           C 160 560 110 500 120 420
           C 125 380 150 350 185 365
           C 205 375 220 410 230 450
           C 225 350 220 250 235 190
           C 245 150 275 150 285 190
           C 295 240 295 330 295 360
           C 305 280 320 160 340 120
           C 355 80 385 85 395 125
           C 410 180 400 300 395 370
           C 410 300 425 210 445 175
           C 460 145 485 155 490 195
           C 495 250 475 360 465 410
           C 485 370 505 320 525 310
           C 545 300 560 320 550 350
           C 535 400 500 530 460 620
           C 435 670 410 720 390 760
           Z"
        fill="url(%23palmSkin)"
        stroke="%238a5327"
        stroke-width="3" />

  <!-- Mount of Venus -->
  <ellipse cx="230" cy="560" rx="45" ry="60" fill="%23d4af37" opacity="0.15" />
  <text x="230" y="565" fill="%23ffffff" font-family="sans-serif" font-size="11" text-anchor="middle" opacity="0.8">शुक्र पर्वत (Venus)</text>

  <!-- Mount of Jupiter -->
  <circle cx="270" cy="380" r="28" fill="%23d4af37" opacity="0.15" />
  <text x="270" y="383" fill="%23ffffff" font-family="sans-serif" font-size="11" text-anchor="middle" opacity="0.8">गुरु (Jupiter)</text>

  <!-- Mount of Saturn -->
  <circle cx="345" cy="370" r="26" fill="%23d4af37" opacity="0.15" />
  <text x="345" y="373" fill="%23ffffff" font-family="sans-serif" font-size="11" text-anchor="middle" opacity="0.8">शनि (Saturn)</text>

  <!-- Mount of Sun -->
  <circle cx="420" cy="380" r="26" fill="%23d4af37" opacity="0.15" />
  <text x="420" y="383" fill="%23ffffff" font-family="sans-serif" font-size="11" text-anchor="middle" opacity="0.8">सूर्य (Sun)</text>

  <!-- Mount of Mercury -->
  <circle cx="480" cy="420" r="24" fill="%23d4af37" opacity="0.15" />
  <text x="480" y="423" fill="%23ffffff" font-family="sans-serif" font-size="11" text-anchor="middle" opacity="0.8">बुध (Mercury)</text>

  <!-- Mount of Moon -->
  <ellipse cx="440" cy="580" rx="40" ry="55" fill="%23d4af37" opacity="0.15" />
  <text x="440" y="585" fill="%23ffffff" font-family="sans-serif" font-size="11" text-anchor="middle" opacity="0.8">चन्द्र (Moon)</text>

  <!-- Heart Line (हृदय रेखा) - Red/Crimson curve -->
  <path d="M 500 450 C 450 455 380 435 340 420 C 310 405 280 390 260 380"
        fill="none" stroke="%23ff4d6d" stroke-width="4.5" stroke-linecap="round" filter="url(%23glow)" />
  <text x="410" y="435" fill="%23ff99aa" font-family="sans-serif" font-weight="bold" font-size="13">Heart Line / हृदय रेखा</text>

  <!-- Head Line (मस्तिष्क रेखा) - Cyan/Teal curve -->
  <path d="M 230 460 C 270 470 330 480 380 500 C 420 520 450 550 470 580"
        fill="none" stroke="%2300f5d4" stroke-width="4.5" stroke-linecap="round" filter="url(%23glow)" />
  <text x="360" y="490" fill="%2370fff0" font-family="sans-serif" font-weight="bold" font-size="13">Head Line / मस्तिष्क रेखा</text>

  <!-- Life Line (जीवन रेखा) - Gold curve looping around Venus -->
  <path d="M 230 460 C 255 490 280 530 280 580 C 280 640 260 690 230 720"
        fill="none" stroke="%23ffd166" stroke-width="5" stroke-linecap="round" filter="url(%23glow)" />
  <text x="210" y="660" fill="%23ffe599" font-family="sans-serif" font-weight="bold" font-size="13">Life Line / जीवन रेखा</text>

  <!-- Fate / Saturn Line (भाग्य रेखा) - Purple/Amethyst line ascending -->
  <path d="M 330 700 C 335 640 340 540 345 440 C 347 400 350 380 350 370"
        fill="none" stroke="%23b5179e" stroke-width="4" stroke-dasharray="2,1" stroke-linecap="round" filter="url(%23glow)" />
  <text x="360" y="620" fill="%23f72585" font-family="sans-serif" font-weight="bold" font-size="13">Fate Line / भाग्य रेखा</text>

  <!-- Sun Line (सूर्य रेखा) -->
  <path d="M 425 540 C 425 490 425 440 425 390"
        fill="none" stroke="%23ffbe0b" stroke-width="3" stroke-linecap="round" opacity="0.8" />
</svg>`;
