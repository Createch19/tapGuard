import { notFound } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import TenantDetailClient from "./TenantDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminTenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSuperAdmin();
  const { id } = await params;

  const [tenant, businessTypes] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id },
      include: {
        cards: {
          include: { tapEvents: true },
          orderBy: { createdAt: "desc" },
        },
        users: true,
        subscription: true,
      },
    }),
    prisma.businessType.findMany({
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    }),
  ]);

  if (!tenant) {
    notFound();
  }

  const formatted = {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    plan: tenant.plan,
    businessType: tenant.businessType || "Restaurant & Café",
    isActive: tenant.isActive,
    maxCards: tenant.maxCards,
    googleReviewUrl: tenant.googleReviewUrl,
    smartGateEnabled: tenant.smartGateEnabled,
    alertEmail: tenant.alertEmail,
    webhookUrl: tenant.webhookUrl,
    createdAt: tenant.createdAt.toISOString(),
    cards: tenant.cards.map((c) => ({
      id: c.id,
      shortCode: c.shortCode,
      urlSlug: c.urlSlug,
      label: c.label,
      status: c.status,
      tapCount: c.tapEvents.length,
    })),
    users: tenant.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
    })),
    subscription: tenant.subscription
      ? {
          id: tenant.subscription.id,
          plan: tenant.subscription.plan,
          status: tenant.subscription.status,
          pricePaid: Number(tenant.subscription.pricePaid),
          billingCycle: tenant.subscription.billingCycle,
        }
      : null,
  };

  const formattedBusinessTypes = businessTypes.map((bt) => ({
    id: bt.id,
    name: bt.name,
    slug: bt.slug,
    icon: bt.icon || "Store",
    isDefault: bt.isDefault,
  }));

  return (
    <TenantDetailClient
      tenant={formatted}
      initialBusinessTypes={formattedBusinessTypes}
    />
  );
}
