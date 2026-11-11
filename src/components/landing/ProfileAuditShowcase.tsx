"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Camera,
  Layers,
  MapPin,
  Utensils,
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
    title: "Complete Core Profile & Accurate Physical Address",
    category: "PROFILE",
    status: "PASS",
    score: 25,
    maxScore: 25,
    impact: "Ensures customers find correct driving directions and store contact info",
  },
  {
    title: "Review Reply Coverage",
    category: "ENGAGEMENT",
    status: "PASS",
    score: 25,
    maxScore: 25,
    impact: "Shows customers and visitors that your team values their direct feedback",
  },
  {
    title: "Upcoming Holiday & Special Hours Configured",
    category: "ENGAGEMENT",
    status: "PASS",
    score: 20,
    maxScore: 20,
    impact: "Prevents customer disappointment by showing accurate holiday opening times",
  },
  {
    title: "Structured Digital Menu or Service Catalog Details",
    category: "CONTENT",
    status: "PASS",
    score: 15,
    maxScore: 15,
    impact: "Helps prospective customers understand your offerings before visiting",
  },
  {
    title: "Recent Storefront & Product Photos Uploaded",
    category: "CONTENT",
    status: "WARN",
    score: 8,
    maxScore: 15,
    impact: "Clear, up-to-date photos help walk-in customers recognize your storefront",
    fixAction: "Add 2-3 recent photos of your storefront or popular offerings",
  },
];

export default function ProfileAuditShowcase() {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const filteredChecks =
    activeFilter === "ALL"
      ? AUDIT_CHECKS
      : AUDIT_CHECKS.filter((c) => c.category === activeFilter);

  return (
    <section id="profile-audit" className="px-4 sm:px-8 py-20 max-w-6xl mx-auto w-full">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold mb-3 border border-teal-200">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Profile Health Checklist</span>
          <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-amber-100 text-amber-800 rounded font-bold uppercase tracking-wider">
            Coming Soon
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Keep Your Google Business Profile Accurate &amp; Up to Date
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl mx-auto leading-relaxed">
          Incomplete hours or missing photos can turn away potential walk-ins. TapGenie runs a profile checklist across your listing details and provides clear, actionable recommendations to keep your public presence accurate.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Illustrative Checklist Score Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-white to-teal-50/30 rounded-3xl p-7 border border-slate-200/90 shadow-xl text-center relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Listing Completeness
            </span>
            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Sample Checklist
            </span>
          </div>

          <div className="relative w-40 h-40 mx-auto my-4 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                className="text-slate-100"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                className="text-teal-600"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 50}
                strokeDashoffset={2 * Math.PI * 50 * (1 - 0.93)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900">93%</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Profile Health
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-left">
            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">Verified Items</span>
              <span className="text-sm font-bold text-slate-900">4 / 5 Passed</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">Suggested Action</span>
              <span className="text-sm font-bold text-amber-600">1 Photo Update</span>
            </div>
          </div>
        </div>

        {/* Right: Detailed Checklist Items */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Health Checks (Sample Preview)
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  activeFilter === "ALL"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("PROFILE")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  activeFilter === "PROFILE"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Core Info
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("ENGAGEMENT")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  activeFilter === "ENGAGEMENT"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Hours &amp; Activity
              </button>
            </div>
          </div>

          {filteredChecks.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {item.status === "PASS" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {item.title}
                  </h4>
                  <p className="text-[11.5px] text-slate-500 mt-0.5 leading-relaxed">
                    {item.impact}
                  </p>
                  {item.fixAction && (
                    <span className="inline-block mt-2 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Recommendation: {item.fixAction}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          <p className="text-[11px] text-slate-400 pt-2 text-right">
            * Sample checklist shown for illustration. Real scores reflect your connected profile details.
          </p>
        </div>
      </div>
    </section>
  );
}
