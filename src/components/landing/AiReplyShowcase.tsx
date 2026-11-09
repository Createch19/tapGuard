"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Star,
  CheckCircle2,
  Bot,
  Zap,
  Clock,
  Globe2,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  Sliders,
  ChevronRight,
  ArrowRight,
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
  confidence: number;
}

const SAMPLE_REVIEWS: SampleReview[] = [
  {
    id: "cafe-1",
    reviewer: "Priya Sundaram",
    avatarBg: "bg-teal-600",
    rating: 5,
    timeAgo: "12 mins ago",
    businessType: "Café & Bakery",
    customerReview:
      "Had their artisanal almond croissant and double shot flat white this morning. The ambience is soothing and the baristas are super knowledgeable! Will definitely be bringing my team here next week.",
    language: "English",
    aiTone: "Warm & Welcoming",
    aiReply:
      "Thank you so much, Priya! We're thrilled you loved the almond croissant and flat white. Our pastry team bakes them fresh at 6 AM every morning! Looking forward to welcoming you and your team next week.",
    confidence: 98,
  },
  {
    id: "restaurant-2",
    reviewer: "Karthik Raja",
    avatarBg: "bg-amber-600",
    rating: 5,
    timeAgo: "45 mins ago",
    businessType: "South Indian Dining",
    customerReview:
      "Vera level taste! Ghee podi idli and filter coffee were top notch. Service was super fast even during Sunday morning rush. Romba nalla experience!",
    language: "Tanglish (Tamil)",
    aiTone: "Enthusiastic Local",
    aiReply:
      "Nandri Priya friend Karthik! Ungalukku namma Ghee Podi Idli & Filter Kaapi pidichathula romba sandhosham. Next time try our crispy Rava Dosa too. See you soon!",
    confidence: 96,
  },
  {
    id: "clinic-3",
    reviewer: "Dr. Arvind Mehta",
    avatarBg: "bg-sky-600",
    rating: 5,
    timeAgo: "2 hours ago",
    businessType: "Dental & Wellness",
    customerReview:
      "Very gentle and professional tooth cleaning session with Dr. Ananya. The digital scanning technology explained everything clearly. Zero pain and minimal waiting time.",
    language: "English",
    aiTone: "Professional & Caring",
    aiReply:
      "Thank you Dr. Mehta for trusting our dental team with your smile! We strive to make every visit relaxed and transparent with our digital scan walkthroughs. Wishing you wonderful oral health!",
    confidence: 99,
  },
  {
    id: "salon-4",
    reviewer: "Sneha Kapoor",
    avatarBg: "bg-pink-600",
    rating: 5,
    timeAgo: "3 hours ago",
    businessType: "Luxury Salon & Spa",
    customerReview:
      "Best hair spa and blowout in the neighborhood. Staff was attentive, offered green tea, and the scalp massage was heavenly. 10/10 service!",
    language: "English",
    aiTone: "Boutique Elegance",
    aiReply:
      "Thank you dear Sneha! So delighted you enjoyed our signature hair spa and scalp massage. Our stylists love pampering our guests. Can't wait to see you on your next self-care day!",
    confidence: 97,
  },
];

export default function AiReplyShowcase() {
  const [selectedReview, setSelectedReview] = useState<SampleReview>(SAMPLE_REVIEWS[0]);
  const [isAutoPilotOn, setIsAutoPilotOn] = useState<boolean>(true);

  return (
    <section id="ai-replies" className="px-4 sm:px-8 py-20 max-w-6xl mx-auto w-full">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold mb-3 border border-teal-200">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Gemini AI Reputation Engine</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Never Leave a Google Review Unanswered Again
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl mx-auto leading-relaxed">
          Google algorithms reward businesses that respond quickly to reviews. TapGenie automatically crafts hyper-personalized, empathetic responses trained on your menu, services, and brand tone.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Review Selector List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Review Feed
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-600">
                5-Star Auto-Pilot:
              </span>
              <button
                type="button"
                onClick={() => setIsAutoPilotOn(!isAutoPilotOn)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isAutoPilotOn ? "bg-teal-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isAutoPilotOn ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
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
                  {rev.reviewer.charAt(0)}
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
                  Gemini Flash AI Responder
                </h3>
                <p className="text-[11px] text-slate-500">
                  Contextual • SEO-Optimized • Multi-Language
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Zap className="w-3 h-3" />
                <span>Auto-Replied in 1.4s</span>
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
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-teal-950">
                  Official Store Reply (Published to Google)
                </span>
              </div>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-full">
                {selectedReview.confidence}% AI Confidence
              </span>
            </div>

            <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed font-normal mb-4">
              {selectedReview.aiReply}
            </p>

            <div className="pt-3 border-t border-teal-100/80 flex flex-wrap items-center justify-between gap-3 text-[11px]">
              <div className="flex items-center gap-1.5 text-teal-800 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Zero manual typing needed</span>
              </div>

              <div className="flex items-center gap-2 text-slate-500 text-[10px]">
                <span>Trained on store knowledge base</span>
                <span>•</span>
                <span>Includes local keywords</span>
              </div>
            </div>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100 text-[11.5px]">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <strong className="block text-slate-900 font-bold mb-0.5">
                ⚡ 24/7 Auto-Pilot
              </strong>
              <p className="text-[10px] text-slate-500">
                Instantly acknowledges 5-star reviews to boost your Google Maps responsiveness score.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <strong className="block text-slate-900 font-bold mb-0.5">
                🎭 Custom Personas
              </strong>
              <p className="text-[10px] text-slate-500">
                Configure brand tone: Warm, Playful, Medical, Luxury, or Tanglish dialect.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <strong className="block text-slate-900 font-bold mb-0.5">
                💬 Maps Q&amp;A Sync
              </strong>
              <p className="text-[10px] text-slate-500">
                Answers customer questions on Google Maps automatically using your store FAQs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

