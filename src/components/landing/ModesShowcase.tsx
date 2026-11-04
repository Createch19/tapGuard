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
      tabTitle: "⭐ Smart Review Gate",
      badge: "Reputation Protection",
      title: "Google Review Smart Gate with Private Venting",
      subtitle:
        "Filter out damaging 1–3 star ratings before they touch Google Maps. Positive ratings go directly to Google Reviews with 1-tap AI sentences.",
      preview: {
        header: "How was your experience today?",
        sub: "Tap a star to rate us",
        stars: 5,
        perks: [
          "4 & 5 Stars: Automatically redirects to your Google Maps review form",
          "1 to 3 Stars: Opens private management venting box (captures name & phone)",
          "Instant email & webhook alert dispatched to on-duty managers",
          "Non-repeating AI keyword sentences in 6 regional languages",
        ],
      },
      tagColor: "bg-amber-50 text-amber-800 border-amber-200",
      ctaUrl: "/tap/tap-805-ghost",
      ctaText: "Test Live Review Gate",
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
      tabTitle: "💳 0% UPI Instant Pay",
      badge: "Direct Merchant Settlement",
      title: "Zero-Commission UPI Payment Tile",
      subtitle:
        "Allow customers to pay instantly using Google Pay, PhonePe, or Paytm via deep link or dynamic on-screen QR code directly to your bank account.",
      preview: {
        header: "Instant UPI QR Payment",
        sub: "GPay • PhonePe • Paytm • BHIM",
        stars: null,
        perks: [
          "0% transaction fees — money hits your merchant bank account directly",
          "One-tap deep link launch for installed UPI apps on mobile",
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
          "Promote direct pickup discounts (e.g. 15% off walk-in orders)",
          "Instant telephone dialer (`tel:`) for table reservations",
          "Boost off-premise revenue from table guests who love your food",
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
            5 Powerful Modes in 1 Physical Card
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Remotely Reprogram Your Cards Anytime
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Switch your physical counter stands or table cards between review collection, digital bio, UPI payments, or food delivery in 1 click from your dashboard.
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

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                href={currentMode.ctaUrl}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <span>{currentMode.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="#pricing"
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                View Included Plans →
              </Link>
            </div>
          </div>

          {/* Right Simulated Mobile Preview Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-xs bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 relative overflow-hidden">
              <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4" />

              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center mx-auto mb-2 font-bold text-base shadow-xs">
                  TG
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  {currentMode.preview.header}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {currentMode.preview.sub}
                </p>
              </div>

              {currentMode.id === "google-gate" && (
                <div className="flex justify-center gap-1.5 py-3 bg-slate-50 rounded-2xl mb-4 border border-slate-100">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-6 h-6 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              )}

              {currentMode.id === "microsite" && (
                <div className="grid grid-cols-3 gap-1.5 text-center mb-4">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <Phone className="w-4 h-4 mx-auto text-teal-600 mb-1" />
                    <span className="text-[9px] font-bold block">Call</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <MessageCircle className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
                    <span className="text-[9px] font-bold block">WhatsApp</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <MapPin className="w-4 h-4 mx-auto text-sky-600 mb-1" />
                    <span className="text-[9px] font-bold block">Maps</span>
                  </div>
                </div>
              )}

              {currentMode.id === "upi-payments" && (
                <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-100 text-center mb-4">
                  <QrCode className="w-16 h-16 mx-auto text-teal-700 mb-2" />
                  <span className="text-[10px] font-bold text-teal-900 block">Scan with GPay or PhonePe</span>
                  <span className="text-[9px] text-teal-600 font-mono">store@okhdfcbank</span>
                </div>
              )}

              {currentMode.id === "social-hub" && (
                <div className="space-y-1.5 mb-4">
                  <div className="p-2 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-xl border border-pink-200/60 text-xs font-bold text-pink-700 flex items-center justify-between">
                    <span>Follow on Instagram</span>
                    <span>→</span>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-xl border border-blue-200/60 text-xs font-bold text-blue-700 flex items-center justify-between">
                    <span>Like on Facebook</span>
                    <span>→</span>
                  </div>
                </div>
              )}

              {currentMode.id === "delivery-hub" && (
                <div className="space-y-1.5 mb-4">
                  <div className="p-2 bg-orange-50 rounded-xl border border-orange-200/60 text-xs font-bold text-orange-700 flex items-center justify-between">
                    <span>Order on Swiggy</span>
                    <span>🛵</span>
                  </div>
                  <div className="p-2 bg-rose-50 rounded-xl border border-rose-200/60 text-xs font-bold text-rose-700 flex items-center justify-between">
                    <span>Order on Zomato</span>
                    <span>🍴</span>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 text-center">
                <span className="text-[9px] text-slate-400 font-medium">
                  Powered by TapGenie Smart Gate
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

