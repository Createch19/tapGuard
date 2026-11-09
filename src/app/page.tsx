import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AiReplyShowcase from "@/components/landing/AiReplyShowcase";
import CompetitorRadarShowcase from "@/components/landing/CompetitorRadarShowcase";
import ProfileAuditShowcase from "@/components/landing/ProfileAuditShowcase";
import ModesShowcase from "@/components/landing/ModesShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import RegionalKeywordsBanner from "@/components/landing/RegionalKeywordsBanner";
import PricingSection from "@/components/landing/PricingSection";
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
  Swords,
  Bot,
  TrendingUp,
  CheckCircle2,
  Trophy,
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

          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#ai-replies" className="hover:text-teal-600 transition-colors flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-teal-600" />
              <span>AI Review Replies</span>
            </a>
            <a href="#competitor-radar" className="hover:text-teal-600 transition-colors flex items-center gap-1">
              <Swords className="w-3.5 h-3.5 text-teal-600" />
              <span>Competitor Radar</span>
            </a>
            <a href="#profile-audit" className="hover:text-teal-600 transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Profile Audit</span>
            </a>
            <a href="#modes" className="hover:text-teal-600 transition-colors">
              NFC Touchpoints
            </a>
            <a href="#pricing" className="hover:text-teal-600 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-teal-600 transition-colors">
              FAQ
            </a>
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
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>AI Reputation Suite • 100% Google Review Policy Compliant</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
          Turn Storefront Taps Into <span className="text-teal-600">5-Star Reviews</span> &amp; Dominate Local Search with AI
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          Empower your storefront with contactless NFC touchpoints, 24/7 Gemini AI automated review replies, local competitor radar intelligence, and real-time Google Profile audit scoring.
        </p>

        {/* Dual Live Demo Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
          <Link
            href="/tap/tap-805-ghost"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02]"
          >
            <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
            <span>Try Live NFC Review Demo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/tap/artisan-counter"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-2xl border border-slate-200 shadow-2xs transition-all hover:scale-[1.02]"
          >
            <Smartphone className="w-4 h-4 text-teal-600" />
            <span>Try Digital Profile &amp; UPI Demo</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>

        {/* Hero Interactive Tri-Pillar Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto text-left">
          {/* Pillar 1 Preview: AI Auto-Pilot */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-lg relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">
                  <Bot className="w-4 h-4" />
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" />
                  Auto-Pilot Live
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">
                Gemini AI Review Reply
              </h3>
              <p className="text-[11px] text-slate-500 mb-3">
                &ldquo;Bakes fresh at 6 AM! Can&apos;t wait to welcome your team next week.&rdquo;
              </p>
            </div>
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-teal-700 font-semibold">
              <span>98% Confidence Match</span>
              <span>1.4s response</span>
            </div>
          </div>

          {/* Pillar 2 Preview: Competitor Radar */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-lg relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs">
                  <Swords className="w-4 h-4" />
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <Trophy className="w-2.5 h-2.5" />
                  Rank #1 in District
                </span>
              </div>
              <h3 className="text-xs font-bold text-white mb-1">
                Competitor Radar
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                +42 reviews/mo vs +11 for nearby rivals. Faster local pack climbing.
              </p>
            </div>
            <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-teal-300 font-semibold">
              <span>4.9★ (486 Reviews)</span>
              <span>3 rivals trailed</span>
            </div>
          </div>

          {/* Pillar 3 Preview: Profile Audit Score */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-lg relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  94/100 Score
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">
                Google Profile Audit
              </h3>
              <p className="text-[11px] text-slate-500 mb-3">
                +38% local Maps discovery. 20+ ranking factors verified &amp; synced.
              </p>
            </div>
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-emerald-700 font-semibold">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Top 5% Health
              </span>
              <span>1-Click Fixes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 1: Gemini AI Review Reply & Auto-Pilot */}
      <AiReplyShowcase />

      {/* Feature 2: Competitor Radar & Market Intelligence */}
      <CompetitorRadarShowcase />

      {/* Feature 3: Google Profile Audit & Health Score */}
      <ProfileAuditShowcase />

      {/* Feature 4: NFC Touchpoints & 5 Reprogrammable Modes */}
      <ModesShowcase />

      {/* 3-Step Walkthrough Section */}
      <HowItWorks />

      {/* Multi-Language & AI Review Sentence Generator Showcase */}
      <RegionalKeywordsBanner />

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
              — AI Google Reputation &amp; Smart NFC Touchpoint SaaS
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
