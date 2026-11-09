"use client";

import React, { useState } from "react";
import {
  Swords,
  Star,
  TrendingUp,
  MapPin,
  Trophy,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Flame,
  BarChart2,
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

const SAMPLE_COMPETITORS: Competitor[] = [
  {
    rank: 1,
    name: "Your Storefront (TapGenie)",
    isCurrentStore: true,
    rating: 4.9,
    reviewCount: 486,
    monthlyVelocity: "+42 reviews/mo",
    sentiment: "97% Positive",
    status: "LEADER",
    keyStrength: "Rapid NFC tap collection + 100% reply rate",
  },
  {
    rank: 2,
    name: "Grand Bay Bistro & Café",
    rating: 4.5,
    reviewCount: 390,
    monthlyVelocity: "+11 reviews/mo",
    sentiment: "84% Positive",
    status: "STRONG",
    keyWeakness: "35% of reviews left unanswered; slow weekend service",
    keyStrength: "Prime central location",
  },
  {
    rank: 3,
    name: "Aroma Coffee Roasters",
    rating: 4.3,
    reviewCount: 310,
    monthlyVelocity: "+8 reviews/mo",
    sentiment: "78% Positive",
    status: "TRAILED",
    keyWeakness: "No NFC touchpoints; outdated Google Maps menu",
    keyStrength: "Loyal morning commuter base",
  },
  {
    rank: 4,
    name: "The Urban Oven",
    rating: 4.1,
    reviewCount: 245,
    monthlyVelocity: "+5 reviews/mo",
    sentiment: "72% Positive",
    status: "TRAILED",
    keyWeakness: "Frequent customer complaints about parking & billing",
    keyStrength: "Spacious seating",
  },
];

export default function CompetitorRadarShowcase() {
  const [selectedLocality, setSelectedLocality] = useState<string>("Chengalpattu District, Tamil Nadu");
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
            <span>Market Intelligence</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Spy on Nearby Competitors &amp; Claim the #1 Spot
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl mx-auto leading-relaxed">
            Know exactly how you rank against rivals in your local area. Track competitor review velocity, uncover their operational weaknesses, and attract more walk-ins.
          </p>
        </div>

        {/* Radar Console Card */}
        <div className="bg-slate-950/80 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Top Bar: Search / Locality Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Live Radar Perimeter
                </span>
                <span className="text-sm font-bold text-white">
                  {selectedLocality}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-slate-400">Category:</span>
              <span className="text-xs font-bold text-teal-300 px-3 py-1 rounded-full bg-teal-950 border border-teal-800/60">
                {activeCategory}
              </span>
            </div>
          </div>

          {/* Competitor Ranking Leaderboard */}
          <div className="space-y-3.5 mb-8">
            {SAMPLE_COMPETITORS.map((comp) => {
              return (
                <div
                  key={comp.rank}
                  className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                    comp.isCurrentStore
                      ? "bg-gradient-to-r from-teal-950/60 via-slate-900 to-teal-950/40 border-teal-500/50 shadow-lg ring-1 ring-teal-500/30"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Store Title & Rank */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          comp.rank === 1
                            ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {comp.rank === 1 ? <Trophy className="w-4 h-4" /> : `#${comp.rank}`}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">
                            {comp.name}
                          </h4>
                          {comp.isCurrentStore && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                              Your Venue
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {comp.isCurrentStore ? (
                            <span className="text-teal-400 font-semibold">{comp.keyStrength}</span>
                          ) : (
                            <span>Weakness: <strong className="text-rose-400 font-normal">{comp.keyWeakness}</strong></span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Stats Pill Columns */}
                    <div className="flex items-center gap-4 sm:gap-6 text-xs shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">Rating</span>
                        <div className="flex items-center gap-1 font-bold text-white">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{comp.rating}</span>
                          <span className="text-slate-500 text-[11px]">({comp.reviewCount})</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">Review Velocity</span>
                        <span className={`font-bold flex items-center gap-1 ${
                          comp.isCurrentStore ? "text-emerald-400" : "text-slate-300"
                        }`}>
                          <TrendingUp className="w-3 h-3" />
                          {comp.monthlyVelocity}
                        </span>
                      </div>

                      <div className="hidden md:block">
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">Sentiment</span>
                        <span className="font-bold text-teal-300">
                          {comp.sentiment}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Competitive Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
              <div className="flex items-center gap-2 text-teal-400 font-bold mb-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>3.8x Faster Growth</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Venues using TapGenie NFC touchpoints generate an average of 42 fresh reviews per month compared to 11 for traditional competitors.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
              <div className="flex items-center gap-2 text-amber-400 font-bold mb-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Competitor Gap Alerts</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Discover what rival customers dislike (e.g. slow service or high prices) so you can market your venue&apos;s strengths effectively.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1.5">
                <Trophy className="w-4 h-4" />
                <span>Google 3-Pack Supremacy</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Higher review volume and active responses propel your profile into Google Maps&apos; top 3 local pack results for high-intent searches.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

