"use client";

import React, { useState } from "react";
import {
  Phone,
  MessageSquare,
  MapPin,
  QrCode,
  Globe,
  Clock,
  CreditCard,
  Share2,
  Download,
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

  // Theming definitions
  const theme = profile.themeStyle || "EXECUTIVE";
  const isDark = theme === "LUXE_DARK";

  const bgClass = isDark
    ? "bg-slate-950 text-slate-100"
    : theme === "MINIMAL"
    ? "bg-[#FDFCFB] text-slate-900"
    : "bg-slate-50 text-slate-900";

  const cardClass = isDark
    ? "bg-slate-900/90 border-slate-800 shadow-lg text-slate-100"
    : theme === "MINIMAL"
    ? "bg-white border-zinc-200/70 shadow-2xs text-slate-900"
    : "bg-white border-slate-200/80 shadow-2xs text-slate-900";

  const subtleTextClass = isDark ? "text-slate-400" : "text-slate-500";

  // Handlers
  const handleNav = (url: string) => {
    trackOutcome?.("REDIRECTED");
    if (!isSimulator) {
      window.location.assign(url);
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
        const title = profile.sectionTitles?.quickActions;
        return (
          <div key="quickActions" className="space-y-1.5">
            {title && (
              <h3 className="font-bold text-xs px-1 text-slate-800 dark:text-slate-200">
                {title}
              </h3>
            )}
            <div className="grid grid-cols-4 gap-2">
              {/* Call */}
              {phone ? (
                <button
                  type="button"
                  onClick={() => handleNav(`tel:${phone}`)}
                  className={`p-3 rounded-2xl ${cardClass} hover:border-teal-500 transition-all text-center group cursor-pointer`}
                >
                  <div
                    className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-white mb-1.5 shadow-2xs group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold block leading-tight">
                    {t.callUs}
                  </span>
                </button>
              ) : null}

              {/* WhatsApp */}
              {whatsapp ? (
                <button
                  type="button"
                  onClick={() => {
                    const clean = whatsapp.replace(/[^0-9]/g, "");
                    const msg = encodeURIComponent(
                      profile.whatsappGreeting ||
                        `Hi ${tenantName}, I am reaching out from your Business Card!`
                    );
                    handleNav(
                      `https://wa.me/${
                        clean.length === 10 ? `91${clean}` : clean
                      }?text=${msg}`
                    );
                  }}
                  className={`p-3 rounded-2xl ${cardClass} hover:border-emerald-500 transition-all text-center group cursor-pointer`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white mx-auto flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold block leading-tight">
                    {t.whatsapp}
                  </span>
                </button>
              ) : null}

              {/* Directions */}
              {mapsUrl ? (
                <button
                  type="button"
                  onClick={() => handleNav(mapsUrl)}
                  className={`p-3 rounded-2xl ${cardClass} hover:border-blue-500 transition-all text-center group cursor-pointer`}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white mx-auto flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold block leading-tight">
                    {t.directions}
                  </span>
                </button>
              ) : null}

              {/* Save vCard Contact */}
              {profile.enableVCard !== false && (
                <button
                  type="button"
                  onClick={() => handleNav(`/api/vcard/${cardSlug}`)}
                  className={`p-3 rounded-2xl ${cardClass} hover:border-indigo-500 transition-all text-center group cursor-pointer`}
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white mx-auto flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform">
                    <Download className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold block leading-tight">
                    {t.saveContact}
                  </span>
                </button>
              )}
            </div>
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
        if (!instagramUrl && !facebookUrl && !youtubeUrl) return null;
        const title = profile.sectionTitles?.social || t.socialTitle;
        return (
          <div
            key="social"
            className={`p-4 rounded-2xl ${cardClass} text-center space-y-2.5`}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              {title}
            </span>
            <div className="flex items-center justify-center gap-2">
              {instagramUrl && (
                <button
                  type="button"
                  onClick={() => handleNav(instagramUrl)}
                  className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-2xs hover:scale-105 transition-transform cursor-pointer"
                  title="Instagram"
                >
                  <Globe className="w-4 h-4" />
                </button>
              )}
              {facebookUrl && (
                <button
                  type="button"
                  onClick={() => handleNav(facebookUrl)}
                  className="p-2.5 rounded-xl bg-[#1877F2] text-white shadow-2xs hover:scale-105 transition-transform cursor-pointer"
                  title="Facebook"
                >
                  <Globe className="w-4 h-4" />
                </button>
              )}
              {youtubeUrl && (
                <button
                  type="button"
                  onClick={() => handleNav(youtubeUrl)}
                  className="p-2.5 rounded-xl bg-[#FF0000] text-white shadow-2xs hover:scale-105 transition-transform cursor-pointer"
                  title="YouTube"
                >
                  <Globe className="w-4 h-4" />
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
          {logoUrl ? (
            <img
              src={logoUrl}
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

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {profile.category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {profile.category}
                </span>
              )}

              {googleReviewUrl && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>4.9 (180+ Reviews)</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t.openNow}</span>
              </span>
            </div>
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
    </div>
  );
}
