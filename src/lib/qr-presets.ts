// Industry presets and SVG icons for Thematic SVG QR Code Generator

export interface QrPreset {
  id: string;
  name: string;
  industry: string;
  iconName: string;
  dotType: "rounded" | "dots" | "classy" | "classy-rounded" | "square" | "extra-rounded";
  cornerSquareType: "dot" | "square" | "extra-rounded";
  cornerDotType: "dot" | "square";
  dotsColor: string;
  dotsGradient?: {
    type: "linear" | "radial";
    colorStops: Array<{ offset: number; color: string }>;
  };
  cornersSquareColor: string;
  cornersDotColor: string;
  backgroundColor: string;
  centerpieceIcon: string;
  description: string;
}

// Clean, high-contrast SVG Data URIs for centerpieces
export const QR_CENTERPIECES: Record<string, { label: string; svgDataUri: string }> = {
  tooth: {
    label: "Dental Tooth",
    svgDataUri:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230284c7' width='48' height='48'><path d='M7.5 2C5 2 3 4.5 3 7.5c0 2.8 1.5 6.2 2.5 10 .8 3 2.5 4.5 3.5 4.5 1.5 0 2-2 3-2s1.5 2 3 2c1 0 2.7-1.5 3.5-4.5 1-3.8 2.5-7.2 2.5-10C21 4.5 19 2 16.5 2c-2.1 0-3.5 1.3-4.5 2.5C11 3.3 9.6 2 7.5 2z'/></svg>",
  },
  scissors: {
    label: "Salon Scissors",
    svgDataUri:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23d97706' width='48' height='48'><circle cx='6' cy='6' r='3' stroke='%23d97706' stroke-width='2' fill='none'/><circle cx='6' cy='18' r='3' stroke='%23d97706' stroke-width='2' fill='none'/><path d='M20 4L8.5 15.5M20 20L8.5 8.5' stroke='%23d97706' stroke-width='2.5' stroke-linecap='round'/></svg>",
  },
  utensils: {
    label: "Restaurant Utensils",
    svgDataUri:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ea580c' width='48' height='48'><path d='M18 2v8h2V2h-2zm-6 0c-1.1 0-2 .9-2 2v6h4V4c0-1.1-.9-2-2-2zM4 2v4c0 1.1.9 2 2 2v14h2V8c1.1 0 2-.9 2-2V2H8v4H6V2H4zm14 10h-2v10h2V12z'/></svg>",
  },
  coffee: {
    label: "Café Coffee Cup",
    svgDataUri:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2392400e' width='48' height='48'><path d='M2 19h18v2H2v-2zm16-9V5H4v8c0 3.3 2.7 6 6 6h4c3.3 0 6-2.7 6-6v-3h-2zm-2 0h2c1.1 0 2 .9 2 2s-.9 2-2 2h-2v-4z'/></svg>",
  },
  dumbbell: {
    label: "Gym Dumbbell",
    svgDataUri:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310b981' width='48' height='48'><path d='M6.5 5h-2C3.7 5 3 5.7 3 6.5v11c0 .8.7 1.5 1.5 1.5h2c.8 0 1.5-.7 1.5-1.5v-11C8 5.7 7.3 5 6.5 5zm13 0h-2c-.8 0-1.5.7-1.5 1.5v11c0 .8.7 1.5 1.5 1.5h2c.8 0 1.5-.7 1.5-1.5v-11c0-.8-.7-1.5-1.5-1.5zm-8.5 6h6v2h-6v-2z'/></svg>",
  },
  shoppingBag: {
    label: "Boutique / Retail",
    svgDataUri:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238b5cf6' width='48' height='48'><path d='M19 6h-2c0-2.8-2.2-5-5-5S7 3.2 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.7 0 3 1.3 3 3H9c0-1.7 1.3-3 3-3zm7 17H5V8h2v2h2V8h6v2h2V8h2v12z'/></svg>",
  },
  pharmacy: {
    label: "Pharmacy & Clinic",
    svgDataUri:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23059669' width='48' height='48'><path d='M19 10.5h-5.5V5h-3v5.5H5v3h5.5V19h3v-5.5H19v-3z'/></svg>",
  },
  star: {
    label: "Review Star",
    svgDataUri:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23eab308' width='48' height='48'><path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/></svg>",
  },
  tapguard: {
    label: "TapGuard Shield",
    svgDataUri:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230d9488' width='48' height='48'><path d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z'/></svg>",
  },
};

export const INDUSTRY_PRESETS: QrPreset[] = [
  {
    id: "dentist",
    name: "Dental & Healthcare",
    industry: "Dentistry & Clinics",
    iconName: "Stethoscope",
    dotType: "extra-rounded",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    dotsColor: "#0284c7",
    dotsGradient: {
      type: "linear",
      colorStops: [
        { offset: 0, color: "#0284c7" },
        { offset: 1, color: "#38bdf8" },
      ],
    },
    cornersSquareColor: "#0369a1",
    cornersDotColor: "#0284c7",
    backgroundColor: "#ffffff",
    centerpieceIcon: "tooth",
    description: "Light blue fluid gradient, extra-rounded dots, circular corners, tooth centerpiece.",
  },
  {
    id: "salon",
    name: "Premium Salon & Spa",
    industry: "Salon, Spa & Beauty",
    iconName: "Scissors",
    dotType: "classy",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    dotsColor: "#b45309",
    dotsGradient: {
      type: "linear",
      colorStops: [
        { offset: 0, color: "#18181b" },
        { offset: 1, color: "#d97706" },
      ],
    },
    cornersSquareColor: "#d97706",
    cornersDotColor: "#18181b",
    backgroundColor: "#ffffff",
    centerpieceIcon: "scissors",
    description: "Gold and dark charcoal colorway, sharp classy dots, diamond-style corners, scissors icon.",
  },
  {
    id: "restaurant",
    name: "Restaurant & Café",
    industry: "Restaurants, Cafés & Bakeries",
    iconName: "Utensils",
    dotType: "rounded",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    dotsColor: "#c2410c",
    dotsGradient: {
      type: "linear",
      colorStops: [
        { offset: 0, color: "#9a3412" },
        { offset: 1, color: "#ea580c" },
      ],
    },
    cornersSquareColor: "#9a3412",
    cornersDotColor: "#ea580c",
    backgroundColor: "#ffffff",
    centerpieceIcon: "utensils",
    description: "Warm amber & terracotta gradient, fluid rounded dots, restaurant centerpiece.",
  },
  {
    id: "gym",
    name: "Gym & Fitness Studio",
    industry: "Fitness & Athletics",
    iconName: "Dumbbell",
    dotType: "classy-rounded",
    cornerSquareType: "square",
    cornerDotType: "square",
    dotsColor: "#059669",
    dotsGradient: {
      type: "linear",
      colorStops: [
        { offset: 0, color: "#065f46" },
        { offset: 1, color: "#10b981" },
      ],
    },
    cornersSquareColor: "#065f46",
    cornersDotColor: "#10b981",
    backgroundColor: "#ffffff",
    centerpieceIcon: "dumbbell",
    description: "High-energy athletic emerald gradient, square-accented corners, dumbbell centerpiece.",
  },
  {
    id: "boutique",
    name: "Boutique & Retail",
    industry: "Fashion & Lifestyle Retail",
    iconName: "ShoppingBag",
    dotType: "dots",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    dotsColor: "#7c3aed",
    dotsGradient: {
      type: "linear",
      colorStops: [
        { offset: 0, color: "#6d28d9" },
        { offset: 1, color: "#a855f7" },
      ],
    },
    cornersSquareColor: "#6d28d9",
    cornersDotColor: "#a855f7",
    backgroundColor: "#ffffff",
    centerpieceIcon: "shoppingBag",
    description: "Vibrant royal violet dots, circular eye markers, shopping bag centerpiece.",
  },
  {
    id: "tapguard",
    name: "TapGuard Brand Standard",
    industry: "All Businesses",
    iconName: "Shield",
    dotType: "rounded",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    dotsColor: "#0f766e",
    dotsGradient: {
      type: "linear",
      colorStops: [
        { offset: 0, color: "#0f766e" },
        { offset: 1, color: "#14b8a6" },
      ],
    },
    cornersSquareColor: "#0f766e",
    cornersDotColor: "#14b8a6",
    backgroundColor: "#ffffff",
    centerpieceIcon: "tapguard",
    description: "Signature Teal & Emerald trust gradient, balanced modern aesthetic, TapGuard shield icon.",
  },
];

// Curated AI Artwork Showcase (Authentic ControlNet QR Monster AI-blended samples)
export const AI_ARTWORK_SHOWCASE = [
  {
    title: "Minimalist Modern Architecture",
    prompt: "Modern brutalist marble and glass architecture with cascading courtyard water reflections, 8k architectural digest photography",
    style: "Minimalist Studio",
    tag: "Clinics & Luxury Venues",
    sampleImage:
      "https://huggingface.co/monster-labs/control_v1p_sd15_qrcode_monster/resolve/main/images/architecture.png",
  },
  {
    title: "Botanical Bonsai Forest",
    prompt: "An ancient giant redwood tree with glowing spiritual moss in an enchanted mountain forest, hyperrealistic studio ghibli watercolor",
    style: "Watercolor Art",
    tag: "Cafés, Spas & Bakeries",
    sampleImage:
      "https://huggingface.co/monster-labs/control_v1p_sd15_qrcode_monster/resolve/main/images/tree.png",
  },
  {
    title: "Cyberpunk Neon Monster",
    prompt: "Futuristic cyberpunk neon creature glowing in an alleyway with holographic billboards, octane 3d render, dramatic neon lighting",
    style: "Cyberpunk Neon",
    tag: "Bars, Clubs & Venues",
    sampleImage:
      "https://huggingface.co/monster-labs/control_v1p_sd15_qrcode_monster/resolve/main/images/monster.png",
  },
  {
    title: "Gothic Gold & Obsidian",
    prompt: "Intricate baroque gold filigree and carved obsidian relief artwork, vintage luxury craftsmanship, volumetric golden rim light",
    style: "Luxury Gold",
    tag: "Salons, Grooming & Jewelry",
    sampleImage:
      "https://huggingface.co/monster-labs/control_v1p_sd15_qrcode_monster/resolve/main/images/skulls.png",
  },
];
