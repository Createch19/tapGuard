import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, tenantId } = await requireTenantUser();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      cards: { where: { status: "ACTIVE" } },
    },
  });

  if (!tenant) {
    throw new Error("Tenant account not found.");
  }

  // Count unresolved private feedback
  const unresolvedFeedbackCount = await prisma.privateFeedback.count({
    where: {
      tenantId,
      isResolved: { not: true },
    },
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row">
      <DashboardSidebar
        tenant={{
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          plan: tenant.plan,
          maxCards: tenant.maxCards,
          activeCards: tenant.cards.length,
        }}
        user={user}
        unresolvedFeedbackCount={unresolvedFeedbackCount}
      />

      <main className="flex-1 lg:pl-64 min-w-0">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
