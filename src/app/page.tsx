import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import {
  Star,
  CreditCard,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  Zap,
  Check,
  ExternalLink,
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
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-base shadow-sm">
              T
            </div>
            <span className="font-black text-lg tracking-tight text-slate-900">
              TapGate
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-teal-600 transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-teal-600 transition-colors">
              Pricing Plans
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
          Enterprise B2B NFC cards with intelligent review filtering. Happy customers are guided straight to Google Reviews, while critical feedback is privately captured so your team can make it right.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
          <Link
            href="/tap/artisan-counter"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02]"
          >
            <Smartphone className="w-4 h-4" />
            <span>Test Customer NFC Experience</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-2xl border border-slate-200 shadow-2xs transition-all"
          >
            <span>Tenant & Admin Sign In</span>
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
                  The Artisan Bakery & Café
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
            How was your coffee & croissant today?
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

      {/* Feature Value Props */}
      <section id="features" className="px-4 sm:px-8 py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 block mb-1">
              Enterprise Grade
            </span>
            <h2 className="text-3xl font-black text-slate-900">
              Why Top Venues Rely on TapGate
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

      {/* Pricing Section (Dynamic from Database PlanConfig) */}
      <section id="pricing" className="px-4 sm:px-8 py-20 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 block mb-1">
            Transparent Pricing
          </span>
          <h2 className="text-3xl font-black text-slate-900">
            Plans for Every Venue Fleet
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            All prices configurable in real-time by Platform Super Admin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planConfigs.map((config) => {
            const isFeatured = config.plan === "PRO";

            return (
              <div
                key={config.id}
                className={`bg-white rounded-3xl p-7 border flex flex-col justify-between transition-all ${
                  isFeatured
                    ? "border-teal-500 shadow-xl ring-2 ring-teal-500/20"
                    : "border-slate-200/90 shadow-2xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-slate-900">
                      {config.displayName}
                    </h3>
                    {isFeatured && (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-teal-100 text-teal-800">
                        Most Popular
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mb-5 h-10">
                    {config.description}
                  </p>

                  <div className="mb-6 pb-6 border-b border-slate-100">
                    {config.price.toNumber() === 0 ? (
                      <div className="text-3xl font-black text-slate-900">
                        Custom
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-slate-900">
                          ₹{config.price.toString()}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {config.billingCycle === "LIFETIME"
                            ? "one-time (lifetime)"
                            : `/${config.billingCycle.toLowerCase()}`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 text-xs text-slate-600 mb-8">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>
                        Up to{" "}
                        <strong>
                          {config.maxCards > 1000
                            ? "Unlimited"
                            : config.maxCards}
                        </strong>{" "}
                        NFC Cards
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>Smart Rating Gate Interception</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Check
                        className={`w-4 h-4 shrink-0 ${
                          config.customBranding
                            ? "text-teal-600"
                            : "text-slate-300"
                        }`}
                      />
                      <span
                        className={
                          config.customBranding ? "" : "text-slate-400"
                        }
                      >
                        Custom Venue Branding & Colors
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Check
                        className={`w-4 h-4 shrink-0 ${
                          config.webhookAlerts
                            ? "text-teal-600"
                            : "text-slate-300"
                        }`}
                      />
                      <span
                        className={
                          config.webhookAlerts ? "" : "text-slate-400"
                        }
                      >
                        Webhook & Urgent Bad Review Alerts
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{config.qrCodeTier} QR Code Generator</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{config.analyticsRetDays} Days Analytics Retention</span>
                    </div>

                    {config.prioritySupport && (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-teal-600 shrink-0" />
                        <span className="font-semibold text-slate-800">
                          Priority Support & SLA
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  href="/login"
                  className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                    isFeatured
                      ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  <span>Get Started with {config.displayName}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 px-4 sm:px-8 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
              T
            </div>
            <span>TapGate</span>
            <span className="text-slate-400 font-normal">
              — B2B NFC Google Review SaaS
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
