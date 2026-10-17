import { requireSuperAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireSuperAdmin();

  const [users, tenants] = await Promise.all([
    prisma.user.findMany({
      include: {
        tenant: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tenant.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const formattedUsers = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    tenantId: u.tenantId,
    tenantName: u.tenant?.name || null,
    tenantSlug: u.tenant?.slug || null,
    createdAt: u.createdAt.toISOString(),
  }));

  return <UsersClient initialUsers={formattedUsers} tenants={tenants} />;
}
