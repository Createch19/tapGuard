"use client";

import React, { useState } from "react";
import {
  Star,
  CheckCircle,
  HeartHandshake,
  Send,
  ArrowRight,
  Copy,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface ReviewGateProps {
  cardId: string;
  cardSlug: string;
  cardLabel?: string | null;
  tenantId: string;
  tenantName: string;
  gateTemplate?: "GOOGLE_REVIEW" | "SOCIAL_HUB" | "DELIVERY_DINING" | "CUSTOM_REDIRECT";
  googleReviewUrl: string;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  swiggyUrl?: string | null;
  zomatoUrl?: string | null;
  deliveryOfferText?: string | null;
  deliveryPhone?: string | null;
  customRedirectUrl?: string | null;
  customRedirectTitle?: string | null;
  greetingTitle: string;
  greetingSubtitle?: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string | null;
  tapEventId?: string | null;
  keywordConfig?: {
    isEnabled: boolean;
    primaryLanguage: string;
    enabledLanguages: string[];
    sentenceBundle: Record<string, string[]>;
  } | null;
}

const STAR_LABELS = [
  "Click to rate",
  "Disappointed",
  "Needs Improvement",
  "It was okay",
  "Very Good!",
  "Outstanding!",
];

export default function ReviewGateClient({
  cardId,
  tenantId,
  tenantName,
  gateTemplate = "GOOGLE_REVIEW",
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
  greetingTitle,
  greetingSubtitle,
  primaryColor,
  logoUrl,
  tapEventId,
  keywordConfig,
}: ReviewGateProps) {
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [step, setStep] = useState<"rating" | "positive" | "feedback" | "submitted">("rating");

  // Keyword Review Generator State
  const initialLang = keywordConfig?.primaryLanguage || "EN";
  const [selectedLang, setSelectedLang] = useState<string>(initialLang);
  const [sentenceIdx, setSentenceIdx] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Private feedback form state
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const trackOutcome = (outcome: "REDIRECTED" | "DIRECT_REDIRECT" = "REDIRECTED", rating?: number) => {
    if (tapEventId) {
      fetch("/api/tap/outcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tapEventId,
          rating: rating ?? null,
          outcome,
        }),
      }).catch(() => {});
    }
  };

  const handleExternalNav = (url: string) => {
    trackOutcome("REDIRECTED");
    window.location.href = url;
  };

  const handleStarClick = async (star: number) => {
    setSelectedRating(star);

    if (star >= 4) {
      setStep("positive");
      trackOutcome("REDIRECTED", star);
      // Auto-redirect only if keyword review suggestion is disabled
      if (!keywordConfig?.isEnabled && googleReviewUrl) {
        setTimeout(() => {
          window.location.href = googleReviewUrl;
        }, 1200);
      }
    } else {
      setStep("feedback");
    }
  };

  // Keyword Sentence Helpers
  const normSelectedLang = (selectedLang || initialLang || "EN").toUpperCase();
  const currentLangBundle =
    keywordConfig?.sentenceBundle?.[normSelectedLang] ||
    keywordConfig?.sentenceBundle?.[selectedLang] ||
    keywordConfig?.sentenceBundle?.["EN"] ||
    [];
  const currentSentence =
    currentLangBundle.length > 0
      ? currentLangBundle[sentenceIdx % currentLangBundle.length]
      : "";

  const handleShuffleSentence = () => {
    setSentenceIdx((prev) => prev + 1);
    setIsCopied(false);
  };

  const handleCopyAndOpenGoogle = () => {
    if (currentSentence) {
      navigator.clipboard.writeText(currentSentence);
      setIsCopied(true);
      trackOutcome("REVIEW_COPIED" as any, selectedRating);
      setTimeout(() => {
        if (googleReviewUrl) {
          window.location.href = googleReviewUrl;
        }
      }, 700);
    } else if (googleReviewUrl) {
      trackOutcome("REDIRECTED", selectedRating);
      window.location.href = googleReviewUrl;
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      setSubmitError("Please share a few words about what went wrong.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tapEventId: tapEventId || "anonymous",
          cardId,
          tenantId,
          rating: selectedRating,
          feedbackText,
          phoneNumber,
          customerName,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit feedback");
      }

      setStep("submitted");
    } catch {
      setSubmitError("Could not submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between p-4 sm:p-6"
      style={
        {
          "--tenant-theme": primaryColor,
        } as React.CSSProperties
      }
    >
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm text-center">
          {/* Header Brand Avatar & Name */}
          <div className="mb-6">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={tenantName}
                className="w-16 h-16 rounded-2xl mx-auto mb-3 object-cover shadow-2xs border border-slate-100"
              />
            ) : (
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 font-bold text-xl text-white shadow-2xs"
                style={{ backgroundColor: primaryColor }}
              >
                {tenantName.slice(0, 1)}
              </div>
            )}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold mb-2">
              <span>{tenantName}</span>
              <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 leading-snug">
              {greetingTitle}
            </h1>
            {greetingSubtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                {greetingSubtitle}
              </p>
            )}
          </div>

          {/* TEMPLATE 1: GOOGLE REVIEW SMART GATE */}
          {gateTemplate === "GOOGLE_REVIEW" && (
            <>
              {/* STEP 1: INITIAL STAR RATING */}
              {step === "rating" && (
                <div className="py-4">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        aria-label={`${star} star rating`}
                        className="p-1.5 focus:outline-none transition-transform hover:scale-125 active:scale-95"
                      >
                        <Star
                          className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                            (hoveredStar || selectedRating) >= star
                              ? "fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.4)]"
                              : "fill-slate-100 text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm font-medium text-slate-600 h-6">
                    {STAR_LABELS[hoveredStar || selectedRating]}
                  </p>
                  <p className="text-xs text-slate-400 mt-4">
                    Tap a star above to rate your experience
                  </p>

                  {keywordConfig?.isEnabled && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-teal-700 bg-teal-50/80 py-2 px-3 rounded-xl font-medium animate-in fade-in">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>Rate 4–5★ to get a 1-click ready review for Google!</span>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: POSITIVE 4-5 STARS (REDIRECT TO GOOGLE WITH KEYWORD REVIEW) */}
              {step === "positive" && (
                <div className="py-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3 border border-teal-200">
                    <CheckCircle className="w-7 h-7" />
                  </div>

                  <div className="flex justify-center gap-1 mb-2">
                    {Array.from({ length: selectedRating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    Thank You for {selectedRating} Stars!
                  </h3>

                  {keywordConfig?.isEnabled && currentSentence ? (
                    <>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">
                        Help others find us on Google! We prepared a quick review for you:
                      </p>

                      {/* Language Selection Tabs */}
                      {keywordConfig.enabledLanguages.length > 1 && (
                        <div className="flex items-center justify-center gap-1 mb-3 overflow-x-auto p-1 bg-slate-100 rounded-xl">
                          {keywordConfig.enabledLanguages.map((langCode) => {
                            const isSelected = selectedLang === langCode;
                            const label =
                              langCode === "TANGLISH"
                                ? "🌴 Tanglish"
                                : langCode === "TA"
                                ? "🇮🇳 தமிழ்"
                                : langCode === "HI"
                                ? "🇮🇳 हिन्दी"
                                : langCode === "TE"
                                ? "🇮🇳 తెలుగు"
                                : langCode === "KN"
                                ? "🇮🇳 ಕನ್ನಡ"
                                : "🌐 English";
                            return (
                              <button
                                key={langCode}
                                type="button"
                                onClick={() => {
                                  setSelectedLang(langCode);
                                  setIsCopied(false);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                                  isSelected
                                    ? "bg-white text-slate-900 shadow-xs"
                                    : "text-slate-500 hover:text-slate-800"
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Suggested Review Card */}
                      <div className="relative bg-slate-50 border border-slate-200/90 rounded-2xl p-4 mb-3 text-left">
                        <span className="text-xl text-teal-600 font-serif leading-none block mb-1">
                          “
                        </span>
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                          {currentSentence}
                        </p>
                        <span className="text-xl text-teal-600 font-serif leading-none block text-right mt-1">
                          ”
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={handleCopyAndOpenGoogle}
                          className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 text-white font-semibold rounded-2xl shadow-sm transition-all text-sm group cursor-pointer active:scale-98"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {isCopied ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-white" />
                              <span>Copied! Opening Google...</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy Review & Open Google</span>
                              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleShuffleSentence}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Try Another (Non-Repeating)</span>
                        </button>
                      </div>

                      <a
                        href={googleReviewUrl || "https://google.com"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackOutcome("REDIRECTED", selectedRating)}
                        className="block mt-3 text-xs text-slate-400 hover:text-slate-600 underline"
                      >
                        Skip & write my own review on Google
                      </a>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-slate-600 leading-relaxed mb-6">
                        Your 5-star experience means the world to our team! Taking you to
                        Google Reviews to share your rating with others...
                      </p>

                      <a
                        href={googleReviewUrl || "https://google.com"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-3 px-5 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-2xl shadow-sm transition-all text-sm group"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <span>Write Review on Google</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </a>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => setStep("rating")}
                    className="mt-3 text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer"
                  >
                    Change my rating
                  </button>
                </div>
              )}

              {/* STEP 3: THE VENTING BOX (1-3 STARS) */}
              {step === "feedback" && (
                <div className="py-1 text-left animate-in fade-in duration-200">
                  <div className="flex items-start gap-3 mb-4 bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/90">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-950">
                        We&apos;re so sorry.
                      </h4>
                      <p className="text-xs text-amber-800 leading-relaxed mt-0.5">
                        Please tell us what went wrong so our manager can fix it right away.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleFeedbackSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tell us what happened so we can make it right *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Please tell us what went wrong so the manager can fix it..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Your Name (optional)
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Phone Number (for manager callback)
                        </label>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+91..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                        />
                      </div>
                    </div>

                    {submitError && (
                      <p className="text-xs text-rose-600">{submitError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-70 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {isSubmitting ? (
                        <span>Sending to Manager...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Message to Manager</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between pt-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setStep("rating")}
                        className="text-slate-400 hover:text-slate-600 underline"
                      >
                        Change rating
                      </button>

                      {/* Subtle Google review option for full policy compliance */}
                      {googleReviewUrl && (
                        <a
                          href={googleReviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackOutcome("REDIRECTED")}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          Post publicly on Google instead
                        </a>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 4: THE COMPLIANCE SAVER (CRUCIAL STEP) */}
              {step === "submitted" && (
                <div className="py-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4 border border-teal-200">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Thank You for Letting Us Know
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    Your feedback has been sent directly to the store manager. We take
                    your experience seriously and are addressing your comments right away.
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold mb-6">
                    <span>✓ Private Manager Alert Sent</span>
                  </div>

                  {/* THE COMPLIANCE SAVER BUTTON */}
                  {googleReviewUrl && (
                    <div className="pt-5 border-t border-slate-100 space-y-2.5">
                      <p className="text-xs text-slate-500 font-medium">
                        If you&apos;d like to share your feedback publicly, you can do so on Google:
                      </p>
                      <a
                        href={googleReviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackOutcome("REDIRECTED")}
                        className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-2xl text-xs font-bold text-slate-700 shadow-2xs transition-all hover:border-slate-400 group"
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                          />
                        </svg>
                        <span>If you&apos;d like to share your feedback publicly, you can do so on Google</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* TEMPLATE 2: SOCIAL MEDIA HUB (INSTAGRAM, FACEBOOK, YOUTUBE) */}
          {gateTemplate === "SOCIAL_HUB" && (
            <div className="space-y-3.5 py-2 animate-in fade-in duration-300">
              {/* Instagram Card */}
              {instagramUrl && (
                <button
                  type="button"
                  onClick={() => handleExternalNav(instagramUrl)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#833ab4]/10 via-[#fd1d1d]/10 to-[#fcb045]/10 border border-rose-200/70 hover:border-rose-400 text-slate-800 transition-all hover:scale-[1.02] shadow-2xs group text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] flex items-center justify-center text-white shadow-sm shrink-0">
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">
                        Follow on Instagram
                      </span>
                      <span className="text-xs text-rose-600 font-medium">
                        Stories, Reels & Specials
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {/* Facebook Card */}
              {facebookUrl && (
                <button
                  type="button"
                  onClick={() => handleExternalNav(facebookUrl)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 hover:border-blue-400 text-slate-800 transition-all hover:scale-[1.02] shadow-2xs group text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#1877F2] flex items-center justify-center text-white shadow-sm shrink-0">
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">
                        Like on Facebook
                      </span>
                      <span className="text-xs text-blue-700 font-medium">
                        Community & Announcements
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {/* YouTube Card */}
              {youtubeUrl && (
                <button
                  type="button"
                  onClick={() => handleExternalNav(youtubeUrl)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-red-50/70 border border-red-200/80 hover:border-red-400 text-slate-800 transition-all hover:scale-[1.02] shadow-2xs group text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#FF0000] flex items-center justify-center text-white shadow-sm shrink-0">
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">
                        Watch on YouTube
                      </span>
                      <span className="text-xs text-red-700 font-medium">
                        Videos & Behind-the-scenes
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {/* Secondary Google Review Action */}
              {googleReviewUrl && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleExternalNav(googleReviewUrl)}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>Also enjoyed your visit? Rate us on Google</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TEMPLATE 3: FOOD DELIVERY & DINING (SWIGGY, ZOMATO, PHONE) */}
          {gateTemplate === "DELIVERY_DINING" && (
            <div className="space-y-3.5 py-2 animate-in fade-in duration-300">
              {/* Optional Offer Banner */}
              {deliveryOfferText && (
                <div className="p-3 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-300 rounded-2xl text-xs font-bold text-amber-900 flex items-center justify-center gap-2 text-center">
                  <span>🔥</span>
                  <span>{deliveryOfferText}</span>
                </div>
              )}

              {/* Swiggy Card */}
              {swiggyUrl && (
                <button
                  type="button"
                  onClick={() => handleExternalNav(swiggyUrl)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-orange-50/80 border border-orange-200 hover:border-orange-400 text-slate-800 transition-all hover:scale-[1.02] shadow-2xs group text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#FC8019] flex items-center justify-center text-white shadow-sm shrink-0 font-black text-xl">
                      S
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">
                        Order on Swiggy
                      </span>
                      <span className="text-xs text-orange-700 font-medium">
                        Fast delivery to your doorstep
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {/* Zomato Card */}
              {zomatoUrl && (
                <button
                  type="button"
                  onClick={() => handleExternalNav(zomatoUrl)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-rose-50/80 border border-rose-200 hover:border-rose-400 text-slate-800 transition-all hover:scale-[1.02] shadow-2xs group text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#E23744] flex items-center justify-center text-white shadow-sm shrink-0 font-bold italic text-lg tracking-tight">
                      zomato
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">
                        Order on Zomato
                      </span>
                      <span className="text-xs text-rose-700 font-medium">
                        Live menu, ratings & offers
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {/* Direct Phone / Call Booking */}
              {deliveryPhone && (
                <button
                  type="button"
                  onClick={() => handleExternalNav(`tel:${deliveryPhone}`)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 hover:border-emerald-400 text-slate-800 transition-all hover:scale-[1.02] shadow-2xs group text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shrink-0 font-bold">
                      📞
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">
                        Direct Call & Takeaway
                      </span>
                      <span className="text-xs text-emerald-700 font-medium">
                        {deliveryPhone}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {/* Secondary Google Review */}
              {googleReviewUrl && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleExternalNav(googleReviewUrl)}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>Dined with us? Leave a Google Review</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TEMPLATE 4: CUSTOM REDIRECTION (ONLINE MENU, WEBSITE, WIFI) */}
          {gateTemplate === "CUSTOM_REDIRECT" && (
            <div className="space-y-4 py-2 animate-in fade-in duration-300">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-center">
                <div
                  className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl shadow-2xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  📖
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {customRedirectTitle || "Digital Menu & Catalog"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Browse our live food items, daily chef specials, and drink selections.
                  </p>
                </div>

                {customRedirectUrl && (
                  <button
                    type="button"
                    onClick={() => handleExternalNav(customRedirectUrl)}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-white font-bold rounded-xl shadow-2xs hover:opacity-95 transition-all text-sm mt-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span>{customRedirectTitle || "Open Online Menu"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {googleReviewUrl && (
                <button
                  type="button"
                  onClick={() => handleExternalNav(googleReviewUrl)}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>Leave a Review on Google</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="text-center py-4 text-xs text-slate-400">
        Powered by{" "}
        <span className="font-semibold text-slate-600">TapGate</span> — Dynamic
        Review Gate
      </footer>
    </div>
  );
}
