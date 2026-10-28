import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { getGoogleOAuthCredentials, getGoogleOAuthRedirectUri } from "@/lib/google-sync";
import SettingsClient from "./SettingsClient";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { tenantId } = await requireTenantUser();

  // Safely parse incoming query params on the server
  const rawParams = searchParams ? await searchParams : {};
  const googleConnected = rawParams.google_connected === "true";
  const accountEmail =
    typeof rawParams.account_email === "string" ? rawParams.account_email : null;
  const errorParam =
    typeof rawParams.error === "string" ? rawParams.error : null;
  const redirectUriParam =
    typeof rawParams.redirect_uri === "string" ? rawParams.redirect_uri : null;

  // Safely retrieve tenant with fallback
  let tenant: any = null;
  try {
    tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        googleConnection: {
          include: { locations: true },
        },
        geminiConfig: true,
      },
    });
  } catch (err) {
    console.warn("Retrying tenant lookup without relations:", err);
    tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });
  }

  if (!tenant) {
    redirect("/dashboard");
  }

  // Safely resolve Google OAuth config and redirect URI
  let hasGoogleCredentials = false;
  let isTenantCustom = false;
  let suggestedRedirectUri = "/api/auth/google/callback";

  try {
    const creds = await getGoogleOAuthCredentials(tenantId);
    hasGoogleCredentials = Boolean(creds.clientId && creds.clientId.trim());
    isTenantCustom = creds.isTenantCustom;
  } catch (err) {
    console.warn("Could not retrieve Google OAuth credentials:", err);
  }

  try {
    const headersList = await headers();
    suggestedRedirectUri = getGoogleOAuthRedirectUri(headersList);
  } catch (err) {
    console.warn("Could not determine dynamic redirect URI from headers:", err);
  }

  return (
    <SettingsClient
      tenant={{
        id: tenant.id,
        name: tenant.name,
        googleReviewUrl: tenant.googleReviewUrl,
        smartGateEnabled: tenant.smartGateEnabled,
        alertEmail: tenant.alertEmail,
        webhookUrl: tenant.webhookUrl,
        googleBusinessEmail:
          tenant.googleBusinessEmail ||
          tenant.googleConnection?.connectedEmail ||
          null,
        googleAccountId: tenant.googleConnection?.googleAccountId || null,
        googleLocationId:
          tenant.googleLocationId ||
          tenant.googleConnection?.locations?.[0]?.googleLocationId ||
          null,
        accountName: tenant.googleConnection?.accountName || null,
        lastSyncedAt:
          tenant.googleConnection?.lastSyncedAt?.toISOString() || null,
        isVerified: tenant.googleConnection?.isVerified || false,
        geminiApiKey: tenant.geminiConfig?.customApiKey || null,
        customGoogleClientId: tenant.customGoogleClientId || null,
        customGoogleClientSecret: tenant.customGoogleClientSecret || null,
        isGoogleConnected: Boolean(
          tenant.googleConnection?.isVerified ||
            tenant.googleConnection?.connectedEmail
        ),
        hasGoogleCredentials,
        isTenantCustomCredential: isTenantCustom,
        suggestedRedirectUri,
      }}
      initialQuery={{
        googleConnected,
        accountEmail,
        error: errorParam,
        redirectUri: redirectUriParam,
      }}
    />
  );
}
