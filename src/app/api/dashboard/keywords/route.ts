import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import {
  SUPPORTED_LANGUAGES,
  getKeywordPresetsForBusinessType,
  generateMultiLanguageSentenceBundle,
  sanitizeKeywords,
  SupportedLanguage,
} from "@/lib/sentence-generator";

export async function GET() {
  try {
    const { tenantId } = await requireTenantUser();

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        reviewKeywords: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const presets = getKeywordPresetsForBusinessType(tenant.businessType);
    const config = tenant.reviewKeywords;

    const isEnabled = config ? config.isEnabled : true;
    const primaryLanguage = (config?.primaryLanguage as SupportedLanguage) || "EN";
    const enabledLanguages =
      config?.enabledLanguages && config.enabledLanguages.length > 0
        ? config.enabledLanguages
        : ["EN", "TANGLISH", "TA"];
    const keywords = config?.keywords && config.keywords.length > 0 ? config.keywords : presets.slice(0, 5);
    const customSentences = config?.customSentences || [];
    const tone = config?.tone || "CASUAL";

    const previewBundle = generateMultiLanguageSentenceBundle(enabledLanguages, {
      keywords,
      businessType: tenant.businessType,
      tone,
      customSentences,
      seedOffset: config?.lastServedIndex || 0,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: config?.id || null,
        isEnabled,
        primaryLanguage,
        enabledLanguages,
        keywords,
        customSentences,
        tone,
        businessType: tenant.businessType,
        presets,
        supportedLanguages: SUPPORTED_LANGUAGES,
        previewBundle,
      },
    });
  } catch (err) {
    console.error("Failed to fetch keyword settings:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { tenantId } = await requireTenantUser();
    const body = await request.json();

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const {
      isEnabled = false,
      primaryLanguage = "EN",
      enabledLanguages = ["EN", "TANGLISH"],
      keywords = [],
      customSentences = [],
      tone = "CASUAL",
    } = body;

    const planConfig = await prisma.planConfig.findUnique({
      where: { plan: tenant.plan },
    });
    const isPlanAllowed = planConfig
      ? planConfig.keywordSuggestions
      : tenant.plan === "PRO" || tenant.plan === "ENTERPRISE";

    if (!isPlanAllowed && isEnabled) {
      return NextResponse.json(
        {
          error:
            "Smart Keyword SEO Reviews is a Pro & Enterprise feature. Please upgrade your subscription to enable it on your gateway.",
        },
        { status: 403 }
      );
    }

    const cleanedKeywords = sanitizeKeywords(Array.isArray(keywords) ? keywords : []);
    const cleanedCustomSentences = Array.isArray(customSentences)
      ? customSentences.map((s: string) => String(s).trim()).filter((s: string) => s.length > 0)
      : [];

    const validLanguages = Array.isArray(enabledLanguages) && enabledLanguages.length > 0
      ? enabledLanguages.map((l: string) => l.toUpperCase())
      : ["EN", "TANGLISH"];

    const validTone = ["CASUAL", "ENTHUSIASTIC", "SHORT", "DETAILED"].includes(tone)
      ? tone
      : "CASUAL";

    const updated = await prisma.tenantReviewKeyword.upsert({
      where: { tenantId },
      update: {
        isEnabled: Boolean(isEnabled),
        primaryLanguage: String(primaryLanguage).toUpperCase(),
        enabledLanguages: validLanguages,
        keywords: cleanedKeywords,
        customSentences: cleanedCustomSentences,
        tone: validTone,
      },
      create: {
        tenantId,
        isEnabled: Boolean(isEnabled),
        primaryLanguage: String(primaryLanguage).toUpperCase(),
        enabledLanguages: validLanguages,
        keywords: cleanedKeywords,
        customSentences: cleanedCustomSentences,
        tone: validTone,
      },
    });

    return NextResponse.json({
      success: true,
      config: updated,
      message: "Keyword configuration saved successfully.",
    });
  } catch (err) {
    console.error("Failed to update keyword settings:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
