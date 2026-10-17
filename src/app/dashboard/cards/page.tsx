import { headers } from "next/headers";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import CardsClient from "./CardsClient";

export const dynamic = "force-dynamic";

export default async function CardsPage() {
  const { tenantId } = await requireTenantUser();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      cards: {
        include: {
          tapEvents: true,
        },
        orderBy: { createdAt: "desc" },
      },
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

  return (
    <CardsClient
      cards={formattedCards}
      tenantName={tenant.name}
      baseUrl={baseUrl}
      maxCards={tenant.maxCards}
    />
  );
}
