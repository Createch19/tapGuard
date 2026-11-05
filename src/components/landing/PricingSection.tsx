"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight, Zap, ShieldCheck } from "lucide-react";

export interface SerializedPlanConfig {
  id: string;
  plan: string;
  displayName: string;
  description?: string | null;
  price: number;
  yearlyPrice?: number | null;
  currency: string;
  billingCycle: string;
  maxCards: number;
  maxLocations: number;
  maxCatalogItems: number;
  bookingFormEnabled: boolean;
  removePoweredBy: boolean;
  smartGate: boolean;
  multiGateTemplates: boolean;
  customBranding: boolean;
  webhookAlerts: boolean;
  keywordSuggestions: boolean;
  googleHub: boolean;
  teamAccess: boolean;
  qrCodeTier: string;
  analyticsRetDays: number;
  prioritySupport: boolean;
  sortOrder: number;
}

interface PricingSectionProps {
  planConfigs: SerializedPlanConfig[];
}

export default function PricingSection({ planConfigs }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

  return (
    <section id="pricing" className="px-4 sm:px-8 py-20 max-w-7xl mx-auto w-full">
      <div className="text-center mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600 block mb-1">
          Simple & Transparent Pricing
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Plans for Every Physical Venue & Brand Fleet
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl mx-auto">
          Start with single-card lifetime branding or scale up to multi-location Google review growth and AI review assistance.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="mt-8 inline-flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setBillingCycle("MONTHLY")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              billingCycle === "MONTHLY"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("YEARLY")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              billingCycle === "YEARLY"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>Annual Billing</span>
            <span
              className={`text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                billingCycle === "YEARLY"
                  ? "bg-white text-teal-700"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              Save ~17% (2 Mo Free)
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-stretch">
        {planConfigs.map((config) => {
          const isGrowth = config.plan === "GROWTH";
          const isLite = config.plan === "LITE";
          const isEnterprise = config.plan === "ENTERPRISE";

          // Calculate effective price display
          let priceText = "";
          let periodText = "";

          if (isEnterprise || config.price === 0) {
            priceText = "Custom";
            periodText = "volume quote";
          } else if (isLite || config.billingCycle === "LIFETIME") {
            priceText = `₹${config.price.toLocaleString("en-IN")}`;
            periodText = "one-time lifetime";
          } else if (billingCycle === "YEARLY" && config.yearlyPrice) {
            priceText = `₹${config.yearlyPrice.toLocaleString("en-IN")}`;
            periodText = "/year (₹" + Math.round(config.yearlyPrice / 12).toLocaleString("en-IN") + "/mo)";
          } else {
            priceText = `₹${config.price.toLocaleString("en-IN")}`;
            periodText = "/month";
          }

          return (
            <div
              key={config.id}
              className={`bg-white rounded-3xl p-6 border flex flex-col justify-between transition-all relative ${
                isGrowth
                  ? "border-teal-500 shadow-xl ring-2 ring-teal-500/20 lg:-translate-y-2 z-10"
                  : "border-slate-200/90 shadow-2xs hover:border-slate-300"
              }`}
            >
              {isGrowth && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Most Popular
                </div>
              )}

              {isLite && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                  Pay Once, Own Forever
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1 mt-1">
                  <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                    {config.displayName}
                  </h3>
                </div>

                <p className="text-[11px] text-slate-500 mb-4 min-h-[36px] leading-relaxed">
                  {config.description}
                </p>

                {/* Price Display */}
                <div className="mb-5 pb-5 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {priceText}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      {periodText}
                    </span>
                  </div>
                </div>

                {/* Feature Bullet Points */}
                <div className="space-y-2.5 text-xs text-slate-600 mb-6">
                  {/* Cards quota */}
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-[11.5px] leading-snug">
                      <strong>{config.maxCards > 1000 ? "Unlimited" : config.maxCards}</strong> NFC Card{config.maxCards === 1 ? "" : "s"}
                    </span>
                  </div>

                  {/* Locations quota */}
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-[11.5px] leading-snug">
                      <strong>{config.maxLocations > 100 ? "Unlimited" : `${config.maxLocations} Location${config.maxLocations === 1 ? "" : "s"}`}</strong>
                    </span>
                  </div>

                  {/* Card Gate modes */}
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-[11.5px] leading-snug">
                      {config.multiGateTemplates
                        ? "All 5 Card Experience Modes"
                        : "Branding Microsite Gateway"}
                    </span>
                  </div>

                  {/* Review Gate */}
                  <div className="flex items-start gap-2">
                    {config.smartGate ? (
                      <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    ) : (
                      <span className="w-4 h-4 text-slate-300 font-bold shrink-0 mt-0.5 text-center text-xs">✕</span>
                    )}
                    <span className={`text-[11.5px] leading-snug ${config.smartGate ? "" : "text-slate-400 line-through"}`}>
                      Google Review Accelerator
                    </span>
                  </div>

                  {/* Catalog limit */}
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-[11.5px] leading-snug">
                      {config.maxCatalogItems === -1
                        ? "Unlimited Catalog & Menu"
                        : `Catalog up to ${config.maxCatalogItems} items`}
                    </span>
                  </div>

                  {/* WhatsApp Booking */}
                  {config.bookingFormEnabled && (
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span className="text-[11.5px] font-semibold text-slate-800 leading-snug">
                        WhatsApp Booking Form
                      </span>
                    </div>
                  )}

                  {/* No Powered By Footer */}
                  {config.removePoweredBy && (
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span className="text-[11.5px] font-semibold text-teal-700 leading-snug">
                        No "Powered by" Footer
                      </span>
                    </div>
                  )}

                  {/* Regional AI Keywords */}
                  {config.keywordSuggestions && (
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span className="text-[11.5px] font-semibold text-slate-800 leading-snug">
                        AI Prompts (Tamil, Hindi, etc.)
                      </span>
                    </div>
                  )}

                  {/* Team access */}
                  {config.teamAccess && (
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span className="text-[11.5px] font-semibold text-purple-700 leading-snug">
                        Multi-user Team Roles
                      </span>
                    </div>
                  )}

                  {/* Analytics retention */}
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-[11.5px] leading-snug">
                      {config.analyticsRetDays >= 365
                        ? `${Math.round(config.analyticsRetDays / 365)} Year Analytics`
                        : `${config.analyticsRetDays} Days Analytics`}
                    </span>
                  </div>

                  {/* Priority support */}
                  {config.prioritySupport && (
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span className="text-[11.5px] font-semibold text-slate-900 leading-snug">
                        Priority Support & SLA
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100">
                <Link
                  href="/claim"
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-center ${
                    isGrowth
                      ? "bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                  }`}
                >
                  <span>{isEnterprise ? "Contact Sales" : "Get Started"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

