/**
 * TapGate / TrustTap - Smart Keyword Review Sentence Generator
 *
 * Generates natural, high-converting Google Review sentences with target keywords injected
 * in English, Tanglish (Tamil in English), Tamil, Hindi/Hinglish, Telugu, and Kannada.
 * Features a non-repeating mathematical permutation engine to protect against Google duplicate review penalties.
 */

export type SupportedLanguage = "EN" | "TANGLISH" | "TA" | "HI" | "TE" | "KN";

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  sample: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: "EN",
    name: "English",
    nativeName: "English",
    flag: "🌐",
    sample: "Visited today and had a wonderful experience! The food was top-notch.",
  },
  {
    code: "TANGLISH",
    name: "Tanglish",
    nativeName: "Tanglish (Tamil)",
    flag: "🌴",
    sample: "Semma experience! Taste vera level, quick service and clean ambience.",
  },
  {
    code: "TA",
    name: "Tamil",
    nativeName: "தமிழ்",
    flag: "🇮🇳",
    sample: "மிகவும் அருமையான உணவகம்! சுவை மற்றும் தரம் மிக அற்புதம்.",
  },
  {
    code: "HI",
    name: "Hindi / Hinglish",
    nativeName: "हिन्दी / Hinglish",
    flag: "🇮🇳",
    sample: "Bahut hi shandar experience raha! Service aur quality ekdam lajawab tha.",
  },
  {
    code: "TE",
    name: "Telugu",
    nativeName: "తెలుగు",
    flag: "🇮🇳",
    sample: "చాలా అద్భుతమైన అనుభవం! రుచి మరియు నాణ్యత సూపర్.",
  },
  {
    code: "KN",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    flag: "🇮🇳",
    sample: "ತುಂಬಾ ಅದ್ಭುತವಾದ ಅನುಭವ! ಗುಣಮಟ್ಟ ಮತ್ತು ಸೇವೆ ಅತ್ಯುತ್ತಮವಾಗಿದೆ.",
  },
];

// ─── Default Industry Keywords ──────────────────────────────────────

export const INDUSTRY_KEYWORD_PRESETS: Record<string, string[]> = {
  "Restaurant & Café": [
    "crispy dosa",
    "authentic filter coffee",
    "quick table service",
    "clean dining area",
    "delicious biryani",
    "pocket-friendly prices",
    "fresh quality ingredients",
    "cozy ambience",
    "friendly staff",
    "family friendly",
  ],
  "Salon & Spa": [
    "professional haircut",
    "relaxing head massage",
    "hygienic salon",
    "skilled hair stylist",
    "soothing facial service",
    "friendly reception",
    "affordable bridal package",
    "modern aesthetic vibe",
  ],
  "Healthcare & Dental Clinic": [
    "painless root canal",
    "gentle dentist",
    "hygienic dental clinic",
    "friendly doctor",
    "quick appointment slot",
    "clear explanation of diagnosis",
    "affordable treatment charges",
    "modern medical equipment",
  ],
  "Automobile & Repair Service": [
    "transparent pricing",
    "quick car water wash",
    "experienced mechanic",
    "genuine spare parts",
    "punctual delivery",
    "clean customer lounge",
    "detailed vehicle inspection",
    "superb AC repair service",
  ],
  "Gym & Fitness Studio": [
    "clean modern gym",
    "certified personal trainer",
    "latest workout equipment",
    "energetic atmosphere",
    "customized diet guidance",
    "spacious locker rooms",
    "friendly gym community",
  ],
  "Drug Store & Pharmacy": [
    "all medicines in stock",
    "helpful pharmacist",
    "quick doorstep delivery",
    "discounted healthcare products",
    "clean store layout",
    "genuine medicine guaranteed",
  ],
  "General Store & Supermarket": [
    "fresh organic vegetables",
    "fast checkout counter",
    "neatly organized aisles",
    "reasonable wholesale rates",
    "wide variety of groceries",
    "courteous store team",
  ],
  "Bakery & Desserts": [
    "freshly baked cakes",
    "soft artisan pastries",
    "delicious custom birthday cake",
    "clean pastry counter",
    "melt in mouth desserts",
    "hygienic packaging",
  ],
  default: [
    "quick customer service",
    "friendly staff",
    "peaceful clean ambience",
    "great value for money",
    "top quality service",
    "highly reliable team",
    "prompt response",
    "smooth hassle-free experience",
  ],
};

// ─── Grammatical Slot Banks ──────────────────────────────────────────

interface LanguageSlots {
  openings: string[];
  keywordPraise: (keyword: string) => string[];
  staffAmbience: string[];
  closers: string[];
  shortPunch: (keyword: string) => string[];
}

const LANGUAGE_GRAMMAR: Record<SupportedLanguage, LanguageSlots> = {
  EN: {
    openings: [
      "Visited today and had an absolutely wonderful experience!",
      "One of the best places I have visited recently!",
      "Had a fantastic time here today!",
      "Really impressed with the quality and hospitality here.",
      "A truly delightful experience from start to finish!",
      "Outstanding service and great overall vibe!",
      "Had an exceptional experience here with family.",
      "Hands down one of my favorite spots in the area!",
      "Super happy with our visit today!",
      "Top-tier service and welcoming environment!",
    ],
    keywordPraise: (k) => [
      `The ${k} was genuinely top-notch and exceeded my expectations.`,
      `Loved their ${k}, you can clearly tell they care about high quality.`,
      `Special mention to the ${k} — absolutely loved it!`,
      `Their ${k} is definitely a must-try for anyone visiting.`,
      `Really appreciated how well they delivered on the ${k}.`,
      `The ${k} alone is worth visiting for!`,
    ],
    staffAmbience: [
      "Service was lightning fast and the staff was extremely courteous.",
      "The ambience is clean, welcoming, and very well maintained.",
      "Prompt service with great attention to hygiene and cleanliness.",
      "The entire team was very polite, attentive, and helpful.",
      "Great pricing and wonderful atmosphere throughout.",
      "Quick response time and a completely hassle-free process.",
    ],
    closers: [
      "Will definitely be returning again soon! 5 stars all the way.",
      "Highly recommended to everyone, keep up the fantastic work!",
      "10/10 experience! A well-deserved 5-star rating.",
      "Would gladly recommend this place to all my friends and family.",
      "Definitely coming back. Thank you for such wonderful hospitality!",
      "Can't wait to visit again. Truly a 5-star standard!",
    ],
    shortPunch: (k) => [
      `Awesome experience! Loved the ${k} and prompt service. 5/5 stars!`,
      `Top-notch ${k} and very friendly team. Highly recommended!`,
      `Superb quality! The ${k} is fantastic. Will visit again!`,
      `Clean, quick, and the ${k} was spot on. 5 stars!`,
    ],
  },

  TANGLISH: {
    openings: [
      "Semma experience innaiku visit pannapo!",
      "Romba nalla experience! One of the best spots around.",
      "Visited today with friends, absolutely loved the place!",
      "Really satisfied with their quality and hospitality.",
      "Superb experience overall, full marks to the team!",
      "Innaiku visit pannom, expectations-ah vida semmaya irundhuchu!",
      "Best place in town! Great vibe and nice service.",
      "Vera level experience! Definitely loved coming here.",
    ],
    keywordPraise: (k) => [
      `${k} taste vera level, romba nalla irundhuchu!`,
      `${k} kandippa must-try, quality simply superb.`,
      `Main-ah avanga ${k} semma fresh and satisfying ah irundhuchu.`,
      `Loved the ${k}, quality top-notch ah irukku.`,
      `${k} super quality, total value for money.`,
      `Avanga ${k} pathi sollave vendam, ultimate perfection!`,
    ],
    staffAmbience: [
      "Staff ellam romba polite and helpful ah irundhanga.",
      "Quick service and clean ambience, romba peaceful ah irukku.",
      "Service romba fast ah pannanga, neat and hygienic maintenance.",
      "Pocket-friendly price and very friendly customer service.",
      "Proper hygiene and super calm atmosphere.",
      "No waiting time, fast delivery and very courteous staff.",
    ],
    closers: [
      "Kandippa friends and family ku recommend pannuven! 5 Stars!",
      "Definitely marubadiyum varuvom! Semma place.",
      "10/10 must visit spot, highly recommend pannuren!",
      "Enoda full 5-star rating ivangalukku dhaan. Super work!",
      "Worth the visit, kandippa try panni paarunga!",
      "Loved everything here. Truly 5 stars!",
    ],
    shortPunch: (k) => [
      `Semma spot! ${k} vera level, quick service. Highly recommended!`,
      `Romba nalla experience. ${k} must try! Clean and polite staff.`,
      `${k} ultimate quality! 100% recommended to everyone.`,
      `Vera level ${k} and friendly service. 5 stars!`,
    ],
  },

  TA: {
    openings: [
      "இன்று இங்கு சென்றிருந்தோம், மிகவும் அருமையான அனுபவம்!",
      "சிறந்த தரம் மற்றும் கனிவான உபசரிப்பு!",
      "குடும்பத்துடன் வந்து மகிழ்ச்சியாக நேரத்தை செலவிட சிறந்த இடம்.",
      "மிகவும் திருப்திகரமான சேவை, மனமார்ந்த வாழ்த்துகள்!",
      "சுவையும் தரமும் மிகச் சிறப்பாக உள்ளது.",
    ],
    keywordPraise: (k) => [
      `${k} தரம் மற்றும் சுவை மிக அற்புதம்!`,
      `இவர்களின் ${k} உண்மையிலேயே தனித்துவமானது.`,
      `${k} கண்டிப்பாக அனைவரும் முயற்சி செய்து பார்க்க வேண்டும்.`,
      `${k} தரத்தில் எந்த சமரசமும் இல்லை, மிக நன்று.`,
    ],
    staffAmbience: [
      "ஊழியர்களின் கனிவான உபசரிப்பு மற்றும் விரைவான பணி.",
      "சுத்தமான சூழல் மற்றும் தூய்மையான பராமரிப்பு.",
      "நியாயமான கட்டணம் மற்றும் சிறந்த உபசரிப்பு.",
      "விரைவான சேவை மற்றும் அமைதியான சூழல்.",
    ],
    closers: [
      "கண்டிப்பாக அனைவருக்கும் பரிந்துரைக்கிறேன்! 5 நட்சத்திரங்கள்.",
      "மீண்டும் நிச்சயமாக வருவோம்! வாழ்த்துகள்.",
      "குடும்பத்துடன் வர மிகச் சிறந்த இடம். மிக நன்று!",
      "முழுமையான மனநிறைவு தரும் சேவை. நன்றி!",
    ],
    shortPunch: (k) => [
      `அருமையான அனுபவம்! ${k} மிக அற்புதம். 5 நட்சத்திரங்கள்!`,
      `சிறந்த தரம் மற்றும் கனிவான சேவை. ${k} மிக நன்று!`,
      `${k} சுவை அருமை, தூய்மையான சூழல். கண்டிப்பாக வரவும்!`,
    ],
  },

  HI: {
    openings: [
      "Bahut hi shandar experience raha aaj yahan aakar!",
      "One of the best places in this area, truly impressive!",
      "Aaj visit kiya aur service dekh kar dil khush ho gaya!",
      "Family ke saath aane ke liye sabse best jagah hai.",
      "Quality aur hospitality dono ekdam lajawab hain!",
    ],
    keywordPraise: (k) => [
      `${k} ka taste aur quality sach me kamaal ka hai!`,
      `${k} ekdam fresh aur delicious tha, must try!`,
      `Khaaskar inka ${k} bahut hi badhiya laga.`,
      `${k} ki quality dekh kar maza aa gaya.`,
    ],
    staffAmbience: [
      "Staff bahut cooperative, polite aur attentive hai.",
      "Fast service aur clean ambience ne dil jeet liya.",
      "Neat and clean atmosphere ke saath pocket-friendly rates hain.",
      "Quick response aur professional service mili yahan.",
    ],
    closers: [
      "Sabhi ko zaroor recommend karunga! Solid 5 Stars.",
      "Definite visit again! Shandar service ke liye dhanyawad.",
      "10/10 rating! Aise hi badhiya service dete rahiye.",
      "Mera 5 star review aapke naam, keep it up!",
    ],
    shortPunch: (k) => [
      `Zabardast experience! ${k} lajawab tha aur staff polite hai. 5 Stars!`,
      `Best quality ${k} aur super fast service. Highly recommended!`,
      `${k} sach me bahut tasty tha. Clean and great ambience!`,
    ],
  },

  TE: {
    openings: [
      "చాలా అద్భుతమైన అనుభవం!",
      "ఈ ఏరియాలో వన్ ఆఫ్ ది బెస్ట్ ప్లేస్, చాలా నచ్చింది!",
      "ఈరోజు ఇక్కడికి వెళ్ళాము, సర్వీస్ మరియు క్వాలిటీ సూపర్!",
      "ఫ్యామిలీతో కలిసి వెళ్ళడానికి చాలా మంచి ప్లేస్.",
    ],
    keywordPraise: (k) => [
      `${k} క్వాలిటీ మరియు రుచి ఎక్సలెంట్ గా ఉంది.`,
      `${k} ఖచ్చితంగా ట్రై చేయాల్సిన ఐటమ్.`,
      `ఇక్కడ ${k} చాలా ఫ్రెష్ అండ్ సూపర్ టేస్టీగా ఉంది.`,
    ],
    staffAmbience: [
      "స్టాఫ్ చాలా మర్యాదగా మరియు త్వరగా సర్వ్ చేశారు.",
      "క్లీన్ అండ్ పీస్ఫుల్ అంబియన్స్ చాలా బాగుంది.",
      "ఫాస్ట్ సర్వీస్ మరియు రీజనబుల్ ప్రైసెస్.",
    ],
    closers: [
      "అందరికీ తప్పకుండా రికమండ్ చేస్తాను! 5 స్టార్స్.",
      "ఖచ్చితంగా మళ్లీ వస్తాము, సూపర్బ్ సర్వీస్!",
      "10/10 రేటింగ్, చాలా సంతోషంగా ఉంది!",
    ],
    shortPunch: (k) => [
      `సూపర్ ఎక్స్‌పీరియన్స్! ${k} చాలా బాగుంది. 5 స్టార్స్!`,
      `మంచి క్వాలిటీ ${k} మరియు ఫాస్ట్ సర్వీస్. తప్పకుండా వెళ్ళండి!`,
    ],
  },

  KN: {
    openings: [
      "ತುಂಬಾ ಅದ್ಭುತವಾದ ಅನುಭವ!",
      "ಈ ಪ್ರದೇಶದ ಅತ್ಯುತ್ತಮ ತಾಣಗಳಲ್ಲಿ ಒಂದು, ತುಂಬಾ ಇಷ್ಟವಾಯಿತು!",
      "ಇಂದು ಭೇಟಿ ನೀಡಿದೆವು, ಸೇವೆ ಮತ್ತು ಗುಣಮಟ್ಟ ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ!",
      "ಕುಟುಂಬದೊಂದಿಗೆ ಭೇಟಿ ನೀಡಲು ಅತ್ಯುತ್ತಮ ಸ್ಥಳ.",
    ],
    keywordPraise: (k) => [
      `${k} ಗುಣಮಟ್ಟ ಮತ್ತು ರುಚಿ ಅದ್ಭುತವಾಗಿದೆ.`,
      `${k} ಖಂಡಿತವಾಗಿಯೂ ಟ್ರೈ ಮಾಡಬೇಕು, ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ.`,
      `ಇಲ್ಲಿನ ${k} ನಿಜವಾಗಿಯೂ ಅತ್ಯುನ್ನತ ಗುಣಮಟ್ಟದ್ದಾಗಿದೆ.`,
    ],
    staffAmbience: [
      "ಸಿಬ್ಬಂದಿ ತುಂಬಾ ವಿನಮ್ರರಾಗಿದ್ದಾರೆ ಮತ್ತು ಸೇವೆ ವೇಗವಾಗಿದೆ.",
      "ಸ್ವಚ್ಛ ಮತ್ತು ಉತ್ತಮ ವಾತಾವರಣ ಮನಸ್ಸಿಗೆ ನೆಮ್ಮದಿ ನೀಡಿತು.",
      "ಉತ್ತಮ ಬೆಲೆ ಮತ್ತು ಶ್ರೇಷ್ಠ ಗುಣಮಟ್ಟದ ಸೇವೆ.",
    ],
    closers: [
      "ಎಲ್ಲರಿಗೂ ಖಂಡಿತ ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ! 5 ನಕ್ಷತ್ರಗಳು.",
      "ಖಂಡಿತವಾಗಿಯೂ ಮತ್ತೆ ಬರುತ್ತೇವೆ. ಅಭಿನಂದನೆಗಳು!",
      "10/10 ರೇಟಿಂಗ್, ತುಂಬಾ ಸಂತೋಷವಾಯಿತು!",
    ],
    shortPunch: (k) => [
      `ಅದ್ಭುತ ಅನುಭವ! ${k} ಸೂಪರ್ ಆಗಿದೆ. 5 ನಕ್ಷತ್ರಗಳು!`,
      `ಉತ್ತಮ ಗುಣಮಟ್ಟದ ${k} ಮತ್ತು ವೇಗದ ಸೇವೆ. ಖಂಡಿತ ಭೇಟಿ ನೀಡಿ!`,
    ],
  },
};

// ─── Non-Repeating Combinatorial Generation Logic ────────────────────

export interface SentenceGeneratorOptions {
  keywords?: string[];
  businessType?: string | null;
  language?: SupportedLanguage;
  tone?: "CASUAL" | "ENTHUSIASTIC" | "SHORT" | "DETAILED";
  customSentences?: string[];
  count?: number;
  seedOffset?: number; // Mathematical offset for non-repeating permutation
}

/**
 * Clean and normalize a keyword input
 */
export function sanitizeKeywords(keywords: string[]): string[] {
  return keywords
    .map((k) => k.trim())
    .filter((k) => k.length > 0 && k.length <= 60);
}

/**
 * Returns suggested keywords for a given business category
 */
export function getKeywordPresetsForBusinessType(businessType?: string | null): string[] {
  if (!businessType) return INDUSTRY_KEYWORD_PRESETS["default"];
  return INDUSTRY_KEYWORD_PRESETS[businessType] || INDUSTRY_KEYWORD_PRESETS["default"];
}

/**
 * Generates an array of non-repeating review sentences for a given language.
 */
export function generateReviewSentences(options: SentenceGeneratorOptions): string[] {
  const language = options.language || "EN";
  const grammar = LANGUAGE_GRAMMAR[language] || LANGUAGE_GRAMMAR["EN"];
  const tone = options.tone || "CASUAL";
  const count = Math.max(1, Math.min(options.count || 5, 20));
  const seed = Math.abs(options.seedOffset || 0);

  // Collect available keywords (fallback to presets if empty)
  let userKeywords = sanitizeKeywords(options.keywords || []);
  if (userKeywords.length === 0) {
    userKeywords = getKeywordPresetsForBusinessType(options.businessType);
  }

  const results: string[] = [];
  const usedCombos = new Set<string>();

  // If user provided custom sentences, weave them into first positions
  const customList = (options.customSentences || []).filter((s) => s.trim().length > 0);
  if (customList.length > 0) {
    const customPick = customList[seed % customList.length];
    results.push(customPick.trim());
    usedCombos.add(customPick.trim());
  }

  const openingsLen = grammar.openings.length;
  const staffLen = grammar.staffAmbience.length;
  const closersLen = grammar.closers.length;
  const keywordsLen = userKeywords.length;

  // Use coprime numbers to create a pseudo-random Weyl cycle without consecutive collisions
  const STEP_A = 17;
  const STEP_B = 23;
  const STEP_C = 37;
  const STEP_D = 41;

  let attempt = 0;
  while (results.length < count && attempt < 100) {
    const idx = seed + attempt * STEP_A;
    attempt++;

    const kw = userKeywords[(idx * STEP_D) % keywordsLen];

    let sentence = "";

    if (tone === "SHORT") {
      const punchArr = grammar.shortPunch(kw);
      sentence = punchArr[idx % punchArr.length];
    } else if (tone === "DETAILED") {
      const op = grammar.openings[idx % openingsLen];
      const praise = grammar.keywordPraise(kw)[(idx * STEP_B) % grammar.keywordPraise(kw).length];
      const staff = grammar.staffAmbience[(idx * STEP_C) % staffLen];
      const close = grammar.closers[(idx * STEP_A) % closersLen];
      sentence = `${op} ${praise} ${staff} ${close}`;
    } else {
      // CASUAL & ENTHUSIASTIC standard formula
      const op = grammar.openings[idx % openingsLen];
      const praise = grammar.keywordPraise(kw)[(idx * STEP_B) % grammar.keywordPraise(kw).length];
      const secondPart =
        idx % 2 === 0
          ? grammar.staffAmbience[(idx * STEP_C) % staffLen]
          : grammar.closers[(idx * STEP_A) % closersLen];

      sentence = `${op} ${praise} ${secondPart}`;
    }

    if (!usedCombos.has(sentence)) {
      usedCombos.add(sentence);
      results.push(sentence);
    }
  }

  return results;
}

/**
 * Generates sentence sets for all enabled languages simultaneously.
 * Ideal for delivering multi-language payloads to the Gateway page in one go.
 */
export function generateMultiLanguageSentenceBundle(
  enabledLanguages: string[],
  options: Omit<SentenceGeneratorOptions, "language">
): Record<string, string[]> {
  const validLanguages = enabledLanguages.length > 0 ? enabledLanguages : ["EN", "TANGLISH", "TA"];
  const bundle: Record<string, string[]> = {};

  for (const lang of validLanguages) {
    const code = (lang.toUpperCase() as SupportedLanguage) || "EN";
    bundle[code] = generateReviewSentences({
      ...options,
      language: code,
      count: 6, // 6 non-repeating sentences ready for client-side shuffle
    });
  }

  return bundle;
}
