import { requireSuperAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { getGoogleOAuthCredentials, getGoogleOAuthRedirectUri } from "@/lib/google-sync";
import PlanConfigClient from "./PlanConfigClient";

export const dynamic = "force-dynamic";

export default async function PlanConfigPage() {
  await requireSuperAdmin();

  const configs = await prisma.planConfig.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const formatted = configs.map((c) => ({
    id: c.id,
    plan: c.plan,
    displayName: c.displayName,
    description: c.description,
    price: Number(c.price),
    currency: c.currency,
    billingCycle: c.billingCycle,
    maxCards: c.maxCards,
    smartGate: c.smartGate,
    multiGateTemplates: c.multiGateTemplates,
    customBranding: c.customBranding,
    webhookAlerts: c.webhookAlerts,
    keywordSuggestions: c.keywordSuggestions,
    googleHub: c.googleHub,
    qrCodeTier: c.qrCodeTier,
    analyticsRetDays: c.analyticsRetDays,
    prioritySupport: c.prioritySupport,
    isActive: c.isActive,
  }));

  const { clientId, clientSecret } = await getGoogleOAuthCredentials();
  const redirectUri = getGoogleOAuthRedirectUri();

  return (
    <PlanConfigClient
      configs={formatted}
      platformGoogleOAuth={{
        clientId: clientId || "",
        clientSecret: clientSecret || "",
        hasCredentials: Boolean(clientId && clientSecret),
        redirectUri,
      }}
    />
  );
}
