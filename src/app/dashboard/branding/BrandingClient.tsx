"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Save,
  Star,
  Smartphone,
  Lock,
  Sparkles,
  ArrowRight,
  Palette,
  ExternalLink,
  Flame,
  Phone,
  HelpCircle,
} from "lucide-react";

type GateTemplateType =
  | "GOOGLE_REVIEW"
  | "SOCIAL_HUB"
  | "DELIVERY_DINING"
  | "CUSTOM_REDIRECT";

interface BrandingClientProps {
  tenant: {
    id: string;
    name: string;
    plan: string;
    gateTemplate?: GateTemplateType;
    googleReviewUrl?: string | null;
    instagramUrl?: string | null;
    facebookUrl?: string | null;
    youtubeUrl?: string | null;
    swiggyUrl?: string | null;
    zomatoUrl?: string | null;
    deliveryOfferText?: string | null;
    deliveryPhone?: string | null;
    customRedirectUrl?: string | null;
    customRedirectTitle?: string | null;
    customRedirectDirect?: boolean;
    greetingTitle: string;
    greetingSubtitle?: string | null;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl?: string | null;
  };
}

export default function BrandingClient({
  tenant,
  branding: initialBranding,
}: BrandingClientProps) {
  const isProOrEnterprise =
    tenant.plan === "PRO" || tenant.plan === "ENTERPRISE";

  // Gate Template Selection State
  const [gateTemplate, setGateTemplate] = useState<GateTemplateType>(
    tenant.gateTemplate || "GOOGLE_REVIEW"
  );

  // General Branding State
  const [greetingTitle, setGreetingTitle] = useState(
    tenant.greetingTitle || "How was your experience?"
  );
  const [greetingSubtitle, setGreetingSubtitle] = useState(
    tenant.greetingSubtitle || ""
  );
  const [primaryColor, setPrimaryColor] = useState(
    initialBranding.primaryColor || "#0D9488"
  );
  const [logoUrl, setLogoUrl] = useState(initialBranding.logoUrl || "");

  // Template Specific States
  const [googleReviewUrl, setGoogleReviewUrl] = useState(
    tenant.googleReviewUrl || ""
  );
  const [instagramUrl, setInstagramUrl] = useState(
    tenant.instagramUrl || "https://instagram.com/"
  );
  const [facebookUrl, setFacebookUrl] = useState(
    tenant.facebookUrl || "https://facebook.com/"
  );
  const [youtubeUrl, setYoutubeUrl] = useState(tenant.youtubeUrl || "");
  const [swiggyUrl, setSwiggyUrl] = useState(
    tenant.swiggyUrl || "https://www.swiggy.com/restaurants/"
  );
  const [zomatoUrl, setZomatoUrl] = useState(
    tenant.zomatoUrl || "https://www.zomato.com/"
  );
  const [deliveryOfferText, setDeliveryOfferText] = useState(
    tenant.deliveryOfferText || "Flat 15% OFF on direct takeaway orders! Call ahead."
  );
  const [deliveryPhone, setDeliveryPhone] = useState(
    tenant.deliveryPhone || "+91 98765 43210"
  );
  const [customRedirectUrl, setCustomRedirectUrl] = useState(
    tenant.customRedirectUrl || "https://menu.example.com"
  );
  const [customRedirectTitle, setCustomRedirectTitle] = useState(
    tenant.customRedirectTitle || "View Online Menu"
  );
  const [customRedirectDirect, setCustomRedirectDirect] = useState(
    tenant.customRedirectDirect || false
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const PRESET_COLORS = [
    { name: "Teal (Signature)", hex: "#0D9488" },
    { name: "Emerald", hex: "#059669" },
    { name: "Indigo", hex: "#4F46E5" },
    { name: "Sapphire", hex: "#0284C7" },
    { name: "Rose Crimson", hex: "#E11D48" },
    { name: "Amber Gold", hex: "#D97706" },
  ];

  const handleSelectTemplate = (template: GateTemplateType) => {
    if (!isProOrEnterprise && template !== "GOOGLE_REVIEW") {
      setErrorMessage(
        "Social Media Hub, Delivery Hub, and Custom Menu Redirection are Pro & Enterprise features."
      );
      return;
    }
    setErrorMessage("");
    setGateTemplate(template);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage("");

    try {
      const res = await fetch("/api/dashboard/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gateTemplate,
          greetingTitle,
          greetingSubtitle,
          primaryColor,
          logoUrl,
          googleReviewUrl,
          instagramUrl,
          facebookUrl,
          youtubeUrl,
          swiggyUrl,
          zomatoUrl,
          deliveryOfferText,
          deliveryPhone,
          customRedirectUrl,
          customRedirectTitle,
          customRedirectDirect,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save branding settings");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Error saving branding settings.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Dynamic Gate Templates & Design
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Choose what customers see upon tapping your cards and customize colors, typography & actions
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Gate published live!</span>
            </div>
          )}

          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
              isProOrEnterprise
                ? "bg-teal-50 text-teal-800 border-teal-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            {tenant.plan} Plan
          </span>
        </div>
      </div>

      {/* Pro Plan Upsell Notice (Only shown on BASIC plan) */}
      {!isProOrEnterprise && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 rounded-3xl border border-amber-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-sm font-bold text-amber-950 block">
                Unlock 4 Dynamic Gate Templates with Pro
              </strong>
              <p className="text-xs text-amber-800/90 mt-0.5 max-w-2xl">
                Your current Basic plan supports the <strong>Google Review Smart Gate</strong>. Upgrade to <strong>Pro Monthly</strong> or <strong>Enterprise</strong> to activate the <strong>Social Media Hub</strong>, <strong>Swiggy & Zomato Delivery Hub</strong>, and <strong>Direct Online Menu Redirection</strong>.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/subscription"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>View Subscription</span>
          </Link>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700">
          {errorMessage}
        </div>
      )}

      {/* 2-Column: Left = Customizer Form, Right = Live Phone Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Form (7 cols) */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-6"
        >
          {/* Section 1: Template Selection (4 Modes) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Select Active Gate Template
                </h2>
                <p className="text-xs text-slate-400">
                  Choose the destination experience when customers tap your NFC card.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Template 1: Google Review */}
              <button
                type="button"
                onClick={() => handleSelectTemplate("GOOGLE_REVIEW")}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  gateTemplate === "GOOGLE_REVIEW"
                    ? "border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20 shadow-2xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
                    ⭐
                  </div>
                  {gateTemplate === "GOOGLE_REVIEW" && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-teal-600 text-white">
                      Active
                    </span>
                  )}
                </div>
                <strong className="text-xs font-bold text-slate-900 block">
                  Google Review Smart Gate
                </strong>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Compliant Venting Strategy. 4-5★ forwards to Google; 1-3★ provides a private manager venting box with compliant Google review option.
                </p>
              </button>

              {/* Template 2: Social Media Hub */}
              <button
                type="button"
                onClick={() => handleSelectTemplate("SOCIAL_HUB")}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  gateTemplate === "SOCIAL_HUB"
                    ? "border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20 shadow-2xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                } ${!isProOrEnterprise ? "opacity-80" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center font-bold text-xs">
                    📸
                  </div>
                  {gateTemplate === "SOCIAL_HUB" ? (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-teal-600 text-white">
                      Active
                    </span>
                  ) : !isProOrEnterprise ? (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 inline-flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> PRO
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-teal-50 text-teal-700">
                      Pro
                    </span>
                  )}
                </div>
                <strong className="text-xs font-bold text-slate-900 block">
                  Social Media Hub
                </strong>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Direct followers to Instagram, Facebook & YouTube to grow your social channels.
                </p>
              </button>

              {/* Template 3: Food Delivery & Dining */}
              <button
                type="button"
                onClick={() => handleSelectTemplate("DELIVERY_DINING")}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  gateTemplate === "DELIVERY_DINING"
                    ? "border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20 shadow-2xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                } ${!isProOrEnterprise ? "opacity-80" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs">
                    🍽️
                  </div>
                  {gateTemplate === "DELIVERY_DINING" ? (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-teal-600 text-white">
                      Active
                    </span>
                  ) : !isProOrEnterprise ? (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 inline-flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> PRO
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-teal-50 text-teal-700">
                      Pro
                    </span>
                  )}
                </div>
                <strong className="text-xs font-bold text-slate-900 block">
                  Swiggy & Zomato Delivery
                </strong>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Direct action cards for Swiggy, Zomato, special deals, and direct table calls.
                </p>
              </button>

              {/* Template 4: Custom URL Redirection */}
              <button
                type="button"
                onClick={() => handleSelectTemplate("CUSTOM_REDIRECT")}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  gateTemplate === "CUSTOM_REDIRECT"
                    ? "border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20 shadow-2xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                } ${!isProOrEnterprise ? "opacity-80" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
                    🔗
                  </div>
                  {gateTemplate === "CUSTOM_REDIRECT" ? (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-teal-600 text-white">
                      Active
                    </span>
                  ) : !isProOrEnterprise ? (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 inline-flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> PRO
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-teal-50 text-teal-700">
                      Pro
                    </span>
                  )}
                </div>
                <strong className="text-xs font-bold text-slate-900 block">
                  Online Menu / Custom URL
                </strong>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Redirect customers to your digital PDF menu, website catalog, or table ordering URL.
                </p>
              </button>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Dynamic Template Fields */}
          <div className="space-y-4">
            {gateTemplate === "GOOGLE_REVIEW" && (
              <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Google Review Settings
                </span>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Google Review Direct Place URL *
                  </label>
                  <input
                    type="url"
                    value={googleReviewUrl}
                    onChange={(e) => setGoogleReviewUrl(e.target.value)}
                    placeholder="https://search.google.com/local/writereview?placeid=..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Where 4-star and 5-star positive customers are redirected to submit public reviews.
                  </span>
                </div>
              </div>
            )}

            {gateTemplate === "SOCIAL_HUB" && (
              <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Social Media Links
                </span>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Instagram Profile URL *
                  </label>
                  <input
                    type="url"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/your_handle"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Facebook Page URL
                  </label>
                  <input
                    type="url"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/your_page"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    YouTube Channel URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/@channel"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                </div>
              </div>
            )}

            {gateTemplate === "DELIVERY_DINING" && (
              <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Food Delivery & Takeaway Links
                </span>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Swiggy Restaurant URL
                  </label>
                  <input
                    type="url"
                    value={swiggyUrl}
                    onChange={(e) => setSwiggyUrl(e.target.value)}
                    placeholder="https://www.swiggy.com/restaurants/..."
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Zomato Restaurant URL
                  </label>
                  <input
                    type="url"
                    value={zomatoUrl}
                    onChange={(e) => setZomatoUrl(e.target.value)}
                    placeholder="https://www.zomato.com/restaurant-slug"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Promo Offer Banner Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={deliveryOfferText}
                    onChange={(e) => setDeliveryOfferText(e.target.value)}
                    placeholder="e.g. Flat 15% OFF on direct takeaway orders! Call ahead."
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Direct Order / Reservation Phone
                  </label>
                  <input
                    type="tel"
                    value={deliveryPhone}
                    onChange={(e) => setDeliveryPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                </div>
              </div>
            )}

            {gateTemplate === "CUSTOM_REDIRECT" && (
              <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Online Menu & Redirection
                </span>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Destination URL (Online Menu / Website) *
                  </label>
                  <input
                    type="url"
                    required
                    value={customRedirectUrl}
                    onChange={(e) => setCustomRedirectUrl(e.target.value)}
                    placeholder="https://menu.artisanbakery.com or Google Drive PDF link"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Button Action Title
                  </label>
                  <input
                    type="text"
                    value={customRedirectTitle}
                    onChange={(e) => setCustomRedirectTitle(e.target.value)}
                    placeholder="e.g. View Online Menu or Browse Catalog"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="instantRedirect"
                    checked={customRedirectDirect}
                    onChange={(e) => setCustomRedirectDirect(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <label htmlFor="instantRedirect" className="text-xs font-medium text-slate-700 cursor-pointer">
                    Instant 307 Direct Forwarding (Skip landing card, open link immediately on tap)
                  </label>
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: Greetings & Copy */}
          <div className="space-y-3.5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-1">
                Header Greetings & Subtitle
              </h2>
              <p className="text-xs text-slate-400">
                Shown at the top of the mobile screen for this template.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Main Greeting Title *
              </label>
              <input
                type="text"
                required
                value={greetingTitle}
                onChange={(e) => setGreetingTitle(e.target.value)}
                placeholder="e.g. How was your visit? or Welcome to our Bakery!"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Greeting Subtitle (Optional)
              </label>
              <input
                type="text"
                value={greetingSubtitle}
                onChange={(e) => setGreetingSubtitle(e.target.value)}
                placeholder="e.g. Follow us on Instagram or order delivery on Swiggy!"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 4: Brand Colors & Logo */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Brand Colors & Aesthetics
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 p-0.5 bg-white shadow-2xs"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-28 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs uppercase font-semibold text-slate-900"
                />
              </div>

              {/* Color Presets */}
              <div className="flex flex-wrap gap-2 mt-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setPrimaryColor(color.hex)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-slate-700 text-[11px]">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Business Logo Image URL (Optional)
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white font-bold rounded-2xl text-sm shadow-sm transition-all"
            >
              <Save className="w-4 h-4 text-teal-400" />
              <span>{isSaving ? "Saving Template & Design..." : "Publish Gate Design Live"}</span>
            </button>
          </div>
        </form>

        {/* Live Smartphone Simulator (5 cols) */}
        <div className="lg:col-span-5 sticky top-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Smartphone className="w-4 h-4 text-teal-600" />
              <span>Real-Time Mobile Preview</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              NFC Tap Simulation
            </span>
          </div>

          {/* Smartphone Shell Frame */}
          <div className="w-full max-w-[340px] mx-auto bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700">
            {/* Dynamic Island Notch */}
            <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500/80" />
            </div>

            {/* Screen Inner Content */}
            <div className="bg-[#F8F9FA] rounded-[34px] p-4 text-center overflow-hidden min-h-[520px] flex flex-col justify-between border border-slate-200/40">
              <div>
                {/* Brand Logo / Avatar */}
                <div className="mb-4 pt-2">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={tenant.name}
                      className="w-12 h-12 rounded-2xl mx-auto mb-2 object-cover shadow-2xs border border-slate-100"
                    />
                  ) : (
                    <div
                      className="inline-flex items-center justify-center w-11 h-11 rounded-2xl mb-2 font-bold text-base text-white shadow-2xs"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {tenant.name.slice(0, 1)}
                    </div>
                  )}

                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-200/70 text-slate-700 rounded-full text-[10px] font-bold mb-1">
                    <span>{tenant.name}</span>
                    <CheckCircle className="w-3 h-3 text-teal-600" />
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    {greetingTitle || "How was your experience?"}
                  </h3>

                  {greetingSubtitle && (
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {greetingSubtitle}
                    </p>
                  )}
                </div>

                {/* TEMPLATE 1 PREVIEW: GOOGLE REVIEW */}
                {gateTemplate === "GOOGLE_REVIEW" && (
                  <div className="py-2 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-7 h-7 fill-amber-400 text-amber-400 drop-shadow-xs"
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-700 block">
                      Outstanding!
                    </span>
                    <div
                      className="mt-3 w-full py-2 px-3 rounded-xl text-white text-xs font-bold inline-flex items-center justify-center gap-1 shadow-2xs"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <span>Post Review on Google</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                )}

                {/* TEMPLATE 2 PREVIEW: SOCIAL MEDIA HUB */}
                {gateTemplate === "SOCIAL_HUB" && (
                  <div className="space-y-2 py-1">
                    <div className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-[#833ab4]/10 via-[#fd1d1d]/10 to-[#fcb045]/10 border border-rose-200/80 text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white text-xs">
                          📸
                        </div>
                        <div>
                          <strong className="text-[11px] font-bold text-slate-900 block leading-tight">
                            Follow on Instagram
                          </strong>
                          <span className="text-[9px] text-rose-600 font-medium">
                            Stories & Reels
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-3 h-3 text-rose-600" />
                    </div>

                    <div className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-50 border border-blue-200/80 text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#1877F2] flex items-center justify-center text-white text-xs font-bold">
                          f
                        </div>
                        <div>
                          <strong className="text-[11px] font-bold text-slate-900 block leading-tight">
                            Like on Facebook
                          </strong>
                          <span className="text-[9px] text-blue-700 font-medium">
                            Community Page
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-3 h-3 text-blue-600" />
                    </div>

                    <div className="w-full p-2 bg-white rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] font-semibold text-slate-600">
                        ⭐ Also Rate Us on Google
                      </span>
                    </div>
                  </div>
                )}

                {/* TEMPLATE 3 PREVIEW: DELIVERY & DINING */}
                {gateTemplate === "DELIVERY_DINING" && (
                  <div className="space-y-2 py-1">
                    {deliveryOfferText && (
                      <div className="p-1.5 bg-amber-50 border border-amber-300 rounded-lg text-[10px] font-bold text-amber-900">
                        🔥 {deliveryOfferText}
                      </div>
                    )}

                    <div className="w-full flex items-center justify-between p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#FC8019] flex items-center justify-center text-white text-xs font-black">
                          S
                        </div>
                        <div>
                          <strong className="text-[11px] font-bold text-slate-900 block leading-tight">
                            Order on Swiggy
                          </strong>
                          <span className="text-[9px] text-orange-700 font-medium">
                            Doorstep delivery
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-3 h-3 text-orange-600" />
                    </div>

                    <div className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#E23744] flex items-center justify-center text-white text-xs font-bold italic">
                          z
                        </div>
                        <div>
                          <strong className="text-[11px] font-bold text-slate-900 block leading-tight">
                            Order on Zomato
                          </strong>
                          <span className="text-[9px] text-rose-700 font-medium">
                            Menu & ratings
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-3 h-3 text-rose-600" />
                    </div>

                    {deliveryPhone && (
                      <div className="w-full p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-emerald-800">
                          📞 Direct Call: {deliveryPhone}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* TEMPLATE 4 PREVIEW: CUSTOM REDIRECT */}
                {gateTemplate === "CUSTOM_REDIRECT" && (
                  <div className="py-2 bg-white rounded-2xl p-4 border border-slate-200 text-center space-y-2">
                    <div
                      className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-white text-lg shadow-2xs"
                      style={{ backgroundColor: primaryColor }}
                    >
                      📖
                    </div>
                    <strong className="text-xs font-bold text-slate-900 block">
                      {customRedirectTitle || "Digital Online Menu"}
                    </strong>
                    <p className="text-[10px] text-slate-500">
                      Tap below to browse our live digital menu.
                    </p>
                    <div
                      className="w-full py-2 rounded-xl text-white text-[11px] font-bold shadow-2xs"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {customRedirectTitle || "Open Online Menu"} →
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Footer */}
              <div className="pt-2 text-[9px] text-slate-400 border-t border-slate-200/50">
                Powered by <strong>TapGate</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
