import { requireSuperAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import SubscriptionsClient from "./SubscriptionsClient";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  await requireSuperAdmin();

  const subscriptions = await prisma.subscription.findMany({
    include: {
      tenant: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const activeMonthly = subscriptions.filter(
    (s) => s.status === "ACTIVE" && s.billingCycle === "MONTHLY"
  );
  const mrr = activeMonthly.reduce((acc, s) => acc + Number(s.pricePaid), 0);

  const lifetime = subscriptions.filter(
    (s) => s.status === "ACTIVE" && s.billingCycle === "LIFETIME"
  );
  const lifetimeRev = lifetime.reduce(
    (acc, s) => acc + Number(s.pricePaid),
    0
  );

  const formatted = subscriptions.map((s) => ({
    id: s.id,
    tenantName: s.tenant.name,
    tenantSlug: s.tenant.slug,
    plan: s.plan,
    status: s.status,
    billingCycle: s.billingCycle,
    pricePaid: Number(s.pricePaid),
    currency: s.currency,
    currentPeriodEnd: s.currentPeriodEnd?.toISOString() || null,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <SubscriptionsClient
      subscriptions={formatted}
      mrr={mrr}
      lifetimeRev={lifetimeRev}
    />
  );
}
