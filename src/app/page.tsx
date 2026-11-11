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
  CreditCard,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  ExternalLink,
  Bot,
  Swords,
  Lock,
  Mail,
  MapPin,
  CheckCircle2,
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
            <a href="#honest-reviews" className="hover:text-teal-600 transition-colors">
              Honest Reviews
            </a>
            <a href="#connect-google" className="hover:text-teal-600 transition-colors">
              Google Integration
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
            <Link href="/privacy" className="hover:text-teal-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-teal-600 transition-colors">
              Terms of Service
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
          <span>Smart Touchpoints &bull; Transparent Google Business Profile Management</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
          Make Leaving a Google Review <span className="text-teal-600">Effortless</span> for In-Store Customers
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          Empower your storefront with contactless NFC touchpoints and QR stands. Direct customers directly to your official Google Maps listing, manage profile details, and streamline customer communication.
        </p>

        {/* Dual Live Demo Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
          <Link
            href="/tap/tap-805-ghost"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02]"
          >
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
          {/* Pillar 1 Preview: AI Drafts (Coming Soon) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-lg relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">
                  <Bot className="w-4 h-4" />
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Coming Soon
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">
                AI Review Reply Assistant
              </h3>
              <p className="text-[11px] text-slate-500 mb-3">
                &ldquo;Thank you for visiting! We bake our almond croissants fresh daily at 6 AM.&rdquo;
              </p>
            </div>
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-teal-700 font-semibold">
              <span>Sample draft</span>
              <span>Owner review required</span>
            </div>
          </div>

          {/* Pillar 2 Preview: Local Benchmarks (Coming Soon) */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-lg relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs">
                  <Swords className="w-4 h-4" />
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Coming Soon
                </span>
              </div>
              <h3 className="text-xs font-bold text-white mb-1">
                Local Category Benchmarks
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                Understand local review activity patterns and public feedback trends in your district.
              </p>
            </div>
            <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-teal-300 font-semibold">
              <span>Public category insights</span>
              <span>Sample data</span>
            </div>
          </div>

          {/* Pillar 3 Preview: Profile Health Checklist */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-lg relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  Profile Checklist
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">
                Google Profile Audit
              </h3>
              <p className="text-[11px] text-slate-500 mb-3">
                Verify that your core hours, contact details, and category listings are accurate.
              </p>
            </div>
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-emerald-700 font-semibold">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Core listing checks
              </span>
              <span>Quick updates</span>
            </div>
          </div>
        </div>
      </section>

      {/* New Section: Honest Reviews, by Design */}
      <section id="honest-reviews" className="px-4 sm:px-8 py-16 bg-white border-y border-slate-200/80 w-full">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 block mb-1">
              Integrity First
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Honest Reviews, by Design
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl mx-auto">
              We believe in building authentic customer trust. TapGenie is engineered to be 100% compliant with Google&apos;s Review Policies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
                <ExternalLink className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                Every Customer Gets the Same Link
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every visitor who taps an NFC card or scans a QR code receives the exact same direct link to your official Google Maps review screen.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                Private Feedback is Never a Gate
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Private feedback forms are strictly optional additional communication channels. They never replace, block, or filter public review links.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                Zero Incentives or Hidden Rewards
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We never offer discounts, coupons, gifts, or incentives for reviews. All customer reviews are authentic, voluntary, and genuine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* New Section: Connect your Google Business Profile */}
      <section id="connect-google" className="px-4 sm:px-8 py-20 max-w-5xl mx-auto w-full">
        <div className="bg-gradient-to-br from-white to-teal-50/40 rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xl">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-1">
              Google Integration Transparency
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Connect Your Google Business Profile
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              When you link your Google Business Profile with TapGenie, here is exactly how your data is handled with complete privacy and control:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <h4 className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>What We Read</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Public reviews, location profile details (business hours, address, categories, services), and basic search performance metrics.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <h4 className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>What We Use It For</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                To organize your reviews in one clean dashboard, suggest draft responses for your approval, and help you keep your business hours accurate.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <h4 className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Full Owner Approval</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nothing is published to Google without your explicit review and consent, unless you specifically enable an automated reply setting.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <h4 className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Easy Disconnect &amp; Deletion</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                You can disconnect your Google account in 1 click at any time from your settings or via Google Account Permissions, and cached data is deleted.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/80 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
            <span>Read our complete data handling disclosure and limited use compliance:</span>
            <Link
              href="/privacy#google-data"
              className="text-teal-700 font-bold hover:text-teal-800 underline shrink-0"
            >
              Google User Data Policy Details &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Feature 1: AI Review Reply Showcase */}
      <AiReplyShowcase />

      {/* Feature 2: Competitor Radar & Market Intelligence */}
      <CompetitorRadarShowcase />

      {/* Feature 3: Google Profile Audit & Health Score */}
      <ProfileAuditShowcase />

      {/* Feature 4: NFC Touchpoints & Flexible Modes */}
      <ModesShowcase />

      {/* 3-Step Walkthrough Section */}
      <HowItWorks />

      {/* Multi-Language Review Prompts */}
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
      <footer className="bg-white border-t border-slate-200/80 px-4 sm:px-8 py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-1">
                <img
                  src="/brand/tapgenie-icon.png"
                  alt="TapGenie Logo"
                  className="w-6 h-6 object-contain"
                />
                <span>TapGenie</span>
                <span className="text-slate-400 font-normal">
                  by CreAiTechnology
                </span>
              </div>
              <p className="text-slate-500 text-xs max-w-md">
                Smart contactless NFC touchpoints and Google Business Profile management tools for storefronts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-600">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">
                Terms of Service
              </Link>
              <Link href="/login" className="hover:text-slate-900 transition-colors">
                Sign In
              </Link>
              <Link href="/claim" className="hover:text-slate-900 transition-colors">
                Activate NFC Card
              </Link>
            </div>
          </div>

          {/* Company Details & Contact */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-600 text-[11.5px]">
            <div className="space-y-0.5">
              <p className="font-semibold text-slate-800">
                CreAiTechnology
              </p>
              <p className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>#15/1 New Vellalar Street, Thirukkalukundram, Chengalpattu, Tamil Nadu, India</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Mail className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Contact: <a href="mailto:support@creaitechnology.com" className="text-teal-700 underline font-semibold">support@creaitechnology.com</a></span>
            </div>
          </div>

          {/* Google Trademark Disclaimer */}
          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed text-center sm:text-left">
            <p>
              Google, Google Maps and Google Business Profile are trademarks of Google LLC. TapGenie is an independent product and is not affiliated with or endorsed by Google.
            </p>
            <p className="mt-1">
              &copy; {new Date().getFullYear()} CreAiTechnology. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
