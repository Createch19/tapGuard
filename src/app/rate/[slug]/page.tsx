import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReviewGateClient from "./ReviewGateClient";
import { generateMultiLanguageSentenceBundle } from "@/lib/sentence-generator";

export const dynamic = "force-dynamic";

export default async function RatePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tid?: string }>;
}) {
  const { slug } = await params;
  const { tid } = await searchParams;

  const card = await prisma.card.findFirst({
    where: {
      OR: [{ urlSlug: slug }, { shortCode: slug.toUpperCase() }],
    },
    include: {
      tenant: {
        include: {
          branding: true,
          reviewKeywords: true,
        },
      },
    },
  });

  if (!card || !card.tenant) {
    notFound();
  }

  const tenant = card.tenant;
  const branding = tenant.branding;
  const rk = tenant.reviewKeywords;

  // 1. Check if tenant's plan allows keyword suggestions (Admin-configurable per plan)
  const planConfig = await prisma.planConfig.findUnique({
    where: { plan: tenant.plan },
  });

  const planAllowsKeywords = planConfig
    ? planConfig.keywordSuggestions
    : (tenant.plan === "PRO" || tenant.plan === "ENTERPRISE");

  // 2. Only show on gateway if plan allows it AND tenant explicitly turned it on
  const isKeywordsActive = Boolean(planAllowsKeywords && rk && rk.isEnabled);

  let keywordConfig: {
    isEnabled: boolean;
    primaryLanguage: string;
    enabledLanguages: string[];
    sentenceBundle: Record<string, string[]>;
  } | null = null;

  if (isKeywordsActive && rk) {
    const enabledLanguages =
      rk.enabledLanguages && rk.enabledLanguages.length > 0
        ? rk.enabledLanguages
        : ["EN", "TANGLISH", "TA"];
    const primaryLanguage = rk.primaryLanguage || "EN";
    const keywords = rk.keywords || [];
    const customSentences = rk.customSentences || [];
    const tone = (rk.tone as unknown as "CASUAL" | "ENTHUSIASTIC" | "DETAILED" | "SHORT") || "CASUAL";
    const seedOffset = rk.lastServedIndex || 0;

    const nextIndex = (rk.lastServedIndex + 1) % 10000;
    prisma.tenantReviewKeyword
      .update({
        where: { id: rk.id },
        data: { lastServedIndex: nextIndex },
      })
      .catch(() => {});

    const bundle = generateMultiLanguageSentenceBundle(enabledLanguages, {
      keywords,
      businessType: tenant.businessType,
      tone,
      customSentences,
      seedOffset,
      primaryLanguage,
    });

    keywordConfig = {
      isEnabled: true,
      primaryLanguage,
      enabledLanguages,
      sentenceBundle: bundle,
    };
  }

  // Resolve Effective Gate Configuration (Card Override VS Tenant Default)
  const isOverridden = Boolean(card.overrideGate);
  const effectiveGateTemplate = isOverridden && card.gateTemplate ? card.gateTemplate : tenant.gateTemplate;
  const effectiveGoogleReviewUrl = isOverridden && card.googleReviewUrl ? card.googleReviewUrl : (tenant.googleReviewUrl || "https://google.com");
  const effectiveZomatoUrl = isOverridden && card.zomatoUrl ? card.zomatoUrl : tenant.zomatoUrl;
  const effectiveSwiggyUrl = isOverridden && card.swiggyUrl ? card.swiggyUrl : tenant.swiggyUrl;
  const effectiveInstagramUrl = isOverridden && card.instagramUrl ? card.instagramUrl : tenant.instagramUrl;
  const effectiveFacebookUrl = isOverridden && card.facebookUrl ? card.facebookUrl : tenant.facebookUrl;
  const effectiveYoutubeUrl = isOverridden && card.youtubeUrl ? card.youtubeUrl : tenant.youtubeUrl;
  const effectiveDeliveryOfferText = isOverridden && card.deliveryOfferText ? card.deliveryOfferText : tenant.deliveryOfferText;
  const effectiveDeliveryPhone = isOverridden && card.deliveryPhone ? card.deliveryPhone : tenant.deliveryPhone;
  const effectiveCustomRedirectUrl = isOverridden && card.customRedirectUrl ? card.customRedirectUrl : tenant.customRedirectUrl;
  const effectiveCustomRedirectTitle = isOverridden && card.customRedirectTitle ? card.customRedirectTitle : (tenant.customRedirectTitle || "View Online Menu");
  const effectiveGreetingTitle = isOverridden && card.greetingTitle ? card.greetingTitle : (tenant.greetingTitle || "How was your experience?");
  const effectiveGreetingSubtitle = isOverridden && card.greetingSubtitle ? card.greetingSubtitle : (tenant.greetingSubtitle || "Your feedback helps us continuously improve our service.");

  return (
    <ReviewGateClient
      cardId={card.id}
      cardSlug={card.urlSlug}
      cardLabel={card.label}
      tenantId={tenant.id}
      tenantName={tenant.name}
      gateTemplate={effectiveGateTemplate}
      googleReviewUrl={effectiveGoogleReviewUrl}
      instagramUrl={effectiveInstagramUrl}
      facebookUrl={effectiveFacebookUrl}
      youtubeUrl={effectiveYoutubeUrl}
      swiggyUrl={effectiveSwiggyUrl}
      zomatoUrl={effectiveZomatoUrl}
      deliveryOfferText={effectiveDeliveryOfferText}
      deliveryPhone={effectiveDeliveryPhone}
      customRedirectUrl={effectiveCustomRedirectUrl}
      customRedirectTitle={effectiveCustomRedirectTitle}
      greetingTitle={effectiveGreetingTitle}
      greetingSubtitle={effectiveGreetingSubtitle}
      primaryColor={branding?.primaryColor || "#0D9488"}
      secondaryColor={branding?.secondaryColor || "#F0FDFA"}
      accentColor={branding?.accentColor || "#14B8A6"}
      logoUrl={branding?.logoUrl || null}
      tapEventId={tid || null}
      keywordConfig={keywordConfig}
    />
  );
}
