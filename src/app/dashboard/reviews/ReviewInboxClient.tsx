"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Star,
  Search,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  MessageSquare,
  Filter,
  Calendar,
  X,
} from "lucide-react";

export interface ReviewItem {
  id: string;
  googleReviewId: string;
  reviewerName: string;
  reviewerPhotoUrl: string | null;
  isAnonymous: boolean;
  rating: number;
  comment: string | null;
  replyComment: string | null;
  replyUpdatedAt: string | null;
  geminiDraftReply: string | null;
  reviewCreatedAt: string;
  locationTitle: string;
}

interface ReviewInboxClientProps {
  tenant: {
    id: string;
    name: string;
    googleReviewUrl: string | null;
    isConnected: boolean;
    brandTone: string;
    replyLength: string;
  };
  initialReviews: ReviewItem[];
}

type ReplyFilter = "all" | "unreplied" | "replied";
type RatingFilter = "all" | 5 | 4 | 3 | 2 | 1;
type DateFilter = "all" | "7d" | "30d" | "90d";

export default function ReviewInboxClient({
  tenant,
  initialReviews,
}: ReviewInboxClientProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyFilter, setReplyFilter] = useState<ReplyFilter>("all");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  // AI Tone & Length for this session
  const [replyTone, setReplyTone] = useState(tenant.brandTone || "SOFT");
  const [replyLength, setReplyLength] = useState(tenant.replyLength || "2_SENTENCES");

  // Per-review state
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Syncing state
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // KPI Calculations
  const totalCount = reviews.length;
  const unrepliedCount = reviews.filter((r) => !r.replyComment).length;
  const avgRating =
    totalCount > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1)
      : "5.0";
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;

  // Filter & Search Logic
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = rev.reviewerName.toLowerCase().includes(query);
        const commentMatch = (rev.comment || "").toLowerCase().includes(query);
        if (!nameMatch && !commentMatch) return false;
      }

      // 2. Reply Status Filter
      if (replyFilter === "unreplied" && rev.replyComment) return false;
      if (replyFilter === "replied" && !rev.replyComment) return false;

      // 3. Rating Filter
      if (ratingFilter !== "all" && rev.rating !== ratingFilter) return false;

      // 4. Date Range Filter
      if (dateFilter !== "all") {
        const reviewDate = new Date(rev.reviewCreatedAt).getTime();
        const now = Date.now();
        const daysAgo = (now - reviewDate) / (1000 * 60 * 60 * 24);

        if (dateFilter === "7d" && daysAgo > 7) return false;
        if (dateFilter === "30d" && daysAgo > 30) return false;
        if (dateFilter === "90d" && daysAgo > 90) return false;
      }

      return true;
    });
  }, [reviews, searchQuery, replyFilter, ratingFilter, dateFilter]);

  // Sync with Google API
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/dashboard/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resync" }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setReviews(json.data.reviews || []);
        showToast("Reviews synchronized live from Google Maps!");
      } else {
        showToast(json.error || "Sync completed.");
      }
    } catch {
      showToast("Failed to sync reviews with Google.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Generate Reply with Gemini
  const handleGenerateReply = async (reviewId: string) => {
    setGeneratingId(reviewId);
    try {
      const res = await fetch("/api/dashboard/google/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_reply",
          reviewId,
          customTone: replyTone,
          customLength: replyLength,
        }),
      });
      const json = await res.json();
      if (json.success && json.draft) {
        setDrafts((prev) => ({ ...prev, [reviewId]: json.draft }));
        showToast("Gemini AI analyzed the review and crafted a reply!");
      } else {
        showToast(json.error || "Failed to generate reply.");
      }
    } catch {
      showToast("Error generating reply.");
    } finally {
      setGeneratingId(null);
    }
  };

  // Publish Reply to Google Maps
  const handlePublishReply = async (reviewId: string) => {
    const text = drafts[reviewId];
    if (!text || !text.trim()) return;

    setPublishingId(reviewId);
    try {
      const res = await fetch("/api/dashboard/google/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish_reply",
          reviewId,
          replyText: text.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  replyComment: text.trim(),
                  replyUpdatedAt: new Date().toISOString(),
                }
              : r
          )
        );
        showToast("Official reply published live to Google Maps!");
      } else {
        showToast(json.error || "Failed to publish reply.");
      }
    } catch {
      showToast("Error publishing reply to Google.");
    } finally {
      setPublishingId(null);
    }
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    replyFilter !== "all" ||
    ratingFilter !== "all" ||
    dateFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setReplyFilter("all");
    setRatingFilter("all");
    setDateFilter("all");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Google Maps
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">
              {tenant.name}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Review Inbox
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View real customer reviews, filter unreplied feedback, and publish AI-grounded replies directly to Google Maps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync Reviews"}</span>
          </button>

          {tenant.googleReviewUrl && (
            <a
              href={tenant.googleReviewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors"
            >
              <span>View on Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Reviews
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-0.5">
            {totalCount}
          </div>
          <div className="text-[11px] text-slate-500">Public Google reviews</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Average Rating
            </span>
            <div className="flex text-amber-400 text-sm">
              {"★".repeat(Math.round(Number(avgRating)))}
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-0.5">
            {avgRating} <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            {fiveStarCount} five-star ratings
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Replies
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${unrepliedCount > 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-50 text-emerald-600"}`}>
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black mb-0.5 ${unrepliedCount > 0 ? "text-amber-600" : "text-emerald-600"}`}>
            {unrepliedCount}
          </div>
          <div className="text-[11px] text-slate-500">
            {unrepliedCount === 0 ? "All caught up! 🎉" : "Requires owner response"}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Response Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">
              %
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-0.5">
            {totalCount > 0 ? Math.round(((totalCount - unrepliedCount) / totalCount) * 100) : 100}%
          </div>
          <div className="text-[11px] text-slate-500">
            {totalCount - unrepliedCount} replied of {totalCount}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Text Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by reviewer name or comment keywords..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* AI Reply Settings Controls */}
          <div className="flex items-center gap-2">
            <select
              value={replyTone}
              onChange={(e) => setReplyTone(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="SOFT">🌸 Tone: Soft & Humble</option>
              <option value="WARM">☀️ Tone: Warm & Hospitable</option>
              <option value="PROFESSIONAL">💼 Tone: Professional & Polite</option>
              <option value="ENTHUSIASTIC">⚡ Tone: Enthusiastic & Energetic</option>
              <option value="CASUAL">☕ Tone: Friendly & Casual</option>
            </select>

            <select
              value={replyLength}
              onChange={(e) => setReplyLength(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="1_SENTENCE">Length: 1 Sentence</option>
              <option value="2_SENTENCES">Length: 2 Sentences</option>
              <option value="3_4_SENTENCES">Length: 3 to 4 Sentences</option>
            </select>
          </div>
        </div>

        {/* Filters Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {/* Reply Status Buttons */}
            <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setReplyFilter("all")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  replyFilter === "all"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                All ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setReplyFilter("unreplied")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  replyFilter === "unreplied"
                    ? "bg-white text-amber-800 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <span>Unreplied</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                  {unrepliedCount}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setReplyFilter("replied")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  replyFilter === "replied"
                    ? "bg-white text-emerald-800 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Replied ({totalCount - unrepliedCount})
              </button>
            </div>

            {/* Star Rating Select */}
            <select
              value={ratingFilter}
              onChange={(e) =>
                setRatingFilter(
                  e.target.value === "all" ? "all" : (Number(e.target.value) as any)
                )
              }
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Rating: All Stars</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
              <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
              <option value="3">⭐⭐⭐ (3 Stars)</option>
              <option value="2">⭐⭐ (2 Stars)</option>
              <option value="1">⭐ (1 Star)</option>
            </select>

            {/* Date Range Select */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Date: All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No reviews found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {hasActiveFilters
                ? "No reviews match your current filters. Try resetting the search or filter options above."
                : "No customer reviews synced from Google yet. Click 'Sync Reviews' above to pull your live reviews."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const isGenerating = generatingId === rev.id;
            const isPublishing = publishingId === rev.id;
            const draftText = drafts[rev.id] ?? rev.geminiDraftReply ?? "";

            return (
              <div
                key={rev.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 hover:border-slate-300 transition-colors"
              >
                {/* Header: Reviewer Info + Rating + Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {rev.reviewerPhotoUrl ? (
                      <img
                        src={rev.reviewerPhotoUrl}
                        alt={rev.reviewerName}
                        className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-200">
                        {rev.reviewerName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {rev.reviewerName}
                        </h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {rev.locationTitle}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {new Date(rev.reviewCreatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <div className="flex text-amber-400 text-sm">
                      {"★".repeat(rev.rating)}
                      <span className="text-slate-200">
                        {"★".repeat(5 - rev.rating)}
                      </span>
                    </div>

                    {rev.replyComment ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Replied</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pending Reply</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Comment Text */}
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                  {rev.comment ? (
                    <p className="whitespace-pre-line">{rev.comment}</p>
                  ) : (
                    <span className="italic text-slate-400">
                      Customer left a {rev.rating}-star rating without written comments.
                    </span>
                  )}
                </div>

                {/* Published Reply (if already replied) */}
                {rev.replyComment && (
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 ml-0 sm:ml-4">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Official Owner Response on Google Maps
                      </span>
                      {rev.replyUpdatedAt && (
                        <span className="text-emerald-700/80">
                          {new Date(rev.replyUpdatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed whitespace-pre-line">
                      {rev.replyComment}
                    </p>
                  </div>
                )}

                {/* Unreplied Actions & Gemini Draft Box */}
                {!rev.replyComment && (
                  <div className="space-y-3 pt-2">
                    {/* Draft Box if available */}
                    {draftText ? (
                      <div className="space-y-2 p-4 rounded-2xl bg-teal-50/50 border border-teal-200 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                            Gemini AI Drafted Reply ({replyTone})
                          </span>

                          <button
                            type="button"
                            onClick={() => handleGenerateReply(rev.id)}
                            disabled={isGenerating}
                            className="text-xs text-teal-700 hover:text-teal-900 font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 ${isGenerating ? "animate-spin" : ""}`} />
                            <span>Regenerate</span>
                          </button>
                        </div>

                        <textarea
                          rows={3}
                          value={draftText}
                          onChange={(e) =>
                            setDrafts((prev) => ({ ...prev, [rev.id]: e.target.value }))
                          }
                          className="w-full text-xs sm:text-sm text-slate-800 p-3 bg-white rounded-xl border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed font-normal"
                        />

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(draftText);
                              setCopiedId(rev.id);
                              setTimeout(() => setCopiedId(null), 2500);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-slate-600 hover:text-slate-900 rounded-lg text-xs font-semibold border border-slate-200 cursor-pointer"
                          >
                            {copiedId === rev.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedId === rev.id ? "Copied" : "Copy"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePublishReply(rev.id)}
                            disabled={isPublishing || !draftText.trim()}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isPublishing ? "Publishing to Google..." : "Publish to Google Maps"}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleGenerateReply(rev.id)}
                          disabled={isGenerating}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
                        >
                          <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isGenerating ? "animate-spin" : ""}`} />
                          <span>{isGenerating ? "Gemini is analyzing..." : "Draft Reply with Gemini AI"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

