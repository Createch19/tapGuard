"use client";

import React, { useState } from "react";
import {
  Swords,
  Star,
  MapPin,
  TrendingUp,
  BarChart2,
  CheckCircle2,
} from "lucide-react";

interface Competitor {
  rank: number;
  name: string;
  isCurrentStore?: boolean;
  rating: number;
  reviewCount: number;
  monthlyVelocity: string;
  sentiment: string;
  status: "LEADER" | "STRONG" | "TRAILED";
  keyWeakness?: string;
  keyStrength: string;
}

// Sample illustrative data - generic labels, no real business names
const SAMPLE_COMPETITORS: Competitor[] = [
  {
    rank: 1,
    name: "Your Storefront",
    isCurrentStore: true,
    rating: 4.8,
    reviewCount: 220,
    monthlyVelocity: "Active collection",
    sentiment: "High satisfaction",
    status: "LEADER",
    keyStrength: "Prompt review responses and clear location details",
  },
  {
    rank: 2,
    name: "Local Business Alpha",
    rating: 4.5,
    reviewCount: 195,
    monthlyVelocity: "Moderate",
    sentiment: "Good satisfaction",
    status: "STRONG",
    keyWeakness: "Unanswered reviews from recent weeks",
    keyStrength: "Longstanding local presence",
  },
  {
    rank: 3,
    name: "Local Business Beta",
    rating: 4.2,
    reviewCount: 140,
    monthlyVelocity: "Low",
    sentiment: "Average",
    status: "TRAILED",
    keyWeakness: "Incomplete opening hours during festivals",
    keyStrength: "Central high-street location",
  },
];

export default function CompetitorRadarShowcase() {
  const [selectedLocality, setSelectedLocality] = useState<string>("Sample District (Illustrative)");
  const [activeCategory, setActiveCategory] = useState<string>("Café & Casual Dining");

  return (
    <section id="competitor-radar" className="px-4 sm:px-8 py-20 bg-slate-900 text-white w-full overflow-hidden relative">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold mb-3 border border-teal-500/30">
            <Swords className="w-3.5 h-3.5 text-teal-400" />
            <span>Local Market Benchmarks</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-amber-400/20 text-amber-300 rounded font-bold uppercase tracking-wider">
              Coming Soon
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Understand Your Local Category Landscape
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl mx-auto leading-relaxed">
            Gain transparent visibility into how other businesses in your area manage their Google presence. Benchmark response habits, track review momentum, and identify areas to improve your customer experience.
          </p>
        </div>

        {/* Top Control Bar */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-4 h-4 text-teal-400" />
            <span className="text-slate-400">Sample Area:</span>
            <span className="font-bold text-white">{selectedLocality}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Category:
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-700 text-teal-300 border border-slate-600">
              {activeCategory}
            </span>
            <span className="text-[10px] font-medium text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              Sample Data
            </span>
          </div>
        </div>

        {/* Competitor Table / Grid */}
        <div className="space-y-3">
          {SAMPLE_COMPETITORS.map((c) => (
            <div
              key={c.rank}
              className={`rounded-2xl p-5 border transition-all ${
                c.isCurrentStore
                  ? "bg-slate-800/95 border-teal-500 shadow-lg ring-1 ring-teal-500/30"
                  : "bg-slate-800/50 border-slate-700/60 hover:bg-slate-800/70"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Rank & Name */}
                <div className="md:col-span-4 flex items-center gap-3.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      c.isCurrentStore
                        ? "bg-teal-500 text-slate-950 font-black"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    #{c.rank}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{c.name}</span>
                      {c.isCurrentStore && (
                        <span className="text-[10px] font-bold bg-teal-500/20 text-teal-300 px-2 py-0.2 rounded-full border border-teal-500/30">
                          Your Listing
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex items-center text-amber-400 text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                        <span className="font-bold text-white">{c.rating}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        ({c.reviewCount} public reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Signals */}
                <div className="md:col-span-4 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center justify-between sm:justify-start gap-4">
                    <span className="text-slate-400 text-[11px]">Review Activity:</span>
                    <span className="font-semibold text-teal-300">{c.monthlyVelocity}</span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-start gap-4">
                    <span className="text-slate-400 text-[11px]">Customer Sentiment:</span>
                    <span className="font-semibold text-slate-200">{c.sentiment}</span>
                  </div>
                </div>

                {/* Key Insight */}
                <div className="md:col-span-4 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Key Observation
                  </span>
                  <p className="text-slate-300 text-[11.5px] leading-relaxed">
                    {c.keyStrength}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-slate-500 mt-6">
          * Note: All data shown above is sample mockup data for illustration purposes. TapGenie provides ethical, publicly available category benchmarks to help store owners learn and improve.
        </p>
      </div>
    </section>
  );
}
