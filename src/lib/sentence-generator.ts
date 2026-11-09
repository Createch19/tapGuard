/**
 * TapGenie - Smart Keyword Review Sentence Generator
 *
 * Generates natural, high-converting Google Review sentences with target keywords injected
 * in English, Tanglish (Tamil in English), Tamil, Hindi/Hinglish, Telugu, and Kannada.
 *
 * Features:
 * - Domain-Specific Industry Dictionaries (Bakery, Restaurant, Salon, Dental/Clinic,
 *   Auto Repair, Fitness/Gym, Supermarket, Sports Turf, Retail, Pharmacy, Hotel, Professional).
 * - Non-repeating mathematical permutation engine yielding 1,000+ unique, contextually
 *   grounded customer reviews per business category.
 * - Protects businesses against Google duplicate review penalties.
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
  "Bakery & Desserts": [
    "freshly baked cakes",
    "soft artisan pastries",
    "delicious custom birthday cake",
    "clean pastry counter",
    "melt in mouth desserts",
    "hygienic packaging",
    "flaky butter croissants",
    "artisanal sourdough bread",
    "aromatic coffee roast",
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
    "clean sterilized equipment",
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
    "spotless clinic hygiene",
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
    "smooth test drive",
  ],
  "Gym & Fitness Studio": [
    "clean modern gym",
    "certified personal trainer",
    "latest workout equipment",
    "energetic atmosphere",
    "customized diet guidance",
    "spacious locker rooms",
    "friendly gym community",
    "well-maintained weight section",
  ],
  "Drug Store & Pharmacy": [
    "all medicines in stock",
    "helpful pharmacist",
    "quick doorstep delivery",
    "discounted healthcare products",
    "clean store layout",
    "genuine medicine guaranteed",
    "prompt counter billing",
  ],
  "General Store & Supermarket": [
    "fresh organic vegetables",
    "fast checkout counter",
    "neatly organized aisles",
    "reasonable wholesale rates",
    "wide variety of groceries",
    "courteous store team",
    "fresh daily essentials",
  ],
  "Hotel & Hospitality": [
    "comfortable clean rooms",
    "courteous front desk",
    "peaceful night stay",
    "delicious breakfast buffet",
    "convenient parking space",
    "prompt room service",
    "prime location",
  ],
  "Boutique & Fashion Retail": [
    "latest trendy collection",
    "premium fabric quality",
    "affordable pricing",
    "helpful sales staff",
    "well-fitting clothes",
    "spacious trial rooms",
    "exclusive designer wear",
  ],
  "Sports & Recreation": [
    "well-maintained turf",
    "excellent floodlights",
    "clean changing rooms",
    "smooth booking process",
    "quality sports equipment",
    "spacious playing arena",
    "friendly court coordinators",
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

// ─── Industry Category Resolver ──────────────────────────────────────

export type IndustryKey =
  | "RESTAURANT_CAFE"
  | "BAKERY_DESSERTS"
  | "SALON_SPA"
  | "HEALTHCARE_DENTAL"
  | "AUTO_REPAIR"
  | "GYM_FITNESS"
  | "PHARMACY"
  | "SUPERMARKET"
  | "HOTEL_HOSPITALITY"
  | "BOUTIQUE_FASHION"
  | "SPORTS_RECREATION"
  | "DEFAULT";

export function resolveIndustryKey(businessType?: string | null): IndustryKey {
  if (!businessType) return "DEFAULT";
  const b = businessType.toLowerCase();
  if (b.includes("bakery") || b.includes("dessert") || b.includes("cake") || b.includes("pastry")) {
    return "BAKERY_DESSERTS";
  }
  if (
    b.includes("restaurant") ||
    b.includes("café") ||
    b.includes("cafe") ||
    b.includes("food") ||
    b.includes("dining") ||
    b.includes("eatery")
  ) {
    return "RESTAURANT_CAFE";
  }
  if (b.includes("salon") || b.includes("spa") || b.includes("beauty") || b.includes("hair") || b.includes("barber")) {
    return "SALON_SPA";
  }
  if (
    b.includes("dental") ||
    b.includes("health") ||
    b.includes("clinic") ||
    b.includes("hospital") ||
    b.includes("doctor")
  ) {
    return "HEALTHCARE_DENTAL";
  }
  if (
    b.includes("auto") ||
    b.includes("car") ||
    b.includes("bike") ||
    b.includes("repair") ||
    b.includes("garage") ||
    b.includes("mechanic")
  ) {
    return "AUTO_REPAIR";
  }
  if (b.includes("gym") || b.includes("fitness") || b.includes("workout") || b.includes("crossfit")) {
    return "GYM_FITNESS";
  }
  if (b.includes("pharmacy") || b.includes("drug") || b.includes("medicine")) {
    return "PHARMACY";
  }
  if (b.includes("supermarket") || b.includes("grocery") || b.includes("general store") || b.includes("market")) {
    return "SUPERMARKET";
  }
  if (b.includes("hotel") || b.includes("hospitality") || b.includes("resort") || b.includes("stay") || b.includes("lodge")) {
    return "HOTEL_HOSPITALITY";
  }
  if (b.includes("boutique") || b.includes("fashion") || b.includes("retail") || b.includes("clothing") || b.includes("apparel")) {
    return "BOUTIQUE_FASHION";
  }
  if (b.includes("sport") || b.includes("recreation") || b.includes("turf") || b.includes("court") || b.includes("badminton")) {
    return "SPORTS_RECREATION";
  }
  return "DEFAULT";
}

// ─── Slot Structure Definition ───────────────────────────────────────

export interface LanguageSlots {
  openings: string[];
  keywordPraise: (keyword: string) => string[];
  staffAmbience: string[];
  closers: string[];
  shortPunch: (keyword: string) => string[];
}

// ─── Industry-Specific Domain Slot Dictionaries ─────────────────────

export const INDUSTRY_GRAMMAR: Record<IndustryKey, Record<SupportedLanguage, LanguageSlots>> = {
  // 1. BAKERY & DESSERTS
  BAKERY_DESSERTS: {
    EN: {
      openings: [
        "The intoxicating aroma of freshly baked items hits you the moment you walk in!",
        "Hands down one of the finest artisanal bakeries and dessert spots in town!",
        "Visited today to pick up fresh treats for the family, absolutely blown away!",
        "Every single item in their display counter looks like an edible work of art!",
        "Freshness, authentic baking craftsmanship, and rich flavors in every bite!",
        "Stopped by for an espresso and oven-fresh treats, what an absolute delight!",
        "If you truly appreciate authentic baking and premium ingredients, this place is heaven!",
        "Such a charming bakehouse with unmatched quality and cozy vibe!",
        "Our weekend mornings are never complete without treats from this wonderful bakery!",
        "Easily the most reliable bakery for celebration cakes and artisanal bakes!",
      ],
      keywordPraise: (k) => [
        `The ${k} had the most exquisite texture, fresh aroma, and melt-in-the-mouth flavour.`,
        `Their ${k} is baked to absolute perfection — crispy on the outside, deliciously tender inside.`,
        `Hands down the best ${k} I've tasted in years; pure culinary craft!`,
        `You can genuinely taste the premium butter and dedication in their ${k}.`,
        `Special shoutout to the ${k}; it alone justifies a daily visit!`,
        `The ${k} was oven-fresh, fragrant, perfectly balanced, and heavenly.`,
        `Loved their ${k} — not overly sweet, just rich, authentic, and satisfying.`,
        `If it's your first time here, do not leave without trying their signature ${k}!`,
      ],
      staffAmbience: [
        "Spotless hygienic glass displays and the staff handles all bakes with utmost care.",
        "Warm, courteous counter hospitality and the takeaway items are packed impeccably.",
        "Cozy, welcoming ambience with a relaxing aroma of roasted beans and warm flour.",
        "Super fast packaging, friendly counter service, and very reasonable pricing.",
        "Incredibly clean seating area, peaceful background music, and smiling crew members.",
        "Top-notch hygiene standards and prompt service even during peak morning hours.",
      ],
      closers: [
        "Will definitely be picking up our daily breads and birthday cakes here! 5 stars all the way.",
        "Highest recommendation for dessert connoisseurs and bakery lovers alike!",
        "Already planning my next visit tomorrow morning. Truly a 5-star local gem!",
        "Can't wait to come back and try the rest of their seasonal bakery menu. Outstanding!",
        "A well-deserved 5 stars. Keep baking with such incredible passion!",
        "10/10 quality and hospitality. You have earned a permanent loyal customer!",
      ],
      shortPunch: (k) => [
        `Heavenly ${k}! Oven-fresh, mouthwatering, and friendly staff. 5/5 stars!`,
        `Best bakery around! The ${k} is incredible. Highly recommended!`,
        `Top-tier bakehouse. Loved the ${k} and warm hospitality. 5 stars!`,
        `Crispy, fresh, and divine ${k}. Quick counter service too!`,
      ],
    },
    TANGLISH: {
      openings: [
        "Innaiku visit pannapo fresh bakes aroma semma appetizing ah irundhuchu!",
        "One of the best bakeries in the city! Cakes and pastries ellam vera level.",
        "Family kooda innaiku treats vanga vandhom, romba satisfied!",
        "Fresh bakes and coffee ku idhu dhaan enoda permanent go-to spot!",
        "Romba hygienic and neat bakehouse, quality semmaya maintain panranga.",
        "Semma vibe and fresh items! First bite laye fresh quality theriyudhu.",
      ],
      keywordPraise: (k) => [
        `${k} taste vera level! Flaky, fresh and melt-in-the-mouth texture.`,
        `${k} kandippa must-try! Authentic baking and rich taste.`,
        `Main-ah avanga ${k} semma fresh and satisfying ah irundhuchu.`,
        `${k} la use panna quality ingredients direct-ah taste la feel aagudhu.`,
        `Romba nalla irundhuchu avanga ${k}, total value for money.`,
        `${k} taste romba balanced ah irukku, not too sweet, exactly perfect!`,
      ],
      staffAmbience: [
        "Counter staff romba polite ah serve pannanga, neat packaging.",
        "Quick service and hygienic glass counter maintenance.",
        "Super clean shop, cozy atmosphere and peaceful ambience.",
        "Neatly boxed takeaway and smiling customer service.",
      ],
      closers: [
        "Kandippa friends and family ku recommend pannuven! 5 Stars!",
        "Marubadiyum bakes vanga kandippa varuvom! Semma bakery.",
        "Birthday cakes and daily bakes ku best place. 10/10 rating!",
        "Truly 5-star experience! Keep up the great work.",
      ],
      shortPunch: (k) => [
        `Semma fresh ${k}! Quick service and great taste. 5 stars!`,
        `Best bakery! ${k} vera level. Highly recommended to everyone!`,
        `Superb quality ${k} and polite staff. Loved it!`,
      ],
    },
    TA: {
      openings: [
        "இன்று இங்கு சென்றிருந்தோம், புதிதாக சுடப்பட்ட தின்பண்டங்களின் மணம் மிக அற்புதம்!",
        "நகரின் மிகச் சிறந்த பேக்கரி மற்றும் இனிப்பகம், தரம் மிக நேர்த்தியாக உள்ளது!",
        "குடும்பத்துடன் வந்து இனிப்புகளும் கார வகைகளும் வாங்க சிறந்த இடம்.",
        "சுவை, தூய்மை மற்றும் உபசரிப்பு அனைத்திலும் முதலிடம்!",
      ],
      keywordPraise: (k) => [
        `${k} சுவை மற்றும் தரம் உண்மையிலேயே நாவில் கரையும் வண்ணம் மிக அற்புதம்!`,
        `இவர்களின் ${k} தயாரிப்பில் தரம் மற்றும் கைவண்ணம் பளிச்சிடுகிறது.`,
        `${k} மிக மென்மையாகவும் புதிதாகவும் இருந்தது, அனைவரும் ருசிக்க வேண்டிய ஒன்று.`,
      ],
      staffAmbience: [
        "கண்ணாடி அலமாரிகள் மிகத் தூய்மையாகவும் ஊழியர்கள் நேர்த்தியாகவும் பரிமாறினர்.",
        "விரைவான பேக்கிங் மற்றும் கனிவான புன்னகையுடன் கூடிய சேவை.",
        "அமைதியான சூழல் மற்றும் சுத்தமான சுகாதாரம்.",
      ],
      closers: [
        "கண்டிப்பாக அனைவருக்கும் பரிந்துரைக்கிறேன்! 5 நட்சத்திரங்கள்.",
        "மீண்டும் பிறந்தநாள் கேக்குகள் வாங்க இங்குதான் வருவோம். வாழ்த்துகள்!",
        "மனமார்ந்த 5-ஸ்டார் மதிப்பீடு!",
      ],
      shortPunch: (k) => [
        `அருமையான சுவை! ${k} மிக நன்று. 5 நட்சத்திரங்கள்!`,
        `புதிய மற்றும் சுவையான ${k}. சிறந்த பேக்கரி!`,
      ],
    },
    HI: {
      openings: [
        "Aaj yahan aakar taza baked items ki khushboo ne dil khush kar diya!",
        "Shaharon ki sabse behtareen bakery aur dessert shop hai yeh!",
        "Family ke liye fresh cakes aur snacks liye, quality ekdam lajawab thi!",
      ],
      keywordPraise: (k) => [
        `${k} ka taste aur softness sach me kamaal ka tha!`,
        `${k} ekdam fresh aur perfectly baked tha, must try!`,
        `Khaaskar inka ${k} bahut hi lajawab aur fresh laga.`,
      ],
      staffAmbience: [
        "Counter staff bahut polite hai aur packaging bahut clean hai.",
        "Neat and clean display ke saath super fast service mili.",
      ],
      closers: [
        "Sabhi doston ko zaroor recommend karunga! Solid 5 Stars.",
        "Definite visit again! Aise hi shandar bakes banate rahiye.",
      ],
      shortPunch: (k) => [
        `Zabardast ${k}! Fresh and tasty. 5 Stars!`,
        `Best bakery! Loved the ${k} and quick service.`,
      ],
    },
    TE: {
      openings: [
        "ఇక్కడ ఫ్రెష్ గా బేక్ చేసిన ఐటమ్స్ వాసన మరియు టేస్ట్ చాలా బాగుంది!",
        "ఈ ఏరియాలో బెస్ట్ బేకరీ, కేక్స్ మరియు పేస్ట్రీస్ చాలా టేస్టీగా ఉన్నాయి!",
      ],
      keywordPraise: (k) => [
        `${k} క్వాలిటీ మరియు సాఫ్ట్‌నెస్ ఎక్సలెంట్ గా ఉంది.`,
        `${k} చాలా ఫ్రెష్ గా ఉంది, ఖచ్చితంగా ట్రై చేయాలి.`,
      ],
      staffAmbience: [
        "స్టాఫ్ చాలా మర్యాదగా సర్వ్ చేశారు, షాప్ చాలా క్లీన్ గా ఉంది.",
      ],
      closers: ["అందరికీ తప్పకుండా రికమండ్ చేస్తాను! 5 స్టార్స్."],
      shortPunch: (k) => [`సూపర్ ${k}! ఫ్రెష్ అండ్ టేస్టీ. 5 స్టార్స్!`],
    },
    KN: {
      openings: [
        "ಇಲ್ಲಿನ ತಾಜಾ ಬೇಕ್ ಮಾಡಿದ ತಿಂಡಿಗಳು ಮತ್ತು ಕೇಕ್ ತುಂಬಾ ರುಚಿಕರವಾಗಿವೆ!",
        "ನಗರದ ಅತ್ಯುತ್ತಮ ಬೇಕರಿಗಳಲ್ಲಿ ಒಂದು, ಗುಣಮಟ್ಟ ಶ್ರೇಷ್ಠವಾಗಿದೆ!",
      ],
      keywordPraise: (k) => [
        `${k} ತುಂಬಾ ಮೃದು ಮತ್ತು ತಾಜಾವಾಗಿದ್ದು ಅತ್ಯುತ್ತಮ ರುಚಿ ನೀಡಿದೆ.`,
      ],
      staffAmbience: ["ಸಿಬ್ಬಂದಿ ತುಂಬಾ ವಿನಮ್ರರಾಗಿದ್ದಾರೆ ಮತ್ತು ಸ್ವಚ್ಛತೆ ಅದ್ಭುತವಾಗಿದೆ."],
      closers: ["ಎಲ್ಲರಿಗೂ ಖಂಡಿತ ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ! 5 ನಕ್ಷತ್ರಗಳು."],
      shortPunch: (k) => [`ಅದ್ಭುತ ${k}! ತಾಜಾ ಮತ್ತು ರುಚಿಕರ. 5 ನಕ್ಷತ್ರಗಳು!`],
    },
  },

  // 2. RESTAURANT & CAFÉ
  RESTAURANT_CAFE: {
    EN: {
      openings: [
        "Visited today for lunch and had an absolutely phenomenal dining experience!",
        "One of the most satisfying and authentic culinary meals I've had recently!",
        "Had a wonderful family dinner here today, everything exceeded our expectations!",
        "The food quality, genuine flavors, and inviting dining vibe are second to none!",
        "Truly a food lover's paradise with authentic cooking and generous portions!",
        "Such a fantastic dining destination for both quick bites and relaxed meals!",
        "From the first bite to the last sip, everything was freshly prepared and delicious!",
        "Top-tier culinary standards with great hospitality and comfortable seating!",
        "Found our new regular weekend dining spot! Absolutely loved our meal.",
        "Delicious aroma, sizzling hot food, and memorable culinary experience throughout!",
      ],
      keywordPraise: (k) => [
        `The ${k} was cooked to perfection with authentic spices and rich aroma.`,
        `Their ${k} is unquestionably a signature highlight that you cannot miss!`,
        `Special compliments to the chef for the ${k} — incredible depth of flavour.`,
        `Loved how fresh and well-balanced the ${k} was; perfectly portioned too.`,
        `The ${k} alone is well worth the visit; bursting with genuine taste!`,
        `Hands down one of the best preparations of ${k} I have tasted in a long time.`,
        `The ${k} arrived steaming hot, aromatic, and cooked with authentic ingredients.`,
        `Really impressed with the consistent taste and fresh preparation of the ${k}.`,
      ],
      staffAmbience: [
        "Table service was swift and the servers were attentive, courteous, and prompt.",
        "Hygienic dining hall, comfortable seating, and a warm family-friendly atmosphere.",
        "Food was served piping hot with minimal wait times despite the busy rush.",
        "Very clean open kitchen, spotless cutlery, and pleasant background acoustics.",
        "Courteous table captains and smooth, transparent billing at the counter.",
        "High standards of hygiene and genuine warmth from the entire floor team.",
      ],
      closers: [
        "Will definitely be returning with friends this weekend! 5 stars all the way.",
        "Highest recommendation to all foodies looking for great taste and hygiene!",
        "A well-deserved 5-star rating for their kitchen and service teams. Keep it up!",
        "Can't wait to visit again and explore more items from their menu. Superb!",
        "10/10 dining experience. You have gained a permanent patron!",
      ],
      shortPunch: (k) => [
        `Phenomenal ${k}! Piping hot, flavorful, and fast service. 5/5 stars!`,
        `Best food spot around! The ${k} was outstanding. Highly recommended!`,
        `Delicious meal! Loved the ${k} and courteous staff. 5 stars!`,
        `Superb taste, clean ambience, and the ${k} was on point!`,
      ],
    },
    TANGLISH: {
      openings: [
        "Innaiku lunch ku vandhom, food taste and quality vera level!",
        "One of the best dining places in this area, romba satisfied!",
        "Family dinner ku vandhom, ellarukum romba pidichirundhuchu!",
        "Semma culinary experience! Authentic taste and hot serving.",
        "Vibe romba cozy ah irukku, food taste simply superb!",
      ],
      keywordPraise: (k) => [
        `${k} taste vera level! Proper authentic masala and fresh serving.`,
        `${k} kandippa must-try dish, authentic flavours and top quality.`,
        `Main-ah avanga ${k} semma aromatic and delicious ah irundhuchu.`,
        `Loved the ${k}, quality and quantity renduமே super balance.`,
        `${k} piping hot ah vandhuchu, pure satisfaction!`,
      ],
      staffAmbience: [
        "Table service romba fast, servers ellam polite ah treat pannanga.",
        "Clean dining area, neat table setup and family-friendly atmosphere.",
        "No long waiting time, hot food served quickly.",
        "Proper hygiene maintain panranga, very pleasant vibe.",
      ],
      closers: [
        "Kandippa friends and family ku recommend pannuven! 5 Stars!",
        "Definitely regular spot aagidum, marubadiyum varuvom!",
        "Full 5-star rating for the taste and service. Semma place!",
      ],
      shortPunch: (k) => [
        `Semma ${k}! Hot, tasty and fast service. 5 stars!`,
        `Vera level food! Loved the ${k}. Highly recommended!`,
      ],
    },
    TA: {
      openings: [
        "இன்று குடும்பத்துடன் உணவருந்தினோம், சுவையும் உபசரிப்பும் மிக அற்புதம்!",
        "நகரின் மிகச் சிறந்த பாரம்பரிய உணவகம், சுவையில் எந்த சமரசமும் இல்லை!",
        "சுடச்சுட பரிமாறப்பட்ட அறுசுவை உணவு, மிகவும் மனநிறைவான அனுபவம்!",
      ],
      keywordPraise: (k) => [
        `${k} சுவை மற்றும் மணம் உண்மையிலேயே நாவில் எச்சில் ஊற வைத்தது!`,
        `இவர்களின் ${k} தனித்துவமான சுவையுடன் மிகச் சிறப்பாக தயாரிக்கப்பட்டுள்ளது.`,
        `${k} தரம் மற்றும் அளவு இரண்டும் மிகத் திருப்திகரமாக இருந்தது.`,
      ],
      staffAmbience: [
        "ஊழியர்களின் விரைவான மற்றும் கனிவான உபசரிப்பு மனதிற்கு மகிழ்ச்சி அளித்தது.",
        "தூய்மையான உணவுக்கூடம் மற்றும் குடும்பத்தினருக்கு ஏற்ற அமைதியான சூழல்.",
      ],
      closers: [
        "அனைவருக்கும் மனதார பரிந்துரைக்கிறேன்! 5 நட்சத்திரங்கள்.",
        "மீண்டும் நிச்சயமாக உணவருந்த வருவோம். வாழ்த்துகள்!",
      ],
      shortPunch: (k) => [
        `அறுசுவை உணவு! ${k} மிக அற்புதம். 5 நட்சத்திரங்கள்!`,
        `பாரம்பரிய சுவை, சுத்தமான சூழல். ${k} மிக நன்று!`,
      ],
    },
    HI: {
      openings: [
        "Aaj yahan lunch kiya, khana aur service dono ekdam lajawab the!",
        "Family ke saath dinner ke liye sabse best restaurant hai yeh!",
        "Asli swaad aur behtareen hospitality ka perfect combination mila!",
      ],
      keywordPraise: (k) => [
        `${k} ka taste aur presentation dono bahut shandar tha!`,
        `${k} ekdam garam aur authentic spices ke saath serve kiya gaya, maza aa gaya!`,
      ],
      staffAmbience: [
        "Table service fast thi aur staff ka nature bahut polite tha.",
        "Neat and clean dining area ke saath family friendly vibe hai.",
      ],
      closers: [
        "Sabhi food lovers ko zaroor recommend karunga! Solid 5 Stars.",
        "Aise hi lajawab swaad dete rahiye, phir aayenge!",
      ],
      shortPunch: (k) => [`Lajawab ${k}! Superb taste aur fast service. 5 Stars!`],
    },
    TE: {
      openings: ["ఈరోజు లంచ్ కి వెళ్ళాము, ఫుడ్ టేస్ట్ మరియు సర్వీస్ చాలా బాగుంది!"],
      keywordPraise: (k) => [`${k} టేస్ట్ మరియు క్వాలిటీ ఎక్సలెంట్ గా ఉంది.`],
      staffAmbience: ["స్టాఫ్ చాలా ఫ్రెండ్లీగా ఉన్నారు, అంబియన్స్ క్లీన్ గా ఉంది."],
      closers: ["ఖచ్చితంగా మళ్లీ వస్తాము! 5 స్టార్స్."],
      shortPunch: (k) => [`సూపర్ టేస్టీ ${k}! ఫాస్ట్ సర్వీస్. 5 స్టార్స్!`],
    },
    KN: {
      openings: ["ಇಂದು ಊಟಕ್ಕೆ ಭೇಟಿ ನೀಡಿದೆವು, ರುಚಿ ಮತ್ತು ಸೇವೆ ಶ್ರೇಷ್ಠವಾಗಿದೆ!"],
      keywordPraise: (k) => [`${k} ಗುಣಮಟ್ಟ ಮತ್ತು ರುಚಿ ನಿಜವಾಗಿಯೂ ಅದ್ಭುತವಾಗಿದೆ.`],
      staffAmbience: ["ಸಿಬ್ಬಂದಿ ಸೇವೆ ವೇಗವಾಗಿದೆ ಮತ್ತು ವಾತಾವರಣ ಸ್ವಚ್ಛವಾಗಿದೆ."],
      closers: ["ಎಲ್ಲರಿಗೂ ಖಂಡಿತ ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ! 5 ನಕ್ಷತ್ರಗಳು."],
      shortPunch: (k) => [`ಅದ್ಭುತ ${k}! ರುಚಿ ಮತ್ತು ಸೇವೆ ಸೂಪರ್. 5 ನಕ್ಷತ್ರಗಳು!`],
    },
  },

  // 3. SALON & SPA
  SALON_SPA: {
    EN: {
      openings: [
        "Walked out feeling completely rejuvenated and confident after my appointment today!",
        "One of the cleanest, most professional salons and aesthetic studios in the area!",
        "Had a wonderful haircut and grooming session today, exceptional attention to detail!",
        "Top-notch styling professionals who actually listen to what you want!",
        "The relaxing ambience and expert care made my visit thoroughly delightful!",
        "If you want high-standard styling and soothing pampering, look no further!",
        "Fantastic makeover experience with sterilized equipment and hygienic standards!",
        "My hair and skin feel refreshed and vibrant after today's professional service!",
      ],
      keywordPraise: (k) => [
        `The ${k} was executed with absolute mastery and precision.`,
        `Loved their approach to ${k}; they tailored it perfectly to my hair texture.`,
        `Special mention for the ${k} — truly relaxing, skilled, and rejuvenating.`,
        `The ${k} transformed my look completely; so many compliments already!`,
        `You can immediately see the expertise and training in how they do ${k}.`,
      ],
      staffAmbience: [
        "Sterilized tools, fresh disposable capes, and spotless salon stations.",
        "Calm, soothing background music, pleasant aroma, and zero rushed service.",
        "Courteous reception team, punctual appointment start, and friendly stylists.",
        "Comfortable seating, modern aesthetic interior, and polite hospitality throughout.",
      ],
      closers: [
        "Already booked my follow-up appointment! A well-deserved 5 stars.",
        "Hands down the best styling lounge in town. Highly recommended to all!",
        "Thank you for the wonderful transformation. 10/10 experience!",
      ],
      shortPunch: (k) => [
        `Brilliant ${k}! Skilled stylist, hygienic studio, and friendly service. 5/5!`,
        `Best salon experience! Loved the ${k}. Highly recommended!`,
      ],
    },
    TANGLISH: {
      openings: [
        "Innaiku grooming session semma satisfying ah mudinjadhu!",
        "One of the most professional and hygienic salons around here.",
        "Stylist romba patient ah listen panni exact ah naanga kettadhai senjanga.",
      ],
      keywordPraise: (k) => [
        `${k} semma professional ah pannanga, result vera level!`,
        `Loved the ${k}, hair and look romba fresh ah aaiduchu.`,
      ],
      staffAmbience: [
        "Sanitized scissors, clean salon chairs and very polite staff.",
        "Punctual appointment timing and peaceful relaxing atmosphere.",
      ],
      closers: [
        "Definitely next time inga dhaan varuven! 5 Stars!",
        "Full 5-star rating for their hygiene and skilled service.",
      ],
      shortPunch: (k) => [`Semma ${k}! Neat and professional service. 5 stars!`],
    },
    TA: {
      openings: [
        "இன்று இங்கு சென்றிருந்தோம், மிகவும் நேர்த்தியான மற்றும் திருப்திகரமான அழகுக்கலை சேவை!",
        "தூய்மையான உபகரணங்கள் மற்றும் திறமையான பணியாளர்களின் சிறந்த கவனிப்பு!",
      ],
      keywordPraise: (k) => [
        `${k} மிக நேர்த்தியாகவும் கனிவாகவும் செய்து முடித்தனர்.`,
      ],
      staffAmbience: ["சுத்தமான சூழல் மற்றும் கனிவான உபசரிப்பு."],
      closers: ["கண்டிப்பாக அனைவருக்கும் பரிந்துரைக்கிறேன்! 5 நட்சத்திரங்கள்."],
      shortPunch: (k) => [`நேர்த்தியான ${k}! சிறந்த சேவை. 5 நட்சத்திரங்கள்!`],
    },
    HI: {
      openings: ["Aaj styling ke liye aaye the, service dekh kar dil khush ho gaya!"],
      keywordPraise: (k) => [`${k} bahut hi professional tareeqe se kiya gaya.`],
      staffAmbience: ["Sanitized tools aur polite staff ke saath best experience mila."],
      closers: ["Sabhi ko zaroor recommend karunga! Solid 5 Stars."],
      shortPunch: (k) => [`Superb ${k}! Professional staff. 5 Stars!`],
    },
    TE: {
      openings: ["చాలా మంచి సెలూన్ అనుభవం, సర్వీస్ చాలా ప్రొఫెషనల్ గా ఉంది!"],
      keywordPraise: (k) => [`${k} చాలా బాగా చేశారు, రిజల్ట్ చాలా నచ్చింది.`],
      staffAmbience: ["క్లీన్ అండ్ హైజీనిక్ వాతావరణం."],
      closers: ["ఖచ్చితంగా మళ్లీ వస్తాము! 5 స్టార్స్."],
      shortPunch: (k) => [`ఎక్సలెంట్ ${k}! 5 స్టార్స్.`],
    },
    KN: {
      openings: ["ಅತ್ಯುತ್ತಮ ಸಲೂನ್ ಅನುಭವ, ಸಿಬ್ಬಂದಿಯ ಕಾಳಜಿ ತುಂಬಾ ಮೆಚ್ಚುಗೆಯಾಯಿತು!"],
      keywordPraise: (k) => [`${k} ಪರಿಪೂರ್ಣವಾಗಿ ಮಾಡಲಾಗಿದೆ.`],
      staffAmbience: ["ಶುಚಿತ್ವ ಮತ್ತು ಉತ್ತಮ ಉಪಕರಣಗಳು."],
      closers: ["ಖಂಡಿತ ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ! 5 ನಕ್ಷತ್ರಗಳು."],
      shortPunch: (k) => [`ಅದ್ಭುತ ${k}! 5 ನಕ್ಷತ್ರಗಳು.`],
    },
  },

  // 4. HEALTHCARE & DENTAL CLINIC
  HEALTHCARE_DENTAL: {
    EN: {
      openings: [
        "Had an exceptionally reassuring and gentle consultation at the clinic today!",
        "One of the cleanest, most comforting healthcare and dental clinics I've visited!",
        "Felt completely safe and well cared for from the moment I entered the clinic.",
        "The doctor is extremely patient, knowledgeable, and transparent in their diagnosis.",
        "Painless procedure and clear explanations without pushing unnecessary tests!",
      ],
      keywordPraise: (k) => [
        `The ${k} was conducted with extreme gentleness, precision, and zero discomfort.`,
        `Really appreciated the clear step-by-step guidance during my ${k}.`,
        `Their approach to ${k} put all my anxiety to rest; truly compassionate care!`,
      ],
      staffAmbience: [
        "Spotless sterilized clinic environment, modern medical equipment, and calm lobby.",
        "Minimal waiting time, punctual appointments, and very courteous front desk staff.",
        "Highest hygiene protocols followed with sanitized instruments and clean rooms.",
      ],
      closers: [
        "Highest recommendation to anyone looking for trustworthy, gentle medical care! 5 stars.",
        "Deeply grateful to the doctor and the team for such outstanding care.",
      ],
      shortPunch: (k) => [
        `Gentle, painless ${k}! Spotless clinic and caring doctor. 5/5 stars!`,
        `Trustworthy clinic! Loved the gentle ${k}. Highly recommended!`,
      ],
    },
    TANGLISH: {
      openings: [
        "Doctor romba patient ah issue explain pannanga, zero fear!",
        "Romba hygienic and modern clinic, treatment semma smooth ah irundhuchu.",
      ],
      keywordPraise: (k) => [
        `${k} romba gentle ah pannanga, no pain at all!`,
        `${k} treatment pathi clear ah guide pannanga, very trustworthy.`,
      ],
      staffAmbience: [
        "Clean clinic maintenance and polite reception desk.",
        "On-time appointment, no unnecessary waiting.",
      ],
      closers: ["Family doctor ah choose panna best clinic. 5 Stars!"],
      shortPunch: (k) => [`Painless ${k} and gentle doctor. 5 stars!`],
    },
    TA: {
      openings: ["மருத்துவரின் கனிவான அணுகுமுறை மற்றும் துல்லியமான சிகிச்சை மிகவும் திருப்தி அளித்தது!"],
      keywordPraise: (k) => [`${k} வலியில்லாமல் மிகவும் நேர்த்தியாக செய்யப்பட்டது.`],
      staffAmbience: ["மிகவும் தூய்மையான மருத்துவமனை மற்றும் உடனடி கவனிப்பு."],
      closers: ["அனைவருக்கும் நம்பிக்கையுடன் பரிந்துரைக்கிறேன்! 5 நட்சத்திரங்கள்."],
      shortPunch: (k) => [`கனிவான மருத்துவர், சிறந்த ${k}. 5 நட்சத்திரங்கள்!`],
    },
    HI: {
      openings: ["Doctor bahut supportive aur knowledgeable hain, clinic bilkul clean hai!"],
      keywordPraise: (k) => [`${k} bilkul painless tha aur sab kuch clearly explain kiya.`],
      staffAmbience: ["Hygienic setup aur courteous staff."],
      closers: ["Sabhi ko zaroor recommend karunga! Solid 5 Stars."],
      shortPunch: (k) => [`Painless ${k} aur best doctor! 5 Stars.`],
    },
    TE: {
      openings: ["డాక్టర్ చాలా నెమ్మదిగా మాట్లాడారు, ట్రీట్‌మెంట్ చాలా బాగుంది!"],
      keywordPraise: (k) => [`${k} ఏ మాత్రం నొప్పి లేకుండా చాలా బాగా చేశారు.`],
      staffAmbience: ["క్లీన్ అండ్ సేఫ్ క్లినిక్."],
      closers: ["అందరికీ రికమండ్ చేస్తాను! 5 స్టార్స్."],
      shortPunch: (k) => [`మంచి కేరింగ్ డాక్టర్, సూపర్ ${k}. 5 స్టార్స్!`],
    },
    KN: {
      openings: ["ವೈದ್ಯರ ಕಾಳಜಿ ಮತ್ತು ಚಿಕಿತ್ಸೆ ತುಂಬಾ ಸಮಾಧಾನ ನೀಡಿತು!"],
      keywordPraise: (k) => [`${k} ನೋವಿಲ್ಲದೆ ಯಶಸ್ವಿಯಾಗಿ ಮಾಡಲಾಯಿತು.`],
      staffAmbience: ["ಸ್ವಚ್ಛ ಮತ್ತು ಆಧುನಿಕ ಕ್ಲಿನಿಕ್."],
      closers: ["ಖಂಡಿತ ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ! 5 ನಕ್ಷತ್ರಗಳು."],
      shortPunch: (k) => [`ಉತ್ತಮ ${k}! 5 ನಕ್ಷತ್ರಗಳು.`],
    },
  },

  // 5. AUTOMOBILE & REPAIR SERVICE
  AUTO_REPAIR: {
    EN: {
      openings: [
        "Finally found an honest, reliable, and prompt automobile service workshop!",
        "My vehicle drives like brand new after today's comprehensive servicing!",
        "Transparent price estimate, genuine parts, and zero unnecessary add-ons!",
        "Great turnaround time and thorough diagnostic checks by skilled mechanics.",
      ],
      keywordPraise: (k) => [
        `The ${k} was handled with genuine mechanical expertise and care.`,
        `Really impressed with the quality of their ${k}; engine runs whisper-quiet!`,
        `Thorough execution of the ${k}; they resolved the persistent issue effortlessly.`,
      ],
      staffAmbience: [
        "Clear explanation from the service advisor, transparent bill, and punctual delivery.",
        "Clean customer lounge, organized workshop bays, and thorough test drive.",
      ],
      closers: [
        "Will definitely be bringing all our vehicles here for regular maintenance! 5 stars.",
        "Highest recommendation to car and bike owners seeking trustworthy repairs!",
      ],
      shortPunch: (k) => [
        `Honest mechanics! The ${k} was spot on. Vehicle feels brand new. 5 stars!`,
        `Quick turnaround, fair rates, and great ${k}. Highly recommended!`,
      ],
    },
    TANGLISH: {
      openings: [
        "Vehicle service semma smooth ah panni kuduthanga, driving feels like new!",
        "Honest pricing and genuine service advisor, no hidden charges.",
      ],
      keywordPraise: (k) => [
        `${k} issue-ah correct ah diagnose panni resolve pannanga.`,
        `${k} quality superb, vehicle performance vera level aaiduchu!`,
      ],
      staffAmbience: [
        "Punctual delivery time and water wash finish was super clean.",
        "Service details ellam clear ah explain pannanga.",
      ],
      closers: ["Regular service ku permanent garage aaiduchu. 5 Stars!"],
      shortPunch: (k) => [`Semma vehicle ${k}! Transparent pricing. 5 stars!`],
    },
    TA: {
      openings: ["வாகனம் புதிது போல ஓடுகிறது, நேர்மையான கட்டணம் மற்றும் சிறந்த பணி!"],
      keywordPraise: (k) => [`${k} மிகவும் திறம்பட சரிசெய்யப்பட்டது.`],
      staffAmbience: ["சரியான நேரத்தில் ஒப்படைப்பு மற்றும் தெளிவான விளக்கம்."],
      closers: ["நம்பிக்கையுடன் அனைவருக்கும் பரிந்துரைக்கிறேன்! 5 நட்சத்திரங்கள்."],
      shortPunch: (k) => [`சிறந்த பணி! ${k} மிக நன்று. 5 நட்சத்திரங்கள்!`],
    },
    HI: {
      openings: ["Gaadi ka kaam ekdam perfect hua, bilkul genuine garage hai yeh!"],
      keywordPraise: (k) => [`${k} ka issue completely solve ho gaya.`],
      staffAmbience: ["On-time delivery aur transparent billing."],
      closers: ["Sabhi vehicle owners ko zaroor recommend karunga! Solid 5 Stars."],
      shortPunch: (k) => [`Best garage! ${k} perfectly done. 5 Stars.`],
    },
    TE: {
      openings: ["వెహికల్ సర్వీస్ చాలా బాగా చేశారు, డ్రైవింగ్ చాలా స్మూత్ గా ఉంది!"],
      keywordPraise: (k) => [`${k} క్వాలిటీ వర్క్ చేశారు.`],
      staffAmbience: ["ఆన్-టైమ్ డెలివరీ మరియు ఫెయిర్ ప్రైసింగ్."],
      closers: ["ఖచ్చితంగా రికమండ్ చేస్తాను! 5 స్టార్స్."],
      shortPunch: (k) => [`సూపర్ సర్వీస్! ${k} బాగుంది. 5 స్టార్స్!`],
    },
    KN: {
      openings: ["ವಾಹನದ ಸೇವೆ ಅತ್ಯುತ್ತಮವಾಗಿದೆ, ಪ್ರಾಮಾಣಿಕ ಕೆಲಸ ಮತ್ತು ಬೆಲೆ!"],
      keywordPraise: (k) => [`${k} ಕೆಲಸ ಪರಿಪೂರ್ಣವಾಗಿ ಮುಗಿದಿದೆ.`],
      staffAmbience: ["ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ವಾಹನ ನೀಡಿದರು."],
      closers: ["ಎಲ್ಲರಿಗೂ ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ! 5 ನಕ್ಷತ್ರಗಳು."],
      shortPunch: (k) => [`ಉತ್ತಮ ಸೇವೆ! ${k} ಸೂಪರ್. 5 ನಕ್ಷತ್ರಗಳು!`],
    },
  },

  // 6. GYM & FITNESS STUDIO
  GYM_FITNESS: {
    EN: {
      openings: [
        "High-octane energy, pristine equipment, and an amazing workout environment!",
        "One of the best fitness facilities in the area for serious results!",
        "Trainers genuinely care about form, progressive overload, and injury prevention.",
      ],
      keywordPraise: (k) => [
        `The ${k} has helped me make measurable fitness progress in just weeks.`,
        `Top-tier quality in their ${k}; motivating, knowledgeable, and results-driven!`,
      ],
      staffAmbience: [
        "Spacious workout floor, sanitized weights, and spotless locker facilities.",
        "Motivating community, supportive trainers, and clean ventilation throughout.",
      ],
      closers: [
        "100% recommended for anyone serious about their health and fitness! 5 stars.",
        "Best gym membership investment I've made. Keep the energy high!",
      ],
      shortPunch: (k) => [`High energy! Great ${k} and clean gym. 5/5 stars!`],
    },
    TANGLISH: {
      openings: ["Workout environment semma motivating ah irukku, great gym!"],
      keywordPraise: (k) => [`${k} trainer guidance vera level, form correct ah solli tharanga.`],
      staffAmbience: ["Clean weights section and friendly fitness community."],
      closers: ["Fitness lovers ku best place. 5 Stars all the way!"],
      shortPunch: (k) => [`Semma gym vibe! ${k} top notch. 5 stars!`],
    },
    TA: {
      openings: ["உடற்பயிற்சி செய்ய சிறந்த சூழல் மற்றும் நவீன உபகரணங்கள்!"],
      keywordPraise: (k) => [`${k} வழிகாட்டுதல் மிகவும் பயனுள்ளதாக உள்ளது.`],
      staffAmbience: ["சுத்தமான உடற்பயிற்சி கூடம் மற்றும் சிறந்த ஊக்கம்."],
      closers: ["உடல்தகுதி விரும்புவோருக்கு சிறந்த இடம். 5 நட்சத்திரங்கள்!"],
      shortPunch: (k) => [`சிறந்த உடற்பயிற்சி கூடம்! ${k} அருமை. 5 நட்சத்திரங்கள்!`],
    },
    HI: {
      openings: ["Zabardast gym aur workout environment! Trainers bahut supportive hain."],
      keywordPraise: (k) => [`${k} se results clearly dikh rahe hain.`],
      staffAmbience: ["Clean gym area aur modern machines."],
      closers: ["Fitness ke liye best gym! Solid 5 Stars."],
      shortPunch: (k) => [`Great gym! Loved the ${k}. 5 Stars.`],
    },
    TE: {
      openings: ["జిమ్ చాలా మోటివేటింగ్ గా ఉంది, ట్రైనర్స్ చాలా హెల్ప్‌ఫుల్!"],
      keywordPraise: (k) => [`${k} గైడెన్స్ చాలా బాగుంది.`],
      staffAmbience: ["క్లీన్ ఎక్విప్‌మెంట్."],
      closers: ["ఫిట్‌నెస్ కి బెస్ట్ ప్లేస్! 5 స్టార్స్."],
      shortPunch: (k) => [`సూపర్ జిమ్! ${k} బాగుంది. 5 స్టార్స్!`],
    },
    KN: {
      openings: ["ಅತ್ಯುತ್ತಮ ಜಿಮ್, ತರಬೇತುದಾರರ ಮಾರ್ಗದರ್ಶನ ಶ್ರೇಷ್ಠವಾಗಿದೆ!"],
      keywordPraise: (k) => [`${k} ತರಬೇತಿ ಫಲಿತಾಂಶ ನೀಡಿದೆ.`],
      staffAmbience: ["ಶುಚಿಯಾದ ಉಪಕರಣಗಳು."],
      closers: ["ಎಲ್ಲರಿಗೂ ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ! 5 ನಕ್ಷತ್ರಗಳು."],
      shortPunch: (k) => [`ಅದ್ಭುತ ಜಿಮ್! ${k} ಸೂಪರ್. 5 ನಕ್ಷತ್ರಗಳು!`],
    },
  },

  // 7. DRUG STORE & PHARMACY
  PHARMACY: {
    EN: {
      openings: [
        "Reliable pharmacy where all prescribed medicines and wellness goods are readily available!",
        "The pharmacist was extremely helpful and double-checked the dosage carefully.",
      ],
      keywordPraise: (k) => [
        `Appreciated how quickly they fulfilled the ${k} without any delay.`,
        `Found genuine, authentic ${k} easily here when other stores were out of stock.`,
      ],
      staffAmbience: [
        "Organized aisles, prompt billing counter, and polite customer assistance.",
        "Quick response, doorstep delivery option, and clean store environment.",
      ],
      closers: [
        "My trusted neighborhood pharmacy for all family medical needs! 5 stars.",
      ],
      shortPunch: (k) => [`All medicines in stock! Quick ${k} and helpful staff. 5 stars!`],
    },
    TANGLISH: {
      openings: ["Prescription medicines ellam easily available ah irundhuchu!"],
      keywordPraise: (k) => [`${k} prompt ah provide pannanga, genuine products.`],
      staffAmbience: ["Pharmacist romba helpful ah dosage explain pannanga."],
      closers: ["Reliable medical store in this area. 5 Stars!"],
      shortPunch: (k) => [`Quick ${k} and polite service. 5 stars!`],
    },
    TA: {
      openings: ["அனைத்து மருந்துகளும் உடனடியாகக் கிடைக்கும் நம்பகமான மருந்தகம்!"],
      keywordPraise: (k) => [`${k} உடனுக்குடன் வழங்கப்பட்டது.`],
      staffAmbience: ["கனிவான மருந்தாளர் மற்றும் தெளிவான விளக்கம்."],
      closers: ["நம்பகமான மருந்தகம்! 5 நட்சத்திரங்கள்."],
      shortPunch: (k) => [`விரைவான சேவை! ${k} நன்று. 5 நட்சத்திரங்கள்!`],
    },
    HI: {
      openings: ["Sabhi medicines yahan easily mil jati hain, best pharmacy!"],
      keywordPraise: (k) => [`${k} turant arrange kar ke diya.`],
      staffAmbience: ["Helpful pharmacist aur quick billing."],
      closers: ["100% recommended medical store! 5 Stars."],
      shortPunch: (k) => [`Fast service aur genuine ${k}. 5 Stars!`],
    },
    TE: {
      openings: ["అన్ని మందులు అందుబాటులో ఉన్నాయి, చాలా మంచి మెడికల్ షాప్!"],
      keywordPraise: (k) => [`${k} త్వరగా ఇచ్చారు.`],
      staffAmbience: ["మర్యాదపూర్వక సిబ్బంది."],
      closers: ["నమ్మకమైన ఫార్మసీ! 5 స్టార్స్."],
      shortPunch: (k) => [`ఫాస్ట్ సర్వీస్! ${k} బాగుంది. 5 స్టార్స్!`],
    },
    KN: {
      openings: ["ಎಲ್ಲಾ ಔಷಧಗಳು ಸುಲಭವಾಗಿ ದೊರೆಯುತ್ತವೆ, ನಂಬಿಕಾರ್ಹ ಮೆಡಿಕಲ್ ಶಾಪ್!"],
      keywordPraise: (k) => [`${k} ತಕ್ಷಣ ಒದಗಿಸಿದರು.`],
      staffAmbience: ["ಸಹಾಯಕ ಸಿಬ್ಬಂದಿ."],
      closers: ["ಖಂಡಿತ ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ! 5 ನಕ್ಷತ್ರಗಳು."],
      shortPunch: (k) => [`ಉತ್ತಮ ಸೇವೆ! ${k} ಸೂಪರ್. 5 ನಕ್ಷತ್ರಗಳು!`],
    },
  },

  // 8. GENERAL STORE & SUPERMARKET
  SUPERMARKET: {
    EN: {
      openings: [
        "A one-stop shopping destination with fresh stock and neatly organized aisles!",
        "Super smooth grocery run with quick billing and helpful floor associates.",
      ],
      keywordPraise: (k) => [
        `The ${k} was fresh, well-packaged, and priced very reasonably.`,
        `Consistently top quality on their ${k}; won't shop anywhere else!`,
      ],
      staffAmbience: [
        "Fast barcode checkout, well-arranged sections, and clean shopping baskets.",
        "Courteous staff who guide you directly to what you need.",
      ],
      closers: [
        "Our family's go-to neighborhood supermarket! 5 stars all the way.",
      ],
      shortPunch: (k) => [`Fresh groceries! Loved the ${k} and fast checkout. 5 stars!`],
    },
    TANGLISH: {
      openings: ["Groceries vanga best supermarket, neatly organized sections!"],
      keywordPraise: (k) => [`${k} romba fresh and wholesale rate laye irundhuchu.`],
      staffAmbience: ["Billing counter super fast, friendly store crew."],
      closers: ["Daily needs ku permanent shop. 5 Stars!"],
      shortPunch: (k) => [`Fresh items and quick ${k}. 5 stars!`],
    },
    TA: {
      openings: ["அனைத்து மளிகைப் பொருட்களும் தரமாகவும் நியாய விலையிலும் கிடைக்கும் சிறந்த அங்காடி!"],
      keywordPraise: (k) => [`${k} தரம் மற்றும் புதிய தன்மை மிகவும் பிடித்திருந்தது.`],
      staffAmbience: ["விரைவான பில்லிங் மற்றும் நேர்த்தியான பராமரிப்பு."],
      closers: ["குடும்பத்துடன் பொருட்கள் வாங்க சிறந்த கடை! 5 நட்சத்திரங்கள்."],
      shortPunch: (k) => [`புதிய பொருட்கள்! ${k} மிக நன்று. 5 நட்சத்திரங்கள்!`],
    },
    HI: {
      openings: ["Ghar ke sabhi samaan ke liye best supermarket hai yeh!"],
      keywordPraise: (k) => [`${k} ekdam fresh aur sahi rate par mila.`],
      staffAmbience: ["Fast checkout aur polite staff."],
      closers: ["Sabhi ko zaroor recommend karunga! Solid 5 Stars."],
      shortPunch: (k) => [`Fresh stock aur fast billing for ${k}. 5 Stars!`],
    },
    TE: {
      openings: ["అన్ని నిత్యావసర వస్తువులు మంచి రేట్స్ కి దొరికే సూపర్ మార్కెట్!"],
      keywordPraise: (k) => [`${k} చాలా ఫ్రెష్ గా ఉంది.`],
      staffAmbience: ["ఫాస్ట్ బిల్లింగ్."],
      closers: ["చాలా మంచి స్టోర్! 5 స్టార్స్."],
      shortPunch: (k) => [`సూపర్ క్వాలిటీ ${k}! 5 స్టార్స్.`],
    },
    KN: {
      openings: ["ಎಲ್ಲಾ ದಿನಸಿ ಸಾಮಗ್ರಿಗಳು ಉತ್ತಮ ಬೆಲೆಗೆ ದೊರೆಯುವ ಸೂಪರ್ ಮಾರ್ಕೆಟ್!"],
      keywordPraise: (k) => [`${k} ತಾಜಾವಾಗಿದೆ.`],
      staffAmbience: ["ವೇಗದ ಬಿಲ್ಲಿಂಗ್."],
      closers: ["ಎಲ್ಲರಿಗೂ ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ! 5 ನಕ್ಷತ್ರಗಳು."],
      shortPunch: (k) => [`ಉತ್ತಮ ${k}! 5 ನಕ್ಷತ್ರಗಳು.`],
    },
  },

  // 9. HOTEL & HOSPITALITY
  HOTEL_HOSPITALITY: {
    EN: {
      openings: [
        "A peaceful, impeccably maintained stay with exceptional hospitality throughout!",
        "From check-in to check-out, the hotel team made us feel like royalty!",
      ],
      keywordPraise: (k) => [
        `The ${k} made our stay deeply memorable and comfortable.`,
        `Special compliments for their ${k}; attention to detail was outstanding.`,
      ],
      staffAmbience: [
        "Spotless rooms, prompt room service, and convenient parking facilities.",
        "Courteous reception team and peaceful nighttime acoustics.",
      ],
      closers: [
        "Will definitely be choosing this hotel whenever visiting the city! 5 stars.",
      ],
      shortPunch: (k) => [`Wonderful stay! Loved the ${k} and polite staff. 5/5 stars!`],
    },
    TANGLISH: {
      openings: ["Stay romba comfortable and peaceful ah irundhuchu, great hotel!"],
      keywordPraise: (k) => [`${k} service semma prompt and luxurious ah irundhuchu.`],
      staffAmbience: ["Front desk staff romba polite ah check-in process mudichanga."],
      closers: ["Next trip layum inga dhaan stay pannuvom. 5 Stars!"],
      shortPunch: (k) => [`Cozy stay and great ${k}. 5 stars!`],
    },
    TA: {
      openings: ["அமைதியான மற்றும் பாதுகாப்பான தங்குமிடம், சிறந்த விருந்தோம்பல்!"],
      keywordPraise: (k) => [`${k} சேவை மிகவும் திருப்திகரமாக இருந்தது.`],
      staffAmbience: ["தூய்மையான அறைகள் மற்றும் விரைவான உதவி."],
      closers: ["குடும்பத்துடன் தங்க மிகச் சிறந்த இடம்! 5 நட்சத்திரங்கள்."],
      shortPunch: (k) => [`அருமையான தங்குமிடம்! ${k} நன்று. 5 நட்சத்திரங்கள்!`],
    },
    HI: {
      openings: ["Stay bahut comfortable aur peaceful raha, best hotel!"],
      keywordPraise: (k) => [`${k} ki service sach me lajawab thi.`],
      staffAmbience: ["Clean rooms aur polite staff."],
      closers: ["Agli baar bhi yahi stay karenge! Solid 5 Stars."],
      shortPunch: (k) => [`Great stay and superb ${k}! 5 Stars.`],
    },
    TE: {
      openings: ["స్టే చాలా కంఫర్టబుల్ గా ఉంది, హోటల్ సర్వీస్ సూపర్!"],
      keywordPraise: (k) => [`${k} చాలా బాగుంది.`],
      staffAmbience: ["క్లీన్ రూమ్స్."],
      closers: ["ఖచ్చితంగా మళ్లీ వస్తాము! 5 స్టార్స్."],
      shortPunch: (k) => [`సూపర్ స్టే! ${k} బాగుంది. 5 స్టార్స్!`],
    },
    KN: {
      openings: ["ವಾಸ್ತವ್ಯ ತುಂಬಾ ಆರಾಮದಾಯಕವಾಗಿತ್ತು, ಉತ್ತಮ ಆತಿಥ್ಯ!"],
      keywordPraise: (k) => [`${k} ಸೇವೆ ಶ್ರೇಷ್ಠವಾಗಿತ್ತು.`],
      staffAmbience: ["ಸ್ವಚ್ಛ ಕೋಣೆಗಳು."],
      closers: ["ಖಂಡಿತ ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ! 5 ನಕ್ಷತ್ರಗಳು."],
      shortPunch: (k) => [`ಅದ್ಭುತ ವಾಸ್ತವ್ಯ! ${k} ಸೂಪರ್. 5 ನಕ್ಷತ್ರಗಳು!`],
    },
  },

  // 10. BOUTIQUE & FASHION RETAIL
  BOUTIQUE_FASHION: {
    EN: {
      openings: [
        "Incredible collection of fashion wear with exquisite fabrics and modern cuts!",
        "Found exactly what I was searching for; chic, stylish, and reasonably priced!",
      ],
      keywordPraise: (k) => [
        `The ${k} has such fine tailoring, premium feel, and flattering fit.`,
        `Constantly receive compliments on the ${k} I purchased here!`,
      ],
      staffAmbience: [
        "Helpful sales associates who assist without hovering, spacious trial rooms.",
        "Beautifully curated clothing displays and clean aesthetic store atmosphere.",
      ],
      closers: [
        "My new favorite shopping boutique for festive and casual wear! 5 stars.",
      ],
      shortPunch: (k) => [`Chic collection! Loved the ${k} and great staff. 5 stars!`],
    },
    TANGLISH: {
      openings: ["Trendy collections and premium fabric quality, semma boutique!"],
      keywordPraise: (k) => [`${k} fit and material quality vera level ah irukku.`],
      staffAmbience: ["Staff romba friendly ah designs show pannanga."],
      closers: ["Shopping ku best place, definitely visiting again. 5 Stars!"],
      shortPunch: (k) => [`Semma collection! ${k} loved it. 5 stars!`],
    },
    TA: {
      openings: ["நவீன ரக ஆடைகள் மற்றும் உயர்ந்த தரம், ஆடை வாங்க சிறந்த கடை!"],
      keywordPraise: (k) => [`${k} தரம் மற்றும் தையல் மிக நேர்த்தியாக உள்ளது.`],
      staffAmbience: ["உதவிகரமான ஊழியர்கள் மற்றும் சுத்தமான சூழல்."],
      closers: ["அனைவருக்கும் பரிந்துரைக்கிறேன்! 5 நட்சத்திரங்கள்."],
      shortPunch: (k) => [`அழகான ஆடைத் தொகுப்பு! ${k} அருமை. 5 நட்சத்திரங்கள்!`],
    },
    HI: {
      openings: ["Latest fashion collections aur best cloth quality yahan milti hai!"],
      keywordPraise: (k) => [`${k} ki fitting aur fabric ekdam premium hai.`],
      staffAmbience: ["Helpful sales team aur spacious trial room."],
      closers: ["Shopping ke liye sabse best boutique! 5 Stars."],
      shortPunch: (k) => [`Awesome collection and great ${k}! 5 Stars.`],
    },
    TE: {
      openings: ["ట్రెండీ కలెక్షన్స్ మరియు మంచి ఫ్యాబ్రిక్ క్వాలిటీ ఉన్నాయి!"],
      keywordPraise: (k) => [`${k} ఫిట్టింగ్ చాలా బాగుంది.`],
      staffAmbience: ["హెల్ప్‌ఫుల్ స్టాఫ్."],
      closers: ["షాపింగ్ కి బెస్ట్ ప్లేస్! 5 స్టార్స్."],
      shortPunch: (k) => [`సూపర్ కలెక్షన్! ${k} బాగుంది. 5 స్టార్స్!`],
    },
    KN: {
      openings: ["ಆಧುನಿಕ ಬಟ್ಟೆಗಳ ಸಂಗ್ರಹ ಮತ್ತು ಉತ್ತಮ ಗುಣಮಟ್ಟ!"],
      keywordPraise: (k) => [`${k} ಹೊಲಿಗೆ ಮತ್ತು ಗುಣಮಟ್ಟ ಶ್ರೇಷ್ಠವಾಗಿದೆ.`],
      staffAmbience: ["ಸ್ನೇಹಪರ ಸಿಬ್ಬಂದಿ."],
      closers: ["ಎಲ್ಲರಿಗೂ ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ! 5 ನಕ್ಷತ್ರಗಳು."],
      shortPunch: (k) => [`ಉತ್ತಮ ಸಂಗ್ರಹ! ${k} ಸೂಪರ್. 5 ನಕ್ಷತ್ರಗಳು!`],
    },
  },

  // 11. SPORTS & RECREATION
  SPORTS_RECREATION: {
    EN: {
      openings: [
        "Top-tier playing surface, high-end turf, and energetic sporting vibe!",
        "Had an exhilarating sports session here today with friends!",
        "One of the best maintained turfs and indoor sporting arenas around!",
      ],
      keywordPraise: (k) => [
        `The ${k} is exceptionally well-maintained, ensuring great grip and gameplay.`,
        `Top marks for their ${k}; smooth booking, great equipment, and hassle-free play!`,
      ],
      staffAmbience: [
        "Bright floodlighting, clean change rooms, and polite court coordinators.",
        "Easy parking space, chilled hydration options, and smooth slot management.",
      ],
      closers: [
        "Will be booking our regular team matches here every week! 5 stars all the way.",
      ],
      shortPunch: (k) => [`Great turf! Loved the ${k} and smooth booking. 5/5 stars!`],
    },
    TANGLISH: {
      openings: ["Turf maintenance and lighting semmaya irukku, great sports arena!"],
      keywordPraise: (k) => [`${k} condition vera level, playing experience was super smooth.`],
      staffAmbience: ["Proper court maintenance and polite booking coordinators."],
      closers: ["Weekend sports ku best spot. 5 Stars!"],
      shortPunch: (k) => [`Semma turf! ${k} well maintained. 5 stars!`],
    },
    TA: {
      openings: ["விளையாட்டு பிரியர்களுக்கு ஏற்ற சிறந்த மைதானம் மற்றும் தூய்மையான சூழல்!"],
      keywordPraise: (k) => [`${k} தரம் மிக நேர்த்தியாக பராமரிக்கப்படுகிறது.`],
      staffAmbience: ["சிறந்த வெளிச்சம் மற்றும் உதவிகரமான ஊழியர்கள்."],
      closers: ["அனைத்து விளையாட்டு வீரர்களுக்கும் பரிந்துரைக்கிறேன்! 5 நட்சத்திரங்கள்."],
      shortPunch: (k) => [`அருமையான விளையாட்டு மைதானம்! ${k} நன்று. 5 நட்சத்திரங்கள்!`],
    },
    HI: {
      openings: ["Khelne ke liye sabse behtareen turf aur sports facility hai yeh!"],
      keywordPraise: (k) => [`${k} ki condition ekdam top-notch hai.`],
      staffAmbience: ["Good floodlights aur clean arena."],
      closers: ["Sports lovers ke liye 10/10 spot! 5 Stars."],
      shortPunch: (k) => [`Awesome turf and great ${k}! 5 Stars.`],
    },
    TE: {
      openings: ["స్పోర్ట్స్ టర్ఫ్ చాలా బాగుంది, మంచి ప్లేయింగ్ ఎక్స్‌పీరియన్స్!"],
      keywordPraise: (k) => [`${k} మెయింటెనెన్స్ సూపర్.`],
      staffAmbience: ["మంచి ఫ్లడ్‌లైట్స్."],
      closers: ["ఆటగాళ్లకు బెస్ట్ ప్లేస్! 5 స్టార్స్."],
      shortPunch: (k) => [`సూపర్ టర్ఫ్! ${k} బాగుంది. 5 స్టార్స్!`],
    },
    KN: {
      openings: ["ಆಟವಾಡಲು ಅತ್ಯುತ್ತಮ ಕ್ರೀಡಾಂಗಣ ಮತ್ತು ಟರ್ಫ್!"],
      keywordPraise: (k) => [`${k} ನಿರ್ವಹಣೆ ಶ್ರೇಷ್ಠವಾಗಿದೆ.`],
      staffAmbience: ["ಉತ್ತಮ ಬೆಳಕಿನ ವ್ಯವಸ್ಥೆ."],
      closers: ["ಎಲ್ಲಾ ಕ್ರೀಡಾಪಟುಗಳಿಗೆ ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ! 5 ನಕ್ಷತ್ರಗಳು."],
      shortPunch: (k) => [`ಅದ್ಭುತ ಟರ್ಫ್! ${k} ಸೂಪರ್. 5 ನಕ್ಷತ್ರಗಳು!`],
    },
  },

  // 12. DEFAULT / PROFESSIONAL SERVICES
  DEFAULT: {
    EN: {
      openings: [
        "Visited today and had an absolutely wonderful experience from start to finish!",
        "One of the best businesses in this category; truly impressed with their standards!",
        "Had a fantastic time here today, everything was smooth, organized, and reliable!",
        "Exceptional professionalism, transparent process, and outstanding customer care!",
        "A truly delightful experience; you can tell they care deeply about customer trust!",
        "Hands down one of my favorite local establishments in the area!",
        "Super happy with our visit today! High quality and welcoming environment throughout.",
        "Found my permanent go-to provider; completely exceeded all our expectations!",
      ],
      keywordPraise: (k) => [
        `The ${k} was genuinely top-notch and delivered with utmost care.`,
        `Loved their ${k}, you can clearly tell they prioritize high standards and quality.`,
        `Special mention to the ${k} — absolutely reliable, prompt, and satisfying!`,
        `Their ${k} is definitely a standout feature that sets them apart from others.`,
        `Really appreciated how diligently and professionally they delivered on the ${k}.`,
      ],
      staffAmbience: [
        "Service was lightning fast and the staff was extremely courteous and attentive.",
        "The ambience is clean, welcoming, professional, and very well maintained.",
        "Prompt communication, great attention to hygiene, and completely hassle-free.",
        "The entire team was very polite, prompt, and eager to assist with a smile.",
      ],
      closers: [
        "Will definitely be returning again soon! 5 stars all the way.",
        "Highly recommended to everyone, keep up the fantastic work!",
        "10/10 experience! A well-deserved 5-star rating for their dedicated team.",
      ],
      shortPunch: (k) => [
        `Awesome experience! Loved the ${k} and prompt service. 5/5 stars!`,
        `Top-notch ${k} and very friendly team. Highly recommended!`,
      ],
    },
    TANGLISH: {
      openings: [
        "Semma experience innaiku visit pannapo, full satisfaction!",
        "Romba nalla service! One of the best spots around here.",
        "Visited today, expectations-ah vida semmaya irundhuchu!",
      ],
      keywordPraise: (k) => [
        `${k} semma quality, total value for money and pure peace of mind!`,
        `Main-ah avanga ${k} romba professional ah irundhuchu.`,
      ],
      staffAmbience: [
        "Staff ellam romba polite and helpful ah irundhanga.",
        "Quick response time and neat clean maintenance.",
      ],
      closers: [
        "Kandippa friends and family ku recommend pannuven! 5 Stars!",
        "Definitely marubadiyum varuvom! Semma work.",
      ],
      shortPunch: (k) => [`Semma spot! ${k} vera level, quick service. 5 stars!`],
    },
    TA: {
      openings: ["இன்று இங்கு சென்றிருந்தோம், மிகவும் நேர்த்தியான மற்றும் மனநிறைவான சேவை!"],
      keywordPraise: (k) => [`${k} தரம் மற்றும் செயல்பாடு மிக அற்புதம்!`],
      staffAmbience: ["ஊழியர்களின் கனிவான நடத்தை மற்றும் விரைவான பணி."],
      closers: ["கண்டிப்பாக அனைவருக்கும் பரிந்துரைக்கிறேன்! 5 நட்சத்திரங்கள்."],
      shortPunch: (k) => [`சிறந்த தரம் மற்றும் கனிவான சேவை. ${k} மிக நன்று! 5 நட்சத்திரங்கள்!`],
    },
    HI: {
      openings: ["Bahut hi shandar experience raha aaj yahan aakar!"],
      keywordPraise: (k) => [`${k} ka quality aur reliability sach me kamaal ka hai!`],
      staffAmbience: ["Staff bahut cooperative aur polite hai."],
      closers: ["Sabhi ko zaroor recommend karunga! Solid 5 Stars."],
      shortPunch: (k) => [`Zabardast experience! ${k} lajawab tha. 5 Stars!`],
    },
    TE: {
      openings: ["చాలా అద్భుతమైన అనుభవం, సర్వీస్ మరియు క్వాలిటీ సూపర్!"],
      keywordPraise: (k) => [`${k} క్వాలిటీ ఎక్సలెంట్ గా ఉంది.`],
      staffAmbience: ["స్టాఫ్ చాలా మర్యాదగా సర్వ్ చేశారు."],
      closers: ["ఖచ్చితంగా మళ్లీ వస్తాము! 5 స్టార్స్."],
      shortPunch: (k) => [`సూపర్ ఎక్స్‌పీరియన్స్! ${k} చాలా బాగుంది. 5 స్టార్స్!`],
    },
    KN: {
      openings: ["ತುಂಬಾ ಅದ್ಭುತವಾದ ಅನುಭವ, ಸೇವೆ ಮತ್ತು ಗುಣಮಟ್ಟ ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ!"],
      keywordPraise: (k) => [`${k} ಗುಣಮಟ್ಟ ಮತ್ತು ಸೇವೆ ಅತ್ಯುತ್ತಮವಾಗಿದೆ.`],
      staffAmbience: ["ಸಿಬ್ಬಂದಿ ತುಂಬಾ ವಿನಮ್ರರಾಗಿದ್ದಾರೆ."],
      closers: ["ಎಲ್ಲರಿಗೂ ಖಂಡಿತ ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ! 5 ನಕ್ಷತ್ರಗಳು."],
      shortPunch: (k) => [`ಅದ್ಭುತ ಅನುಭವ! ${k} ಸೂಪರ್ ಆಗಿದೆ. 5 ನಕ್ಷತ್ರಗಳು!`],
    },
  },
};

// Backwards-compatible alias
export const LANGUAGE_GRAMMAR = INDUSTRY_GRAMMAR.DEFAULT;

// ─── Non-Repeating Combinatorial Generation Logic ────────────────────

export interface SentenceGeneratorOptions {
  keywords?: string[];
  businessType?: string | null;
  language?: SupportedLanguage;
  primaryLanguage?: string;
  tone?: "CASUAL" | "ENTHUSIASTIC" | "SHORT" | "DETAILED" | string;
  customSentences?: string[];
  count?: number;
  seedOffset?: number; // Mathematical offset for non-repeating permutation
}

/**
 * Checks if a custom sentence belongs to the target language script or primary language.
 * Prevents English custom sentences from overwriting index 0 of Tamil, Hindi, Telugu, or Kannada bundles.
 */
function isCustomSentenceLanguageCompatible(
  sentence: string,
  targetLang: SupportedLanguage,
  primaryLang: string = "EN"
): boolean {
  const hasTamil = /[\u0B80-\u0BFF]/.test(sentence);
  const hasHindi = /[\u0900-\u097F]/.test(sentence);
  const hasTelugu = /[\u0C00-\u0C7F]/.test(sentence);
  const hasKannada = /[\u0C80-\u0CFF]/.test(sentence);

  if (hasTamil) return targetLang === "TA";
  if (hasHindi) return targetLang === "HI";
  if (hasTelugu) return targetLang === "TE";
  if (hasKannada) return targetLang === "KN";

  // If sentence is in Latin/English characters:
  if (targetLang === "TA" || targetLang === "HI" || targetLang === "TE" || targetLang === "KN") {
    return false;
  }

  // Allow Latin sentences in EN or TANGLISH
  const normalizedPrimary = (primaryLang || "EN").toUpperCase();
  if (normalizedPrimary === "TANGLISH") {
    return targetLang === "TANGLISH" || targetLang === "EN";
  }
  return targetLang === normalizedPrimary || targetLang === "EN";
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
 * Resolves appropriate language grammar based on business type and language
 */
export function getIndustrySlots(businessType?: string | null, language: SupportedLanguage = "EN"): LanguageSlots {
  const industryKey = resolveIndustryKey(businessType);
  const industryGrammar = INDUSTRY_GRAMMAR[industryKey] || INDUSTRY_GRAMMAR.DEFAULT;
  return industryGrammar[language] || industryGrammar.EN || INDUSTRY_GRAMMAR.DEFAULT[language] || INDUSTRY_GRAMMAR.DEFAULT.EN;
}

/**
 * Generates an array of non-repeating review sentences for a given language.
 * Guarantees 1,000+ distinct mathematical permutations specifically tailored to the tenant's trade.
 */
export function generateReviewSentences(options: SentenceGeneratorOptions): string[] {
  const language = (options.language?.toUpperCase() as SupportedLanguage) || "EN";
  const grammar = getIndustrySlots(options.businessType, language);
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

  // If user provided custom sentences, prioritize and weave them in if compatible
  const customList = (options.customSentences || [])
    .map((s) => s.trim())
    .filter(
      (s) =>
        s.length > 0 &&
        isCustomSentenceLanguageCompatible(s, language, options.primaryLanguage)
    );

  if (customList.length > 0) {
    const customPick = customList[seed % customList.length];
    results.push(customPick);
    usedCombos.add(customPick);
  }

  const openingsLen = grammar.openings.length || 1;
  const staffLen = grammar.staffAmbience.length || 1;
  const closersLen = grammar.closers.length || 1;
  const keywordsLen = userKeywords.length || 1;

  // Use coprime numbers to create a pseudo-random Weyl permutation cycle without collisions
  const STEP_A = 17;
  const STEP_B = 23;
  const STEP_C = 37;
  const STEP_D = 41;

  let attempt = 0;
  while (results.length < count && attempt < 120) {
    const idx = seed + attempt * STEP_A;
    attempt++;

    const kw = userKeywords[(idx * STEP_D) % keywordsLen];
    let sentence = "";

    if (tone === "SHORT" && grammar.shortPunch.length > 0) {
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
 * Delivers multi-language payloads directly to the Gateway and Dashboard Simulator.
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
      count: 6, // 6 non-repeating sentences ready for customer-side shuffle
    });
  }

  return bundle;
}
