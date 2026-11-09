export type GeminiTone = "SOFT" | "WARM" | "PROFESSIONAL" | "ENTHUSIASTIC" | "CASUAL" | "SHORT" | "LUXURY" | "CUSTOM";
export type GeminiReplyLength = "1_SENTENCE" | "2_SENTENCES" | "3_4_SENTENCES";
import { generateReviewSentences, SupportedLanguage } from "./sentence-generator";

export interface GeminiReviewContext {
  rating: number;
  reviewerName: string;
  comment: string;
  businessName: string;
  businessType?: string | null;
  brandTone?: GeminiTone | string;
  replyLength?: GeminiReplyLength | string;
  knowledgeBase?: string | null;
  customPersona?: string | null;
  apiKey?: string | null;
  model?: string;
}

export interface GeminiQAContext {
  question: string;
  businessName: string;
  businessType?: string | null;
  brandTone?: GeminiTone;
  knowledgeBase?: string | null;
  menuContext?: string | null;
  escalationPhone?: string | null;
  apiKey?: string | null;
  model?: string;
}

/**
 * Generate an authentic, policy-compliant reply to a Google Review
 */
export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";

export function normalizeGeminiModel(model?: string | null): string {
  if (!model || model.startsWith("gemini-1.5") || model.startsWith("gemini-2.0")) {
    return DEFAULT_GEMINI_MODEL;
  }
  return model;
}

export async function generateReviewReply(context: GeminiReviewContext): Promise<string> {
  const {
    rating,
    reviewerName,
    comment,
    businessName,
    businessType = "Business",
    brandTone = "SOFT",
    replyLength = "2_SENTENCES",
    knowledgeBase = "",
    customPersona = "",
    apiKey = process.env.GEMINI_API_KEY,
    model = DEFAULT_GEMINI_MODEL,
  } = context;

  const targetModel = normalizeGeminiModel(model);

  // Prompt construction
  const toneInstructions = {
    SOFT: "Soft, gentle, humble, and deeply polite. Express heartfelt modesty, quiet gratitude, and respect without sounding boastful.",
    WARM: "Warm, hospitable, gracious, and appreciative. Express genuine gratitude for their patronage.",
    PROFESSIONAL: "Polite, courteous, formal, and reassuring. Focus on high standards, reliability, and service excellence.",
    ENTHUSIASTIC: "Energetic, excited, and vibrant. Express high energy, passion, and excitement for their support!",
    CASUAL: "Friendly, upbeat, modern, and conversational. Like a great local neighborhood host.",
    SHORT: "Punchy, concise, sincere, and direct.",
    LUXURY: "Refined, elegant, bespoke, and welcoming. Highlight dedication to craft and unforgettable experiences.",
    CUSTOM: customPersona || "Friendly, professional, and authentic.",
  }[brandTone as string] || "Soft, gentle, and polite.";

  const lengthInstructions = {
    "1_SENTENCE": "Length constraint: Exactly 1 single well-crafted sentence. Do not write more than 1 sentence under any circumstance.",
    "2_SENTENCES": "Length constraint: Exactly 2 complete sentences. Sentence 1 directly acknowledges what they mentioned; Sentence 2 thanks them and welcomes them back.",
    "3_4_SENTENCES": "Length constraint: Between 3 and 4 thoughtful sentences. Give an in-depth, attentive response referencing their feedback.",
  }[replyLength as string] || "Length constraint: Exactly 2 complete sentences.";

  const systemPrompt = `You are the official business owner/manager of "${businessName}" (${businessType}).
A customer left a ${rating}-star Google Review.
Your task is to draft a personalized, authentic, and high-impact reply to be published on Google Maps.

Tone Directive: ${toneInstructions}
${lengthInstructions}
${customPersona ? `Custom Brand Persona: ${customPersona}` : ""}

Store Knowledge & Policies:
${knowledgeBase || "Standard local hospitality and customer satisfaction focus."}

Guidelines:
1. Greet the customer by name ("${reviewerName}") unless anonymous.
2. CAREFULLY READ AND VIEW THE CUSTOMER'S EXACT COMMENT:
   - Identify the specific things they mentioned (e.g. staff behavior, specific items, sports equipment, service speed, prices, cleanliness).
   - Directly respond to what they actually said. NEVER use generic stock templates or forced robotic keyword stuffing.
   - If the comment is in Tamil, Tanglish (colloquial Tamil in English script like "semma experience", "super quality"), or regional phrasing, respond naturally with cultural warmth and respect.
3. Strictly follow the sentence length directive: ${lengthInstructions}
4. For 4-5★ reviews: Warmly thank them for the specific points they loved.
5. For 1-3★ reviews: Express sincere empathy, apologize humbly for falling short, and offer direct management contact to resolve.
6. Return ONLY the final response text without quotes, markdown headers, or prefixes.`;

  const userPrompt = `Customer Name: ${reviewerName}
Rating: ${rating} / 5 Stars
Review Comment: "${comment || "No written text provided, just star rating."}"`;

  // If Gemini API key is configured, call official Gemini REST endpoint
  if (apiKey) {
    const modelsToTry = [
      targetModel,
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash",
    ].filter((m, idx, arr) => arr.indexOf(m) === idx);

    for (const activeModel of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
                },
              ],
              generationConfig: {
                temperature: 0.85,
                maxOutputTokens: 2500,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const candidate = data?.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text?.trim();
          if (candidate) {
            return candidate;
          }
        } else {
          console.warn(`Gemini (${activeModel}) returned non-200 status:`, response.status);
        }
      } catch (err) {
        console.warn(`Gemini (${activeModel}) request failed:`, err);
      }
    }
  }

  // Heuristic Grounded Fallback
  return generateHeuristicReviewReply({
    rating,
    reviewerName,
    comment,
    businessName,
    brandTone: brandTone as GeminiTone,
    replyLength,
  });
}

/**
 * Generate a contextually grounded answer to a Google Maps public question
 */
export async function generateQuestionAnswer(context: GeminiQAContext): Promise<string> {
  const {
    question,
    businessName,
    businessType = "Business",
    brandTone = "WARM",
    knowledgeBase = "",
    menuContext = "",
    escalationPhone = "",
    apiKey = process.env.GEMINI_API_KEY,
    model = DEFAULT_GEMINI_MODEL,
  } = context;

  const targetModel = normalizeGeminiModel(model);

  const systemPrompt = `You are the official representative of "${businessName}" (${businessType}) on Google Maps.
A prospective customer asked a public question on our Google Maps profile.
Your task is to provide a helpful, accurate, and concise answer grounded exclusively in our verified store knowledge.

Store Knowledge & Policies:
${knowledgeBase || "Open daily. Friendly local service."}
${menuContext ? `Menu & Offerings:\n${menuContext}` : ""}
${escalationPhone ? `Store Contact: ${escalationPhone}` : ""}

Rules:
1. Answer the question directly in 1 to 3 clear sentences.
2. If the question asks about parking, dietary options, hours, or pet policies, rely strictly on the provided knowledge.
3. If information is not in the knowledge base, politely state what is known and invite them to call ${escalationPhone || "us directly"} for quick confirmation.
4. Tone: Helpful, welcoming, and accurate.
5. Return ONLY the answer text.`;

  const userPrompt = `Question on Google Maps: "${question}"`;

  if (apiKey) {
    const modelsToTry = [
      targetModel,
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash",
    ].filter((m, idx, arr) => arr.indexOf(m) === idx);

    for (const activeModel of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    { text: `${systemPrompt}\n\n${userPrompt}` }
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 2500,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const candidate = data?.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text?.trim();
          if (candidate) {
            return candidate;
          }
        }
      } catch (err) {
        console.warn(`Gemini QA call error (${activeModel}), falling back:`, err);
      }
    }
  }

  // Heuristic QA Fallback
  return generateHeuristicQAAnswer({
    question,
    businessName,
    knowledgeBase: knowledgeBase || "",
    escalationPhone: escalationPhone || "",
  });
}

export interface GeminiKeywordReviewParams {
  businessName: string;
  businessType?: string | null;
  keywords: string[];
  language?: string; // "EN" | "TANGLISH" | "TA" | "HI" | "TE" | "KN"
  tone?: "CASUAL" | "ENTHUSIASTIC" | "DETAILED" | "SHORT" | string;
  count?: number;
  catalogContext?: string | null;
  knowledgeBase?: string | null;
  apiKey?: string | null;
  model?: string;
}

/**
 * Generate authentic, high-converting customer reviews grounded in the tenant's business using Gemini API
 */
export async function generateDynamicKeywordReviews(
  params: GeminiKeywordReviewParams
): Promise<string[]> {
  const {
    businessName,
    businessType = "Business",
    keywords = [],
    language = "EN",
    tone = "CASUAL",
    count = 5,
    catalogContext = "",
    knowledgeBase = "",
    apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    model = DEFAULT_GEMINI_MODEL,
  } = params;

  const targetModel = normalizeGeminiModel(model);

  const validCount = Math.max(1, Math.min(count, 15));
  const cleanKeywords = keywords.map((k) => k.trim()).filter(Boolean);
  const kwList = cleanKeywords.length > 0 ? cleanKeywords.join(", ") : "quality service, great hospitality";

  const langInstructions: Record<string, string> = {
    EN: "Write in natural, fluent, conversational English as written by genuine local customers. Sound warm, human, and authentic.",
    TANGLISH: "Write in authentic colloquial Tanglish (Tamil written in English Latin alphabet as spoken daily by customers in Chennai and Tamil Nadu). Use natural regional terms like 'semma', 'vera level', 'romba nalla', 'kandippa must try', 'super quality', 'staff ellam polite ah irundhanga'. Do NOT write pure formal English.",
    TA: "Write in natural, conversational, polite Tamil script (தமிழ்). Use respectful, appreciative vocabulary that local guests naturally write.",
    HI: "Write in natural, conversational Hindi/Hinglish (हिन्दी/Hinglish). Warm, enthusiastic, and authentic (e.g. 'lajawab', 'shandar service', 'ekdam best', 'family ke sath aane ke liye best jagah').",
    TE: "Write in natural conversational Telugu script (తెలుగు). Warm, authentic, appreciative, and culturally polite.",
    KN: "Write in natural conversational Kannada script (ಕನ್ನಡ). Warm, authentic, appreciative, and culturally polite.",
  };

  const targetLangGuide = langInstructions[language.toUpperCase()] || langInstructions["EN"];

  const toneGuide = {
    CASUAL: "Friendly, relaxed, and conversational. Like a customer telling a friend about a great local discovery.",
    ENTHUSIASTIC: "Energetic, excited, and full of praise. Emphasize why this place exceeded expectations.",
    DETAILED: "Informative and specific (2-3 sentences), mentioning the experience, item quality, and staff hospitality.",
    SHORT: "Punchy, concise (1-2 sentences), impactful, and straight to the point.",
  }[tone] || "Friendly and positive.";

  const systemPrompt = `You are an elite Google Review generation AI for local storefronts.
Your job is to generate ${validCount} diverse, completely unique 5-star Google Review recommendations written from the perspective of real, satisfied customers of "${businessName}" (${businessType}).

CRITICAL REQUIREMENTS:
1. SPECIFIC TO THE BUSINESS: Each review MUST be deeply rooted in the trade and craft of "${businessType}". Mention sensory details, items, or interactions authentic to this specific business (e.g. for a bakery: fresh oven aroma, buttery crust, espresso; for a salon: skilled styling, hair wash, hygiene; for a clinic: painless care, gentle doctor; for auto: honest pricing, smooth engine, quick service).
2. KEYWORD INTEGRATION: Naturally weave in one or more of these target keywords into each review: [${kwList}]. NEVER keyword-stuff. They must read seamlessly.
3. LANGUAGE DIRECTIVE: ${targetLangGuide}
4. TONE: ${toneGuide}
5. DIVERSITY: Ensure every review has a distinct angle (e.g. one praising a specific signature item, one praising the welcoming staff & ambience, one recommending it for families/friends, one short punchy review).
${catalogContext ? `Verified Store Menu & Offerings Context: ${catalogContext}` : ""}
${knowledgeBase ? `Store Background & Values: ${knowledgeBase}` : ""}

OUTPUT FORMAT:
Return ONLY a valid JSON array of ${validCount} strings.
Example: ["Review text 1...", "Review text 2...", "Review text 3..."]
Do NOT wrap in markdown codeblocks (no \`\`\`json). Do NOT add explanations or intro text.`;

  const userPrompt = `Generate ${validCount} authentic 5-star reviews for "${businessName}" (${businessType}) incorporating keywords: ${kwList} in language: ${language}.`;

  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
              },
            ],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 1200,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (candidateText) {
          const cleaned = candidateText
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```$/i, "")
            .trim();

          try {
            let textToParse = cleaned;
            if (!textToParse.endsWith("}") && !textToParse.endsWith("]")) {
              const lastBrace = textToParse.lastIndexOf("}");
              if (lastBrace > 0) {
                textToParse = textToParse.slice(0, lastBrace + 1);
              }
            }

            let parsed: any;
            try {
              parsed = JSON.parse(textToParse);
            } catch {
              parsed = JSON.parse(cleaned);
            }
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed.map((item) => String(item).trim()).filter((s) => s.length > 0);
            }
          } catch {
            // Fallback line-by-line parsing if JSON parse had a trailing comma
            const lines = candidateText
              .split("\n")
              .map((l: string) => l.replace(/^[\d+.\-*"]\s*/, "").replace(/["\],]+$/, "").trim())
              .filter((l: string) => l.length > 15);
            if (lines.length > 0) {
              return lines.slice(0, validCount);
            }
          }
        }
      } else {
        console.warn(`Gemini API returned status ${response.status}`);
      }
    } catch (err) {
      console.warn("Gemini dynamic review generation failed, falling back to industry engine:", err);
    }
  }

  // Fallback to industry-grounded permutation engine
  return generateReviewSentences({
    keywords: cleanKeywords,
    businessType,
    language: (language.toUpperCase() as SupportedLanguage) || "EN",
    tone: (tone as any) || "CASUAL",
    count: validCount,
  });
}

// ─── Heuristic Fallbacks ──────────────────────────────────

function generateHeuristicReviewReply(params: {
  rating: number;
  reviewerName: string;
  comment: string;
  businessName: string;
  brandTone: GeminiTone;
  replyLength?: GeminiReplyLength | string;
}): string {
  const { rating, reviewerName, comment, businessName, brandTone, replyLength = "2_SENTENCES" } = params;
  const name = reviewerName && reviewerName !== "A Google User" ? reviewerName : "valued guest";
  const lower = (comment || "").toLowerCase();

  const pick = (options: string[]) => options[Math.floor(Math.random() * options.length)];

  if (rating >= 4) {
    if (replyLength === "1_SENTENCE" || brandTone === "SHORT") {
      return pick([
        `Thank you so much for the wonderful 5-star review and for supporting ${businessName}, ${name}!`,
        `We are thrilled you had such a great experience with us at ${businessName}, ${name}—thank you for the 5 stars!`,
        `Huge thanks for the 5-star rating, ${name}; we truly appreciate your support for ${businessName}!`,
      ]);
    }

    if (brandTone === "SOFT") {
      return pick([
        `Thank you so much for your kind words and for visiting ${businessName}, ${name}. Our team is truly humbled and grateful for your support, and we look forward to serving you again soon!`,
        `Dear ${name}, we are deeply touched by your thoughtful review. Thank you for your continued trust in ${businessName}, and we hope to welcome you back very soon.`,
        `We sincerely appreciate your heartfelt feedback, ${name}. Serving you at ${businessName} is always our joy, and our entire crew is grateful for your kindness!`,
      ]);
    }

    if (brandTone === "ENTHUSIASTIC") {
      return pick([
        `Awesome! Thank you so much for the fantastic 5-star review, ${name}! We love having you at ${businessName} and can't wait to see you for your next visit!`,
        `Woohoo! You just made our whole team's day, ${name}! Thank you for the incredible love and support for ${businessName}—see you again soon!`,
        `Thank you so much for the stellar review, ${name}! We're beyond excited that you had a blast at ${businessName}!`,
      ]);
    }

    if (brandTone === "PROFESSIONAL") {
      return pick([
        `Dear ${name}, thank you for taking the time to share your positive experience at ${businessName}. Our team is committed to maintaining the highest standard of service and hospitality, and we truly appreciate your patronage.`,
        `Dear ${name}, we appreciate you sharing your positive rating with our business. Excellence and reliability remain our priority at ${businessName}, and we look forward to assisting you on future visits.`,
        `Thank you for your valuable feedback and recommendation, ${name}. It is our pleasure to deliver quality service at ${businessName}, and we look forward to serving you again.`,
      ]);
    }

    if (brandTone === "LUXURY") {
      return pick([
        `It was our utmost pleasure hosting you at ${businessName}, ${name}. Thank you for your generous praise; our team is dedicated to curating memorable moments, and we eagerly await your next visit.`,
        `Dear ${name}, thank you for your esteemed review. It is an honor to exceed your expectations at ${businessName}, and we remain devoted to delivering an exemplary standard of care.`,
      ]);
    }

    // WARM / CASUAL
    let highlight = "your kind words";
    if (lower.includes("sports") || lower.includes("turf") || lower.includes("bat") || lower.includes("ball") || lower.includes("ground") || lower.includes("shop")) {
      highlight = "shopping and playing with us";
    } else if (lower.includes("food") || lower.includes("dish") || lower.includes("croissant") || lower.includes("coffee")) {
      highlight = "your compliments on our culinary offerings";
    } else if (lower.includes("staff") || lower.includes("service")) {
      highlight = "recognizing our dedicated team";
    }

    return pick([
      `Hi ${name}! Thank you so much for the 5-star review! We are delighted that you enjoyed ${highlight} at ${businessName}. Your support means the world to our local crew, and we can't wait to see you again soon!`,
      `Hey ${name}, thank you for the wonderful 5-star feedback! Hearing that you had such a great time with ${highlight} at ${businessName} brings a smile to all of us. Looking forward to welcoming you back!`,
      `Hi ${name}! Thanks a ton for stopping by ${businessName} and sharing your experience. We truly appreciate your support and can’t wait to have you back with us soon!`,
    ]);
  }

  // 1 to 3 stars
  return pick([
    `Hi ${name}, thank you for bringing this to our attention. We are sincerely sorry that your recent visit to ${businessName} did not reflect the quality and care we strive to provide. We take feedback seriously and would appreciate the opportunity to make things right—please reach out to our management team directly so we can look into this for you.`,
    `Dear ${name}, we apologize that your experience at ${businessName} fell short of expectations. Your satisfaction is our priority, and we would welcome the chance to speak with you directly to address your concerns and make amends.`,
  ]);
}

function generateHeuristicQAAnswer(params: {
  question: string;
  businessName: string;
  knowledgeBase: string;
  escalationPhone: string;
}): string {
  const q = params.question.toLowerCase();
  const kb = params.knowledgeBase.toLowerCase();

  if (q.includes("park") || q.includes("valet")) {
    if (kb.includes("valet") || kb.includes("parking")) {
      return `Yes! We offer convenient parking for our customers. Please check with our front desk upon arrival for direct assistance.`;
    }
    return `Street and nearby public parking are available around ${params.businessName}. Feel free to call us at ${params.escalationPhone || "our front desk"} if you need exact directions!`;
  }

  if (q.includes("vegan") || q.includes("vegetarian") || q.includes("gluten") || q.includes("halal")) {
    return `Yes! ${params.businessName} features dietary-friendly options clearly marked on our live menu. Our staff is always happy to accommodate special dietary preferences.`;
  }

  if (q.includes("pet") || q.includes("dog")) {
    return `Well-behaved pets and service animals are welcome in our outdoor seating section! Fresh water bowls are happily provided on request.`;
  }

  if (q.includes("reserv") || q.includes("book") || q.includes("table")) {
    return `We warmly accept walk-ins throughout the day, and recommend table reservations for large groups or weekend evenings. You can reach us directly at ${params.escalationPhone || "our reception"} to reserve.`;
  }

  return `Thank you for asking! We're open and excited to assist you at ${params.businessName}. Please feel free to give us a call at ${params.escalationPhone || "our main number"} for any immediate questions!`;
}

// ─── Location & Trending Keywords Intelligence ─────────────

export interface LocationKeywordSuggestion {
  keyword: string;
  type: "TRENDING" | "LOCAL_GEO" | "HIGH_INTENT";
  tag: string;
  searchIntent: string;
}

export interface GenerateLocationKeywordsParams {
  businessName: string;
  businessType?: string | null;
  location?: string | null;
  services?: string | null;
  existingKeywords?: string[];
  apiKey?: string | null;
  model?: string;
}

/**
 * Generate high-converting location-wise and city trending keywords using Gemini
 */
export async function generateLocationTrendingKeywords(
  params: GenerateLocationKeywordsParams
): Promise<LocationKeywordSuggestion[]> {
  const {
    businessName,
    businessType = "Business",
    location = "",
    services = "",
    existingKeywords = [],
    apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    model = DEFAULT_GEMINI_MODEL,
  } = params;

  const targetModel = normalizeGeminiModel(model);
  const cleanExisting = (existingKeywords || []).map((k) => k.trim().toLowerCase()).filter(Boolean);
  const locStr = location?.trim() || "Local Area";

  const systemPrompt = `You are an elite Local SEO & Google Search Trends specialist.
Your task is to analyze the business, its specific service location/city, and category to generate 12 to 16 high-impact local search keywords.

FOCUS AREAS:
1. "TRENDING": Trending searches, seasonal spikes, event/tournament queries, and high-velocity searches around the city/district.
2. "LOCAL_GEO": Specific geo-targeted keywords combining the service/trade with the locality, neighboring towns, transit corridors, and landmarks.
3. "HIGH_INTENT": High-conversion search queries where customers are actively looking to book, buy, visit, or hire immediately ("near me", "price", "booking", "open now", "best").

CRITICAL RULES:
- Keywords must be realistic queries that real local customers type into Google Maps & Google Search.
- Do NOT repeat existing keywords: [${cleanExisting.join(", ")}].
- Return ONLY a valid JSON array of objects with keys:
  - "keyword": lowercase string
  - "type": "TRENDING" | "LOCAL_GEO" | "HIGH_INTENT"
  - "tag": short badge string with an emoji (e.g. "🔥 Trending in City", "📍 Locality", "⚡ High Intent")
  - "searchIntent": brief explanation of customer search behavior (under 8 words)
Do not include markdown codeblocks or text outside the JSON array.`;

  const userPrompt = `Business: "${businessName}"
Category / Trade: "${businessType}"
Service Location / Area: "${locStr}"
${services ? `Services & Specialties: "${services}"` : ""}
Existing Keywords to avoid duplicates: [${cleanExisting.join(", ")}]`;

  if (apiKey) {
    const modelsToTry = [
      "gemini-3.5-flash-lite",
      targetModel,
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash",
    ].filter((m, idx, arr) => arr.indexOf(m) === idx);

    for (const activeModel of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
              generationConfig: {
                maxOutputTokens: 4500,
                temperature: 0.6,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text;
          if (rawText) {
            let cleaned = rawText.trim();
            if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
            if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
            if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
            cleaned = cleaned.trim();

            let textToParse = cleaned;
            if (!textToParse.endsWith("}") && !textToParse.endsWith("]")) {
              const lastBrace = textToParse.lastIndexOf("}");
              if (lastBrace > 0) {
                textToParse = textToParse.slice(0, lastBrace + 1);
              }
            }

            let parsed: any;
            try {
              parsed = JSON.parse(textToParse);
            } catch {
              parsed = JSON.parse(cleaned);
            }
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed.map((item: any) => ({
                keyword: String(item.keyword || "").trim().toLowerCase(),
                type: (item.type === "TRENDING" || item.type === "LOCAL_GEO" || item.type === "HIGH_INTENT")
                  ? item.type
                  : "LOCAL_GEO",
                tag: String(item.tag || "📍 Local SEO"),
                searchIntent: String(item.searchIntent || "Local customer search"),
              })).filter((item: LocationKeywordSuggestion) => item.keyword.length > 2 && !cleanExisting.includes(item.keyword));
            }
          }
        }
      } catch (err) {
        console.warn(`Location keyword generation error (${activeModel}):`, err);
      }
    }
  }

  // Heuristic Grounded Fallback
  return generateHeuristicLocationKeywords({
    businessName,
    businessType: businessType || "Business",
    location: locStr,
    cleanExisting,
  });
}

function generateHeuristicLocationKeywords(params: {
  businessName: string;
  businessType: string;
  location: string;
  cleanExisting: string[];
}): LocationKeywordSuggestion[] {
  const { businessType, location, cleanExisting } = params;
  const loc = location.split(",")[0].trim().toLowerCase();
  const type = businessType.toLowerCase();

  const base: LocationKeywordSuggestion[] = [
    {
      keyword: `best ${type} in ${loc}`,
      type: "HIGH_INTENT",
      tag: "⚡ High Intent",
      searchIntent: "customers looking for top-rated option",
    },
    {
      keyword: `${type} near me`,
      type: "HIGH_INTENT",
      tag: "⚡ Near Me",
      searchIntent: "immediate local proximity search",
    },
    {
      keyword: `trending ${type} spots ${loc}`,
      type: "TRENDING",
      tag: "🔥 Trending in City",
      searchIntent: "popular buzz and discovery searches",
    },
    {
      keyword: `${type} booking in ${loc}`,
      type: "HIGH_INTENT",
      tag: "⚡ Booking Intent",
      searchIntent: "customers ready to book a slot or service",
    },
    {
      keyword: `top rated ${type} around ${loc}`,
      type: "LOCAL_GEO",
      tag: "📍 Locality",
      searchIntent: "geo-targeted neighborhood discovery",
    },
    {
      keyword: `${type} prices in ${loc}`,
      type: "HIGH_INTENT",
      tag: "⚡ Price Comparison",
      searchIntent: "evaluating pricing and rates",
    },
    {
      keyword: `weekend ${type} ${loc}`,
      type: "TRENDING",
      tag: "🔥 Seasonal Spike",
      searchIntent: "high weekend activity searches",
    },
  ];

  return base.filter((b) => !cleanExisting.includes(b.keyword));
}

// ─── Competitor Radar & Market Intelligence ─────────────────

export interface CompetitorItem {
  id: string;
  name: string;
  locality: string;
  distance: string;
  rating: number;
  reviewsCount: number;
  category: string;
  pricing?: string;
  strengths: string[];
  weaknesses: string[];
  differenceFromUs: string;
  googleMapsUrl?: string;
}

export interface CompetitorRadarSummary {
  ourRating: number;
  ourReviewCount: number;
  averageCompetitorRating: number;
  averageCompetitorReviews: number;
  topCompetitorName: string;
  topCompetitorReviews: number;
  reviewCountGap: number;
  marketStanding: string;
  aiRecommendation: string;
}

export interface CompetitorRadarResult {
  serviceLocation: string;
  category: string;
  derivedCategories: string[];
  competitors: CompetitorItem[];
  summary: CompetitorRadarSummary;
}

export function getSmartDerivedCategories(trade?: string | null): string[] {
  const lower = (trade || "").toLowerCase();
  if (
    lower.includes("sport") ||
    lower.includes("cricket") ||
    lower.includes("fitness") ||
    lower.includes("badminton") ||
    lower.includes("athletic") ||
    lower.includes("gym")
  ) {
    return [
      "Sporting goods store",
      "Cricket shop",
      "Badminton equipment supplier",
      "Athletic apparel store",
      "Fitness equipment store",
      "Exercise equipment store",
      "Sports accessories wholesaler",
      "Bicycle store",
    ];
  }
  if (
    lower.includes("baker") ||
    lower.includes("cafe") ||
    lower.includes("restaurant") ||
    lower.includes("food") ||
    lower.includes("coffee")
  ) {
    return [
      "Bakery",
      "Café",
      "Cake shop",
      "Pastry shop",
      "Coffee shop",
      "Dessert restaurant",
      "Wholesale bakery",
    ];
  }
  if (
    lower.includes("salon") ||
    lower.includes("beauty") ||
    lower.includes("spa") ||
    lower.includes("hair")
  ) {
    return [
      "Beauty salon",
      "Hair salon",
      "Spa and health club",
      "Barber shop",
      "Nail salon",
      "Cosmetics store",
    ];
  }
  const safeTrade = trade?.trim() || "Business";
  return [
    safeTrade,
    `${safeTrade} retailer`,
    `${safeTrade} supplier`,
    `${safeTrade} shop`,
    `${safeTrade} service`,
  ];
}

export interface FetchCompetitorRadarParams {
  businessName: string;
  businessType?: string | null;
  location?: string | null;
  scope?: "DISTRICT" | "LOCAL" | string;
  ourRating?: number;
  ourReviewCount?: number;
  apiKey?: string | null;
  model?: string;
}

export async function fetchNearbyCompetitorRadar(
  params: FetchCompetitorRadarParams
): Promise<CompetitorRadarResult> {
  const {
    businessName,
    businessType = "Business",
    location = "",
    scope = "DISTRICT",
    ourRating = 5.0,
    ourReviewCount = 10,
    apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    model = DEFAULT_GEMINI_MODEL,
  } = params;

  const targetModel = normalizeGeminiModel(model);
  const locStr = location?.trim() || "Chengalpattu District, Tamil Nadu";

  const typeStr = (businessType || "").toLowerCase();
  const isRetailStore =
    typeStr.includes("good") ||
    typeStr.includes("shop") ||
    typeStr.includes("store") ||
    typeStr.includes("equipment") ||
    typeStr.includes("retail");

  const defaultDerived = getSmartDerivedCategories(businessType);
  let derivedCategories: string[] = [...defaultDerived];

  const systemPrompt = `You are an elite Competitive Intelligence Specialist for Google Maps & Local Business Profiles in India.
Your mission is to analyze the local business landscape around "${locStr}" and across the district, identifying 5 to 7 real competing businesses by expanding across related Google Business Profile categories.

MANDATORY TIERED PROXIMITY COVERAGE (CRITICAL):
1. TIER 1 - HYPER-LOCAL RADIUS (< 15 km):
   - You MUST identify competitors in the immediate vicinity, neighborhood, and connecting local roads around ${locStr}.
   - For example, in the Tirukazhukundram / Sadras Road / Mullikolathur corridor, include immediate local sports shops such as "Village Cricketers Sports" (Sadras Road, Mullikolathur, ~6 km) and neighborhood cricket/sports equipment dealers.
   - Do NOT ignore nearby shops within 15 km in favor of far-off cities!
2. TIER 2 - COMMERCIAL & INDUSTRIAL CORRIDORS (15 - 25 km):
   - Include prominent corridor retailers such as "SA Sports" near Mahindra World City / Paranur corridor (~18-22 km) and "Olympic Sports" in Chengalpattu Town (~16 km).
3. TIER 3 - REGIONAL DESTINATION HUBS (20+ km):
   - Include large regional destination stores (e.g. Decathlon Padur/OMR or Playfield Sports Kelambakkam).

MULTI-CATEGORY & TRADE INTEGRITY:
- Primary & related Google categories:
${defaultDerived.map((c) => `   * "${c}"`).join("\n")}
- Many local sports stores and cricket equipment dealers operate under categories such as "Cricket shop", "Sporting goods store", "Sports equipment dealer", or local sports kit supplier. Include them!
${
  isRetailStore
    ? '- ALL competitors MUST sell sports equipment, cricket gear, badminton rackets, athletic kits, or sportswear. Do NOT return pure turf grounds or stadiums that do not sell retail sports equipment.'
    : '- Match the specific trade and facility type requested.'
}

Return ONLY a valid JSON object in the exact format:
{
  "derivedCategories": [
    "Sporting goods store",
    "Cricket shop",
    "Sports equipment dealer",
    "Badminton supplier",
    "Athletic apparel store"
  ],
  "competitors": [
    {
      "name": "Competitor Business Name (e.g. Village Cricketers Sports, SA Sports, Olympic Sports, Decathlon)",
      "locality": "Area or Town (e.g. Sadras Road Mullikolathur, Mahindra World City, Chengalpattu)",
      "distance": "Distance from location (e.g. 5.8 km, 18 km)",
      "rating": 4.6,
      "reviewsCount": 85,
      "category": "Matched Google Business Category",
      "pricing": "Price indicator (e.g. Budget to Mid-range, ₹₹)",
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"],
      "differenceFromUs": "1 sentence on our advantage compared to them"
    }
  ]
}`;

  const userPrompt = `Our Business: "${businessName}"
Target Category: "${businessType}"
Location / District: "${locStr}"
Scope: "${scope === "DISTRICT" ? "Whole District & Surrounding Hubs" : "Immediate Town / Local Radius"}"
Our Google Rating: ${ourRating} Stars (${ourReviewCount} Reviews)`;

  let parsedCompetitors: CompetitorItem[] = [];

  if (apiKey) {
    const modelsToTry = [
      "gemini-3.5-flash-lite",
      targetModel,
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash",
    ].filter((m, idx, arr) => arr.indexOf(m) === idx);

    for (const activeModel of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
              generationConfig: {
                maxOutputTokens: 4500,
                temperature: 0.6,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text;
          if (rawText) {
            let cleaned = rawText.trim();
            if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
            if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
            if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
            cleaned = cleaned.trim();

            let textToParse = cleaned;
            if (!textToParse.endsWith("}") && !textToParse.endsWith("]")) {
              const lastBrace = textToParse.lastIndexOf("}");
              if (lastBrace > 0) {
                textToParse = textToParse.slice(0, lastBrace + 1);
              }
            }

            let parsed: any;
            try {
              parsed = JSON.parse(textToParse);
            } catch {
              parsed = JSON.parse(cleaned);
            }
            let rawList: any[] = [];
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
              if (Array.isArray(parsed.derivedCategories) && parsed.derivedCategories.length > 0) {
                derivedCategories = parsed.derivedCategories.map(String);
              }
              if (Array.isArray(parsed.competitors) && parsed.competitors.length > 0) {
                rawList = parsed.competitors;
              }
            } else if (Array.isArray(parsed) && parsed.length > 0) {
              rawList = parsed;
            }

            if (rawList.length > 0) {
              parsedCompetitors = rawList.map((c: any, idx: number) => ({
                id: `comp-${idx + 1}-${encodeURIComponent(c.name || "c")}`,
                name: String(c.name || `Competitor ${idx + 1}`),
                locality: String(c.locality || locStr),
                distance: String(c.distance || `${(idx + 1) * 2.5} km`),
                rating: Number(c.rating) || 4.2,
                reviewsCount: Number(c.reviewsCount) || 120,
                category: String(c.category || businessType),
                pricing: c.pricing ? String(c.pricing) : undefined,
                strengths: Array.isArray(c.strengths) ? c.strengths : ["Established presence"],
                weaknesses: Array.isArray(c.weaknesses) ? c.weaknesses : ["Inconsistent response rate"],
                differenceFromUs: String(c.differenceFromUs || `${businessName} provides superior personalized customer service.`),
                googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.name} ${c.locality}`)}`,
              }));
              break;
            }
          }
        }
      } catch (err) {
        console.warn(`Competitor radar fetch error (${activeModel}):`, err);
      }
    }
  }

  // Heuristic Fallback if API was unreachable or empty
  if (parsedCompetitors.length === 0) {
    parsedCompetitors = generateHeuristicCompetitors({
      businessName,
      businessType: businessType || "Business",
      location: locStr,
      ourRating,
    });
  }

  // Compute Benchmark Summary
  const avgRating =
    parsedCompetitors.length > 0
      ? Number(
          (
            parsedCompetitors.reduce((acc, c) => acc + c.rating, 0) /
            parsedCompetitors.length
          ).toFixed(1)
        )
      : 4.3;

  const avgReviews =
    parsedCompetitors.length > 0
      ? Math.round(
          parsedCompetitors.reduce((acc, c) => acc + c.reviewsCount, 0) /
            parsedCompetitors.length
        )
      : 120;

  const topComp = [...parsedCompetitors].sort((a, b) => b.reviewsCount - a.reviewsCount)[0] || {
    name: "Area Leader",
    reviewsCount: 180,
  };

  const gap = Math.max(0, topComp.reviewsCount - ourReviewCount);

  let standing = "Emerging Leader";
  if (ourRating >= 4.8 && gap > 50) {
    standing = "Top Rated Quality (5.0★) • Volume Expansion Needed";
  } else if (ourRating >= 4.8 && gap <= 50) {
    standing = "Market Leader Candidate";
  }

  const recommendation =
    ourRating >= 4.8
      ? `You have the highest star rating (${ourRating}★) in ${locStr}! Focus on accelerating review velocity using NFC Tap cards to bridge the ${gap} review gap against ${topComp.name} (${topComp.reviewsCount} reviews).`
      : `Drive 5-star customer feedback to raise your overall score above the area average of ${avgRating}★ and outrank nearby competitors.`;

  return {
    serviceLocation: locStr,
    category: businessType || "Business",
    derivedCategories,
    competitors: parsedCompetitors,
    summary: {
      ourRating,
      ourReviewCount,
      averageCompetitorRating: avgRating,
      averageCompetitorReviews: avgReviews,
      topCompetitorName: topComp.name,
      topCompetitorReviews: topComp.reviewsCount,
      reviewCountGap: gap,
      marketStanding: standing,
      aiRecommendation: recommendation,
    },
  };
}

function generateHeuristicCompetitors(params: {
  businessName: string;
  businessType: string;
  location: string;
  ourRating: number;
}): CompetitorItem[] {
  const { businessName, businessType, location } = params;
  const loc = location.split(",")[0].trim();
  const lowerType = businessType.toLowerCase();

  const isRetail =
    lowerType.includes("good") ||
    lowerType.includes("shop") ||
    lowerType.includes("store") ||
    lowerType.includes("equipment") ||
    lowerType.includes("retail");

  if (isRetail) {
    return [
      {
        id: "comp-retail-village-cricketers",
        name: "Village Cricketers Sports",
        locality: "Sadras Road, Mullikolathur",
        distance: "5.8 km",
        rating: 4.6,
        reviewsCount: 84,
        category: "Cricket Equipment & Sports Shop",
        pricing: "₹₹ (Budget to Mid-range)",
        strengths: ["Hyper-local neighborhood presence on Sadras Road", "Specialist bat knocking, repairs, and tournament team kits"],
        weaknesses: ["Focused primarily on cricket rather than all sports", "Limited showroom floor space"],
        differenceFromUs: `${businessName} provides a modern full-spectrum sports store with comprehensive cricket, badminton, and football gear.`,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Village Cricketers Sports Sadras Road Mullikolathur")}`,
      },
      {
        id: "comp-retail-1",
        name: "Olympic Sports & Fitness",
        locality: "Chengalpattu Town",
        distance: "14 km",
        rating: 4.4,
        reviewsCount: 380,
        category: "Sports Goods Store",
        pricing: "₹₹ (Mid-range)",
        strengths: ["Established presence in Chengalpattu center", "Wide variety of cricket bats & athletic apparel"],
        weaknesses: ["Congested main road parking", "Limited stock of modern Gen Z sportswear brands"],
        differenceFromUs: `${businessName} provides personalized customer service, faster order turnaround, and modern sports accessories.`,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Olympic Sports Chengalpattu")}`,
      },
      {
        id: "comp-retail-2",
        name: "Smash Sports & Racket Works",
        locality: "Kelambakkam Commercial Hub",
        distance: "19 km",
        rating: 4.3,
        reviewsCount: 195,
        category: "Sports Equipment Retailer",
        pricing: "₹₹ (Affordable)",
        strengths: ["Specialized badminton racket stringing machine", "Good stock of Yonex and Li-Ning gear"],
        weaknesses: ["Small shop footprint", "Limited football gear and team jerseys"],
        differenceFromUs: `${businessName} stocks complete gear across multiple sports including cricket, football, and fitness.`,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Smash Sports Kelambakkam")}`,
      },
      {
        id: "comp-retail-sa-sports",
        name: "SA Sports & Fitness",
        locality: "Mahindra World City Corridor",
        distance: "21 km",
        rating: 4.5,
        reviewsCount: 210,
        category: "Sporting Goods Store / Fitness Equipment",
        pricing: "₹₹ (Moderate)",
        strengths: ["Strategic location serving Mahindra World City tech corridor", "Strong inventory of cricket bats, balls & gym accessories"],
        weaknesses: ["Peak evening store rush", "Limited display space for full-size indoor gym units"],
        differenceFromUs: `${businessName} provides dedicated personalized customer service, faster local delivery, and custom team jersey printing.`,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("SA Sports Mahindra World City Chengalpattu")}`,
      },
      {
        id: "comp-retail-3",
        name: "Decathlon Padur OMR",
        locality: "Padur - OMR Expressway",
        distance: "22 km",
        rating: 4.6,
        reviewsCount: 1450,
        category: "Sporting Goods Hypermarket",
        pricing: "Budget to Premium",
        strengths: ["Massive multinational catalog", "Large indoor trial zones"],
        weaknesses: ["Far distance requiring travel to OMR", "No custom local team jersey printing"],
        differenceFromUs: `${businessName} offers convenient neighborhood access, personalized gear fitting, and local custom jerseys.`,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Decathlon Padur OMR")}`,
      },
      {
        id: "comp-retail-4",
        name: "Winner Sports & Uniforms",
        locality: "Maraimalai Nagar Industrial Area",
        distance: "25 km",
        rating: 4.2,
        reviewsCount: 140,
        category: "Sports Goods Shop",
        pricing: "Budget friendly",
        strengths: ["Supplies corporate and school sports kits in bulk", "Affordable pricing on basic gear"],
        weaknesses: ["Lacks premium English Willow cricket bats", "Basic retail display"],
        differenceFromUs: `${businessName} offers higher grade performance equipment and authentic tournament quality kits.`,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Winner Sports Maraimalai Nagar")}`,
      },
      {
        id: "comp-retail-5",
        name: "Grand Sports World",
        locality: "Guduvanchery Main Road",
        distance: "32 km",
        rating: 4.5,
        reviewsCount: 410,
        category: "Sports Goods Store",
        pricing: "₹₹ (Standard)",
        strengths: ["High footfall on GST Road corridor", "Strong inventory of cricket and badminton equipment"],
        weaknesses: ["Higher pricing during peak sporting seasons", "Busy store with longer checkout waits"],
        differenceFromUs: `${businessName} delivers dedicated attentive shopping experience with competitive local pricing.`,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Grand Sports Guduvanchery")}`,
      },
    ];
  }

  return [
    {
      id: "comp-1-strikerz",
      name: `${loc} Sports & Turf Arena`,
      locality: loc,
      distance: "3.2 km",
      rating: 4.5,
      reviewsCount: 195,
      category: businessType,
      pricing: "₹800 - ₹1,200/hr",
      strengths: ["Central neighborhood location", "Consistent weekend turnout"],
      weaknesses: ["Limited shaded waiting area", "No online slot booking"],
      differenceFromUs: `${businessName} provides seamless online slot reservations and dedicated coaching programs.`,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${loc} Sports Turf`)}`,
    },
    {
      id: "comp-2-royal",
      name: `Grand Play Ground & Arena`,
      locality: `${loc} Bypass`,
      distance: "6.5 km",
      rating: 4.3,
      reviewsCount: 110,
      category: businessType,
      pricing: "₹700 - ₹1,000/hr",
      strengths: ["Spacious ground dimensions", "Ample parking area"],
      weaknesses: ["Basic lighting setup for night games", "Slow customer reply time"],
      differenceFromUs: `${businessName} features high-lumen floodlit enclosures specifically engineered for nighttime matches.`,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Play Ground ${loc}`)}`,
    },
    {
      id: "comp-3-apex",
      name: `Apex Multi-Sport Complex`,
      locality: "Chengalpattu District Hub",
      distance: "11.0 km",
      rating: 4.6,
      reviewsCount: 280,
      category: "Sports Complex",
      pricing: "₹1,000 - ₹1,500/hr",
      strengths: ["Large multi-sport courts", "High review count on Google Maps"],
      weaknesses: ["Higher hourly fees during peak hours", "Strict cancellation policy"],
      differenceFromUs: `${businessName} offers superior localized hospitality and budget-friendly membership packages.`,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Apex Sports ${loc}`)}`,
    },
    {
      id: "comp-4-metro",
      name: `Champions Turf Club`,
      locality: "Mahabalipuram Link",
      distance: "13.4 km",
      rating: 4.2,
      reviewsCount: 75,
      category: businessType,
      pricing: "₹650 - ₹950/hr",
      strengths: ["Budget pricing structure", "Casual weekend crowd"],
      weaknesses: ["Older synthetic turf fiber", "Limited equipment rental options"],
      differenceFromUs: `${businessName} maintains premium shock-absorbing turf with professional cricket kits.`,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Champions Turf ${loc}`)}`,
    },
  ];
}
