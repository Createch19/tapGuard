export type GeminiTone = "WARM" | "PROFESSIONAL" | "CASUAL" | "SHORT" | "LUXURY" | "CUSTOM";

export interface GeminiReviewContext {
  rating: number;
  reviewerName: string;
  comment: string;
  businessName: string;
  businessType?: string | null;
  brandTone?: GeminiTone;
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
export async function generateReviewReply(context: GeminiReviewContext): Promise<string> {
  const {
    rating,
    reviewerName,
    comment,
    businessName,
    businessType = "Business",
    brandTone = "WARM",
    knowledgeBase = "",
    customPersona = "",
    apiKey = process.env.GEMINI_API_KEY,
    model = "gemini-1.5-flash",
  } = context;

  // Prompt construction
  const toneInstructions = {
    WARM: "Warm, hospitable, gracious, and appreciative. Express genuine gratitude for their patronage.",
    PROFESSIONAL: "Polite, courteous, formal, and reassuring. Focus on high standards, reliability, and service excellence.",
    CASUAL: "Friendly, upbeat, modern, and conversational. Like a great local neighborhood host.",
    SHORT: "Punchy, concise (max 2 sentences), sincere, and direct.",
    LUXURY: "Refined, elegant, bespoke, and welcoming. Highlight dedication to craft and unforgettable experiences.",
    CUSTOM: customPersona || "Friendly, professional, and authentic.",
  }[brandTone] || "Friendly and polite.";

  const systemPrompt = `You are the official business owner/manager of "${businessName}" (${businessType}).
A customer left a ${rating}-star Google Review.
Your task is to draft a personalized, authentic, and high-impact reply to be published on Google Maps.

Tone Directive: ${toneInstructions}
${customPersona ? `Custom Brand Persona: ${customPersona}` : ""}

Store Knowledge & Policies:
${knowledgeBase || "Standard local hospitality and customer satisfaction focus."}

Guidelines:
1. Greet the customer by name ("${reviewerName}") unless anonymous.
2. For 4-5★ reviews: Specifically reference the positive points mentioned in their comment, express gratitude, and warmly invite them back.
3. For 1-3★ reviews: Express genuine empathy and apologize for their experience not meeting expectations. Never argue. Reference our care for quality and offer a peaceful resolution.
4. Keep the reply between 2 and 4 sentences. Sound like a real human venue manager, not an AI bot.
5. Return ONLY the final response text without quotes, markdown headers, or prefixes.`;

  const userPrompt = `Customer Name: ${reviewerName}
Rating: ${rating} / 5 Stars
Review Comment: "${comment || "No written text provided, just star rating."}"`;

  // If Gemini API key is configured, call official Gemini REST endpoint
  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
              temperature: 0.7,
              maxOutputTokens: 250,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (candidate) {
          return candidate;
        }
      } else {
        console.warn("Gemini API call returned non-200 status:", response.status);
      }
    } catch (err) {
      console.warn("Gemini API request failed, falling back to heuristic engine:", err);
    }
  }

  // Heuristic Grounded Fallback
  return generateHeuristicReviewReply({
    rating,
    reviewerName,
    comment,
    businessName,
    brandTone,
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
    model = "gemini-1.5-flash",
  } = context;

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
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
              maxOutputTokens: 200,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (candidate) {
          return candidate;
        }
      }
    } catch (err) {
      console.warn("Gemini QA call error, falling back:", err);
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

// ─── Heuristic Fallbacks ──────────────────────────────────

function generateHeuristicReviewReply(params: {
  rating: number;
  reviewerName: string;
  comment: string;
  businessName: string;
  brandTone: GeminiTone;
}): string {
  const { rating, reviewerName, comment, businessName, brandTone } = params;
  const name = reviewerName && reviewerName !== "A Google User" ? reviewerName : "valued guest";
  const lower = (comment || "").toLowerCase();

  if (rating >= 4) {
    if (brandTone === "SHORT") {
      return `Thanks for the wonderful ${rating}-star rating, ${name}! We're thrilled you had a great time at ${businessName} and look forward to welcoming you back soon.`;
    }
    if (brandTone === "PROFESSIONAL") {
      return `Dear ${name}, thank you for taking the time to share your positive experience at ${businessName}. Our team is committed to maintaining the highest standard of service and hospitality, and we truly appreciate your patronage.`;
    }
    if (brandTone === "LUXURY") {
      return `It was our utmost pleasure hosting you at ${businessName}, ${name}. Thank you for your generous praise; our team is dedicated to curating memorable moments, and we eagerly await your next visit.`;
    }
    // WARM / CASUAL
    let highlight = "your kind words";
    if (lower.includes("food") || lower.includes("dish") || lower.includes("croissant") || lower.includes("coffee")) {
      highlight = "your compliments on our culinary offerings";
    } else if (lower.includes("staff") || lower.includes("service")) {
      highlight = "recognizing our dedicated team";
    }
    return `Hi ${name}! Thank you so much for the 5-star review! We are delighted that you enjoyed ${highlight} at ${businessName}. Your support means the world to our local crew, and we can't wait to see you again soon!`;
  }

  // 1 to 3 stars
  return `Hi ${name}, thank you for bringing this to our attention. We are sincerely sorry that your recent visit to ${businessName} did not reflect the quality and care we strive to provide. We take feedback seriously and would appreciate the opportunity to make things right—please reach out to our management team directly so we can look into this for you.`;
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
