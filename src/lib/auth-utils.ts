import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export interface AuthSessionUser {
  id: string;
  name?: string | null;
  email: string;
  role: "SUPER_ADMIN" | "OWNER" | "MANAGER" | "STAFF";
  tenantId?: string | null;
  tenantName?: string | null;
  tenantSlug?: string | null;
}

export async function getCurrentUser(): Promise<AuthSessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;

  return {
    id: (session.user as unknown as { id: string }).id || session.user.id || "",
    name: session.user.name,
    email: session.user.email || "",
    role: (session.user as unknown as { role: AuthSessionUser["role"] }).role || "OWNER",
    tenantId: (session.user as unknown as { tenantId?: string | null }).tenantId || null,
    tenantName: (session.user as unknown as { tenantName?: string | null }).tenantName || null,
    tenantSlug: (session.user as unknown as { tenantSlug?: string | null }).tenantSlug || null,
  };
}

export async function requireAuth(): Promise<AuthSessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireSuperAdmin(): Promise<AuthSessionUser> {
  const user = await requireAuth();
  if (user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }
  return user;
}

export async function requireTenantUser(): Promise<{
  user: AuthSessionUser;
  tenantId: string;
}> {
  const user = await requireAuth();
  if (user.role === "SUPER_ADMIN") {
    // If super admin visits tenant area without tenantId, default to the first active tenant
    const firstTenant = await prisma.tenant.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    if (!firstTenant) {
      redirect("/admin");
    }
    return { user, tenantId: firstTenant.id };
  }

  if (!user.tenantId) {
    redirect("/login");
  }

  return { user, tenantId: user.tenantId };
}
