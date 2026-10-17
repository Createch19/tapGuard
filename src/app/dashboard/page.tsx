import Link from "next/link";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import {
  CreditCard,
  MessageSquareWarning,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Smartphone,
  Laptop,
  Star,
  ExternalLink,
} from "lucide-react";

export default async function DashboardOverviewPage() {
  const { tenantId } = await requireTenantUser();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      cards: true,
      branding: true,
    },
  });

  if (!tenant) return null;

  // Aggregate stats
  const totalTaps = await prisma.tapEvent.count({
    where: { tenantId },
  });

  const redirectedTaps = await prisma.tapEvent.count({
    where: {
      tenantId,
      outcome: { in: ["REDIRECTED", "DIRECT_REDIRECT"] },
    },
  });

  const feedbackCaptured = await prisma.tapEvent.count({
    where: {
      tenantId,
      outcome: "FEEDBACK_CAPTURED",
    },
  });

  const activeCards = tenant.cards.filter((c) => c.status === "ACTIVE").length;

  const conversionRate =
    totalTaps > 0 ? Math.round((redirectedTaps / totalTaps) * 100) : 0;

  // OS Breakdown
  const iosTaps = await prisma.tapEvent.count({
    where: { tenantId, deviceOs: "IOS" },
  });
  const androidTaps = await prisma.tapEvent.count({
    where: { tenantId, deviceOs: "ANDROID" },
  });
  const desktopTaps = await prisma.tapEvent.count({
    where: { tenantId, deviceOs: "DESKTOP" },
  });

  const iosPercent = totalTaps > 0 ? Math.round((iosTaps / totalTaps) * 100) : 0;
  const androidPercent =
    totalTaps > 0 ? Math.round((androidTaps / totalTaps) * 100) : 0;
  const desktopPercent =
    totalTaps > 0 ? Math.round((desktopTaps / totalTaps) * 100) : 0;

  // Unresolved private feedback count
  const unresolvedFeedback = await prisma.privateFeedback.findMany({
    where: { tenantId, isResolved: false },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  // Recent 8 Tap Events
  const recentTaps = await prisma.tapEvent.findMany({
    where: { tenantId },
    include: {
      card: true,
      feedback: true,
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {tenant.plan} Plan
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Smart Gate {tenant.smartGateEnabled ? "Active" : "Bypassed"}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {tenant.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time performance of your NFC Google Review touchpoints
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/claim"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-2xs"
          >
            <CreditCard className="w-3.5 h-3.5 text-teal-600" />
            <span>Claim Card</span>
          </Link>

          <Link
            href="/dashboard/cards"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>View NFC Cards</span>
          </Link>
        </div>
      </div>

      {/* Unresolved Feedback Alert if any */}
      {unresolvedFeedback.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                {unresolvedFeedback.length} Negative Customer{" "}
                {unresolvedFeedback.length === 1 ? "Experience" : "Experiences"}{" "}
                Intercepted
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                These ratings were captured privately before they reached Google.
                Reach out to resolve their concerns directly!
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/feedback"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shrink-0 shadow-2xs transition-colors"
          >
            <span>Review Feedback</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Taps */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Taps & Scans
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">{totalTaps}</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-teal-600 font-bold inline-flex items-center">
              100%
            </span>
            <span>hardware interaction</span>
          </div>
        </div>

        {/* 5-Star Redirection Rate */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Positive Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">
            {conversionRate}%
          </div>
          <div className="text-[11px] text-slate-500">
            {redirectedTaps} sent to Google Reviews
          </div>
        </div>

        {/* Private Feedback Intercepted */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Shielded Bad Reviews
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">
            {feedbackCaptured}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            Saved from Google rating drop
          </div>
        </div>

        {/* Active Cards */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active NFC Cards
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">
            {activeCards}
            <span className="text-sm font-semibold text-slate-400 ml-1">
              / {tenant.maxCards}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            {tenant.maxCards - activeCards} available slots
          </div>
        </div>
      </div>

      {/* Analytics Breakdown & Recent Taps Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Breakdown (1 column) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Device Operating Systems
            </h3>

            <div className="space-y-4">
              {/* Apple iOS */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-3.5 h-3.5 text-slate-600" />
                    <span>Apple iOS</span>
                  </div>
                  <span>
                    {iosTaps} taps ({iosPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-600 h-full rounded-full"
                    style={{ width: `${iosPercent}%` }}
                  />
                </div>
              </div>

              {/* Android */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                    <span>Android</span>
                  </div>
                  <span>
                    {androidTaps} taps ({androidPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-500 h-full rounded-full"
                    style={{ width: `${androidPercent}%` }}
                  />
                </div>
              </div>

              {/* Desktop / Laptop */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-3.5 h-3.5 text-slate-400" />
                    <span>Desktop / Tablet</span>
                  </div>
                  <span>
                    {desktopTaps} taps ({desktopPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-slate-400 h-full rounded-full"
                    style={{ width: `${desktopPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs text-slate-600">
              <span className="font-semibold block text-slate-800 mb-0.5">
                Google Review Link
              </span>
              <a
                href={tenant.googleReviewUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="text-teal-600 hover:text-teal-700 font-medium truncate block flex items-center gap-1"
              >
                <span className="truncate">
                  {tenant.googleReviewUrl || "Not configured yet"}
                </span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* Recent Tap Events Feed (2 columns) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recent Tap Activity
            </h3>
            <span className="text-xs text-slate-400">Live Hardware Feed</span>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTaps.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                No tap activity recorded yet. Scan or tap an active NFC card to get started!
              </div>
            ) : (
              recentTaps.map((event) => {
                let badgeClass = "bg-slate-100 text-slate-700";
                let badgeText = "Bounced";

                if (
                  event.outcome === "REDIRECTED" ||
                  event.outcome === "DIRECT_REDIRECT"
                ) {
                  badgeClass = "bg-teal-50 text-teal-700 border border-teal-200";
                  badgeText = "Google 5★ Redirect";
                } else if (event.outcome === "FEEDBACK_CAPTURED") {
                  badgeClass = "bg-amber-50 text-amber-800 border border-amber-200";
                  badgeText = `Private Feedback (${event.rating || "?"}★)`;
                }

                return (
                  <div
                    key={event.id}
                    className="py-3 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 font-mono text-[10px] font-bold">
                        {event.deviceOs.slice(0, 3)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {event.card.label || `Card ${event.card.shortCode}`}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(event.createdAt).toLocaleDateString()} at{" "}
                          {new Date(event.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full font-semibold text-[11px] ${badgeClass}`}
                      >
                        {badgeText}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
