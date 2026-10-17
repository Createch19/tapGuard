import { requireSuperAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import TenantsClient from "./TenantsClient";

export const dynamic = "force-dynamic";

export default async function AdminTenantsPage() {
  await requireSuperAdmin();

  const [tenants, businessTypes] = await Promise.all([
    prisma.tenant.findMany({
      include: {
        cards: true,
        tapEvents: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.businessType.findMany({
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    }),
  ]);

  const formatted = tenants.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    plan: t.plan,
    businessType: t.businessType || "Restaurant & Café",
    isActive: t.isActive,
    maxCards: t.maxCards,
    createdAt: t.createdAt.toISOString(),
    cardCount: t.cards.length,
    tapCount: t.tapEvents.length,
  }));

  const formattedBusinessTypes = businessTypes.map((bt) => ({
    id: bt.id,
    name: bt.name,
    slug: bt.slug,
    icon: bt.icon || "Store",
    isDefault: bt.isDefault,
  }));

  return (
    <TenantsClient
      tenants={formatted}
      initialBusinessTypes={formattedBusinessTypes}
    />
  );
}
