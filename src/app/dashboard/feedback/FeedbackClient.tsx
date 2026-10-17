"use client";

import React, { useState } from "react";
import {
  Star,
  CheckCircle,
  Clock,
  Phone,
  MessageCircle,
  CreditCard,
  Check,
  RotateCcw,
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
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(initialFeedbacks);
  const [filter, setFilter] = useState<"all" | "unresolved" | "resolved">(
    "unresolved"
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const unresolvedCount = feedbacks.filter((f) => !f.isResolved).length;

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (filter === "unresolved") return !f.isResolved;
    if (filter === "resolved") return f.isResolved;
    return true;
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
    } catch {
      alert("Failed to update feedback status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

        {/* Filter Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setFilter("unresolved")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === "unresolved"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Needs Attention ({unresolvedCount})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === "all"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            All ({feedbacks.length})
          </button>
          <button
            onClick={() => setFilter("resolved")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === "resolved"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Resolved ({feedbacks.length - unresolvedCount})
          </button>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {filteredFeedbacks.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-2xs">
            <CheckCircle className="w-12 h-12 text-teal-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">
              All Caught Up!
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No private negative feedback pending resolution. Your Smart Gate is actively guarding your online reputation.
            </p>
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
                      <span>{new Date(fb.createdAt).toLocaleDateString()} at {new Date(fb.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
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
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
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
