import { requireSuperAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  await requireSuperAdmin();

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Security & Compliance Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Immutable log of Super Admin modifications, plan pricing updates, and card batch minting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            {logs.length} Audit Entries
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-4">Action Type</th>
                <th className="py-3.5 px-4">Actor Email</th>
                <th className="py-3.5 px-4">Target Type</th>
                <th className="py-3.5 px-5 text-right">Event Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5 text-slate-500 font-mono text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>

                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-800 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded-md">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-4 px-4 font-semibold text-slate-700">
                    {log.actorEmail}
                  </td>

                  <td className="py-4 px-4 text-slate-500 font-mono">
                    {log.targetType}
                  </td>

                  <td className="py-4 px-5 text-right">
                    <span className="font-mono text-[11px] text-slate-400 truncate max-w-xs inline-block">
                      {log.metadata ? JSON.stringify(log.metadata) : "None"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
