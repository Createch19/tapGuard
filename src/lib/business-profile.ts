export type ProfileLanguage = "EN" | "TA" | "HI";
export type ProfileThemeStyle = "LIGHT" | "DARK" | "EXECUTIVE" | "LUXE_DARK" | "MINIMAL" | "VIBRANT";

export type ProfileSectionKey =
  | "quickActions"
  | "upi"
  | "catalog"
  | "enquiry"
  | "about"
  | "hours"
  | "map"
  | "reviews"
  | "social";

export const DEFAULT_SECTION_ORDER: ProfileSectionKey[] = [
  "quickActions",
  "upi",
  "catalog",
  "enquiry",
  "about",
  "hours",
  "map",
  "reviews",
  "social",
];

export const SECTION_METADATA: Record<
  ProfileSectionKey,
  { defaultTitle: string; defaultSubtitle: string; icon: string; description: string }
> = {
  quickActions: {
    defaultTitle: "Quick Connect",
    defaultSubtitle: "Call, WhatsApp, Maps & Contact",
    icon: "⚡",
    description: "4-action button bar for immediate customer contact & directions",
  },
  upi: {
    defaultTitle: "Instant UPI Payment",
    defaultSubtitle: "Google Pay, PhonePe, Paytm & CRED",
    icon: "💳",
    description: "1-tap mobile payment checkout & scan-and-pay QR code",
  },
  catalog: {
    defaultTitle: "Menu & Catalog",
    defaultSubtitle: "Explore our offerings & prices",
    icon: "🍱",
    description: "Categorized products/services with prices, photos & WhatsApp enquiry",
  },
  enquiry: {
    defaultTitle: "Appointment & Enquiry",
    defaultSubtitle: "Book a slot or send a query",
    icon: "📅",
    description: "Customer booking & lead form sent directly to your WhatsApp",
  },
  about: {
    defaultTitle: "About Us",
    defaultSubtitle: "Our story & background",
    icon: "📖",
    description: "Business background, description, and bio",
  },
  hours: {
    defaultTitle: "Operating Hours",
    defaultSubtitle: "When we are open",
    icon: "🕒",
    description: "Store or clinic working days and hours",
  },
  map: {
    defaultTitle: "Store Location & Directions",
    defaultSubtitle: "Find us in person",
    icon: "📍",
    description: "Physical address with 1-tap Google Maps directions",
  },
  reviews: {
    defaultTitle: "Google Reviews & Ratings",
    defaultSubtitle: "See what customers say",
    icon: "⭐",
    description: "5-Star rating link to your Google Business Profile",
  },
  social: {
    defaultTitle: "Social Channels",
    defaultSubtitle: "Follow us online",
    icon: "🌐",
    description: "Instagram, Facebook, and YouTube social channels",
  },
};

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  price?: string;
  description?: string;
  imageUrl?: string;
  badge?: string;
}

export interface BusinessProfileData {
  themeStyle?: ProfileThemeStyle;
  coverImageUrl?: string;
  logoUrl?: string;
  tagline?: string;
  category?: string;
  bio?: string;

  // UPI Payment Integration
  upiId?: string;
  upiPayeeName?: string;
  enableUpi?: boolean;

  // Direct Contact & Actions
  whatsappNumber?: string;
  whatsappGreeting?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactName?: string;
  address?: string;
  googleMapsUrl?: string;
  enableVCard?: boolean;

  // Social Channels
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;

  // Operating Hours
  businessHoursText?: string;

  // Categorized Catalog / Menu / Services
  catalogCategories?: string[];
  catalogItems?: CatalogItem[];

  // Gallery Photos
  galleryPhotos?: string[];

  // Appointment / Enquiry Form
  enableEnquiryForm?: boolean;
  enquiryTargetWhatsapp?: string;

  // Ordered sections sequence
  sectionOrder?: ProfileSectionKey[];

  // Custom section titles & subtitles (allows merchant to rename any tile)
  sectionTitles?: Partial<Record<ProfileSectionKey, string>>;
  sectionSubtitles?: Partial<Record<ProfileSectionKey, string>>;

  // Section visibility toggles
  sections?: {
    upi?: boolean;
    quickActions?: boolean;
    about?: boolean;
    catalog?: boolean;
    enquiry?: boolean;
    gallery?: boolean;
    hours?: boolean;
    reviews?: boolean;
    social?: boolean;
    map?: boolean;
  };
}

export const DEFAULT_BUSINESS_PROFILE: BusinessProfileData = {
  themeStyle: "LIGHT",
  coverImageUrl: "",
  logoUrl: "",
  tagline: "Professional Excellence & Personal Care",
  category: "Business & Services",
  bio: "Welcome to our official page. Explore our services, get in touch, or make quick payments directly.",
  enableUpi: true,
  enableVCard: true,
  contactName: "",
  instagramUrl: "",
  facebookUrl: "",
  youtubeUrl: "",
  twitterUrl: "",
  enableEnquiryForm: true,
  businessHoursText: "Mon - Sat: 9:00 AM - 9:00 PM | Sun: 10:00 AM - 2:00 PM",
  sectionOrder: DEFAULT_SECTION_ORDER,
  sectionTitles: {},
  sectionSubtitles: {},
  catalogCategories: ["Featured Services", "Consultation"],
  catalogItems: [
    {
      id: "item-1",
      name: "Standard Consultation",
      category: "Consultation",
      price: "₹499",
      description: "Direct consultation and evaluation with our certified specialists.",
      badge: "Popular",
    },
    {
      id: "item-2",
      name: "Complete Service Package",
      category: "Featured Services",
      price: "₹1,499",
      description: "Comprehensive end-to-end service including review and priority support.",
      badge: "Recommended",
    },
  ],
  galleryPhotos: [],
  sections: {
    quickActions: true,
    upi: true,
    about: true,
    catalog: true,
    enquiry: true,
    gallery: true,
    hours: true,
    reviews: true,
    social: true,
    map: true,
  },
};

export const PROFILE_TRANSLATIONS = {
  EN: {
    langName: "English",
    quickConnect: "Quick Connect",
    callUs: "Call",
    whatsapp: "WhatsApp",
    directions: "Directions",
    saveContact: "Save Contact",
    vcardSubtitle: "Download to Phone Contacts",
    upiTitle: "UPI Instant Payment",
    upiSubtitle: "Pay directly via GPay, PhonePe, Paytm, or CRED",
    payNow: "Pay Now via UPI",
    scanQr: "Show QR Code",
    hideQr: "Hide QR Code",
    copyUpi: "Copy UPI ID",
    copied: "Copied!",
    aboutUs: "About Us",
    catalogTitle: "Menu & Offerings",
    catalogSubtitle: "Browse our services, menu, or products",
    allCategories: "All",
    enquireItem: "Enquire on WhatsApp",
    enquiryTitle: "Book Appointment / Enquiry",
    enquirySubtitle: "Fill in your details to connect with us immediately",
    nameLabel: "Your Name *",
    namePlaceholder: "e.g. John Doe",
    phoneLabel: "Phone Number *",
    phonePlaceholder: "e.g. +91 98765 43210",
    timeLabel: "Preferred Date & Time",
    timePlaceholder: "e.g. Tomorrow 11:00 AM",
    msgLabel: "Requirement / Message",
    msgPlaceholder: "Tell us how we can help you...",
    sendEnquiry: "Send Enquiry via WhatsApp",
    galleryTitle: "Gallery & Ambience",
    hoursTitle: "Business Working Hours",
    openNow: "Open Now",
    closed: "Closed Today",
    locationTitle: "Visit Our Location",
    openMaps: "Open in Google Maps",
    reviewsTitle: "Google Reviews & Ratings",
    rateUs: "Write a Review on Google",
    socialTitle: "Connect With Us",
    poweredBy: "Powered by TapGenie — Smart Business Profile",
  },
  TA: {
    langName: "தமிழ்",
    quickConnect: "விரைவு தொடர்பு",
    callUs: "அழைக்கவும்",
    whatsapp: "வாட்ஸ்அப்",
    directions: "வழிகாட்டுதல்",
    saveContact: "தொடர்பைச் சேமி",
    vcardSubtitle: "தொடர்புகளில் சேமிக்கவும்",
    upiTitle: "UPI உடனடி கட்டணம்",
    upiSubtitle: "GPay, PhonePe, Paytm மூலம் நேரடியாக செலுத்தலாம்",
    payNow: "இப்போது செலுத்தவும்",
    scanQr: "QR குறியீட்டைக் காட்டு",
    hideQr: "QR குறியீட்டை மறை",
    copyUpi: "UPI ஐடியை நகலெடு",
    copied: "நகலெடுக்கப்பட்டது!",
    aboutUs: "எங்களை பற்றி",
    catalogTitle: "பட்டியல் மற்றும் சேவைகள்",
    catalogSubtitle: "எங்கள் சேவைகள் மற்றும் விலைகளை அறியவும்",
    allCategories: "அனைத்தும்",
    enquireItem: "விசாரிக்க வாட்ஸ்அப் செய்யவும்",
    enquiryTitle: "முன்பதிவு / விசாரணை",
    enquirySubtitle: "உடனடி தகவலுக்கு உங்கள் விவரங்களை பகிரவும்",
    nameLabel: "உங்கள் பெயர் *",
    namePlaceholder: "எ.கா: ரமேஷ் குமார்",
    phoneLabel: "தொலைபேசி எண் *",
    phonePlaceholder: "எ.கா: +91 98765 43210",
    timeLabel: "விருப்பமான நாள் & நேரம்",
    timePlaceholder: "எ.கா: நாளை காலை 11:00 மணி",
    msgLabel: "தேவை / தகவல்",
    msgPlaceholder: "உங்கள் தேவையை இங்கே குறிப்பிடவும்...",
    sendEnquiry: "வாட்ஸ்அப்பில் அனுப்பவும்",
    galleryTitle: "புகைப்படங்கள் & வசதிகள்",
    hoursTitle: "வேலை நேரம்",
    openNow: "திறந்துள்ளது",
    closed: "இன்று மூடப்பட்டுள்ளது",
    locationTitle: "எங்கள் முகவரி",
    openMaps: "கூகிள் மேப்ஸில் திறக்கவும்",
    reviewsTitle: "கூகிள் மதிப்பாய்வுகள்",
    rateUs: "கூகிளில் மதிப்பாய்வு செய்க",
    socialTitle: "சமூக வலைத்தளங்கள்",
    poweredBy: "TapGenie மூலம் இயங்குகிறது — வணிக சுயவிவரம்",
  },
  HI: {
    langName: "हिन्दी",
    quickConnect: "त्वरित संपर्क",
    callUs: "कॉल करें",
    whatsapp: "व्हाट्सएप",
    directions: "दिशा-निर्देश",
    saveContact: "संपर्क सहेजें",
    vcardSubtitle: "फ़ोन संपर्कों में जोड़ें",
    upiTitle: "UPI त्वरित भुगतान",
    upiSubtitle: "GPay, PhonePe, Paytm से सीधे भुगतान करें",
    payNow: "अभी भुगतान करें",
    scanQr: "QR कोड दिखाएं",
    hideQr: "QR कोड छुपाएं",
    copyUpi: "UPI आईडी कॉपी करें",
    copied: "कॉपी हो गया!",
    aboutUs: "हमारे बारे में",
    catalogTitle: "मेनू एवं उत्पाद",
    catalogSubtitle: "हमारी सेवाएं और उत्पाद देखें",
    allCategories: "सभी",
    enquireItem: "व्हाट्सएप पर पूछें",
    enquiryTitle: "अपॉइंटमेंट / पूछताछ",
    enquirySubtitle: "त्वरित संपर्क के लिए अपना विवरण साझा करें",
    nameLabel: "आपका नाम *",
    namePlaceholder: "उदा. अमित शर्मा",
    phoneLabel: "फ़ोन नंबर *",
    phonePlaceholder: "उदा. +91 98765 43210",
    timeLabel: "पसंदीदा समय और तारीख",
    timePlaceholder: "उदा. कल सुबह 11:00 बजे",
    msgLabel: "विवरण / संदेश",
    msgPlaceholder: "कृपया अपनी आवश्यकता बताएं...",
    sendEnquiry: "व्हाट्सएप पर भेजें",
    galleryTitle: "गैलरी और स्थान",
    hoursTitle: "कार्य के घंटे",
    openNow: "अभी खुला है",
    closed: "आज बंद है",
    locationTitle: "हमारा पता",
    openMaps: "गूगल मैप्स में खोलें",
    reviewsTitle: "गूगल समीक्षाएं व रेटिंग",
    rateUs: "गूगल पर समीक्षा दें",
    socialTitle: "हमसे जुड़ें",
    poweredBy: "TapGenie द्वारा संचालित — स्मार्ट बिजनेस प्रोफाइल",
  },
};
