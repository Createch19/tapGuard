"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Star,
  CheckCircle2,
  Bot,
  Zap,
  Clock,
  ShieldCheck,
  Check,
} from "lucide-react";

interface SampleReview {
  id: string;
  reviewer: string;
  avatarBg: string;
  rating: number;
  timeAgo: string;
  businessType: string;
  customerReview: string;
  language: string;
  aiTone: string;
  aiReply: string;
}

// Sample illustrative reviews - clearly labeled as mock/demo data
const SAMPLE_REVIEWS: SampleReview[] = [
  {
    id: "cafe-1",
    reviewer: "Customer A",
    avatarBg: "bg-teal-600",
    rating: 5,
    timeAgo: "15 mins ago",
    businessType: "Café & Bakery",
    customerReview:
      "Had their fresh croissant and flat white this morning. The ambience is quiet and comfortable. Looking forward to visiting again with colleagues.",
    language: "English",
    aiTone: "Warm & Friendly",
    aiReply:
      "Thank you for visiting! We're glad you enjoyed the fresh croissant and coffee. Looking forward to welcoming you and your colleagues next time.",
  },
  {
    id: "restaurant-2",
    reviewer: "Customer B",
    avatarBg: "bg-amber-600",
    rating: 5,
    timeAgo: "1 hour ago",
    businessType: "Casual Dining",
    customerReview:
      "Great experience! The ghee roast dosa and filter coffee were very good. Fast service even during peak hours.",
    language: "English / Tamil",
    aiTone: "Welcoming & Courteous",
    aiReply:
      "Thank you for sharing your experience! We're happy to hear you enjoyed the dosa and coffee, and our team appreciated your visit. Hope to see you again soon!",
  },
  {
    id: "clinic-3",
    reviewer: "Customer C",
    avatarBg: "bg-sky-600",
    rating: 4,
    timeAgo: "3 hours ago",
    businessType: "Dental & Wellness",
    customerReview:
      "Professional and gentle checkup. The staff explained the procedure clearly. Clean clinic and minimal waiting time.",
    language: "English",
    aiTone: "Professional & Caring",
    aiReply:
      "Thank you for trusting our clinic with your care! We are committed to making every visit comfortable and informative. Wishing you continued wellness.",
  },
];

export default function AiReplyShowcase() {
  const [selectedReview, setSelectedReview] = useState<SampleReview>(SAMPLE_REVIEWS[0]);

  return (
    <section id="ai-replies" className="px-4 sm:px-8 py-20 max-w-6xl mx-auto w-full">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold mb-3 border border-teal-200">
          <Bot className="w-3.5 h-3.5 text-teal-600" />
          <span>AI Review Reply Assistant</span>
          <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-amber-100 text-amber-800 rounded font-bold uppercase tracking-wider">
            Coming Soon
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Helpful AI Drafts for Timely Customer Responses
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl mx-auto leading-relaxed">
          Responding to customer reviews shows that you care about their experience. TapGenie helps draft personalized, thoughtful replies that you can review, edit, and approve before posting to your Google Business Profile.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Review Selector List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Sample Reviews (Illustrative)
            </span>
            <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded">
              Demo Preview
            </span>
          </div>

          {SAMPLE_REVIEWS.map((rev) => {
            const isSelected = rev.id === selectedReview.id;
            return (
              <button
                key={rev.id}
                type="button"
                onClick={() => setSelectedReview(rev)}
                className={`w-full text-left p-4 rounded-2xl border transition-all text-left flex items-start gap-3.5 cursor-pointer ${
                  isSelected
                    ? "bg-white border-teal-500 shadow-md ring-1 ring-teal-500/20"
                    : "bg-white/70 border-slate-200/80 hover:bg-white hover:border-slate-300"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl ${rev.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}
                >
                  {rev.reviewer.charAt(rev.reviewer.length - 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {rev.reviewer}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {rev.timeAgo}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-1.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 fill-amber-400 text-amber-400"
                      />
                    ))}
                    <span className="text-[10px] text-teal-700 font-semibold ml-1.5 px-1.5 py-0.2 bg-teal-50 rounded">
                      {rev.businessType}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-600 line-clamp-2 leading-relaxed">
                    &ldquo;{rev.customerReview}&rdquo;
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: AI Reply Studio Simulator */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl relative">
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  AI Suggested Reply
                </h3>
                <p className="text-[11px] text-slate-500">
                  Review &bull; Edit &bull; Approve Before Posting
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                <span>Sample Draft</span>
              </span>
            </div>
          </div>

          {/* Original Customer Review Box */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 mb-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  {selectedReview.reviewer}
                </span>
                <span className="text-[10px] text-slate-400">
                  on Google Maps
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                {[...Array(selectedReview.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3 h-3 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed italic">
              &ldquo;{selectedReview.customerReview}&rdquo;
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span>Language: <strong className="text-slate-700">{selectedReview.language}</strong></span>
              <span>Tone Setting: <strong className="text-teal-700">{selectedReview.aiTone}</strong></span>
            </div>
          </div>

          {/* AI Response Output Card */}
          <div className="bg-gradient-to-br from-teal-50/50 via-white to-teal-50/20 rounded-2xl p-5 border border-teal-200/80 shadow-xs relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span className="text-xs font-bold text-teal-950">
                  AI Draft Suggestion (Awaiting Owner Approval)
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                You control what posts
              </span>
            </div>

            <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed font-normal mb-4">
              {selectedReview.aiReply}
            </p>

            <div className="pt-3 border-t border-teal-100/80 flex flex-wrap items-center justify-between gap-3 text-[11px]">
              <div className="flex items-center gap-1.5 text-teal-800 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Editable before publishing</span>
              </div>

              <div className="flex items-center gap-2 text-slate-500 text-[10px]">
                <span>Requires owner sign-off</span>
                <span>&bull;</span>
                <span>Respects your brand tone</span>
              </div>
            </div>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100 text-[11.5px]">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <strong className="block text-slate-900 font-bold mb-0.5">
                ✏️ Full Owner Control
              </strong>
              <p className="text-[10px] text-slate-500">
                Nothing is published to Google without your explicit approval, unless you opt into automation.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <strong className="block text-slate-900 font-bold mb-0.5">
                🎭 Custom Tone
              </strong>
              <p className="text-[10px] text-slate-500">
                Set the response style: Warm, Professional, Casual, or Courteous.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <strong className="block text-slate-900 font-bold mb-0.5">
                🌐 Multi-Language Support
              </strong>
              <p className="text-[10px] text-slate-500">
                Helps draft replies in English, regional languages, or bilingual phrasing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
