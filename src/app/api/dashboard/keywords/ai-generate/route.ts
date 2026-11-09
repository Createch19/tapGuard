import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { sanitizeKeywords } from "@/lib/sentence-generator";
import { generateDynamicKeywordReviews } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await requireTenantUser();
    const body = await request.json();

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        geminiConfig: true,
        reviewKeywords: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const {
      keywords = [],
      language = "EN",
      tone = "CASUAL",
      count = 5,
    } = body;

    const rawKeywords = Array.isArray(keywords) && keywords.length > 0
      ? keywords
      : tenant.reviewKeywords?.keywords || [];

    const cleanKw = sanitizeKeywords(rawKeywords);

    // Extract catalog offerings or bio from business profile if available
    let catalogContext = "";
    if (tenant.businessProfile) {
      const bp = tenant.businessProfile as Record<string, unknown>;
      if (Array.isArray(bp.catalogItems) && bp.catalogItems.length > 0) {
        catalogContext = bp.catalogItems
          .slice(0, 8)
          .map((item: { name?: string; price?: string }) => `${item.name || ""}${item.price ? ` (${item.price})` : ""}`)
          .filter(Boolean)
          .join(", ");
      }
    }

    const apiKey =
      tenant.geminiConfig?.customApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      null;

    const suggestions = await generateDynamicKeywordReviews({
      businessName: tenant.name,
      businessType: tenant.businessType || "Business",
      keywords: cleanKw,
      language: String(language || "EN").toUpperCase(),
      tone: String(tone || tenant.reviewKeywords?.tone || "CASUAL"),
      count: Math.min(Math.max(Number(count) || 5, 1), 15),
      catalogContext,
      knowledgeBase: tenant.geminiConfig?.knowledgeBase || (tenant.businessProfile as any)?.bio || "",
      apiKey,
      model: tenant.geminiConfig?.model || "gemini-1.5-flash",
    });

    return NextResponse.json({
      success: true,
      suggestions,
      usedGemini: Boolean(apiKey),
      message: `Generated ${suggestions.length} reviews for ${tenant.name}`,
    });
  } catch (err) {
    console.error("AI dynamic review generation failed:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
