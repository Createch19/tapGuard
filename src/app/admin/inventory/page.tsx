import { headers } from "next/headers";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import InventoryClient from "./InventoryClient";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  await requireSuperAdmin();

  const cards = await prisma.card.findMany({
    include: {
      tenant: true,
      batch: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const unassignedCount = cards.filter((c) => c.status === "UNASSIGNED").length;
  const activeCount = cards.filter((c) => c.status === "ACTIVE").length;

  const headerList = await headers();
  const host = headerList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;

  const formatted = cards.map((c) => ({
    id: c.id,
    shortCode: c.shortCode,
    urlSlug: c.urlSlug,
    label: c.label,
    status: c.status,
    tenantName: c.tenant?.name || null,
    batchName: c.batch?.name || null,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <InventoryClient
      cards={formatted}
      unassignedCount={unassignedCount}
      activeCount={activeCount}
      baseUrl={baseUrl}
    />
  );
}
