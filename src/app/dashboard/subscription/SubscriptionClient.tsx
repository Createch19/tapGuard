"use client";

import React from "react";
import Link from "next/link";
import {
  Check,
  CreditCard,
  ShieldCheck,
  Palette,
  BellRing,
  QrCode,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";

interface PlanConfigItem {
  id: string;
  plan: "BASIC" | "PRO" | "ENTERPRISE";
  displayName: string;
  description?: string | null;
  price: number;
  currency: string;
  billingCycle: string;
  maxCards: number;
  smartGate: boolean;
  multiGateTemplates?: boolean;
  customBranding: boolean;
  webhookAlerts: boolean;
  qrCodeTier: string;
  analyticsRetDays: number;
  prioritySupport: boolean;
}

interface SubscriptionClientProps {
  tenant: {
    name: string;
    plan: string;
    activeCards: number;
    maxCards: number;
  };
  subscription?: {
    status: string;
    billingCycle: string;
    pricePaid: number;
    currency: string;
    currentPeriodEnd?: string | null;
  } | null;
  planConfigs: PlanConfigItem[];
}

export default function SubscriptionClient({
  tenant,
  subscription,
  planConfigs,
}: SubscriptionClientProps) {
  // Locate the active plan configuration
  const activeConfig =
    planConfigs.find((pc) => pc.plan === tenant.plan) || {
      id: "default",
      plan: tenant.plan as "BASIC" | "PRO" | "ENTERPRISE",
      displayName:
        tenant.plan === "BASIC"
          ? "Basic Lifetime Tier"
          : tenant.plan === "PRO"
          ? "Pro Business Tier"
          : "Enterprise Custom Tier",
      description: "Active business plan and features entitlement",
      price: subscription?.pricePaid || 0,
      currency: subscription?.currency || "INR",
      billingCycle: subscription?.billingCycle || "MONTHLY",
      maxCards: tenant.maxCards,
      smartGate: true,
      multiGateTemplates: tenant.plan !== "BASIC",
      customBranding: tenant.plan !== "BASIC",
      webhookAlerts: tenant.plan !== "BASIC",
      qrCodeTier: tenant.plan === "ENTERPRISE" ? "White-label" : tenant.plan === "PRO" ? "Branded" : "Basic",
      analyticsRetDays: tenant.plan === "ENTERPRISE" ? 3650 : tenant.plan === "PRO" ? 365 : 30,
      prioritySupport: tenant.plan === "ENTERPRISE",
    };

  const remainingSlots = Math.max(0, tenant.maxCards - tenant.activeCards);
  const quotaPercent = Math.min(
    100,
    Math.round((tenant.activeCards / (tenant.maxCards || 1)) * 100)
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Subscription & Plan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Your active subscription tier, hardware quota, and included capabilities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            {tenant.plan} Plan Active
          </span>
        </div>
      </div>

      {/* Primary Plan Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Tier Summary Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 bg-teal-950/80 px-2.5 py-0.5 rounded-md border border-teal-800/80">
                  Current Active Plan
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {subscription?.status || "ACTIVE"}
                </span>
              </div>

              <h2 className="text-3xl font-black tracking-tight text-white">
                {activeConfig.displayName}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                {activeConfig.description ||
                  "Empowering your venue with intelligent review filtering and NFC engagement."}
              </p>
            </div>

            {/* Price Badge */}
            <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 text-right sm:text-left min-w-[180px]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 block">
                Billing Rate
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                {activeConfig.price === 0 ? (
                  "Custom"
                ) : (
                  <>
                    ₹{activeConfig.price}
                    <span className="text-xs font-normal text-slate-300 ml-1">
                      {activeConfig.billingCycle === "LIFETIME"
                        ? "(one-time)"
                        : `/${activeConfig.billingCycle.toLowerCase()}`}
                    </span>
                  </>
                )}
              </div>
              <span className="text-[11px] text-teal-200 mt-1 block">
                {subscription?.billingCycle === "LIFETIME"
                  ? "Lifetime license"
                  : subscription?.currentPeriodEnd
                  ? `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                  : "Active billing period"}
              </span>
            </div>
          </div>
        </div>

        {/* Quota & Utilization Bar */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Hardware & Card Fleet Capacity
              </h3>
              <p className="text-xs text-slate-500">
                Active NFC cards and QR codes assigned to your business location
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500">Utilization: </span>
              <strong className="text-sm font-bold text-slate-900">
                {tenant.activeCards} / {tenant.maxCards} Cards
              </strong>{" "}
              <span className="text-xs text-teal-700 font-semibold">({quotaPercent}%)</span>
            </div>
          </div>

          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-2">
            <div
              className="bg-teal-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${quotaPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{remainingSlots} activation slots available</span>
            <Link
              href="/dashboard/cards"
              className="text-teal-700 hover:text-teal-800 font-semibold inline-flex items-center gap-1"
            >
              <span>Manage Fleet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Plan Capabilities & Features Included */}
        <div className="p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Included Plan Features & Entitlements
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-900 block">
                  Hardware Fleet Allowance
                </strong>
                <p className="text-xs text-slate-500 mt-0.5">
                  Up to <strong>{activeConfig.maxCards > 1000 ? "Unlimited" : activeConfig.maxCards}</strong> pre-printed NFC review cards, stands, and table pucks.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-900 block">
                  Smart Rating Gate
                </strong>
                <p className="text-xs text-slate-500 mt-0.5">
                  Routes 4-5 star positive customers to Google Reviews while capturing 1-3 star feedback privately.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-900 block">
                  Dynamic Gate Templates (4 Modes)
                </strong>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeConfig.multiGateTemplates
                    ? "Full access to 4 dynamic gate templates: Google Review Smart Gate, Social Media Hub (Instagram & Facebook), Swiggy & Zomato Delivery Hub, and Direct Online Menu Redirection."
                    : "Standard Google Review Smart Gate. (Upgrade to Pro for Social Hub, Swiggy/Zomato & Online Menu)."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center shrink-0">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-900 block">
                  Custom Branding & Theming
                </strong>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeConfig.customBranding
                    ? "Full control over custom primary brand colors, greeting titles, and themes."
                    : "Standard TapGate themed rating flow."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center shrink-0">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-900 block">
                  Urgent Feedback & Webhook Alerts
                </strong>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeConfig.webhookAlerts
                    ? "Real-time email and webhook alerts dispatched when a customer submits negative feedback."
                    : "Standard in-app feedback resolution inbox."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center shrink-0">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-900 block">
                  {activeConfig.qrCodeTier} QR Generator
                </strong>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-resolution SVG and PNG printable QR codes paired with every NFC card.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-900 block">
                  Analytics Retention
                </strong>
                <p className="text-xs text-slate-500 mt-0.5">
                  <strong>{activeConfig.analyticsRetDays} days</strong> of device OS, tap timeline, and outcome history stored.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
