import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
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
        geminiApiKey: tenant.geminiConfig?.customApiKey || null,
        isGoogleConnected: Boolean(tenant.googleConnection),
      }}
    />
  );
}
