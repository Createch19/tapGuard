import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import SubscriptionClient from "./SubscriptionClient";

export const dynamic = "force-dynamic";

export default async function SubscriptionPage() {
  const { tenantId } = await requireTenantUser();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      cards: { where: { status: "ACTIVE" } },
      subscription: true,
    },
  });

  if (!tenant) return null;

  const planConfigs = await prisma.planConfig.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const formattedConfigs = planConfigs.map((pc) => ({
    id: pc.id,
    plan: pc.plan,
    displayName: pc.displayName,
    description: pc.description,
    price: Number(pc.price),
    currency: pc.currency,
    billingCycle: pc.billingCycle,
    maxCards: pc.maxCards,
    smartGate: pc.smartGate,
    multiGateTemplates: pc.multiGateTemplates,
    customBranding: pc.customBranding,
    webhookAlerts: pc.webhookAlerts,
    qrCodeTier: pc.qrCodeTier,
    analyticsRetDays: pc.analyticsRetDays,
    prioritySupport: pc.prioritySupport,
  }));

  return (
    <SubscriptionClient
      tenant={{
        name: tenant.name,
        plan: tenant.plan,
        activeCards: tenant.cards.length,
        maxCards: tenant.maxCards,
      }}
      subscription={
        tenant.subscription
          ? {
              status: tenant.subscription.status,
              billingCycle: tenant.subscription.billingCycle,
              pricePaid: Number(tenant.subscription.pricePaid),
              currency: tenant.subscription.currency,
              currentPeriodEnd:
                tenant.subscription.currentPeriodEnd?.toISOString() || null,
            }
          : null
      }
      planConfigs={formattedConfigs}
    />
  );
}
