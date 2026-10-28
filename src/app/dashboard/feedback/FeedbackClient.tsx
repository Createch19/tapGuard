"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  CheckCircle,
  Clock,
  Phone,
  MessageCircle,
  CreditCard,
  Check,
  RotateCcw,
  Search,
  Filter,
  X,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";

interface FeedbackItem {
  id: string;
  rating: number;
  customerName?: string | null;
  phoneNumber?: string | null;
  feedbackText?: string | null;
  isResolved: boolean;
  resolvedAt?: string | null;
  createdAt: string;
  cardLabel?: string | null;
  cardCode: string;
}

interface FeedbackClientProps {
  feedbacks: FeedbackItem[];
}

export default function FeedbackClient({
  feedbacks: initialFeedbacks,
}: FeedbackClientProps) {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(initialFeedbacks);

  // Filters State
  const [statusFilter, setStatusFilter] = useState<"all" | "unresolved" | "resolved">(
    "unresolved"
  );
  const [ratingFilter, setRatingFilter] = useState<"all" | 1 | 2 | 3>("all");
  const [cardFilter, setCardFilter] = useState<string>("all");
  const [hasPhoneOnly, setHasPhoneOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "rating-asc" | "rating-desc">(
    "newest"
  );

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Derived metrics
  const unresolvedCount = feedbacks.filter((f) => !f.isResolved).length;
  const resolvedCount = feedbacks.filter((f) => f.isResolved).length;

  // Extract unique cards for card filter
  const uniqueCards = Array.from(
    new Set(
      feedbacks.map((f) => f.cardLabel?.trim() || `Card ${f.cardCode}`)
    )
  ).filter(Boolean);

  // Check if any non-default filter is active
  const isAnyFilterActive =
    statusFilter !== "unresolved" ||
    ratingFilter !== "all" ||
    cardFilter !== "all" ||
    hasPhoneOnly ||
    searchQuery.trim() !== "" ||
    sortBy !== "newest";

  const handleResetFilters = () => {
    setStatusFilter("all");
    setRatingFilter("all");
    setCardFilter("all");
    setHasPhoneOnly(false);
    setSearchQuery("");
    setSortBy("newest");
  };

  // Filtered & Sorted Feedbacks
  const filteredFeedbacks = feedbacks
    .filter((f) => {
      // 1. Status Filter
      if (statusFilter === "unresolved" && f.isResolved) return false;
      if (statusFilter === "resolved" && !f.isResolved) return false;

      // 2. Rating Filter
      if (ratingFilter !== "all" && f.rating !== ratingFilter) return false;

      // 3. Card Filter
      if (cardFilter !== "all") {
        const cardDisplay = f.cardLabel?.trim() || `Card ${f.cardCode}`;
        if (cardDisplay !== cardFilter) return false;
      }

      // 4. Phone Only
      if (hasPhoneOnly && !f.phoneNumber) return false;

      // 5. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (f.customerName || "").toLowerCase();
        const phone = (f.phoneNumber || "").toLowerCase();
        const text = (f.feedbackText || "").toLowerCase();
        const card = (f.cardLabel || `Card ${f.cardCode}`).toLowerCase();
        if (!name.includes(q) && !phone.includes(q) && !text.includes(q) && !card.includes(q)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "rating-asc") {
        return a.rating - b.rating;
      }
      if (sortBy === "rating-desc") {
        return b.rating - a.rating;
      }
      // default: newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleToggleResolve = async (feedback: FeedbackItem) => {
    setUpdatingId(feedback.id);
    const newStatus = !feedback.isResolved;

    try {
      const res = await fetch(
        `/api/dashboard/feedback/${feedback.id}/resolve`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isResolved: newStatus }),
        }
      );

      if (!res.ok) throw new Error("Failed to update status");

      setFeedbacks((prev) =>
        prev.map((item) =>
          item.id === feedback.id
            ? {
                ...item,
                isResolved: newStatus,
                resolvedAt: newStatus ? new Date().toISOString() : null,
              }
            : item
        )
      );

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("feedback-status-changed"));
      }
      router.refresh();
    } catch {
      alert("Failed to update feedback status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Smart Gate Protection
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Private Customer Feedback
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Low ratings captured privately before reaching Google. Contact customers to make things right.
          </p>
        </div>

        {/* Primary Status Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("unresolved")}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "unresolved"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Needs Attention</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                statusFilter === "unresolved"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {unresolvedCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("resolved")}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "resolved"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Resolved</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                statusFilter === "resolved"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {resolvedCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "all"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>All</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                statusFilter === "all"
                  ? "bg-slate-200 text-slate-800"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {feedbacks.length}
            </span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, phone, comment or card..."
              className="w-full pl-10 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Selectors (Card + Sort) */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Card selector (if more than 1 card exists) */}
            {uniqueCards.length > 1 && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={cardFilter}
                  onChange={(e) => setCardFilter(e.target.value)}
                  className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Touchpoints</option>
                  {uniqueCards.map((card) => (
                    <option key={card} value={card}>
                      {card}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating-asc">Lowest Rating (1★ First)</option>
                <option value="rating-desc">Highest Rating (3★ First)</option>
              </select>
            </div>

            {/* Reset button if filtered */}
            {isAnyFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 font-semibold rounded-xl transition-colors cursor-pointer border border-rose-200"
              >
                <X className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills row: Star Ratings & Contact toggles */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            <span>Filter Rating:</span>
          </span>

          {/* Star Filter Pills */}
          {(["all", 1, 2, 3] as const).map((starVal) => {
            const isSelected = ratingFilter === starVal;
            const label = starVal === "all" ? "All Stars" : `${starVal} ★`;
            return (
              <button
                key={String(starVal)}
                type="button"
                onClick={() => setRatingFilter(starVal)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-teal-600 text-white shadow-2xs font-bold"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {label}
              </button>
            );
          })}

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Phone / WhatsApp Available Toggle */}
          <button
            type="button"
            onClick={() => setHasPhoneOnly(!hasPhoneOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              hasPhoneOnly
                ? "bg-emerald-600 text-white shadow-2xs font-bold"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            <Phone className="w-3 h-3" />
            <span>With Phone / WhatsApp</span>
          </button>

          {/* Results count indicator */}
          <span className="ml-auto text-xs text-slate-400 font-medium">
            Showing <strong className="text-slate-700">{filteredFeedbacks.length}</strong> of{" "}
            {feedbacks.length}
          </span>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {filteredFeedbacks.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-2xs">
            {feedbacks.length === 0 ? (
              <>
                <CheckCircle className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  All Caught Up!
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No private negative feedback recorded yet. Your Smart Gate is actively guarding your online reputation.
                </p>
              </>
            ) : (
              <>
                <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  No Feedback Matches Your Filters
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Try adjusting or clearing your search, star rating, or status filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </button>
              </>
            )}
          </div>
        ) : (
          filteredFeedbacks.map((fb) => (
            <div
              key={fb.id}
              className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all shadow-2xs ${
                fb.isResolved
                  ? "border-slate-200/70 bg-slate-50/40 opacity-80"
                  : "border-amber-200/90 hover:border-amber-300"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                {/* Left: Star rating and Author */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                      fb.rating <= 2
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    <div className="flex items-center gap-0.5">
                      <span>{fb.rating}</span>
                      <Star className="w-3 h-3 fill-current" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {fb.customerName || "Anonymous Customer"}
                      </h3>
                      {fb.isResolved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <Check className="w-3 h-3" />
                          Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Pending Action
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>
                        {new Date(fb.createdAt).toLocaleDateString()} at{" "}
                        {new Date(fb.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-500 font-medium">
                        <CreditCard className="w-3 h-3" />
                        {fb.cardLabel || `Card ${fb.cardCode}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Quick Customer Contact & Resolve Actions */}
                <div className="flex items-center gap-2">
                  {fb.phoneNumber && (
                    <>
                      <a
                        href={`tel:${fb.phoneNumber}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                      >
                        <Phone className="w-3 h-3 text-teal-600" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/${fb.phoneNumber.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold transition-colors border border-emerald-200"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </>
                  )}

                  <button
                    disabled={updatingId === fb.id}
                    onClick={() => handleToggleResolve(fb)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      fb.isResolved
                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        : "bg-teal-600 hover:bg-teal-700 text-white shadow-2xs"
                    }`}
                  >
                    {fb.isResolved ? (
                      <>
                        <RotateCcw className="w-3 h-3" />
                        <span>Reopen</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark as Resolved</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Feedback text quote */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-slate-700 text-xs sm:text-sm leading-relaxed">
                &ldquo;{fb.feedbackText || "No written comment left by customer."}&rdquo;
              </div>

              {fb.phoneNumber && (
                <div className="mt-3 text-[11px] text-slate-400">
                  Customer Contact:{" "}
                  <strong className="text-slate-700 font-mono">
                    {fb.phoneNumber}
                  </strong>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
