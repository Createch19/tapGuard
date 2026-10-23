import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import KeywordsClient from "./KeywordsClient";
import {
  getKeywordPresetsForBusinessType,
  generateMultiLanguageSentenceBundle,
  SupportedLanguage,
} from "@/lib/sentence-generator";

export const dynamic = "force-dynamic";

export default async function KeywordsPage() {
  const { tenantId } = await requireTenantUser();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      reviewKeywords: true,
      branding: true,
    },
  });

  if (!tenant) return null;

  const presets = getKeywordPresetsForBusinessType(tenant.businessType);
  const config = tenant.reviewKeywords;

  const planConfig = await prisma.planConfig.findUnique({
    where: { plan: tenant.plan },
  });

  const isPlanAllowed = planConfig
    ? planConfig.keywordSuggestions
    : tenant.plan === "PRO" || tenant.plan === "ENTERPRISE";

  const isEnabled = config ? config.isEnabled : false;
  const primaryLanguage = (config?.primaryLanguage as SupportedLanguage) || "EN";
  const enabledLanguages =
    config?.enabledLanguages && config.enabledLanguages.length > 0
      ? config.enabledLanguages
      : ["EN", "TANGLISH", "TA"];
  const keywords =
    config?.keywords && config.keywords.length > 0 ? config.keywords : presets.slice(0, 5);
  const customSentences = config?.customSentences || [];
  const tone = (config?.tone as "CASUAL" | "ENTHUSIASTIC" | "SHORT" | "DETAILED") || "CASUAL";

  // Initial pre-generated bundle
  const initialBundle = generateMultiLanguageSentenceBundle(enabledLanguages, {
    keywords,
    businessType: tenant.businessType,
    tone,
    customSentences,
    seedOffset: config?.lastServedIndex || 0,
  });

  return (
    <KeywordsClient
      tenant={{
        id: tenant.id,
        name: tenant.name,
        plan: tenant.plan,
        businessType: tenant.businessType,
        googleReviewUrl: tenant.googleReviewUrl,
        primaryColor: tenant.branding?.primaryColor || "#0D9488",
        logoUrl: tenant.branding?.logoUrl || null,
        isPlanAllowed,
      }}
      initialConfig={{
        isEnabled,
        primaryLanguage,
        enabledLanguages,
        keywords,
        customSentences,
        tone,
        presets,
        initialBundle,
      }}
    />
  );
}
