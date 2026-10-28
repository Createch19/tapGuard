import { Suspense } from "react";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { getGoogleOAuthCredentials, getGoogleOAuthRedirectUri } from "@/lib/google-sync";
import SettingsClient from "./SettingsClient";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { tenantId } = await requireTenantUser();
  const headersList = await headers();

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

  const { clientId, isTenantCustom } = await getGoogleOAuthCredentials(tenantId);
  const hasGoogleCredentials = Boolean(clientId && clientId.trim());
  const suggestedRedirectUri = getGoogleOAuthRedirectUri(headersList);

  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
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
          googleLocationId: tenant.googleLocationId || tenant.googleConnection?.locations?.[0]?.googleLocationId || null,
          accountName: tenant.googleConnection?.accountName || null,
          lastSyncedAt: tenant.googleConnection?.lastSyncedAt?.toISOString() || null,
          isVerified: tenant.googleConnection?.isVerified || false,
          geminiApiKey: tenant.geminiConfig?.customApiKey || null,
          customGoogleClientId: tenant.customGoogleClientId || null,
          customGoogleClientSecret: tenant.customGoogleClientSecret || null,
          isGoogleConnected: Boolean(tenant.googleConnection?.isVerified || tenant.googleConnection?.connectedEmail),
          hasGoogleCredentials,
          isTenantCustomCredential: isTenantCustom,
          suggestedRedirectUri,
        }}
      />
    </Suspense>
  );
}
