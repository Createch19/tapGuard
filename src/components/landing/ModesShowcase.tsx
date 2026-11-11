"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Star,
  Smartphone,
  CreditCard,
  QrCode,
  Share2,
  Utensils,
  Globe,
  Check,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Phone,
  MessageCircle,
  MapPin,
} from "lucide-react";

export default function ModesShowcase() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const modes = [
    {
      id: "google-gate",
      tabTitle: "⭐ Direct Google Reviews",
      badge: "Honest Review Collection",
      title: "Direct Google Review Touchpoint",
      subtitle:
        "Make it easy for in-store visitors to leave a review on your official Google Maps listing. Direct one-tap redirect with helpful reflection prompts.",
      preview: {
        header: "How was your experience today?",
        sub: "Tap to leave an authentic review",
        stars: 5,
        perks: [
          "Direct 1-tap redirect straight to your official Google Maps review screen",
          "Every customer gets the same review link — zero filtering or gating",
          "Optional reflection prompts in regional languages to help customers write in their own words",
          "Card tap analytics to track in-store engagement per touchpoint",
        ],
      },
      tagColor: "bg-amber-50 text-amber-800 border-amber-200",
      ctaUrl: "/tap/tap-805-ghost",
      ctaText: "Test Google Review Flow",
    },
    {
      id: "microsite",
      tabTitle: "📱 Business Microsite",
      badge: "Digital Bio & Showcase",
      title: "Full Business Profile Microsite Studio",
      subtitle:
        "A sleek mobile microsite with light & dark mode, 1-tap vCard save to phonebook, categorized service catalog, photo gallery, and operating hours.",
      preview: {
        header: "The Artisan Bakery & Café",
        sub: "Artisanal Breads, Specialty Coffee & Croissants",
        stars: null,
        perks: [
          "One-tap Save Contact (.vcf) directly into phone contacts",
          "Trilingual switcher: English, Tamil (தமிழ்), and Hindi (हिन्दी)",
          "Categorized menu & service catalog with WhatsApp enquiry buttons",
          "Live 'Open Now / Closed Today' working hours badge",
        ],
      },
      tagColor: "bg-teal-50 text-teal-800 border-teal-200",
      ctaUrl: "/tap/artisan-counter",
      ctaText: "Preview Live Microsite",
    },
    {
      id: "upi-payments",
      tabTitle: "💳 Direct UPI Display",
      badge: "Direct Merchant Settlement",
      title: "Direct UPI Payment Details Tile",
      subtitle:
        "Display your merchant UPI ID and payment links so customers can pay you directly. TapGenie does not process, hold, or touch transaction funds.",
      preview: {
        header: "Direct UPI Payment",
        sub: "GPay • PhonePe • Paytm • BHIM",
        stars: null,
        perks: [
          "Payments go straight to your UPI ID — TapGenie does not process payments",
          "One-tap deep link launch for installed UPI apps on customer devices",
          "Dynamic on-screen vector QR code with 1-click 'Copy UPI ID'",
          "Available directly inside your digital business profile",
        ],
      },
      tagColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      ctaUrl: "/tap/artisan-counter",
      ctaText: "See UPI Payment Demo",
    },
    {
      id: "social-hub",
      tabTitle: "🚀 Social Media Hub",
      badge: "Follower Growth",
      title: "Social Channel Growth Hub",
      subtitle:
        "Turn in-store visitors into permanent social followers across Instagram, Facebook, YouTube, and X (Twitter) with clean branded action buttons.",
      preview: {
        header: "Connect on Social Media",
        sub: "Follow us for daily deals & behind the scenes",
        stars: null,
        perks: [
          "Direct profile redirects without leaving the browser",
          "Conditional rendering: only buttons with added links are shown",
          "Official vector brand logos for Instagram, Facebook, YouTube & X",
          "Ideal for retail stores, salons, gyms, and lifestyle brands",
        ],
      },
      tagColor: "bg-purple-50 text-purple-800 border-purple-200",
      ctaUrl: "/tap/tap-805-ghost",
      ctaText: "View Social Hub Demo",
    },
    {
      id: "delivery-hub",
      tabTitle: "🛵 Food Delivery Hub",
      badge: "Direct Ordering",
      title: "Swiggy & Zomato Delivery & Dining Hub",
      subtitle:
        "Capture direct online delivery orders, highlight takeaway discounts, and provide one-tap telephone hotline dialers for reservations.",
      preview: {
        header: "Order Online for Takeaway",
        sub: "Swiggy • Zomato • Direct Phone Orders",
        stars: null,
        perks: [
          "One-tap redirect to your verified Swiggy & Zomato storefronts",
          "Promote direct pickup options for walk-in orders",
          "Instant telephone dialer (`tel:`) for table reservations",
          "Convenient access for customers visiting your location",
        ],
      },
      tagColor: "bg-rose-50 text-rose-800 border-rose-200",
      ctaUrl: "/tap/artisan-counter",
      ctaText: "View Food Hub Demo",
    },
  ];

  const currentMode = modes[activeTab];

  return (
    <section id="modes" className="px-4 sm:px-8 py-20 bg-slate-900 text-white w-full">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block mb-1">
            Flexible Modes in 1 Physical Card
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Remotely Reprogram Your Cards Anytime
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Switch your physical counter stands or table cards between direct Google reviews, digital bio, UPI payment details, or food delivery in 1 click from your dashboard.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {modes.map((mode, idx) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === idx
                  ? "bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20 scale-102"
                  : "bg-slate-800/90 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {mode.tabTitle}
            </button>
          ))}
        </div>

        {/* Active Mode Card Container */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Details */}
          <div className="lg:col-span-7 space-y-5">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${currentMode.tagColor}`}
            >
              {currentMode.badge}
            </span>

            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {currentMode.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {currentMode.subtitle}
            </p>

            <div className="space-y-3 pt-2">
              {currentMode.preview.perks.map((perk, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <div className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{perk}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center gap-4">
              <Link
                href={currentMode.ctaUrl}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all"
              >
                <span>{currentMode.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Mobile Visual Preview */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[280px] bg-slate-950 rounded-4xl p-4 border-4 border-slate-700 shadow-2xl relative">
              <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto mb-4" />
              <div className="bg-white text-slate-900 rounded-2xl p-4 text-center min-h-[300px] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Mobile Experience
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900 mb-1">
                    {currentMode.preview.header}
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-4">
                    {currentMode.preview.sub}
                  </p>

                  {currentMode.preview.stars && (
                    <div className="flex justify-center gap-1.5 mb-4">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] text-slate-600">
                  Direct Google Maps Link &bull; Tap or Scan to Open
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
