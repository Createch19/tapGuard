"use client";

import React, { useState, useEffect } from "react";
import {
  Swords,
  RefreshCw,
  Star,
  MapPin,
  TrendingUp,
  Trophy,
  ExternalLink,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Shield,
  Search,
  Filter,
} from "lucide-react";
import { CompetitorItem, CompetitorRadarResult } from "@/lib/gemini";

interface CompetitorRadarViewProps {
  locationId?: string;
  tenantName: string;
  businessType: string;
}

export default function CompetitorRadarView({
  locationId,
  tenantName,
  businessType,
}: CompetitorRadarViewProps) {
  const initialCategory = tenantName.toLowerCase().includes("sport")
    ? "Sports Goods & Equipment Store"
    : businessType;

  const [categoryInput, setCategoryInput] = useState(initialCategory);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [searchScope, setSearchScope] = useState<"DISTRICT" | "LOCAL">("DISTRICT");
  const [derivedCategories, setDerivedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [radarData, setRadarData] = useState<CompetitorRadarResult | null>(null);
  const [locationInput, setLocationInput] = useState("Chengalpattu District, Tamil Nadu");
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "TOP_RATED" | "NEAREST">("ALL");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchRadar = async (override?: { loc?: string; cat?: string; scope?: "DISTRICT" | "LOCAL" }) => {
    setIsScanning(true);
    setErrorMessage(null);
    try {
      const locToUse = override?.loc !== undefined ? override.loc : locationInput;
      const catToUse = override?.cat !== undefined ? override.cat : categoryInput;
      const scopeToUse = override?.scope !== undefined ? override.scope : searchScope;

      const res = await fetch("/api/dashboard/google/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: locToUse,
          category: catToUse,
          scope: scopeToUse,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRadarData(data);
        if (data.serviceLocation) {
          setLocationInput(data.serviceLocation);
        }
        if (data.category) {
          setCategoryInput(data.category);
        }
        if (data.derivedCategories && Array.isArray(data.derivedCategories)) {
          setDerivedCategories(data.derivedCategories);
        }
      } else {
        setErrorMessage(data.error || "Failed to fetch competitor radar data.");
      }
    } catch (err: any) {
      console.error("Competitor Radar fetch error:", err);
      setErrorMessage("Could not connect to competitor intelligence service.");
    } finally {
      setIsScanning(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRadar();
  }, [locationId]);

  const summary = radarData?.summary;
  const competitors = radarData?.competitors || [];

  const filteredCompetitors = competitors.filter((c) => {
    if (activeFilter === "TOP_RATED") return c.rating >= 4.4;
    if (activeFilter === "NEAREST") {
      const km = parseFloat(c.distance) || 999;
      return km <= 7.0;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-xs shrink-0 mt-0.5">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Competitor Radar & Local Market Benchmark
              </h2>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                Live Google Maps
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare ratings, Google review volume, and local 3-Pack rankings against nearby competing venues.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchRadar({ loc: locationInput, cat: categoryInput, scope: searchScope })}
          disabled={isScanning}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin text-purple-400" : ""}`} />
          <span>{isScanning ? "Scanning District..." : "Scan Competitors"}</span>
        </button>
      </div>

      {/* Target Category & Scope Control Bar */}
      <div className="space-y-2.5 p-4 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/40 border border-purple-200/80 rounded-2xl text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category Input / Display */}
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-purple-600 shrink-0" />
            {!isEditingCategory ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-500 font-medium">Competitor Category:</span>
                <strong className="text-purple-950 font-bold bg-white px-2.5 py-1 rounded-lg border border-purple-200 shadow-2xs">
                  {categoryInput}
                </strong>
                <button
                  type="button"
                  onClick={() => setIsEditingCategory(true)}
                  className="text-purple-700 hover:text-purple-900 font-semibold underline text-[11px] cursor-pointer"
                >
                  Edit Category
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  placeholder="e.g. Sports Goods Shop, Sports Equipment Store..."
                  className="px-3 py-1.5 text-xs bg-white border border-purple-300 rounded-xl flex-1 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingCategory(false);
                    fetchRadar({ cat: categoryInput });
                  }}
                  className="px-3 py-1.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 cursor-pointer text-xs"
                >
                  Apply & Search
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingCategory(false)}
                  className="px-2 py-1 text-slate-500 hover:text-slate-800 cursor-pointer text-xs"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Scope Toggle */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-purple-200 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setSearchScope("DISTRICT");
                fetchRadar({ scope: "DISTRICT" });
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                searchScope === "DISTRICT"
                  ? "bg-purple-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              🌐 Whole District
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchScope("LOCAL");
                fetchRadar({ scope: "LOCAL" });
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                searchScope === "LOCAL"
                  ? "bg-purple-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              📍 Local Town (10 km)
            </button>
          </div>
        </div>

        {/* 1-Click Quick Category Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-purple-100">
          <span className="text-[11px] font-bold text-slate-500">Quick Trade Filters:</span>
          {[
            { label: "🛍️ Sports Goods Store", val: "Sports Goods & Equipment Store" },
            { label: "🏏 Cricket Gear & Bat Store", val: "Cricket Equipment & Sports Store" },
            { label: "🏟️ Sports Complex & Turf Ground", val: "Sports Complex & Turf Ground" },
            { label: "🏸 Badminton & Fitness", val: "Badminton Court & Academy" },
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCategoryInput(preset.val);
                fetchRadar({ cat: preset.val });
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                categoryInput === preset.val
                  ? "bg-purple-100 text-purple-900 border-purple-300 font-bold"
                  : "bg-white text-slate-600 hover:bg-purple-50 border-slate-200"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Multi-Category Google Business Discovery Badges */}
        {derivedCategories.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-purple-100/90">
            <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Multi-Category Scan:</span>
            </span>
            {derivedCategories.map((cat, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCategoryInput(cat);
                  fetchRadar({ cat });
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer border ${
                  categoryInput.toLowerCase() === cat.toLowerCase()
                    ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                    : "bg-white text-purple-950 hover:bg-purple-100/80 border-purple-200"
                }`}
                title={`Filter or search specifically for "${cat}"`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Service Location Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
          {!isEditingLocation ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Radar Focus Area:</span>
              <strong className="text-slate-900 font-bold">
                {locationInput || "Chengalpattu District, Tamil Nadu"}
              </strong>
              <button
                type="button"
                onClick={() => setIsEditingLocation(true)}
                className="text-purple-700 hover:text-purple-900 font-semibold underline text-[11px] ml-1 cursor-pointer"
              >
                Change Area
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Enter district or city (e.g. Chengalpattu District, Chennai, Kanchipuram)..."
                className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl flex-1 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
              />
              <button
                type="button"
                onClick={() => {
                  setIsEditingLocation(false);
                  fetchRadar({ loc: locationInput });
                }}
                className="px-3 py-1.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 cursor-pointer text-xs shadow-2xs"
              >
                Scan Area
              </button>
              <button
                type="button"
                onClick={() => setIsEditingLocation(false)}
                className="px-2 py-1 text-slate-500 hover:text-slate-800 cursor-pointer text-xs"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          Coverage: <span className="font-bold text-slate-800">{searchScope === "DISTRICT" ? "District-wide" : "Local radius"}</span>
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 py-8 text-center">
          <div className="inline-block p-4 bg-purple-50 text-purple-600 rounded-full animate-bounce">
            <Swords className="w-8 h-8" />
          </div>
          <p className="text-sm font-bold text-slate-800">
            Scanning Google Maps for competitors near {locationInput || "your location"}...
          </p>
          <p className="text-xs text-slate-400">
            Gathering live star ratings, Google review counts, and pricing benchmarks.
          </p>
        </div>
      )}

      {/* Radar Main Content */}
      {!loading && summary && (
        <div className="space-y-6 animate-in fade-in">
          {/* KPI Summary Cards Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Your Business */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-200/80 space-y-1.5 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                <span>{tenantName}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                  You
                </span>
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-black text-slate-900">
                  {summary.ourRating.toFixed(1)}★
                </span>
                <div className="flex text-amber-400 text-xs">
                  {"★".repeat(Math.round(summary.ourRating))}
                </div>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {summary.ourReviewCount} Google Reviews
              </p>
              <div className="text-[11px] text-emerald-700 font-bold pt-1 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                <span>Highest Rating in Area</span>
              </div>
            </div>

            {/* Card 2: Local Average */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Competitor Average
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-black text-slate-900">
                  {summary.averageCompetitorRating.toFixed(1)}★
                </span>
                <span className="text-xs text-slate-400 font-semibold">Area avg</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                ~{summary.averageCompetitorReviews} Reviews average
              </p>
              <div className="text-[11px] text-slate-500 pt-1">
                Based on {competitors.length} tracked venues
              </div>
            </div>

            {/* Card 3: Review Gap */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-200/80 space-y-1.5">
              <div className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Top Rival Volume
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-black text-slate-900">
                  {summary.topCompetitorReviews}
                </span>
                <span className="text-xs text-amber-700 font-semibold truncate max-w-[120px]">
                  {summary.topCompetitorName}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {summary.reviewCountGap > 0
                  ? `+${summary.reviewCountGap} reviews to take #1 volume`
                  : "You lead in total review volume!"}
              </p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(10, Math.round((summary.ourReviewCount / summary.topCompetitorReviews) * 100))
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Card 4: Market Standing */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border border-purple-200/80 space-y-1.5">
              <div className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                Market Status
              </div>
              <div className="text-sm font-black text-slate-900 pt-1 line-clamp-2">
                {summary.marketStanding}
              </div>
              <p className="text-[11px] text-slate-500 leading-snug pt-0.5">
                Superior quality advantage over surrounding area.
              </p>
            </div>
          </div>

          {/* AI Strategy Playbook Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200/80 flex items-start gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0 mt-0.5 shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-0.5">
                AI Strategic Growth Takeaway
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                {summary.aiRecommendation}
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5">
              {[
                { id: "ALL", label: `All Competitors (${competitors.length})` },
                {
                  id: "TOP_RATED",
                  label: `⭐ Top Rated (${competitors.filter((c) => c.rating >= 4.4).length})`,
                },
                {
                  id: "NEAREST",
                  label: `📍 Closest (${
                    competitors.filter((c) => (parseFloat(c.distance) || 99) <= 7.0).length
                  })`,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    activeFilter === tab.id
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400 font-medium">
              Showing {filteredCompetitors.length} venues in radar range
            </span>
          </div>

          {/* Competitor Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCompetitors.map((comp, idx) => (
              <div
                key={comp.id || idx}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-purple-300 p-5 shadow-2xs hover:shadow-xs transition-all space-y-3.5 relative group"
              >
                {/* Header: Name, Distance & Rank */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-extrabold rounded-md uppercase">
                        #{idx + 1} Rival
                      </span>
                      <span className="text-[11px] text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        {comp.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 tracking-tight group-hover:text-purple-700 transition-colors">
                      {comp.name}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{comp.locality}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">{comp.distance} away</span>
                    </div>
                  </div>

                  {/* Rating Badge */}
                  <div className="text-right shrink-0">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-xl">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-black text-slate-900 text-xs">{comp.rating.toFixed(1)}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium mt-1">
                      {comp.reviewsCount} reviews
                    </div>
                  </div>
                </div>

                {/* Rating & Volume Benchmark Bar */}
                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>Review Volume: {comp.reviewsCount}</span>
                    <span>
                      {comp.reviewsCount > summary.ourReviewCount
                        ? `${comp.reviewsCount - summary.ourReviewCount} ahead`
                        : "You lead"}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        comp.reviewsCount > summary.ourReviewCount ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(15, Math.round((comp.reviewsCount / (summary.topCompetitorReviews || 1)) * 100))
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Pricing (if present) */}
                {comp.pricing && (
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-500">Estimated Rate: </span>
                    <span className="font-bold text-slate-800">{comp.pricing}</span>
                  </div>
                )}

                {/* Strengths & Weaknesses Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  {/* Strengths */}
                  <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 space-y-1">
                    <span className="font-bold text-emerald-950 flex items-center gap-1 text-[10px] uppercase">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Strengths
                    </span>
                    <ul className="space-y-0.5 text-emerald-900">
                      {comp.strengths.slice(0, 2).map((s, i) => (
                        <li key={i} className="truncate">• {s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-rose-50/50 p-2.5 rounded-xl border border-rose-100 space-y-1">
                    <span className="font-bold text-rose-950 flex items-center gap-1 text-[10px] uppercase">
                      <XCircle className="w-3 h-3 text-rose-600" /> Weaknesses
                    </span>
                    <ul className="space-y-0.5 text-rose-900">
                      {comp.weaknesses.slice(0, 2).map((w, i) => (
                        <li key={i} className="truncate">• {w}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* How You Stand Out / Advantage */}
                <div className="p-3 bg-teal-50/60 border border-teal-200/70 rounded-xl space-y-1">
                  <span className="text-[10px] font-black text-teal-900 uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-3 h-3 text-teal-600" /> How {tenantName} Wins
                  </span>
                  <p className="text-xs text-teal-950 leading-relaxed font-normal">
                    {comp.differenceFromUs}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    Google Maps Business Profile
                  </span>
                  <a
                    href={comp.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${comp.name} ${comp.locality}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-purple-700 hover:text-purple-900 font-bold hover:underline"
                  >
                    <span>View on Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

