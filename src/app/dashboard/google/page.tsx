import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { getTenantGoogleHubData } from "@/lib/google-business";
import GoogleCommandCenterClient from "./GoogleCommandCenterClient";

export const dynamic = "force-dynamic";

export default async function GoogleHubPage() {
  const { tenantId } = await requireTenantUser();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      branding: true,
      geminiConfig: true,
      googleConnection: true,
    },
  });

  if (!tenant) return null;

  const planConfig = await prisma.planConfig.findUnique({
    where: { plan: tenant.plan },
  });

  const isPlanAllowed = planConfig
    ? Boolean(planConfig.googleHub)
    : tenant.plan === "PRO" || tenant.plan === "ENTERPRISE";

  const initialData = await getTenantGoogleHubData(tenantId);

  return (
    <GoogleCommandCenterClient
      tenant={{
        id: tenant.id,
        name: tenant.name,
        plan: tenant.plan,
        businessType: tenant.businessType || "Business",
        googleReviewUrl: tenant.googleReviewUrl,
        googleBusinessEmail: tenant.googleBusinessEmail || tenant.googleConnection?.connectedEmail || null,
        googleLocationId: tenant.googleLocationId || null,
        hasGeminiKey: Boolean(tenant.geminiConfig?.customApiKey),
        primaryColor: tenant.branding?.primaryColor || "#0D9488",
        isPlanAllowed,
      }}
      initialData={initialData}
    />
  );
}
