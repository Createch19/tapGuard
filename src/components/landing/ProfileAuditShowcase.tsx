"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Camera,
  Layers,
  MapPin,
  Utensils,
  ChevronRight,
} from "lucide-react";

interface AuditCheck {
  title: string;
  category: "PROFILE" | "CONTENT" | "ENGAGEMENT";
  status: "PASS" | "WARN";
  score: number;
  maxScore: number;
  impact: string;
  fixAction?: string;
}

const AUDIT_CHECKS: AuditCheck[] = [
  {
    title: "100% Core Profile & Address Attributes Filled",
    category: "PROFILE",
    status: "PASS",
    score: 25,
    maxScore: 25,
    impact: "Maximizes discovery in local search algorithms",
  },
  {
    title: "100% Review Reply Rate (Gemini Auto-Pilot Active)",
    category: "ENGAGEMENT",
    status: "PASS",
    score: 25,
    maxScore: 25,
    impact: "Google signals high business responsiveness",
  },
  {
    title: "Upcoming Holiday & Festival Hours Configured",
    category: "ENGAGEMENT",
    status: "PASS",
    score: 20,
    maxScore: 20,
    impact: "Prevents customer confusion during long weekends",
  },
  {
    title: "Structured Digital Menu & Service Catalog Synced",
    category: "CONTENT",
    status: "PASS",
    score: 15,
    maxScore: 15,
    impact: "Enables direct item search in Google Maps",
  },
  {
    title: "Fresh High-Res Photos Uploaded Within 14 Days",
    category: "CONTENT",
    status: "WARN",
    score: 9,
    maxScore: 15,
    impact: "Venues with fresh photos receive 42% more direction requests",
    fixAction: "Upload 5 fresh storefront / dish photos",
  },
];

export default function ProfileAuditShowcase() {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const filteredChecks = activeFilter === "ALL"
    ? AUDIT_CHECKS
    : AUDIT_CHECKS.filter((c) => c.category === activeFilter);

  return (
    <section id="profile-audit" className="px-4 sm:px-8 py-20 max-w-6xl mx-auto w-full">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold mb-3 border border-teal-200">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Profile Health &amp; SEO Optimization</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Unlock 100/100 Google Business Profile Health
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl mx-auto leading-relaxed">
          Google buries incomplete or outdated business listings. TapGenie scans your Google profile across 20+ ranking factors and gives you 1-click recommendations to climb local rankings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Interactive Score Dial & Health Breakdown */}
        <div className="lg:col-span-5 bg-gradient-to-br from-white to-teal-50/30 rounded-3xl p-7 border border-slate-200/90 shadow-xl text-center relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Audit Health Score
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Top 5% in District
            </span>
          </div>

          {/* Big Circular Score Display */}
          <div className="relative w-44 h-44 mx-auto mb-6 flex flex-col items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                className="stroke-slate-100 fill-none"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                className="stroke-teal-600 fill-none transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 50}
                strokeDashoffset={2 * Math.PI * 50 * (1 - 0.94)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black text-slate-900 leading-none">
                94
              </span>
              <span className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                out of 100
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                +14 pts gained
              </span>
            </div>
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-1">
            Excellent Listing Optimization
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Your profile has 94% of Google&apos;s ranking signals active.
          </p>

          {/* Impact Stats */}
          <div className="grid grid-cols-2 gap-2 text-left pt-4 border-t border-slate-100">
            <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                Maps Discovery
              </span>
              <span className="text-lg font-black text-teal-600 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +38%
              </span>
              <span className="text-[10px] text-slate-500">
                vs district average
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                Direction Requests
              </span>
              <span className="text-lg font-black text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +24%
              </span>
              <span className="text-[10px] text-slate-500">
                more customer footfall
              </span>
            </div>
          </div>
        </div>

        {/* Right: Live Audit Checklist */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Live Optimization Checklist
              </h3>
              <p className="text-[11px] text-slate-500">
                Scanned across Google Business Profile APIs
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-[11px]">
              {(["ALL", "PROFILE", "CONTENT", "ENGAGEMENT"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeFilter === cat
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {cat === "ALL" ? "All Checks" : cat.charAt(0) + cat.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-3 mb-6">
            {filteredChecks.map((check, idx) => {
              const isPass = check.status === "PASS";
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    isPass
                      ? "bg-slate-50/60 border-slate-200/80"
                      : "bg-amber-50/50 border-amber-200/80"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isPass ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-slate-900">
                        {check.title}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPass
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-100 text-amber-800 border border-amber-300"
                        }`}
                      >
                        {check.score}/{check.maxScore} pts
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      {check.impact}
                    </p>

                    {check.fixAction && (
                      <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-amber-900">
                          Recommended Fix: {check.fixAction}
                        </span>
                        <span className="text-[10px] font-bold text-amber-800 underline">
                          Fix in Dashboard &rarr;
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 text-teal-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                <strong>1-Click Profile Sync:</strong> Sync changes directly from TapGenie to Google Maps instantly.
              </span>
            </div>
            <a
              href="#pricing"
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shrink-0 transition-all text-[11px]"
            >
              Start Free Audit
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

