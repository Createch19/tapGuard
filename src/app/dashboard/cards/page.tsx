import { headers } from "next/headers";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import CardsClient from "./CardsClient";

export const dynamic = "force-dynamic";

export default async function CardsPage() {
  const { user, tenantId } = await requireTenantUser();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      cards: {
        include: {
          tapEvents: true,
        },
        orderBy: { createdAt: "desc" },
      },
      subscription: true,
    },
  });

  if (!tenant) return null;

  const headerList = await headers();
  const host = headerList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;

  const formattedCards = tenant.cards.map((c) => ({
    id: c.id,
    shortCode: c.shortCode,
    urlSlug: c.urlSlug,
    label: c.label,
    status: c.status,
    activatedAt: c.activatedAt?.toISOString() || null,
    tapCount: c.tapEvents.length,
  }));

  const rawPlan = String(
    tenant.subscription?.plan || tenant.plan || "BASIC"
  ).toUpperCase();

  const effectivePlan: "BASIC" | "PRO" | "ENTERPRISE" =
    user.role === "SUPER_ADMIN"
      ? "ENTERPRISE"
      : rawPlan === "PRO"
      ? "PRO"
      : rawPlan === "ENTERPRISE"
      ? "ENTERPRISE"
      : "BASIC";

  return (
    <CardsClient
      cards={formattedCards}
      tenantName={tenant.name}
      tenantPlan={effectivePlan}
      baseUrl={baseUrl}
      maxCards={tenant.maxCards}
    />
  );
}
