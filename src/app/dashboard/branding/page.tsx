import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import BrandingClient from "./BrandingClient";

export const dynamic = "force-dynamic";

export default async function BrandingPage() {
  const { tenantId } = await requireTenantUser();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      branding: true,
    },
  });

  if (!tenant) return null;

  return (
    <BrandingClient
      tenant={{
        id: tenant.id,
        name: tenant.name,
        plan: tenant.plan,
        gateTemplate: tenant.gateTemplate,
        googleReviewUrl: tenant.googleReviewUrl || "",
        instagramUrl: tenant.instagramUrl || "",
        facebookUrl: tenant.facebookUrl || "",
        youtubeUrl: tenant.youtubeUrl || "",
        swiggyUrl: tenant.swiggyUrl || "",
        zomatoUrl: tenant.zomatoUrl || "",
        deliveryOfferText: tenant.deliveryOfferText || "",
        deliveryPhone: tenant.deliveryPhone || "",
        customRedirectUrl: tenant.customRedirectUrl || "",
        customRedirectTitle: tenant.customRedirectTitle || "View Online Menu",
        customRedirectDirect: tenant.customRedirectDirect || false,
        greetingTitle: tenant.greetingTitle,
        greetingSubtitle: tenant.greetingSubtitle,
      }}
      branding={{
        primaryColor: tenant.branding?.primaryColor || "#0D9488",
        secondaryColor: tenant.branding?.secondaryColor || "#F0FDFA",
        accentColor: tenant.branding?.accentColor || "#14B8A6",
        logoUrl: tenant.branding?.logoUrl || null,
      }}
    />
  );
}
