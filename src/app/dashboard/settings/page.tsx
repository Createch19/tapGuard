import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { getGoogleOAuthCredentials, getGoogleOAuthRedirectUri } from "@/lib/google-sync";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { tenantId } = await requireTenantUser();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      googleConnection: {
        include: { locations: true },
      },
      geminiConfig: true,
    },
  });

  if (!tenant) return null;

  const { clientId } = await getGoogleOAuthCredentials();
  const hasGoogleCredentials = Boolean(clientId && clientId.trim());
  const suggestedRedirectUri = getGoogleOAuthRedirectUri();

  return (
    <SettingsClient
      tenant={{
        id: tenant.id,
        name: tenant.name,
        googleReviewUrl: tenant.googleReviewUrl,
        smartGateEnabled: tenant.smartGateEnabled,
        alertEmail: tenant.alertEmail,
        webhookUrl: tenant.webhookUrl,
        googleBusinessEmail: tenant.googleBusinessEmail || tenant.googleConnection?.connectedEmail || null,
        googleAccountId: tenant.googleConnection?.googleAccountId || null,
        googleLocationId: tenant.googleLocationId || tenant.googleConnection?.locations[0]?.googleLocationId || null,
        accountName: tenant.googleConnection?.accountName || null,
        lastSyncedAt: tenant.googleConnection?.lastSyncedAt?.toISOString() || null,
        isVerified: tenant.googleConnection?.isVerified || false,
        geminiApiKey: tenant.geminiConfig?.customApiKey || null,
        isGoogleConnected: Boolean(tenant.googleConnection?.isVerified || tenant.googleConnection?.connectedEmail),
        hasGoogleCredentials,
        suggestedRedirectUri,
      }}
    />
  );
}
