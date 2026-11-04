import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PricingSection from "@/components/landing/PricingSection";
import ModesShowcase from "@/components/landing/ModesShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import RegionalKeywordsBanner from "@/components/landing/RegionalKeywordsBanner";
import FaqSection from "@/components/landing/FaqSection";
import ClosingCta from "@/components/landing/ClosingCta";

export const dynamic = "force-dynamic";

import {
  Star,
  CreditCard,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  Zap,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export default async function HomePage() {
  // Fetch real plan configs from DB
  const planConfigs = await prisma.planConfig.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/brand/tapgenie-icon.png"
              alt="TapGenie Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="font-black text-lg tracking-tight text-slate-900">
              TapGenie
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#modes" className="hover:text-teal-600 transition-colors">
              5 Card Modes
            </a>
            <a href="#how-it-works" className="hover:text-teal-600 transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-teal-600 transition-colors">
              Pricing Plans
            </a>
            <a href="#faq" className="hover:text-teal-600 transition-colors">
              FAQ
            </a>
            <Link
              href="/tap/artisan-counter"
              className="text-teal-600 font-bold hover:text-teal-700 transition-colors flex items-center gap-1"
            >
              <span>Live NFC Demo</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/claim"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Activate Card</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 sm:px-8 pt-16 pb-20 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-6 animate-in fade-in">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Smart Rating Gate • Zero Negative Google Reviews</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
          Turn Customer Taps Into{" "}
          <span className="text-teal-600">5-Star Google Reviews</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          Enterprise B2B NFC cards with intelligent review filtering. Happy customers are guided straight to Google Reviews with 1-tap AI sentences, while critical feedback is privately captured so your team can make it right.
        </p>

        {/* Dual Live Demo Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
          <Link
            href="/tap/tap-805-ghost"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02]"
          >
            <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
            <span>Try Review Gate Demo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/tap/artisan-counter"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-2xl border border-slate-200 shadow-2xs transition-all hover:scale-[1.02]"
          >
            <Smartphone className="w-4 h-4 text-teal-600" />
            <span>Try Profile &amp; UPI Demo</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>

        {/* Hero Interactive Preview Card */}
        <div className="max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xl text-left relative">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                A
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  The Artisan Bakery &amp; Café
                </span>
                <span className="text-[10px] text-teal-600 font-medium">
                  Front Register NFC Card
                </span>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Touchpoint
            </span>
          </div>

          <h3 className="text-sm font-bold text-slate-900 mb-1">
            How was your coffee &amp; croissant today?
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Tap a star rating to experience our Smart Gate filter:
          </p>

          <div className="flex justify-center gap-2 py-2 mb-4 bg-slate-50 rounded-2xl border border-slate-100">
            {[1, 2, 3, 4, 5].map((star) => (
              <Link
                key={star}
                href="/tap/artisan-counter"
                className="p-1 hover:scale-125 transition-transform"
                title={`${star} star rating`}
              >
                <Star className="w-7 h-7 fill-amber-400 text-amber-400" />
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-teal-50/80 border border-teal-100 text-teal-900">
              <strong className="block text-teal-700 mb-0.5">⭐ 4 or 5 Stars:</strong>
              Opens Google Reviews
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-100 text-amber-900">
              <strong className="block text-amber-800 mb-0.5">⚠️ 1 to 3 Stars:</strong>
              Private Empathy Form
            </div>
          </div>
        </div>
      </section>

      {/* 5 Gate Modes Visual Showcase */}
      <ModesShowcase />

      {/* 3-Step Walkthrough Section */}
      <HowItWorks />

      {/* Multi-Language & AI Review Sentence Generator Showcase */}
      <RegionalKeywordsBanner />

      {/* Enterprise Feature Value Props */}
      <section id="features" className="px-4 sm:px-8 py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 block mb-1">
              Enterprise Grade
            </span>
            <h2 className="text-3xl font-black text-slate-900">
              Why Top Venues Rely on TapGenie
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50/60 border border-slate-200/80">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">
                Smart Rating Gate
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Filter out bad ratings before they touch Google. Unhappy guests vent privately to management so you can resolve complaints before they become permanent 1-star stains.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50/60 border border-slate-200/80">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">
                Ghost Link NFC Technology
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pre-printed hardware with universal dynamic redirects. Cards can be mass manufactured and bound to any venue in 5 seconds without reprogramming the NFC chip.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50/60 border border-slate-200/80">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">
                Urgent Bad Review Alerts
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Instant email and webhook notifications dispatch to your floor managers the moment a 1-3 star rating is captured, complete with customer contact info.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 5-Tier Pricing Section */}
      <PricingSection
        planConfigs={planConfigs.map((pc) => ({
          id: pc.id,
          plan: pc.plan,
          displayName: pc.displayName,
          description: pc.description,
          price: pc.price.toNumber(),
          yearlyPrice: pc.yearlyPrice ? pc.yearlyPrice.toNumber() : null,
          currency: pc.currency,
          billingCycle: pc.billingCycle,
          maxCards: pc.maxCards,
          maxLocations: pc.maxLocations,
          maxCatalogItems: pc.maxCatalogItems,
          bookingFormEnabled: pc.bookingFormEnabled,
          removePoweredBy: pc.removePoweredBy,
          smartGate: pc.smartGate,
          multiGateTemplates: pc.multiGateTemplates,
          customBranding: pc.customBranding,
          webhookAlerts: pc.webhookAlerts,
          keywordSuggestions: pc.keywordSuggestions,
          googleHub: pc.googleHub,
          teamAccess: pc.teamAccess,
          qrCodeTier: pc.qrCodeTier,
          analyticsRetDays: pc.analyticsRetDays,
          prioritySupport: pc.prioritySupport,
          sortOrder: pc.sortOrder,
        }))}
      />

      {/* Frequently Asked Questions */}
      <FaqSection />

      {/* Pre-Footer Closing Call-to-Action */}
      <ClosingCta />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 px-4 sm:px-8 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <img
              src="/brand/tapgenie-icon.png"
              alt="TapGenie Logo"
              className="w-6 h-6 object-contain"
            />
            <span>TapGenie</span>
            <span className="text-slate-400 font-normal">
              — Smart NFC Business Profile &amp; Review SaaS
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/login" className="hover:text-slate-800">
              Tenant Login
            </Link>
            <Link href="/login" className="hover:text-slate-800">
              Super Admin Portal
            </Link>
            <Link href="/claim" className="hover:text-slate-800">
              Activate NFC Card
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
