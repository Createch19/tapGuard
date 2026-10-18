import { headers } from "next/headers";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import QrStudioClient from "./QrStudioClient";

export const dynamic = "force-dynamic";

export default async function QrStudioPage() {
  const { user, tenantId } = await requireTenantUser();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      cards: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      },
      branding: true,
      subscription: true,
    },
  });

  if (!tenant) return null;

  const headerList = await headers();
  const host = headerList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;

  const cards = tenant.cards.map((c) => ({
    id: c.id,
    shortCode: c.shortCode,
    urlSlug: c.urlSlug,
    label: c.label,
    fullUrl: `${baseUrl}/tap/${c.urlSlug}`,
  }));

  // Fallback direct gate URL if no cards claimed yet
  const defaultUrl = cards[0]?.fullUrl || `${baseUrl}/rate/${tenant.slug}`;

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
    <QrStudioClient
      tenantName={tenant.name}
      tenantPlan={effectivePlan}
      businessType={tenant.businessType}
      cards={cards}
      defaultUrl={defaultUrl}
    />
  );
}
