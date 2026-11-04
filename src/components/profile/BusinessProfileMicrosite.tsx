"use client";

import React, { useState } from "react";
import {
  PhoneCall,
  MessageCircle,
  MapPin,
  QrCode,
  Globe,
  Clock,
  CreditCard,
  Share2,
  UserPlus,
  Check,
  ShieldCheck,
  Star,
  ExternalLink,
  ChevronRight,
  Send,
  Sparkles,
  Copy,
  Utensils,
  Calendar,
} from "lucide-react";
import {
  BusinessProfileData,
  ProfileLanguage,
  PROFILE_TRANSLATIONS,
  DEFAULT_BUSINESS_PROFILE,
  CatalogItem,
  ProfileSectionKey,
  DEFAULT_SECTION_ORDER,
} from "@/lib/business-profile";

export interface BusinessProfileMicrositeProps {
  cardSlug?: string;
  tenantName: string;
  businessProfile?: BusinessProfileData | null;
  googleReviewUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  twitterUrl?: string | null;
  primaryColor?: string;
  logoUrl?: string | null;
  trackOutcome?: (outcome: "REDIRECTED" | "DIRECT_REDIRECT" | "REVIEW_COPIED", rating?: number) => void;
  isSimulator?: boolean;
}

export default function BusinessProfileMicrosite({
  cardSlug = "demo",
  tenantName,
  businessProfile: customProfile,
  googleReviewUrl,
  instagramUrl,
  facebookUrl,
  youtubeUrl,
  twitterUrl,
  primaryColor = "#0D9488",
  logoUrl,
  trackOutcome,
  isSimulator = false,
}: BusinessProfileMicrositeProps) {
  // Merge custom profile with sensible defaults
  const profile: BusinessProfileData = {
    ...DEFAULT_BUSINESS_PROFILE,
    ...customProfile,
    sections: {
      ...DEFAULT_BUSINESS_PROFILE.sections,
      ...customProfile?.sections,
    },
  };

  const [lang, setLang] = useState<ProfileLanguage>("EN");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [actionToast, setActionToast] = useState<{ message: string; icon?: string } | null>(null);

  const showActionToast = (message: string, icon?: string) => {
    setActionToast({ message, icon });
    setTimeout(() => {
      setActionToast(null);
    }, 3200);
  };

  // Enquiry form state
  const [enquiryName, setEnquiryName] = useState("");
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquiryTime, setEnquiryTime] = useState("");
  const [enquiryMessage, setEnquiryMessage] = useState("");

  const t = PROFILE_TRANSLATIONS[lang] || PROFILE_TRANSLATIONS.EN;

  // Contact resolution
  const phone = profile.contactPhone || "";
  const whatsapp = profile.whatsappNumber || profile.contactPhone || "";
  const address = profile.address || "";
  const mapsUrl = profile.googleMapsUrl || (address ? `https://maps.google.com/?q=${encodeURIComponent(`${tenantName} ${address}`)}` : "");
  const upiId = profile.upiId || "";
  const upiPayee = profile.upiPayeeName || tenantName;
  const upiUri = upiId ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiPayee)}&cu=INR` : "";

  // Theming definitions (Light Mode vs Dark Mode)
  const theme = profile.themeStyle || "LIGHT";
  const isDark = theme === "DARK" || theme === "LUXE_DARK";

  const bgClass = isDark
    ? "dark bg-slate-950 text-slate-100"
    : "bg-slate-50 text-slate-900";

  const cardClass = isDark
    ? "bg-slate-900 border-slate-800 shadow-md text-slate-100"
    : "bg-white border-slate-200/90 shadow-2xs text-slate-900";

  const subtleTextClass = isDark ? "text-slate-400" : "text-slate-500";

  // Social links sanitization & detection (only shows if merchant entered their link)
  const sanitizeSocialLink = (
    val?: string | null,
    platform?: "instagram" | "facebook" | "youtube" | "twitter"
  ): string | null => {
    if (!val) return null;
    const trimmed = val.trim();
    if (!trimmed || trimmed === "https://" || trimmed === "http://") return null;

    // Check if it's only a dummy placeholder domain
    const lower = trimmed.toLowerCase().replace(/\/+$/, "");
    const genericDomains = [
      "https://instagram.com",
      "http://instagram.com",
      "instagram.com",
      "https://facebook.com",
      "http://facebook.com",
      "facebook.com",
      "https://youtube.com",
      "http://youtube.com",
      "youtube.com",
      "https://x.com",
      "http://x.com",
      "x.com",
      "https://twitter.com",
      "http://twitter.com",
      "twitter.com",
    ];
    if (genericDomains.includes(lower)) return null;

    // Auto-prefix handles or incomplete URLs
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      const cleanHandle = trimmed.replace(/^@/, "");
      if (!cleanHandle) return null;
      if (platform === "instagram") return `https://instagram.com/${cleanHandle}`;
      if (platform === "twitter") return `https://x.com/${cleanHandle}`;
      if (platform === "facebook") return `https://facebook.com/${cleanHandle}`;
      if (platform === "youtube") return `https://youtube.com/@${cleanHandle}`;
      return `https://${trimmed}`;
    }

    return trimmed;
  };

  const activeInstagram = sanitizeSocialLink(profile.instagramUrl || instagramUrl, "instagram");
  const activeTwitter = sanitizeSocialLink(profile.twitterUrl || twitterUrl, "twitter");
  const activeFacebook = sanitizeSocialLink(profile.facebookUrl || facebookUrl, "facebook");
  const activeYoutube = sanitizeSocialLink(profile.youtubeUrl || youtubeUrl, "youtube");

  // Handlers
  const handleNav = (url: string) => {
    trackOutcome?.("REDIRECTED");
    if (!isSimulator) {
      window.location.assign(url);
    } else {
      showActionToast(`Redirecting to: ${url}`, "🔗");
    }
  };

  const handleSocialClick = (url: string, platformName: string) => {
    trackOutcome?.("REDIRECTED");
    if (isSimulator) {
      showActionToast(`Opening ${platformName}...`, "🌐");
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleQuickCall = () => {
    trackOutcome?.("REDIRECTED");
    const targetPhone = phone || whatsapp;
    if (!targetPhone) {
      showActionToast("Please set your phone number in Quick Connect settings.", "📞");
      return;
    }
    if (isSimulator) {
      showActionToast(`Calling ${targetPhone} (In live tap, opens phone dialer)`, "📞");
    } else {
      window.location.assign(`tel:${targetPhone.replace(/\s+/g, "")}`);
    }
  };

  const handleQuickWhatsapp = () => {
    trackOutcome?.("REDIRECTED");
    const targetWhatsapp = whatsapp || phone;
    if (!targetWhatsapp) {
      showActionToast("Please set your WhatsApp number in Quick Connect settings.", "💬");
      return;
    }
    const clean = targetWhatsapp.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(
      profile.whatsappGreeting ||
        `Hi ${tenantName}, I am reaching out from your Business Profile!`
    );
    const waUrl = `https://wa.me/${clean.length === 10 ? `91${clean}` : clean}?text=${msg}`;

    if (isSimulator) {
      showActionToast(`Opening WhatsApp chat with ${targetWhatsapp}...`, "💬");
    } else {
      window.location.assign(waUrl);
    }
  };

  const handleQuickDirections = () => {
    trackOutcome?.("REDIRECTED");
    const targetMapsUrl =
      mapsUrl ||
      (address
        ? `https://maps.google.com/?q=${encodeURIComponent(`${tenantName} ${address}`)}`
        : `https://maps.google.com/?q=${encodeURIComponent(tenantName)}`);

    if (isSimulator) {
      showActionToast(`Opening Google Maps directions for "${tenantName}"...`, "📍");
    } else {
      window.location.assign(targetMapsUrl);
    }
  };

  const handleQuickSaveContact = () => {
    trackOutcome?.("REDIRECTED");
    const vcardName = (profile.contactName || tenantName).trim();
    const contactNumber = phone || whatsapp || "";
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${vcardName.replace(/[;\n]/g, " ")}`,
      `ORG:${tenantName.replace(/[;\n]/g, " ")}`,
      `TITLE:${(profile.category || "Business").replace(/[;\n]/g, " ")}`,
      contactNumber ? `TEL;TYPE=CELL,VOICE:${contactNumber}` : "",
      whatsapp && whatsapp !== contactNumber ? `TEL;TYPE=WORK,VOICE:${whatsapp}` : "",
      profile.contactEmail ? `EMAIL;TYPE=PREF,INTERNET:${profile.contactEmail}` : "",
      profile.address ? `ADR;TYPE=WORK:;;${profile.address.replace(/[;\n]/g, ", ")};;;;` : "",
      "PRODID:-//TapGate//Smart NFC Business Card//EN",
      "END:VCARD",
    ]
      .filter(Boolean)
      .join("\r\n");

    try {
      const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.setAttribute(
        "download",
        `${vcardName.replace(/[^a-zA-Z0-9_-]/g, "_") || "Contact"}.vcf`
      );
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);

      showActionToast(`Downloaded contact card for "${vcardName}"!`, "📇");
    } catch {
      if (!isSimulator && cardSlug) {
        const fallbackLink = document.createElement("a");
        fallbackLink.href = `/api/vcard/${cardSlug}`;
        fallbackLink.setAttribute("download", `${vcardName}.vcf`);
        document.body.appendChild(fallbackLink);
        fallbackLink.click();
        document.body.removeChild(fallbackLink);
      } else {
        showActionToast(`Saved contact for "${vcardName}"!`, "📇");
      }
    }
  };

  const handleCopyUpi = () => {
    if (upiId) {
      navigator.clipboard?.writeText(upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share && !isSimulator) {
      navigator.share({ title: tenantName, url }).catch(() => {});
    } else if (url) {
      navigator.clipboard?.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleSendEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryName.trim() || !enquiryPhone.trim()) return;

    const target = profile.enquiryTargetWhatsapp || profile.whatsappNumber || "";
    const cleanTarget = target.replace(/[^0-9]/g, "");

    const text = `🌟 *New Enquiry from TapGate Business Profile*\n👤 *Name:* ${enquiryName}\n📞 *Phone:* ${enquiryPhone}\n🕒 *Preferred Time:* ${enquiryTime || "Flexible"}\n📝 *Requirement:* ${enquiryMessage || "General Enquiry"}\n📍 *Business:* ${tenantName}`;

    const waUrl = `https://wa.me/${cleanTarget ? (cleanTarget.length === 10 ? `91${cleanTarget}` : cleanTarget) : ""}?text=${encodeURIComponent(text)}`;
    trackOutcome?.("REDIRECTED");

    if (!isSimulator) {
      window.open(waUrl, "_blank");
    } else {
      alert("Enquiry formatted! In live tap, this opens WhatsApp immediately.");
    }
  };

  // Catalog filtering
  const categories: string[] = [
    "All",
    ...(profile.catalogCategories && profile.catalogCategories.length > 0
      ? profile.catalogCategories
      : Array.from(new Set((profile.catalogItems || []).map((i) => i.category).filter(Boolean)))),
  ];

  const filteredItems: CatalogItem[] = (profile.catalogItems || []).filter(
    (item) => activeCategory === "All" || item.category === activeCategory
  );

  const rawOrder = profile.sectionOrder || DEFAULT_SECTION_ORDER;
  const effectiveSectionOrder: ProfileSectionKey[] = [
    ...rawOrder.filter((k) => DEFAULT_SECTION_ORDER.includes(k)),
    ...DEFAULT_SECTION_ORDER.filter((k) => !rawOrder.includes(k)),
  ];

  const renderSection = (sectionKey: ProfileSectionKey) => {
    // Check if section is toggled OFF
    if (profile.sections?.[sectionKey] === false) {
      return null;
    }

    switch (sectionKey) {
      case "quickActions": {
        return (
          <div key="quickActions" className="grid grid-cols-4 gap-2 sm:gap-2.5">
            {/* 1. Call */}
            <button
              type="button"
              onClick={handleQuickCall}
              className={`group relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                isDark
                  ? "bg-slate-900 border border-slate-800 shadow-md hover:border-emerald-500/60 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  : "bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-500/60 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0"
              }`}
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-200 mb-1.5">
                <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold leading-tight truncate w-full text-center text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {t.callUs}
              </span>
              <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5 uppercase tracking-wider scale-95">
                Call
              </span>
            </button>

            {/* 2. WhatsApp */}
            <button
              type="button"
              onClick={handleQuickWhatsapp}
              className={`group relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                isDark
                  ? "bg-slate-900 border border-slate-800 shadow-md hover:border-green-500/60 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  : "bg-white border border-slate-200/90 shadow-2xs hover:border-green-500/60 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0"
              }`}
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#1ebe5d] text-white flex items-center justify-center shadow-sm shadow-green-500/20 group-hover:scale-110 transition-transform duration-200 mb-1.5">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold leading-tight truncate w-full text-center text-slate-800 dark:text-slate-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {t.whatsapp}
              </span>
              <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5 uppercase tracking-wider scale-95">
                Chat
              </span>
            </button>

            {/* 3. Directions */}
            <button
              type="button"
              onClick={handleQuickDirections}
              className={`group relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                isDark
                  ? "bg-slate-900 border border-slate-800 shadow-md hover:border-blue-500/60 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  : "bg-white border border-slate-200/90 shadow-2xs hover:border-blue-500/60 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0"
              }`}
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20 group-hover:scale-110 transition-transform duration-200 mb-1.5">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold leading-tight truncate w-full text-center text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {t.directions}
              </span>
              <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5 uppercase tracking-wider scale-95">
                Map
              </span>
            </button>

            {/* 4. Save Contact */}
            <button
              type="button"
              onClick={handleQuickSaveContact}
              className={`group relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                isDark
                  ? "bg-slate-900 border border-slate-800 shadow-md hover:border-violet-500/60 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  : "bg-white border border-slate-200/90 shadow-2xs hover:border-violet-500/60 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0"
              }`}
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 text-white flex items-center justify-center shadow-sm shadow-violet-500/20 group-hover:scale-110 transition-transform duration-200 mb-1.5">
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold leading-tight truncate w-full text-center text-slate-800 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                {t.saveContact}
              </span>
              <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5 uppercase tracking-wider scale-95">
                Save
              </span>
            </button>
          </div>
        );
      }

      case "upi": {
        if (!profile.enableUpi || !upiId) return null;
        const title = profile.sectionTitles?.upi || t.upiTitle;
        const subtitle = profile.sectionSubtitles?.upi || t.upiSubtitle;
        return (
          <div
            key="upi"
            className={`p-4 sm:p-5 rounded-3xl ${cardClass} border border-amber-300/80 dark:border-amber-800/80 relative overflow-hidden`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm">{title}</h3>
                  <p className={`text-[10px] ${subtleTextClass}`}>{subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200">
                  BHIM • UPI
                </span>
              </div>
            </div>

            {/* UPI ID Badge with Copy */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700 mb-3 text-xs">
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                {upiId}
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              >
                {copiedUpi ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{t.copyUpi}</span>
                  </>
                )}
              </button>
            </div>

            {/* Pay Now Button & QR Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href={upiUri}
                onClick={() => trackOutcome?.("REDIRECTED")}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-2xl text-xs shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>{t.payNow}</span>
              </a>

              <button
                type="button"
                onClick={() => setShowQrModal(!showQrModal)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{showQrModal ? t.hideQr : t.scanQr}</span>
              </button>
            </div>

            {/* Expandable UPI QR Code Card */}
            {showQrModal && (
              <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800 text-center animate-in fade-in zoom-in-95">
                <div className="bg-white p-3 rounded-2xl inline-block shadow-md border border-slate-200 mx-auto">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                      upiUri
                    )}`}
                    alt="UPI QR Code"
                    className="w-44 h-44 mx-auto"
                  />
                </div>
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-2">
                  Scan with Google Pay, PhonePe, or Paytm
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Payee: {upiPayee}
                </p>
              </div>
            )}
          </div>
        );
      }

      case "catalog": {
        if (filteredItems.length === 0) return null;
        const title = profile.sectionTitles?.catalog || t.catalogTitle;
        const subtitle = profile.sectionSubtitles?.catalog || t.catalogSubtitle;
        return (
          <div
            key="catalog"
            className={`p-4 sm:p-5 rounded-3xl ${cardClass} space-y-3.5`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs sm:text-sm">{title}</h3>
                <p className={`text-[10px] ${subtleTextClass}`}>{subtitle}</p>
              </div>
              <Utensils className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>

            {/* Category Filter Pills */}
            {categories.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      activeCategory === cat
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {cat === "All" ? t.allCategories : cat}
                  </button>
                ))}
              </div>
            )}

            {/* Items List */}
            <div className="space-y-2.5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 flex items-start gap-3 hover:border-slate-300 transition-colors"
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-2xs border border-slate-100"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 leading-snug">
                        {item.name}
                      </h4>
                      {item.price && (
                        <span
                          className="font-black text-xs px-2 py-0.5 rounded-lg text-white shrink-0 shadow-2xs"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {item.price}
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p
                        className={`text-[11px] ${subtleTextClass} leading-relaxed mt-0.5 line-clamp-2`}
                      >
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-slate-200/40 dark:border-slate-800 text-[10px]">
                      {item.badge ? (
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          ★ {item.badge}
                        </span>
                      ) : (
                        <span />
                      )}

                      {whatsapp && (
                        <button
                          type="button"
                          onClick={() => {
                            const clean = whatsapp.replace(/[^0-9]/g, "");
                            const msg = encodeURIComponent(
                              `Hi ${tenantName}, I am interested in "${
                                item.name
                              }" (${item.price || ""}). Could you share more details?`
                            );
                            handleNav(
                              `https://wa.me/${
                                clean.length === 10 ? `91${clean}` : clean
                              }?text=${msg}`
                            );
                          }}
                          className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          <span>{t.enquireItem}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "enquiry": {
        if (!profile.enableEnquiryForm) return null;
        const title = profile.sectionTitles?.enquiry || t.enquiryTitle;
        const subtitle = profile.sectionSubtitles?.enquiry || t.enquirySubtitle;
        return (
          <div
            key="enquiry"
            className={`p-4 sm:p-5 rounded-3xl ${cardClass} space-y-3.5`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shadow-2xs"
                style={{ backgroundColor: primaryColor }}
              >
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm">{title}</h3>
                <p className={`text-[10px] ${subtleTextClass}`}>{subtitle}</p>
              </div>
            </div>

            <form onSubmit={handleSendEnquiry} className="space-y-2.5 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                    {t.nameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={enquiryName}
                    onChange={(e) => setEnquiryName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                    {t.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    required
                    value={enquiryPhone}
                    onChange={(e) => setEnquiryPhone(e.target.value)}
                    placeholder={t.phonePlaceholder}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                  {t.timeLabel}
                </label>
                <input
                  type="text"
                  value={enquiryTime}
                  onChange={(e) => setEnquiryTime(e.target.value)}
                  placeholder={t.timePlaceholder}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                  {t.msgLabel}
                </label>
                <textarea
                  rows={2}
                  value={enquiryMessage}
                  onChange={(e) => setEnquiryMessage(e.target.value)}
                  placeholder={t.msgPlaceholder}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold rounded-2xl text-xs shadow-sm transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.sendEnquiry}</span>
              </button>
            </form>
          </div>
        );
      }

      case "about": {
        if (!profile.bio) return null;
        const title = profile.sectionTitles?.about || t.aboutUs;
        return (
          <div
            key="about"
            className={`p-4 sm:p-5 rounded-3xl ${cardClass} space-y-2`}
          >
            <h3 className="font-bold text-xs sm:text-sm">{title}</h3>
            <p className={`text-xs ${subtleTextClass} leading-relaxed`}>
              {profile.bio}
            </p>
          </div>
        );
      }

      case "hours": {
        if (!profile.businessHoursText) return null;
        const title = profile.sectionTitles?.hours || t.hoursTitle;
        return (
          <div
            key="hours"
            className={`p-4 rounded-2xl ${cardClass} flex items-start gap-3`}
          >
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-0.5">
                {title}
              </h4>
              <p
                className={`text-xs ${subtleTextClass} leading-relaxed font-mono`}
              >
                {profile.businessHoursText}
              </p>
            </div>
          </div>
        );
      }

      case "map": {
        if (!address) return null;
        const title = profile.sectionTitles?.map || t.locationTitle;
        return (
          <div key="map" className={`p-4 rounded-2xl ${cardClass} space-y-2.5`}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-0.5">
                  {title}
                </h4>
                <p className={`text-xs ${subtleTextClass} leading-relaxed`}>
                  {address}
                </p>
              </div>
            </div>

            {mapsUrl && (
              <button
                type="button"
                onClick={() => handleNav(mapsUrl)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{t.openMaps}</span>
              </button>
            )}
          </div>
        );
      }

      case "reviews": {
        if (!googleReviewUrl) return null;
        const title = profile.sectionTitles?.reviews || t.reviewsTitle;
        return (
          <button
            key="reviews"
            type="button"
            onClick={() => handleNav(googleReviewUrl)}
            className={`w-full p-3.5 rounded-2xl ${cardClass} hover:border-amber-400 transition-all flex items-center justify-between group cursor-pointer text-left`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  {title}
                </h4>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  {t.rateUs}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>
        );
      }

      case "social": {
        const hasAnySocial = Boolean(
          activeInstagram || activeTwitter || activeFacebook || activeYoutube
        );

        const title = profile.sectionTitles?.social || t.socialTitle;
        const subtitle = profile.sectionSubtitles?.social;

        if (!hasAnySocial) {
          // In simulator mode, show a helpful dashed card so the user knows where to configure links
          if (isSimulator) {
            return (
              <div
                key="social"
                className={`p-4 rounded-2xl ${cardClass} text-center space-y-1.5 border border-dashed border-slate-300 dark:border-slate-700`}
              >
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Globe className="w-4 h-4 text-teal-600" />
                  <span>{title}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  No social links added yet. Enter your Instagram, X, Facebook, or YouTube link in settings to display icons here.
                </p>
              </div>
            );
          }
          // In live customer view: do not render empty tile
          return null;
        }

        return (
          <div
            key="social"
            className={`p-4 sm:p-5 rounded-3xl ${cardClass} text-center space-y-3 relative overflow-hidden`}
          >
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 block">
                {title}
              </span>
              {subtitle && (
                <p className={`text-[11px] ${subtleTextClass} mt-0.5`}>{subtitle}</p>
              )}
            </div>

            <div className="flex items-center justify-center flex-wrap gap-3 pt-1">
              {/* Instagram: ONLY if user provided Instagram link */}
              {activeInstagram && (
                <button
                  type="button"
                  onClick={() => handleSocialClick(activeInstagram, "Instagram")}
                  className="group flex flex-col items-center gap-1 cursor-pointer"
                  title="Follow on Instagram"
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-sm shadow-pink-500/20 group-hover:scale-110 active:scale-95 transition-all duration-200">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    Instagram
                  </span>
                </button>
              )}

              {/* X (formerly Twitter): ONLY if user provided X link */}
              {activeTwitter && (
                <button
                  type="button"
                  onClick={() => handleSocialClick(activeTwitter, "X (Twitter)")}
                  className="group flex flex-col items-center gap-1 cursor-pointer"
                  title="Follow on X"
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-black dark:bg-slate-800 text-white border border-slate-700/50 flex items-center justify-center shadow-sm shadow-slate-900/20 group-hover:scale-110 active:scale-95 transition-all duration-200">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    X
                  </span>
                </button>
              )}

              {/* Facebook: ONLY if user provided Facebook link */}
              {activeFacebook && (
                <button
                  type="button"
                  onClick={() => handleSocialClick(activeFacebook, "Facebook")}
                  className="group flex flex-col items-center gap-1 cursor-pointer"
                  title="Like on Facebook"
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shadow-sm shadow-blue-500/20 group-hover:scale-110 active:scale-95 transition-all duration-200">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    Facebook
                  </span>
                </button>
              )}

              {/* YouTube: ONLY if user provided YouTube link */}
              {activeYoutube && (
                <button
                  type="button"
                  onClick={() => handleSocialClick(activeYoutube, "YouTube")}
                  className="group flex flex-col items-center gap-1 cursor-pointer"
                  title="Subscribe on YouTube"
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FF0000] text-white flex items-center justify-center shadow-sm shadow-red-500/20 group-hover:scale-110 active:scale-95 transition-all duration-200">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    YouTube
                  </span>
                </button>
              )}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div
      className={`w-full min-h-screen ${bgClass} transition-colors duration-200 pb-12`}
      style={{ "--brand-theme": primaryColor } as React.CSSProperties}
    >
      <div className="w-full max-w-lg mx-auto overflow-hidden">
        {/* Floating Top Control Bar: Language Switcher & Share */}
        <div className="sticky top-0 z-30 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(["EN", "TA", "HI"] as ProfileLanguage[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  lang === l
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                }`}
              >
                {l === "EN" ? "EN" : l === "TA" ? "தமிழ்" : "हिन्दी"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>

        {/* Hero Cover Banner */}
        <div className="relative h-36 sm:h-44 w-full overflow-hidden bg-gradient-to-r from-teal-700 via-slate-900 to-indigo-900">
          {profile.coverImageUrl ? (
            <img
              src={profile.coverImageUrl}
              alt={tenantName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full opacity-90"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, #0F172A 100%)`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </div>

        {/* Brand Profile Header */}
        <div className="px-4 sm:px-6 relative -mt-14 mb-5 text-center">
          {(profile.logoUrl || logoUrl) ? (
            <img
              src={profile.logoUrl || logoUrl || ""}
              alt={tenantName}
              className="w-24 h-24 rounded-3xl mx-auto object-cover shadow-xl border-4 border-white dark:border-slate-900 bg-white"
            />
          ) : (
            <div
              className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center text-3xl font-black text-white shadow-xl border-4 border-white dark:border-slate-900"
              style={{ backgroundColor: primaryColor }}
            >
              {tenantName.slice(0, 1)}
            </div>
          )}

          <div className="mt-3 space-y-1">
            <div className="inline-flex items-center gap-1.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                {tenantName}
              </h1>
              <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
            </div>

            {profile.tagline && (
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                {profile.tagline}
              </p>
            )}

            {profile.category && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {profile.category}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-6 space-y-4">
          {effectiveSectionOrder.map((sectionKey) => renderSection(sectionKey))}

          {/* Footer */}
          <footer className={`text-center py-4 text-[10px] ${subtleTextClass}`}>
            {t.poweredBy}
          </footer>
        </div>
      </div>

      {/* Floating Interactive Toast Feedback */}
      {actionToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] bg-slate-900/95 dark:bg-slate-800/95 text-white backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none">
          <span className="text-xl shrink-0">{actionToast.icon || "⚡"}</span>
          <p className="text-xs font-semibold leading-snug flex-1">{actionToast.message}</p>
        </div>
      )}
    </div>
  );
}
