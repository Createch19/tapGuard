import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { tenantId } = await requireTenantUser();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
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
      }}
    />
  );
}
