import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import {
  Building2,
  CreditCard,
  SlidersHorizontal,
  PackagePlus,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

export default async function AdminOverviewPage() {
  const totalTenants = await prisma.tenant.count();
  const activeTenants = await prisma.tenant.count({ where: { isActive: true } });
  const activeCards = await prisma.card.count({ where: { status: "ACTIVE" } });
  const unassignedCards = await prisma.card.count({
    where: { status: "UNASSIGNED" },
  });

  const totalTaps = await prisma.tapEvent.count();
  const totalFeedbackIntercepted = await prisma.privateFeedback.count();

  // Calculate MRR from active monthly subscriptions
  const activeMonthlySubs = await prisma.subscription.findMany({
    where: { status: "ACTIVE", billingCycle: "MONTHLY" },
  });
  const mrr = activeMonthlySubs.reduce(
    (acc, sub) => acc + Number(sub.pricePaid),
    0
  );

  // Calculate Lifetime Revenue
  const lifetimeSubs = await prisma.subscription.findMany({
    where: { status: "ACTIVE", billingCycle: "LIFETIME" },
  });
  const lifetimeRev = lifetimeSubs.reduce(
    (acc, sub) => acc + Number(sub.pricePaid),
    0
  );

  // Recent 6 tenants
  const recentTenants = await prisma.tenant.findMany({
    include: {
      cards: true,
      subscription: true,
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  // Recent 6 audit logs
  const recentLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 text-teal-400">
              Super Admin Mode
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Platform Health 100% Operational
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Platform Master Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Fleet monitoring, multi-tenant subscription health, and hardware logistics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/plan-config"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
            <span>Edit Plan Prices</span>
          </Link>

          <Link
            href="/admin/inventory/generate"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <PackagePlus className="w-3.5 h-3.5 text-teal-400" />
            <span>Generate NFC Batch</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tenants */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Tenants
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">
            {activeTenants}
            <span className="text-xs text-slate-400 font-normal ml-1.5">
              / {totalTenants} total
            </span>
          </div>
          <div className="text-[11px] text-teal-600 font-semibold">
            B2B accounts live
          </div>
        </div>

        {/* Platform MRR */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Platform MRR
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">
            ₹{mrr.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">
            + ₹{lifetimeRev.toLocaleString()} lifetime collections
          </div>
        </div>

        {/* Total Cards & Inventory */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Card Fleet
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">
            {activeCards}
            <span className="text-xs text-slate-400 font-normal ml-1.5">
              Active
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            {unassignedCards} ghost links in stock
          </div>
        </div>

        {/* Platform Total Taps */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Tap Traffic
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">
            {totalTaps}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            {totalFeedbackIntercepted} bad reviews intercepted
          </div>
        </div>
      </div>

      {/* Grid: Tenants List (2 cols) & Audit Log (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tenants List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Tenant Accounts
            </h3>
            <Link
              href="/admin/tenants"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <span>View All Tenants</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTenants.map((t) => (
              <div
                key={t.id}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 font-black text-xs flex items-center justify-center">
                    {t.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{t.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      /{t.slug} • {t.cards.length} cards
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase bg-slate-100 text-slate-700">
                    {t.plan}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {t.isActive ? "Active" : "Suspended"}
                  </span>
                  <Link
                    href={`/admin/tenants/${t.id}`}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log Feed */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recent Admin Events
            </h3>
            <Link
              href="/admin/audit-logs"
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              All Logs
            </Link>
          </div>

          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs"
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-800">
                    {log.action.replace(/_/g, " ")}
                  </span>
                  <span className="text-slate-400">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  By {log.actorEmail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
