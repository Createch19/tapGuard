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
    const tone = (rk.tone as any) || "CASUAL";
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

  return (
    <ReviewGateClient
      cardId={card.id}
      cardSlug={card.urlSlug}
      cardLabel={card.label}
      tenantId={tenant.id}
      tenantName={tenant.name}
      gateTemplate={tenant.gateTemplate}
      googleReviewUrl={tenant.googleReviewUrl || "https://google.com"}
      instagramUrl={tenant.instagramUrl}
      facebookUrl={tenant.facebookUrl}
      youtubeUrl={tenant.youtubeUrl}
      swiggyUrl={tenant.swiggyUrl}
      zomatoUrl={tenant.zomatoUrl}
      deliveryOfferText={tenant.deliveryOfferText}
      deliveryPhone={tenant.deliveryPhone}
      customRedirectUrl={tenant.customRedirectUrl}
      customRedirectTitle={tenant.customRedirectTitle || "View Online Menu"}
      greetingTitle={tenant.greetingTitle || "How was your experience?"}
      greetingSubtitle={
        tenant.greetingSubtitle ||
        "Your feedback helps us continuously improve our service."
      }
      primaryColor={branding?.primaryColor || "#0D9488"}
      secondaryColor={branding?.secondaryColor || "#F0FDFA"}
      accentColor={branding?.accentColor || "#14B8A6"}
      logoUrl={branding?.logoUrl || null}
      tapEventId={tid || null}
      keywordConfig={keywordConfig}
    />
  );
}
