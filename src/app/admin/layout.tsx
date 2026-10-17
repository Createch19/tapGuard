import { requireSuperAdmin } from "@/lib/auth-utils";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSuperAdmin();

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row">
      <AdminSidebar
        user={{
          name: user.name,
          email: user.email,
          role: user.role,
        }}
      />

      <main className="flex-1 lg:pl-64 min-w-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
