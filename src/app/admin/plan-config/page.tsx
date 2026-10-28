import { requireSuperAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { getGoogleOAuthCredentials, getGoogleOAuthRedirectUri } from "@/lib/google-sync";
import PlanConfigClient from "./PlanConfigClient";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function PlanConfigPage() {
  await requireSuperAdmin();
  const headersList = await headers();

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

  let clientId = "";
  let clientSecret = "";
  try {
    const creds = await getGoogleOAuthCredentials();
    clientId = creds.clientId || "";
    clientSecret = creds.clientSecret || "";
  } catch (err) {
    console.warn("Could not retrieve Google OAuth credentials:", err);
  }

  let redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google/callback`;
  try {
    redirectUri = getGoogleOAuthRedirectUri(headersList);
  } catch (err) {
    console.warn("Could not compute Google OAuth redirect URI:", err);
  }

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
