import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReviewGateClient from "./ReviewGateClient";

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
        },
      },
    },
  });

  if (!card || !card.tenant) {
    notFound();
  }

  const tenant = card.tenant;
  const branding = tenant.branding;

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
    />
  );
}
