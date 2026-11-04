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
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Upload,
} from "lucide-react";
import BusinessProfileMicrosite from "@/components/profile/BusinessProfileMicrosite";
import {
  BusinessProfileData,
  DEFAULT_BUSINESS_PROFILE,
  CatalogItem,
  ProfileSectionKey,
  DEFAULT_SECTION_ORDER,
  SECTION_METADATA,
} from "@/lib/business-profile";

type GateTemplateType =
  | "GOOGLE_REVIEW"
  | "SOCIAL_HUB"
  | "DELIVERY_DINING"
  | "CUSTOM_REDIRECT"
  | "BUSINESS_PROFILE";

interface BrandingClientProps {
  tenant: {
    id: string;
    name: string;
    plan: string;
    gateTemplate?: GateTemplateType;
    businessProfile?: BusinessProfileData | null;
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

  // Legacy & General Template States
  const [googleReviewUrl, setGoogleReviewUrl] = useState(
    tenant.googleReviewUrl || ""
  );
  const [instagramUrl, setInstagramUrl] = useState(
    tenant.instagramUrl || tenant.businessProfile?.instagramUrl || ""
  );
  const [facebookUrl, setFacebookUrl] = useState(
    tenant.facebookUrl || tenant.businessProfile?.facebookUrl || ""
  );
  const [youtubeUrl, setYoutubeUrl] = useState(
    tenant.youtubeUrl || tenant.businessProfile?.youtubeUrl || ""
  );
  const [twitterUrl, setTwitterUrl] = useState(
    tenant.businessProfile?.twitterUrl || ""
  );
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

  // Business Profile Mini-Website State
  const [profile, setProfile] = useState<BusinessProfileData>(() => {
    const rawOrder = tenant.businessProfile?.sectionOrder || DEFAULT_SECTION_ORDER;
    const initialOrder: ProfileSectionKey[] = [
      ...rawOrder.filter((k) => DEFAULT_SECTION_ORDER.includes(k)),
      ...DEFAULT_SECTION_ORDER.filter((k) => !rawOrder.includes(k)),
    ];

    return {
      ...DEFAULT_BUSINESS_PROFILE,
      ...(tenant.businessProfile || {}),
      sectionOrder: initialOrder,
      sections: {
        ...DEFAULT_BUSINESS_PROFILE.sections,
        ...(tenant.businessProfile?.sections || {}),
      },
      sectionTitles: {
        ...(tenant.businessProfile?.sectionTitles || {}),
      },
      sectionSubtitles: {
        ...(tenant.businessProfile?.sectionSubtitles || {}),
      },
      contactPhone: tenant.businessProfile?.contactPhone || tenant.deliveryPhone || "",
      whatsappNumber: tenant.businessProfile?.whatsappNumber || tenant.deliveryPhone || "",
      upiPayeeName: tenant.businessProfile?.upiPayeeName || tenant.name,
      instagramUrl: tenant.businessProfile?.instagramUrl || tenant.instagramUrl || "",
      facebookUrl: tenant.businessProfile?.facebookUrl || tenant.facebookUrl || "",
      youtubeUrl: tenant.businessProfile?.youtubeUrl || tenant.youtubeUrl || "",
      twitterUrl: tenant.businessProfile?.twitterUrl || "",
    };
  });

  // Active tab inside Business Profile customizer
  const [activeProfileTab, setActiveProfileTab] = useState<
    "tiles" | "theme" | "upi" | "catalog" | "enquiry" | "contact"
  >("tiles");

  // Single-input phone & WhatsApp synchronization state
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState<boolean>(() => {
    const existingWp = tenant.businessProfile?.whatsappNumber;
    const existingPhone = tenant.businessProfile?.contactPhone || tenant.deliveryPhone;
    if (!existingWp) return true;
    return existingWp === existingPhone;
  });

  const handlePhoneChange = (val: string) => {
    setProfile((prev) => ({
      ...prev,
      contactPhone: val,
      ...(whatsappSameAsPhone ? { whatsappNumber: val } : {}),
    }));
  };

  const handleToggleSameWhatsapp = (checked: boolean) => {
    setWhatsappSameAsPhone(checked);
    if (checked) {
      setProfile((prev) => ({
        ...prev,
        whatsappNumber: prev.contactPhone || "",
      }));
    }
  };

  const handleUpdateSocialLink = (
    platform: "instagramUrl" | "twitterUrl" | "facebookUrl" | "youtubeUrl",
    val: string
  ) => {
    if (platform === "instagramUrl") setInstagramUrl(val);
    if (platform === "twitterUrl") setTwitterUrl(val);
    if (platform === "facebookUrl") setFacebookUrl(val);
    if (platform === "youtubeUrl") setYoutubeUrl(val);
    setProfile((prev) => ({
      ...prev,
      [platform]: val,
    }));
  };

  // Image compression & file upload handler
  const compressImage = (
    file: File,
    maxWidth: number,
    maxHeight: number,
    callback: (dataUrl: string) => void
  ) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          callback(canvas.toDataURL("image/jpeg", 0.88));
        } else {
          callback(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, 400, 400, (dataUrl) => {
        setLogoUrl(dataUrl);
        setProfile((prev) => ({ ...prev, logoUrl: dataUrl }));
      });
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl("");
    setProfile((prev) => ({ ...prev, logoUrl: "" }));
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, 1200, 600, (dataUrl) => {
        setProfile((prev) => ({ ...prev, coverImageUrl: dataUrl }));
      });
    }
  };

  const handleRemoveCover = () => {
    setProfile((prev) => ({ ...prev, coverImageUrl: "" }));
  };

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
        "Business Profile, Delivery Hub, Social Media Hub, and Custom Menu Redirection require Pro or Enterprise."
      );
      return;
    }
    setErrorMessage("");
    setGateTemplate(template);
  };

  const updateProfileField = <K extends keyof BusinessProfileData>(
    field: K,
    value: BusinessProfileData[K]
  ) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Dynamic Tile Layout & Reordering Handlers
  const currentOrder: ProfileSectionKey[] = (() => {
    const raw = profile.sectionOrder || DEFAULT_SECTION_ORDER;
    return [
      ...raw.filter((k) => DEFAULT_SECTION_ORDER.includes(k)),
      ...DEFAULT_SECTION_ORDER.filter((k) => !raw.includes(k)),
    ];
  })();

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

    const newOrder = [...currentOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    setProfile((prev) => ({
      ...prev,
      sectionOrder: newOrder,
    }));
  };

  const handleToggleSection = (key: ProfileSectionKey) => {
    setProfile((prev) => {
      const currentVal = prev.sections?.[key] !== false;
      return {
        ...prev,
        sections: {
          ...prev.sections,
          [key]: !currentVal,
        },
      };
    });
  };

  const handleUpdateSectionTitle = (key: ProfileSectionKey, title: string) => {
    setProfile((prev) => ({
      ...prev,
      sectionTitles: {
        ...prev.sectionTitles,
        [key]: title,
      },
    }));
  };

  const handleUpdateSectionSubtitle = (key: ProfileSectionKey, subtitle: string) => {
    setProfile((prev) => ({
      ...prev,
      sectionSubtitles: {
        ...prev.sectionSubtitles,
        [key]: subtitle,
      },
    }));
  };

  const handleApplyPreset = (
    preset: "RESTAURANT" | "CLINIC" | "RETAIL" | "DEFAULT"
  ) => {
    let newOrder: ProfileSectionKey[];
    if (preset === "RESTAURANT") {
      newOrder = [
        "catalog",
        "quickActions",
        "upi",
        "hours",
        "map",
        "reviews",
        "about",
        "social",
        "enquiry",
      ];
    } else if (preset === "CLINIC") {
      newOrder = [
        "enquiry",
        "quickActions",
        "about",
        "catalog",
        "hours",
        "map",
        "reviews",
        "upi",
        "social",
      ];
    } else if (preset === "RETAIL") {
      newOrder = [
        "upi",
        "quickActions",
        "catalog",
        "reviews",
        "hours",
        "map",
        "about",
        "social",
        "enquiry",
      ];
    } else {
      newOrder = [...DEFAULT_SECTION_ORDER];
    }

    setProfile((prev) => ({
      ...prev,
      sectionOrder: newOrder,
    }));
  };

  // Catalog item handlers
  const handleAddCatalogItem = () => {
    const newItem: CatalogItem = {
      id: `item-${Date.now()}`,
      name: "New Service / Item",
      category: profile.catalogCategories?.[0] || "General",
      price: "₹499",
      description: "Brief service summary or item description.",
      badge: "Popular",
    };
    setProfile((prev) => ({
      ...prev,
      catalogItems: [...(prev.catalogItems || []), newItem],
    }));
  };

  const handleUpdateCatalogItem = (
    id: string,
    field: keyof CatalogItem,
    value: string
  ) => {
    setProfile((prev) => ({
      ...prev,
      catalogItems: (prev.catalogItems || []).map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleDeleteCatalogItem = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      catalogItems: (prev.catalogItems || []).filter((item) => item.id !== id),
    }));
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
          businessProfile: profile,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update branding gate settings");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Dynamic Gate Design & Website Builder</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure your active gate template (Business Profile, Google Review, Delivery, Social Hub) with live real-time simulation
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

      {/* Pro Plan Upsell Notice */}
      {!isProOrEnterprise && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 rounded-3xl border border-amber-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-sm font-bold text-amber-950 block">
                Unlock Business Profile & Custom Gates with Pro
              </strong>
              <p className="text-xs text-amber-800/90 mt-0.5 max-w-2xl">
                Upgrade to <strong>Pro Monthly</strong> or <strong>Enterprise</strong> to activate the <strong>Business Profile Mini-Website (with UPI payments, catalog & enquiry)</strong>, <strong>Delivery Hub</strong>, and <strong>Social Hub</strong>.
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
          {/* Section 1: Template Selection (5 Modes) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Select Active Gate Template
                </h2>
                <p className="text-xs text-slate-400">
                  Choose the destination experience when customers tap your NFC cards.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Template 0: Business Profile Mini-Website */}
              <button
                type="button"
                onClick={() => handleSelectTemplate("BUSINESS_PROFILE")}
                className={`p-4 rounded-2xl border text-left transition-all relative col-span-1 sm:col-span-2 cursor-pointer ${
                  gateTemplate === "BUSINESS_PROFILE"
                    ? "border-teal-600 bg-gradient-to-r from-teal-50/80 via-emerald-50/50 to-white ring-2 ring-teal-400/40 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏢</span>
                    <div>
                      <strong className="text-sm font-black text-slate-900 block leading-tight">
                        Business Profile (Customized Mini-Website)
                      </strong>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        UPI Pay • Catalog • Enquiry • EN/TA/HI
                      </span>
                    </div>
                  </div>
                  {gateTemplate === "BUSINESS_PROFILE" && (
                    <CheckCircle className="w-5 h-5 text-teal-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  A high-converting mobile microsite with direct UPI payments, product catalog, appointment WhatsApp leads, and 1-tap contact saving.
                </p>
              </button>

              {/* Template 1: Google Review */}
              <button
                type="button"
                onClick={() => handleSelectTemplate("GOOGLE_REVIEW")}
                className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  gateTemplate === "GOOGLE_REVIEW"
                    ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-300/40"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">⭐</span>
                  {gateTemplate === "GOOGLE_REVIEW" && (
                    <CheckCircle className="w-4 h-4 text-amber-600" />
                  )}
                </div>
                <strong className="text-xs font-bold text-slate-900 block">
                  Google Review Smart Gate
                </strong>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  4-5★ routes to Google Review with AI suggestions; 1-3★ opens private manager feedback form.
                </p>
              </button>

              {/* Template 2: Food Delivery & Dining */}
              <button
                type="button"
                onClick={() => handleSelectTemplate("DELIVERY_DINING")}
                className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  gateTemplate === "DELIVERY_DINING"
                    ? "border-rose-500 bg-rose-50/60 ring-2 ring-rose-300/40"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">🛵</span>
                  {gateTemplate === "DELIVERY_DINING" && (
                    <CheckCircle className="w-4 h-4 text-rose-600" />
                  )}
                </div>
                <strong className="text-xs font-bold text-slate-900 block">
                  Swiggy & Zomato Delivery Hub
                </strong>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Showcase Swiggy, Zomato, phone takeaway orders, and special promo offers.
                </p>
              </button>

              {/* Template 3: Social Media Hub */}
              <button
                type="button"
                onClick={() => handleSelectTemplate("SOCIAL_HUB")}
                className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  gateTemplate === "SOCIAL_HUB"
                    ? "border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-300/40"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">📱</span>
                  {gateTemplate === "SOCIAL_HUB" && (
                    <CheckCircle className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <strong className="text-xs font-bold text-slate-900 block">
                  Social Media Hub
                </strong>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Grow your followers on Instagram, Facebook, and YouTube with 1-tap links.
                </p>
              </button>

              {/* Template 4: Custom URL / Menu */}
              <button
                type="button"
                onClick={() => handleSelectTemplate("CUSTOM_REDIRECT")}
                className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  gateTemplate === "CUSTOM_REDIRECT"
                    ? "border-purple-500 bg-purple-50/60 ring-2 ring-purple-300/40"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">📖</span>
                  {gateTemplate === "CUSTOM_REDIRECT" && (
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                  )}
                </div>
                <strong className="text-xs font-bold text-slate-900 block">
                  Online Menu / Custom Link
                </strong>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Redirect customers to your digital PDF menu, website catalog, or table ordering URL.
                </p>
              </button>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: BUSINESS PROFILE CUSTOMIZER (MODULAR TABS) */}
          {gateTemplate === "BUSINESS_PROFILE" && (
            <div className="space-y-4 pt-1 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>Business Profile Microsite Studio</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Customize every section of your mini-website with instant live preview.
                  </p>
                </div>
              </div>

              {/* Studio Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto scrollbar-none">
                {([
                  { id: "tiles", label: "🧱 Tiles & Layout" },
                  { id: "theme", label: "🎨 Theme, Banner & Logo" },
                  { id: "upi", label: "💳 UPI Payment" },
                  { id: "catalog", label: "🍱 Menu & Catalog" },
                  { id: "enquiry", label: "📅 Enquiry Form" },
                  { id: "contact", label: "📍 Contact & Hours" },
                ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveProfileTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      activeProfileTab === tab.id
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB 0: Dynamic Tiles & Placement Layout */}
              {activeProfileTab === "tiles" && (
                <div className="space-y-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 animate-in fade-in">
                  {/* Banner notice */}
                  <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>Banner & Profile Fixed at Top</span>
                    </div>
                    <p className="text-[11px] text-teal-800 leading-relaxed">
                      Your hero banner, cover photo, logo, language switcher, and tagline stay anchored at the top. Below the banner, you can <strong>turn each tile ON or OFF</strong>, <strong>rearrange their sequence</strong>, and <strong>rename each tile</strong>.
                    </p>
                  </div>

                  {/* Quick Presets */}
                  <div>
                    <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      1-Click Layout Presets
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => handleApplyPreset("RESTAURANT")}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all cursor-pointer group"
                      >
                        <span className="text-base block mb-0.5">🍕</span>
                        <span className="text-xs font-bold text-slate-900 block group-hover:text-teal-700">
                          Restaurant & Café
                        </span>
                        <span className="text-[10px] text-slate-500 block leading-tight">
                          Menu ➔ Connect ➔ UPI
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyPreset("CLINIC")}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all cursor-pointer group"
                      >
                        <span className="text-base block mb-0.5">🩺</span>
                        <span className="text-xs font-bold text-slate-900 block group-hover:text-teal-700">
                          Doctor & Clinic
                        </span>
                        <span className="text-[10px] text-slate-500 block leading-tight">
                          Booking ➔ Services ➔ Bio
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyPreset("RETAIL")}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all cursor-pointer group"
                      >
                        <span className="text-base block mb-0.5">🛍️</span>
                        <span className="text-xs font-bold text-slate-900 block group-hover:text-teal-700">
                          Retail & Counter
                        </span>
                        <span className="text-[10px] text-slate-500 block leading-tight">
                          UPI Pay ➔ Catalog ➔ Reviews
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyPreset("DEFAULT")}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 text-left transition-all cursor-pointer group"
                      >
                        <span className="text-base block mb-0.5">🔄</span>
                        <span className="text-xs font-bold text-slate-900 block">
                          Reset Order
                        </span>
                        <span className="text-[10px] text-slate-500 block leading-tight">
                          Standard Default
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Re-orderable Tiles List */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      <span>Tile Blocks Order ({currentOrder.length} Tiles)</span>
                      <span className="text-slate-400 font-normal">Use ⬆️ ⬇️ to rearrange order</span>
                    </div>

                    {currentOrder.map((sectionKey, index) => {
                      const meta = SECTION_METADATA[sectionKey];
                      const isEnabled = profile.sections?.[sectionKey] !== false;
                      const customTitle = profile.sectionTitles?.[sectionKey] || "";
                      const customSubtitle = profile.sectionSubtitles?.[sectionKey] || "";
                      const isFirst = index === 0;
                      const isLast = index === currentOrder.length - 1;

                      return (
                        <div
                          key={sectionKey}
                          className={`p-3 sm:p-3.5 rounded-2xl border transition-all ${
                            isEnabled
                              ? "bg-white border-slate-200 shadow-2xs hover:border-slate-300"
                              : "bg-slate-100/70 border-dashed border-slate-300 opacity-60"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {/* Left: Position badge, Icon, Tile Title */}
                            <div className="flex items-center gap-2.5 min-w-0">
                              {/* Reorder Buttons */}
                              <div className="flex flex-col gap-0.5 shrink-0">
                                <button
                                  type="button"
                                  disabled={isFirst}
                                  onClick={() => handleMoveSection(index, "up")}
                                  className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                                  title="Move Tile Up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={isLast}
                                  onClick={() => handleMoveSection(index, "down")}
                                  className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                                  title="Move Tile Down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Position Index Badge */}
                              <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                                {index + 1}
                              </span>

                              {/* Section Icon & Info */}
                              <div className="text-xl shrink-0">{meta.icon}</div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-slate-900 truncate">
                                    {sectionKey === "quickActions"
                                      ? meta.defaultTitle
                                      : customTitle
                                      ? customTitle
                                      : meta.defaultTitle}
                                  </span>
                                  {sectionKey !== "quickActions" && customTitle && (
                                    <span className="text-[10px] text-teal-600 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded font-semibold shrink-0">
                                      Renamed
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500 block truncate">
                                  {meta.description}
                                </span>
                              </div>
                            </div>

                            {/* Right: Toggle Switch & Config shortcut */}
                            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                              {/* Quick tab link if relevant */}
                              {sectionKey === "catalog" && (
                                <button
                                  type="button"
                                  onClick={() => setActiveProfileTab("catalog")}
                                  className="text-[11px] font-semibold text-teal-700 hover:underline cursor-pointer mr-1"
                                >
                                  Edit Items ➔
                                </button>
                              )}
                              {sectionKey === "upi" && (
                                <button
                                  type="button"
                                  onClick={() => setActiveProfileTab("upi")}
                                  className="text-[11px] font-semibold text-teal-700 hover:underline cursor-pointer mr-1"
                                >
                                  Set UPI ID ➔
                                </button>
                              )}
                              {sectionKey === "enquiry" && (
                                <button
                                  type="button"
                                  onClick={() => setActiveProfileTab("enquiry")}
                                  className="text-[11px] font-semibold text-teal-700 hover:underline cursor-pointer mr-1"
                                >
                                  Settings ➔
                                </button>
                              )}

                              {/* Visibility Toggle Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleSection(sectionKey)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  isEnabled
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                                    : "bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300"
                                }`}
                              >
                                {isEnabled ? (
                                  <>
                                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>ON</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                                    <span>OFF</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Quick Connect Configuration or Tile Title/Subtitle */}
                          {isEnabled && (
                            sectionKey === "quickActions" ? (
                              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
                                <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200/80 space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                                      <span>⚡</span> Phone & WhatsApp Contact Setup
                                    </span>
                                    <span className="text-[10px] text-teal-700 font-bold bg-white px-2 py-0.5 rounded-md border border-teal-300/60 shadow-2xs">
                                      Powers Call, WhatsApp & Save Contact
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Primary Phone Input */}
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-1">
                                        Phone / Mobile Number *
                                      </label>
                                      <input
                                        type="tel"
                                        value={profile.contactPhone || ""}
                                        onChange={(e) => handlePhoneChange(e.target.value)}
                                        placeholder="+91 98765 43210"
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-2xs"
                                      />
                                      <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                                        Powers the <strong>Call</strong> and <strong>Save Contact</strong> buttons.
                                      </p>
                                    </div>

                                    {/* WhatsApp Input with Same as Phone Checkbox */}
                                    <div>
                                      <div className="flex items-center justify-between mb-1">
                                        <label className="block text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                                          WhatsApp Number
                                        </label>
                                        <label className="inline-flex items-center gap-1.5 text-[10px] font-bold text-teal-800 cursor-pointer select-none">
                                          <input
                                            type="checkbox"
                                            checked={whatsappSameAsPhone}
                                            onChange={(e) => handleToggleSameWhatsapp(e.target.checked)}
                                            className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5 cursor-pointer"
                                          />
                                          <span>Same as phone</span>
                                        </label>
                                      </div>

                                      {whatsappSameAsPhone ? (
                                        <div className="w-full px-3 py-2 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between">
                                          <span className="truncate">{profile.contactPhone || "Same as phone above"}</span>
                                          <span className="text-[9px] text-teal-800 font-bold bg-teal-100/70 px-1.5 py-0.5 rounded border border-teal-300/60">
                                            Linked
                                          </span>
                                        </div>
                                      ) : (
                                        <input
                                          type="tel"
                                          value={profile.whatsappNumber || ""}
                                          onChange={(e) => updateProfileField("whatsappNumber", e.target.value)}
                                          placeholder="+91 98765 43210"
                                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-2xs"
                                        />
                                      )}
                                      <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                                        Powers the <strong>WhatsApp</strong> chat button.
                                      </p>
                                    </div>
                                  </div>

                                  {/* Save Contact info */}
                                  <div className="pt-2 border-t border-teal-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-slate-700">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-900">📇 Save Contact:</span>
                                      <span>Downloads vCard phone contact for <strong>{profile.contactName || tenant.name}</strong></span>
                                    </div>
                                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100/80 border border-emerald-300/60 px-2 py-0.5 rounded-md inline-block">
                                      Instant .vcf card download
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : sectionKey === "social" ? (
                              <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                                {/* Title and Subtitle */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                      Tile Heading (Default: &quot;{meta.defaultTitle}&quot;)
                                    </label>
                                    <input
                                      type="text"
                                      value={customTitle}
                                      onChange={(e) => handleUpdateSectionTitle(sectionKey, e.target.value)}
                                      placeholder={meta.defaultTitle}
                                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-teal-500 shadow-2xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                      Tile Subtitle (Optional)
                                    </label>
                                    <input
                                      type="text"
                                      value={customSubtitle}
                                      onChange={(e) => handleUpdateSectionSubtitle(sectionKey, e.target.value)}
                                      placeholder={meta.defaultSubtitle}
                                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-teal-500 shadow-2xs"
                                    />
                                  </div>
                                </div>

                                {/* Social Links Setup */}
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                      <span>🌐</span> Social Channel Links
                                    </span>
                                    <span className="text-[10px] text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                                      Only filled links appear on card
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {/* Instagram */}
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                                        Instagram Profile URL / @handle
                                      </label>
                                      <input
                                        type="text"
                                        value={profile.instagramUrl || instagramUrl || ""}
                                        onChange={(e) => handleUpdateSocialLink("instagramUrl", e.target.value)}
                                        placeholder="e.g. @yourbrand or https://instagram.com/..."
                                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-teal-500 shadow-2xs"
                                      />
                                    </div>

                                    {/* X (Twitter) */}
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-black"></span>
                                        X (Twitter) URL / @handle
                                      </label>
                                      <input
                                        type="text"
                                        value={profile.twitterUrl || twitterUrl || ""}
                                        onChange={(e) => handleUpdateSocialLink("twitterUrl", e.target.value)}
                                        placeholder="e.g. @yourbrand or https://x.com/..."
                                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-teal-500 shadow-2xs"
                                      />
                                    </div>

                                    {/* Facebook */}
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                        Facebook Page URL
                                      </label>
                                      <input
                                        type="text"
                                        value={profile.facebookUrl || facebookUrl || ""}
                                        onChange={(e) => handleUpdateSocialLink("facebookUrl", e.target.value)}
                                        placeholder="e.g. https://facebook.com/yourpage"
                                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-teal-500 shadow-2xs"
                                      />
                                    </div>

                                    {/* YouTube */}
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-red-600"></span>
                                        YouTube Channel URL
                                      </label>
                                      <input
                                        type="text"
                                        value={profile.youtubeUrl || youtubeUrl || ""}
                                        onChange={(e) => handleUpdateSocialLink("youtubeUrl", e.target.value)}
                                        placeholder="e.g. https://youtube.com/@yourchannel"
                                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-teal-500 shadow-2xs"
                                      />
                                    </div>
                                  </div>

                                  <p className="text-[10px] text-slate-500 mt-1">
                                    💡 <strong>Smart Icon Visibility:</strong> Only channels with links entered above will show on your profile. Any platform left empty will have its icon automatically hidden.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Tile Heading (Default: &quot;{meta.defaultTitle}&quot;)
                                  </label>
                                  <input
                                    type="text"
                                    value={customTitle}
                                    onChange={(e) => handleUpdateSectionTitle(sectionKey, e.target.value)}
                                    placeholder={meta.defaultTitle}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-teal-500 shadow-2xs"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Tile Subtitle (Optional)
                                  </label>
                                  <input
                                    type="text"
                                    value={customSubtitle}
                                    onChange={(e) => handleUpdateSectionSubtitle(sectionKey, e.target.value)}
                                    placeholder={meta.defaultSubtitle}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-teal-500 shadow-2xs"
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 1: Theme & Cover */}
              {activeProfileTab === "theme" && (
                <div className="space-y-3.5 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Microsite Theme Mode
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Light Mode Card */}
                      <button
                        type="button"
                        onClick={() => updateProfileField("themeStyle", "LIGHT")}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                          (profile.themeStyle || "LIGHT") === "LIGHT" ||
                          profile.themeStyle === "EXECUTIVE" ||
                          profile.themeStyle === "MINIMAL" ||
                          profile.themeStyle === "VIBRANT"
                            ? "border-teal-600 bg-teal-50/70 ring-2 ring-teal-300 shadow-xs"
                            : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl shrink-0">
                            ☀️
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-900 block">
                              Light Mode
                            </span>
                            <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                              Clean, bright & ultra-crisp modern look
                            </span>
                          </div>
                        </div>
                        {((profile.themeStyle || "LIGHT") === "LIGHT" ||
                          profile.themeStyle === "EXECUTIVE" ||
                          profile.themeStyle === "MINIMAL" ||
                          profile.themeStyle === "VIBRANT") && (
                          <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>

                      {/* Dark Mode Card */}
                      <button
                        type="button"
                        onClick={() => updateProfileField("themeStyle", "DARK")}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                          profile.themeStyle === "DARK" || profile.themeStyle === "LUXE_DARK"
                            ? "border-teal-500 bg-slate-900 text-white ring-2 ring-teal-400 shadow-md"
                            : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 text-indigo-300 flex items-center justify-center text-xl shrink-0">
                            🌙
                          </div>
                          <div>
                            <span
                              className={`font-bold text-xs block ${
                                profile.themeStyle === "DARK" || profile.themeStyle === "LUXE_DARK"
                                  ? "text-white"
                                  : "text-slate-900"
                              }`}
                            >
                              Dark Mode
                            </span>
                            <span
                              className={`text-[11px] block leading-tight mt-0.5 ${
                                profile.themeStyle === "DARK" || profile.themeStyle === "LUXE_DARK"
                                  ? "text-slate-300"
                                  : "text-slate-500"
                              }`}
                            >
                              Sleek, deep obsidian luxury aesthetic
                            </span>
                          </div>
                        </div>
                        {(profile.themeStyle === "DARK" || profile.themeStyle === "LUXE_DARK") && (
                          <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Brand Profile Logo */}
                  <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🏷️</span>
                        <div>
                          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Business Profile Logo / Avatar
                          </label>
                          <p className="text-[11px] text-slate-500">
                            Square logo displayed at the center of your profile banner.
                          </p>
                        </div>
                      </div>
                      {(logoUrl || profile.logoUrl) && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Logo</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3.5">
                      {/* Logo Thumbnail Preview */}
                      <div className="relative shrink-0">
                        {(logoUrl || profile.logoUrl) ? (
                          <img
                            src={logoUrl || profile.logoUrl}
                            alt="Logo preview"
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-sm bg-white"
                          />
                        ) : (
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-sm border-2 border-slate-200"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {tenant.name.slice(0, 1)}
                          </div>
                        )}
                      </div>

                      {/* Upload & URL options */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-all cursor-pointer shadow-2xs">
                            <Upload className="w-3.5 h-3.5 text-teal-600" />
                            <span>Upload Logo Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </label>
                          <span className="text-[11px] text-slate-400">or paste image URL:</span>
                        </div>

                        <input
                          type="url"
                          value={logoUrl || profile.logoUrl || ""}
                          onChange={(e) => {
                            setLogoUrl(e.target.value);
                            setProfile((prev) => ({ ...prev, logoUrl: e.target.value }));
                          }}
                          placeholder="https://example.com/logo.png"
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hero Cover Banner */}
                  <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🖼️</span>
                        <div>
                          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Hero Cover Banner
                          </label>
                          <p className="text-[11px] text-slate-500">
                            Landscape photo banner displayed across the top of your microsite.
                          </p>
                        </div>
                      </div>
                      {profile.coverImageUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveCover}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Banner</span>
                        </button>
                      )}
                    </div>

                    {profile.coverImageUrl && (
                      <div className="relative w-full h-24 rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                        <img
                          src={profile.coverImageUrl}
                          alt="Cover banner preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-all cursor-pointer shadow-2xs">
                          <Upload className="w-3.5 h-3.5 text-teal-600" />
                          <span>Upload Banner Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverUpload}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[11px] text-slate-400">or paste banner image URL:</span>
                      </div>

                      <input
                        type="url"
                        value={profile.coverImageUrl || ""}
                        onChange={(e) => updateProfileField("coverImageUrl", e.target.value)}
                        placeholder="https://images.unsplash.com/... or your banner photo URL"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Tagline / Catchphrase
                      </label>
                      <input
                        type="text"
                        value={profile.tagline || ""}
                        onChange={(e) => updateProfileField("tagline", e.target.value)}
                        placeholder="e.g. Award-Winning Dental & Aesthetic Care"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Category Pill
                      </label>
                      <input
                        type="text"
                        value={profile.category || ""}
                        onChange={(e) => updateProfileField("category", e.target.value)}
                        placeholder="e.g. Multi-Specialty Clinic"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      About Us & Story Bio
                    </label>
                    <textarea
                      rows={2}
                      value={profile.bio || ""}
                      onChange={(e) => updateProfileField("bio", e.target.value)}
                      placeholder="Describe your clinic, salon, store, or agency..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: UPI Payment */}
              {activeProfileTab === "upi" && (
                <div className="space-y-3.5 p-4 bg-amber-50/60 rounded-2xl border border-amber-200 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                        Direct UPI Pay & QR Code
                      </h4>
                      <p className="text-[11px] text-amber-800">
                        Customers can tap & pay straight to your bank via GPay, PhonePe, or Paytm.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.enableUpi ?? true}
                        onChange={(e) => updateProfileField("enableUpi", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600" />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Merchant / Shop UPI ID *
                      </label>
                      <input
                        type="text"
                        value={profile.upiId || ""}
                        onChange={(e) => updateProfileField("upiId", e.target.value.trim())}
                        placeholder="e.g. apexclinic@okaxis or 9876543210@paytm"
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Payee Display Name
                      </label>
                      <input
                        type="text"
                        value={profile.upiPayeeName || ""}
                        onChange={(e) => updateProfileField("upiPayeeName", e.target.value)}
                        placeholder="e.g. Apex Health Clinic"
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-medium text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Menu & Product Catalog */}
              {activeProfileTab === "catalog" && (
                <div className="space-y-3.5 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Menu / Product Catalog Items
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Add items, consultations, dishes, or packages with prices and photos.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCatalogItem}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {(profile.catalogItems || []).map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-white border border-slate-200 rounded-2xl space-y-2 relative shadow-2xs"
                      >
                        <button
                          type="button"
                          onClick={() => handleDeleteCatalogItem(item.id)}
                          className="absolute top-2.5 right-2.5 p-1 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pr-6">
                          <div className="sm:col-span-2">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleUpdateCatalogItem(item.id, "name", e.target.value)}
                              placeholder="Item / Service Name"
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={item.price || ""}
                              onChange={(e) => handleUpdateCatalogItem(item.id, "price", e.target.value)}
                              placeholder="Price e.g. ₹999"
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-teal-700"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={item.category || ""}
                            onChange={(e) => handleUpdateCatalogItem(item.id, "category", e.target.value)}
                            placeholder="Category e.g. Treatments, Desserts"
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700"
                          />
                          <input
                            type="text"
                            value={item.badge || ""}
                            onChange={(e) => handleUpdateCatalogItem(item.id, "badge", e.target.value)}
                            placeholder="Badge e.g. Bestseller, Special"
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-amber-700"
                          />
                        </div>

                        <input
                          type="text"
                          value={item.description || ""}
                          onChange={(e) => handleUpdateCatalogItem(item.id, "description", e.target.value)}
                          placeholder="Short description or benefits..."
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: Appointment / Enquiry */}
              {activeProfileTab === "enquiry" && (
                <div className="space-y-3.5 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                        WhatsApp Appointment & Enquiry Form
                      </h4>
                      <p className="text-[11px] text-emerald-800">
                        Sends structured customer bookings and leads directly to your WhatsApp.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.enableEnquiryForm ?? true}
                        onChange={(e) => updateProfileField("enableEnquiryForm", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Recipient WhatsApp Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={profile.enquiryTargetWhatsapp || profile.whatsappNumber || ""}
                      onChange={(e) => updateProfileField("enquiryTargetWhatsapp", e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-medium text-slate-900"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      When a customer taps &quot;Send Enquiry&quot;, it opens a WhatsApp chat with their name, phone, and time pre-filled.
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 5: Contact & Hours */}
              {activeProfileTab === "contact" && (
                <div className="space-y-3.5 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                        Direct Phone / Mobile *
                      </label>
                      <input
                        type="tel"
                        value={profile.contactPhone || ""}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-teal-500 shadow-2xs"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                          WhatsApp Number *
                        </label>
                        <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-800 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={whatsappSameAsPhone}
                            onChange={(e) => handleToggleSameWhatsapp(e.target.checked)}
                            className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>Same as phone</span>
                        </label>
                      </div>

                      {whatsappSameAsPhone ? (
                        <div className="w-full px-3 py-2 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between">
                          <span className="truncate">{profile.contactPhone || "Same as phone"}</span>
                          <span className="text-[9px] text-teal-800 font-bold bg-teal-100/70 px-1.5 py-0.5 rounded border border-teal-300/60">
                            Linked
                          </span>
                        </div>
                      ) : (
                        <input
                          type="tel"
                          value={profile.whatsappNumber || ""}
                          onChange={(e) => updateProfileField("whatsappNumber", e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-teal-500 shadow-2xs"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Physical Store Address
                    </label>
                    <input
                      type="text"
                      value={profile.address || ""}
                      onChange={(e) => updateProfileField("address", e.target.value)}
                      placeholder="e.g. 124 Anna Salai, Teynampet, Chennai"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Operating Hours Summary
                    </label>
                    <input
                      type="text"
                      value={profile.businessHoursText || ""}
                      onChange={(e) => updateProfileField("businessHoursText", e.target.value)}
                      placeholder="Mon - Sat: 9:00 AM - 9:00 PM | Sun: 10:00 AM - 2:00 PM"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 2 (Other templates): Dynamic Template Fields */}
          {gateTemplate !== "BUSINESS_PROFILE" && (
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
                      onChange={(e) => handleUpdateSocialLink("instagramUrl", e.target.value)}
                      placeholder="https://instagram.com/your_handle"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      X (Twitter) Profile URL
                    </label>
                    <input
                      type="url"
                      value={twitterUrl}
                      onChange={(e) => handleUpdateSocialLink("twitterUrl", e.target.value)}
                      placeholder="https://x.com/your_handle"
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
                      onChange={(e) => handleUpdateSocialLink("facebookUrl", e.target.value)}
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
                      onChange={(e) => handleUpdateSocialLink("youtubeUrl", e.target.value)}
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
                      Direct Order / Takeaway Phone
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
                      Target Destination URL *
                    </label>
                    <input
                      type="url"
                      value={customRedirectUrl}
                      onChange={(e) => setCustomRedirectUrl(e.target.value)}
                      placeholder="https://yourbrand.com/menu.pdf"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <hr className="border-slate-100" />

          {/* Section 4: Brand Colors & Logo */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Brand Colors & Logo
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
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Business Logo (Image URL or File Upload)
                </label>
                {(logoUrl || profile.logoUrl) && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-all cursor-pointer shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-teal-600" />
                  <span>Upload Logo File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-slate-400">or paste hosted logo URL:</span>
              </div>
              <input
                type="url"
                value={logoUrl || profile.logoUrl || ""}
                onChange={(e) => {
                  setLogoUrl(e.target.value);
                  setProfile((prev) => ({ ...prev, logoUrl: e.target.value }));
                }}
                placeholder="https://example.com/logo.png"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white font-bold rounded-2xl text-sm shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4 text-teal-400" />
              <span>{isSaving ? "Saving Live..." : "Publish Gate Design Live"}</span>
            </button>
          </div>
        </form>

        {/* Live Smartphone Simulator (5 cols) */}
        <div className="lg:col-span-5 sticky top-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Smartphone className="w-4 h-4 text-teal-600" />
              <span>Real-Time Mobile Simulator</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Live Tap View
            </span>
          </div>

          {/* Smartphone Shell Frame */}
          <div className="w-full max-w-[360px] mx-auto bg-slate-950 rounded-[44px] p-2.5 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700">
            {/* Dynamic Island Notch */}
            <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500/80" />
            </div>

            {/* Screen Inner Content */}
            <div className="bg-[#F8F9FA] rounded-[34px] overflow-hidden min-h-[580px] max-h-[660px] overflow-y-auto border border-slate-200/40 scrollbar-none">
              {gateTemplate === "BUSINESS_PROFILE" ? (
                <BusinessProfileMicrosite
                  cardSlug="preview"
                  tenantName={tenant.name}
                  businessProfile={{
                    ...profile,
                    contactPhone: profile.contactPhone || deliveryPhone || "",
                    whatsappNumber: profile.whatsappNumber || deliveryPhone || "",
                  }}
                  googleReviewUrl={googleReviewUrl}
                  instagramUrl={instagramUrl || profile.instagramUrl || ""}
                  facebookUrl={facebookUrl || profile.facebookUrl || ""}
                  youtubeUrl={youtubeUrl || profile.youtubeUrl || ""}
                  twitterUrl={twitterUrl || profile.twitterUrl || ""}
                  primaryColor={primaryColor}
                  logoUrl={logoUrl || profile.logoUrl || ""}
                  isSimulator={true}
                />
              ) : (
                <div className="p-4 text-center min-h-[540px] flex flex-col justify-between">
                  <div>
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
                      <div className="space-y-3 py-2">
                        <div className="flex justify-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="w-7 h-7 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Tap a star to rate experience
                        </p>
                        <div className="p-2.5 rounded-xl bg-teal-50/80 border border-teal-100 text-[10px] text-teal-800 font-medium">
                          ✨ 4–5★ unlocks 1-click Google Review with ready sentences
                        </div>
                      </div>
                    )}

                    {/* TEMPLATE 2 PREVIEW: SOCIAL HUB */}
                    {gateTemplate === "SOCIAL_HUB" && (
                      <div className="space-y-2 py-1">
                        <div className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200/80 text-left">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                              IG
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
                          <strong className="text-[11px] font-bold text-slate-900">
                            Order on Swiggy
                          </strong>
                          <ArrowRight className="w-3 h-3 text-orange-600" />
                        </div>
                        <div className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-left">
                          <strong className="text-[11px] font-bold text-slate-900">
                            Order on Zomato
                          </strong>
                          <ArrowRight className="w-3 h-3 text-rose-600" />
                        </div>
                      </div>
                    )}

                    {/* TEMPLATE 4 PREVIEW: CUSTOM REDIRECT */}
                    {gateTemplate === "CUSTOM_REDIRECT" && (
                      <div className="py-2 bg-white rounded-2xl p-4 border border-slate-200 text-center space-y-2">
                        <strong className="text-xs font-bold text-slate-900 block">
                          {customRedirectTitle || "Digital Online Menu"}
                        </strong>
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
