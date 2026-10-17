import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import ClaimClient from "./ClaimClient";

export const dynamic = "force-dynamic";

export default async function ClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const user = await getCurrentUser();

  let tenant = null;
  let activeCardCount = 0;
  let adminTenants: Array<{
    id: string;
    name: string;
    maxCards: number;
    activeCardCount: number;
  }> = [];

  if (user?.role === "SUPER_ADMIN") {
    const rawTenants = await prisma.tenant.findMany({
      where: { isActive: true },
      include: {
        cards: { where: { status: "ACTIVE" } },
      },
      orderBy: { name: "asc" },
    });

    adminTenants = rawTenants.map((t) => ({
      id: t.id,
      name: t.name,
      maxCards: t.maxCards,
      activeCardCount: t.cards.length,
    }));
  } else if (user?.tenantId) {
    tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      include: {
        cards: { where: { status: "ACTIVE" } },
      },
    });
    if (tenant) {
      activeCardCount = tenant.cards.length;
    }
  }

  return (
    <ClaimClient
      initialCode={code || ""}
      user={user}
      adminTenants={adminTenants}
      tenant={
        tenant
          ? {
              id: tenant.id,
              name: tenant.name,
              maxCards: tenant.maxCards,
              activeCardCount,
            }
          : null
      }
    />
  );
}
