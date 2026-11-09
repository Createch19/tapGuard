"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ArrowRight,
  Sliders,
  Calendar,
  MessageSquare,
  Camera,
  ExternalLink,
} from "lucide-react";

interface AuditCheckItem {
  id: string;
  title: string;
  category: "PROFILE" | "CONTENT" | "ENGAGEMENT";
  status: "PASS" | "WARN" | "FAIL";
  score: number;
  maxScore: number;
  details: string;
  fixAction?: string;
}

interface FixSuggestion {
  id: string;
  title: string;
  fixAction: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

interface ProfileAuditViewProps {
  locationId?: string;
  onNavigateTab?: (tab: string) => void;
}

export default function ProfileAuditView({ locationId, onNavigateTab }: ProfileAuditViewProps) {
  const [loading, setLoading] = useState(true);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [auditData, setAuditData] = useState<{
    overallScore: number;
    previousScore: number | null;
    scoreDelta: number | null;
    checks: AuditCheckItem[];
    fixSuggestions: FixSuggestion[];
    auditedAt: string;
    locationTitle?: string;
  } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAudit = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const url = locationId
        ? `/api/dashboard/google/audit?locationId=${encodeURIComponent(locationId)}`
        : "/api/dashboard/google/audit";
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load audit");

      if (data.audit) {
        setAuditData({
          overallScore: data.audit.overallScore,
          previousScore: data.audit.previousScore,
          scoreDelta: data.audit.scoreDelta,
          checks: (data.audit.checksJson as AuditCheckItem[]) || [],
          fixSuggestions: (data.audit.fixSuggestions as FixSuggestion[]) || [],
          auditedAt: data.audit.auditedAt,
          locationTitle: data.location?.title,
        });
      }
      setHistory(data.history || []);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load profile audit.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, [locationId]);

  const handleRunAudit = async () => {
    setIsRunningAudit(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/dashboard/google/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to execute audit");

      if (data.result) {
        setAuditData({
          overallScore: data.result.overallScore,
          previousScore: data.result.previousScore,
          scoreDelta: data.result.scoreDelta,
          checks: data.result.checks,
          fixSuggestions: data.result.fixSuggestions,
          auditedAt: data.result.auditedAt,
          locationTitle: data.result.locationTitle,
        });
        // refresh history
        fetchAudit();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to execute audit.");
    } finally {
      setIsRunningAudit(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-12 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-700">Auditing Google Business Profile...</p>
        <p className="text-xs text-slate-400">Inspecting 13 profile dimensions, photos, hours & engagement.</p>
      </div>
    );
  }

  const score = auditData?.overallScore ?? 0;
  const scoreDelta = auditData?.scoreDelta;
  const checks = auditData?.checks ?? [];
  const fixSuggestions = auditData?.fixSuggestions ?? [];

  const scoreColor =
    score >= 80
      ? "text-emerald-600"
      : score >= 60
      ? "text-amber-500"
      : "text-rose-600";

  const scoreBadgeBg =
    score >= 80
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : score >= 60
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : "bg-rose-50 text-rose-800 border-rose-200";

  const filteredChecks = checks.filter((c) => {
    if (activeCategory === "ALL") return true;
    if (activeCategory === "NEEDS_FIX") return c.status !== "PASS";
    return c.category === activeCategory;
  });

  const passedCount = checks.filter((c) => c.status === "PASS").length;
  const warnCount = checks.filter((c) => c.status === "WARN").length;
  const failCount = checks.filter((c) => c.status === "FAIL").length;

  return (
    <div className="space-y-6">
      {/* Header & Score Gauge Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">
                  Google Profile Completeness Audit
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  READ-ONLY ANALYSIS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates search ranking factors, metadata completeness, and customer engagement signals.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isRunningAudit}
            onClick={handleRunAudit}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunningAudit ? "animate-spin" : ""}`} />
            <span>{isRunningAudit ? "Analyzing Profile..." : "Re-run Audit"}</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Hero Score Display */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Score Badge */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50/70 rounded-2xl border border-slate-100 text-center">
            <div className="relative flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-8 border-slate-200/80 flex flex-col items-center justify-center bg-white shadow-xs">
                <span className={`text-4xl font-black ${scoreColor} tracking-tight`}>
                  {score}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-1">
                  / 100 PTS
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${scoreBadgeBg}`}>
                {score >= 80 ? "Excellent Profile" : score >= 60 ? "Good — Needs Improvement" : "Critical Fixes Needed"}
              </span>

              {typeof scoreDelta === "number" && scoreDelta !== 0 && (
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                    scoreDelta > 0
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {scoreDelta > 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta} pts
                  </span>
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-2">
              Last audited:{" "}
              {auditData?.auditedAt
                ? new Date(auditData.auditedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Just now"}
            </p>
          </div>

          {/* Breakdown summary */}
          <div className="md:col-span-7 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-center">
                <div className="text-xl font-black text-emerald-700">{passedCount}</div>
                <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Passed</div>
              </div>
              <div className="p-3.5 bg-amber-50/70 border border-amber-100 rounded-2xl text-center">
                <div className="text-xl font-black text-amber-700">{warnCount}</div>
                <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Optimizations</div>
              </div>
              <div className="p-3.5 bg-rose-50/70 border border-rose-100 rounded-2xl text-center">
                <div className="text-xl font-black text-rose-700">{failCount}</div>
                <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Missing Critical</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Google algorithms reward complete, active profiles with higher local search map rankings. Complete the recommended fixes below to increase your profile strength.
            </p>

            {history.length > 1 && (
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700 shrink-0">Score History:</span>
                {history.slice(0, 5).map((h, i) => (
                  <span
                    key={h.id || i}
                    className="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-[10px] text-slate-700 whitespace-nowrap"
                  >
                    {new Date(h.auditedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}:{" "}
                    <strong>{h.overallScore}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actionable What to Fix List */}
      {fixSuggestions.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Recommended Fixes ({fixSuggestions.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Ranked by local SEO impact
            </span>
          </div>

          <div className="space-y-2.5">
            {fixSuggestions.map((fix) => {
              const isHigh = fix.priority === "HIGH";
              return (
                <div
                  key={fix.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isHigh
                      ? "bg-rose-50/40 border-rose-100"
                      : "bg-slate-50/70 border-slate-200/70"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isHigh
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isHigh ? "High Impact" : "Medium Impact"}
                      </span>
                      <h4 className="text-xs font-black text-slate-800">{fix.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600">{fix.fixAction}</p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {fix.id === "review_reply_rate" && onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => onNavigateTab("reviews")}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Reply in Reviews</span>
                      </button>
                    )}

                    {fix.id === "post_recency" && onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => onNavigateTab("posts")}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Create Post</span>
                      </button>
                    )}

                    {fix.id === "photo_count" && onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => onNavigateTab("photos")}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Upload Photos</span>
                      </button>
                    )}

                    {["description", "secondary_categories", "services", "regular_hours", "special_hours", "phone", "website"].includes(fix.id) && onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => onNavigateTab("editor")}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Fix in Editor</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed 13-Check Inspection Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            All 13 Audit Checks Breakdown
          </h3>

          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: "ALL", label: "All Checks" },
              { id: "NEEDS_FIX", label: `Needs Attention (${warnCount + failCount})` },
              { id: "PROFILE", label: "Profile" },
              { id: "CONTENT", label: "Content" },
              { id: "ENGAGEMENT", label: "Engagement" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredChecks.map((item) => {
            const isPass = item.status === "PASS";
            const isWarn = item.status === "WARN";
            return (
              <div key={item.id} className="py-3.5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isPass ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isWarn ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{item.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-500 uppercase tracking-widest">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{item.details}</p>
                    {item.fixAction && (
                      <p className="text-[11px] text-amber-800 font-medium pt-0.5">
                        &rarr; Fix: {item.fixAction}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                      isPass
                        ? "bg-emerald-50 text-emerald-700"
                        : isWarn
                        ? "bg-amber-50 text-amber-800"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {item.score} / {item.maxScore}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
