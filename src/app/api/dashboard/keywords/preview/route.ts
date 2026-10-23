import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import {
  generateReviewSentences,
  generateMultiLanguageSentenceBundle,
  SupportedLanguage,
  sanitizeKeywords,
} from "@/lib/sentence-generator";

export async function POST(request: NextRequest) {
  try {
    await requireTenantUser();
    const body = await request.json();

    const {
      keywords = [],
      businessType,
      language = "EN",
      tone = "CASUAL",
      customSentences = [],
      enabledLanguages = ["EN", "TANGLISH", "TA"],
      seedOffset = 0,
    } = body;

    const cleanedKeywords = sanitizeKeywords(Array.isArray(keywords) ? keywords : []);

    const singleLanguageSentences = generateReviewSentences({
      keywords: cleanedKeywords,
      businessType,
      language: language as SupportedLanguage,
      tone,
      customSentences,
      count: 8,
      seedOffset: Number(seedOffset) || 0,
    });

    const bundle = generateMultiLanguageSentenceBundle(
      Array.isArray(enabledLanguages) ? enabledLanguages : ["EN", "TANGLISH", "TA"],
      {
        keywords: cleanedKeywords,
        businessType,
        tone,
        customSentences,
        seedOffset: Number(seedOffset) || 0,
      }
    );

    return NextResponse.json({
      success: true,
      sentences: singleLanguageSentences,
      bundle,
    });
  } catch (err) {
    console.error("Preview generation error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
