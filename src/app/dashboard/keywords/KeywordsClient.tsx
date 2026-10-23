"use client";

import React, { useState } from "react";
import {
  Tag,
  Save,
  CheckCircle,
  Sparkles,
  Smartphone,
  RefreshCw,
  Copy,
  Plus,
  X,
  Languages,
  Sliders,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Lock,
  ArrowRight,
} from "lucide-react";
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  generateMultiLanguageSentenceBundle,
} from "@/lib/sentence-generator";

interface KeywordsClientProps {
  tenant: {
    id: string;
    name: string;
    plan: string;
    businessType?: string | null;
    googleReviewUrl?: string | null;
    primaryColor: string;
    logoUrl?: string | null;
    isPlanAllowed: boolean;
  };
  initialConfig: {
    isEnabled: boolean;
    primaryLanguage: SupportedLanguage;
    enabledLanguages: string[];
    keywords: string[];
    customSentences: string[];
    tone: "CASUAL" | "ENTHUSIASTIC" | "SHORT" | "DETAILED";
    presets: string[];
    initialBundle: Record<string, string[]>;
  };
}

const TONE_OPTIONS: {
  value: "CASUAL" | "ENTHUSIASTIC" | "SHORT" | "DETAILED";
  label: string;
  desc: string;
}[] = [
  {
    value: "CASUAL",
    label: "Casual & Authentic",
    desc: "Natural everyday review tone that sounds real",
  },
  {
    value: "ENTHUSIASTIC",
    label: "Enthusiastic & Hype",
    desc: "Excited 5-star praise with strong recommendations",
  },
  {
    value: "SHORT",
    label: "Short & Punchy",
    desc: "1-2 snappy sentences perfect for quick mobile reading",
  },
  {
    value: "DETAILED",
    label: "Detailed Experience",
    desc: "Mentions keyword, staff hospitality, and atmosphere",
  },
];

export default function KeywordsClient({ tenant, initialConfig }: KeywordsClientProps) {
  const [isEnabled, setIsEnabled] = useState(initialConfig.isEnabled);
  const [primaryLanguage, setPrimaryLanguage] = useState<SupportedLanguage>(
    initialConfig.primaryLanguage
  );
  const [enabledLanguages, setEnabledLanguages] = useState<string[]>(
    initialConfig.enabledLanguages
  );
  const [keywords, setKeywords] = useState<string[]>(initialConfig.keywords);
  const [keywordInput, setKeywordInput] = useState("");
  const [tone, setTone] = useState<"CASUAL" | "ENTHUSIASTIC" | "SHORT" | "DETAILED">(
    initialConfig.tone
  );
  const [customSentences, setCustomSentences] = useState<string[]>(
    initialConfig.customSentences
  );
  const [customInput, setCustomInput] = useState("");

  // Live Simulator state
  const [simLanguage, setSimLanguage] = useState<SupportedLanguage>(
    initialConfig.primaryLanguage
  );
  const [simIndex, setSimIndex] = useState(0);
  const [bundle, setBundle] = useState<Record<string, string[]>>(
    initialConfig.initialBundle
  );
  const [copiedToast, setCopiedToast] = useState(false);

  // Status & loading
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Refresh client-side simulator bundle when parameters change
  const refreshSimulatorBundle = (
    updatedKw = keywords,
    updatedLanguages = enabledLanguages,
    updatedTone = tone,
    updatedCustom = customSentences
  ) => {
    const newBundle = generateMultiLanguageSentenceBundle(updatedLanguages, {
      keywords: updatedKw,
      businessType: tenant.businessType,
      tone: updatedTone,
      customSentences: updatedCustom,
      seedOffset: simIndex,
    });
    setBundle(newBundle);
  };

  const handleAddKeyword = (kwToAdd?: string) => {
    const target = (kwToAdd || keywordInput).trim().toLowerCase();
    if (!target) return;
    if (keywords.includes(target)) {
      setKeywordInput("");
      return;
    }
    const updated = [...keywords, target];
    setKeywords(updated);
    setKeywordInput("");
    refreshSimulatorBundle(updated);
  };

  const handleRemoveKeyword = (indexToRemove: number) => {
    const updated = keywords.filter((_, i) => i !== indexToRemove);
    setKeywords(updated);
    refreshSimulatorBundle(updated);
  };

  const handleToggleLanguage = (code: string) => {
    let updated: string[];
    if (enabledLanguages.includes(code)) {
      if (enabledLanguages.length === 1) return; // Keep at least one
      updated = enabledLanguages.filter((l) => l !== code);
    } else {
      updated = [...enabledLanguages, code];
    }
    setEnabledLanguages(updated);

    // If active preview language was disabled, reset it
    if (!updated.includes(simLanguage)) {
      setSimLanguage((updated[0] as SupportedLanguage) || "EN");
    }
    refreshSimulatorBundle(keywords, updated);
  };

  const handleAddCustomSentence = () => {
    if (!customInput.trim()) return;
    const updated = [...customSentences, customInput.trim()];
    setCustomSentences(updated);
    setCustomInput("");
    refreshSimulatorBundle(keywords, enabledLanguages, tone, updated);
  };

  const handleRemoveCustomSentence = (index: number) => {
    const updated = customSentences.filter((_, i) => i !== index);
    setCustomSentences(updated);
    refreshSimulatorBundle(keywords, enabledLanguages, tone, updated);
  };

  const handleShufflePreview = () => {
    const nextIdx = simIndex + 1;
    setSimIndex(nextIdx);
    const newBundle = generateMultiLanguageSentenceBundle(enabledLanguages, {
      keywords,
      businessType: tenant.businessType,
      tone,
      customSentences,
      seedOffset: nextIdx,
    });
    setBundle(newBundle);
  };

  const handleCopyPreviewText = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const handleAiBrainstorm = async () => {
    setIsAiGenerating(true);
    try {
      const res = await fetch("/api/dashboard/keywords/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords,
          businessType: tenant.businessType,
          language: simLanguage,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.suggestions)) {
        const updated = [...customSentences, ...data.suggestions];
        setCustomSentences(updated);
        refreshSimulatorBundle(keywords, enabledLanguages, tone, updated);
      }
    } catch (e) {
      console.error("AI Generation error:", e);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage("");

    try {
      const res = await fetch("/api/dashboard/keywords", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isEnabled,
          primaryLanguage,
          enabledLanguages,
          keywords,
          customSentences,
          tone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save keywords");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Error saving keyword configuration"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Get active preview sentence for simulator
  const activeSentenceList = bundle[simLanguage] || bundle["EN"] || [];
  const currentSentence =
    activeSentenceList[simIndex % (activeSentenceList.length || 1)] ||
    "Thank you for the wonderful experience! Highly recommended!";

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <Tag className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Review Keywords & Local SEO
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-100 text-teal-800">
              {isEnabled ? "Active on Gate" : "Disabled"}
            </span>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl">
            Boost your Google Maps and local search rank. When customers rate 4–5
            stars, TapGate suggests ready-to-copy, non-repeating sentences containing
            your high-value keywords in English, Tanglish, and regional languages.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white text-sm font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50 shrink-0 cursor-pointer"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Save Success Banner */}
      {saveSuccess && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium animate-in fade-in duration-200">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Keyword settings and review templates saved successfully!</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-medium">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Pro Plan Locked Notice */}
      {!tenant.isPlanAllowed && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-sm font-bold">Pro & Enterprise Feature</strong>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-200 text-amber-900 rounded-md">
                  Current: {tenant.plan}
                </span>
              </div>
              <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                Smart Keyword SEO Reviews are available on <strong>Pro</strong> and <strong>Enterprise</strong> plans. Upgrade your plan to activate keyword reviews on your customer gateway.
              </p>
            </div>
          </div>
          <a
            href="/dashboard/subscription"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shrink-0 transition-colors shadow-xs"
          >
            <span>Upgrade to Pro</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Main Grid: Settings (Left) + Interactive Mobile Simulator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Configuration Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Activation Toggle & Tone */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Smart Keyword Suggestions
                  </h3>
                  {!tenant.isPlanAllowed && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 inline-flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Pro Plan
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Enable suggested review sentences on 4–5 star ratings
                </p>
              </div>
              <label className={`relative inline-flex items-center ${tenant.isPlanAllowed ? "cursor-pointer" : "opacity-60 cursor-not-allowed"}`}>
                <input
                  type="checkbox"
                  checked={isEnabled && tenant.isPlanAllowed}
                  disabled={!tenant.isPlanAllowed}
                  onChange={(e) => {
                    if (!tenant.isPlanAllowed) {
                      setErrorMessage("Smart Keyword Suggestions requires a Pro or Enterprise plan.");
                      return;
                    }
                    setIsEnabled(e.target.checked);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Sentence Tone & Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TONE_OPTIONS.map((t) => {
                  const isSelected = tone === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => {
                        setTone(t.value);
                        refreshSimulatorBundle(
                          keywords,
                          enabledLanguages,
                          t.value
                        );
                      }}
                      className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="text-sm font-semibold text-slate-900">
                        {t.label}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-snug">
                        {t.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Languages Selection */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-teal-600" />
              <h3 className="text-base font-bold text-slate-900">
                Languages & Regional Dialects
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enable the languages your customers use. In Tamil Nadu,{" "}
              <strong>Tanglish</strong> (e.g., &quot;Food taste vera level!&quot;) has high
              authenticity and converts exceptionally well on Google Reviews.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isChecked = enabledLanguages.includes(lang.code);
                const isDefault = primaryLanguage === lang.code;
                return (
                  <div
                    key={lang.code}
                    className={`p-3 rounded-xl border transition-all ${
                      isChecked
                        ? "border-teal-500 bg-teal-50/30"
                        : "border-slate-200 bg-slate-50/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-base">{lang.flag}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleLanguage(lang.code)}
                        className="w-4 h-4 text-teal-600 rounded-sm border-slate-300 focus:ring-teal-500 cursor-pointer"
                      />
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {lang.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {lang.nativeName}
                    </div>

                    {isChecked && (
                      <button
                        type="button"
                        onClick={() => {
                          setPrimaryLanguage(lang.code);
                          setSimLanguage(lang.code);
                        }}
                        className={`mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                          isDefault
                            ? "bg-teal-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {isDefault ? "Primary Default" : "Set as Default"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Keyword Tag Manager */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Target Business Keywords
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {keywords.length} keywords configured
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Add services, specialty items, or features you want customers to
              mention in their Google Reviews to rank higher on search.
            </p>

            {/* Keyword Input Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                  placeholder="e.g., crispy ghee dosa, filter coffee, friendly staff..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddKeyword()}
                disabled={!keywordInput.trim()}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {/* Keyword Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {keywords.map((kw, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-900 border border-teal-200 rounded-full text-xs font-semibold group animate-in fade-in"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(i)}
                    className="p-0.5 text-teal-500 hover:text-teal-900 rounded-full hover:bg-teal-100 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {keywords.length === 0 && (
                <div className="text-xs text-slate-400 italic py-2">
                  No keywords added yet. Click one of the suggestions below!
                </div>
              )}
            </div>

            {/* 1-Click Suggestions based on Business Type */}
            {initialConfig.presets.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <span className="block text-xs font-bold text-slate-500 mb-2">
                  💡 Popular Suggestions for {tenant.businessType || "Your Business"}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {initialConfig.presets
                    .filter((p) => !keywords.includes(p))
                    .slice(0, 8)
                    .map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddKeyword(preset)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-teal-100 hover:text-teal-900 text-slate-700 text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{preset}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Custom Review Templates & AI Brainstorm */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Custom Review Templates & AI Assistant
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAiBrainstorm}
                disabled={isAiGenerating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAiGenerating ? "Generating..." : "✨ AI Generate"}</span>
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Have specific one-liners or signature items you want mentioned? Add
              them here or tap <strong>✨ AI Generate</strong> to brainstorm.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomSentence();
                  }
                }}
                placeholder="e.g., Must try their signature cold coffee & brownies!"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddCustomSentence}
                disabled={!customInput.trim()}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
              >
                Add
              </button>
            </div>

            {customSentences.length > 0 && (
              <div className="space-y-2 pt-2">
                {customSentences.map((sentence, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                  >
                    <span>&quot;{sentence}&quot;</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomSentence(idx)}
                      className="text-slate-400 hover:text-rose-600 shrink-0 p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Interactive Mobile Gateway Simulator */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-xl border border-slate-800">
            {/* Simulator Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
                  Live Customer Gateway Preview
                </span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800/80">
                5-Star Screen
              </span>
            </div>

            {/* Mobile Screen Shell */}
            <div className="bg-white text-slate-900 rounded-2xl p-5 shadow-inner border border-slate-200 relative overflow-hidden">
              {/* Copied Toast Banner */}
              {copiedToast && (
                <div className="absolute top-3 left-4 right-4 bg-slate-900 text-white text-xs font-semibold py-2 px-3 rounded-xl shadow-lg flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150 z-20">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Review copied! Ready to paste on Google 🚀</span>
                </div>
              )}

              {/* Brand Avatar */}
              <div className="text-center mb-4">
                {tenant.logoUrl ? (
                  <img
                    src={tenant.logoUrl}
                    alt={tenant.name}
                    className="w-12 h-12 rounded-xl mx-auto mb-2 object-cover border border-slate-200 shadow-2xs"
                  />
                ) : (
                  <div
                    className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-2 font-bold text-lg text-white shadow-2xs"
                    style={{ backgroundColor: tenant.primaryColor }}
                  >
                    {tenant.name.slice(0, 1)}
                  </div>
                )}
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 rounded-full text-[11px] font-semibold text-slate-700">
                  <span>{tenant.name}</span>
                  <CheckCircle className="w-3 h-3 text-teal-600" />
                </div>
                <div className="flex justify-center gap-1 text-amber-400 mt-2">
                  {"★★★★★"}
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-1">
                  Thank You for 5 Stars!
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  We prepared a quick review for you:
                </p>
              </div>

              {/* Language Switcher Tabs */}
              <div className="flex items-center justify-center gap-1 mb-3 overflow-x-auto p-1 bg-slate-100 rounded-xl">
                {enabledLanguages.map((code) => {
                  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
                  if (!lang) return null;
                  const isActive = simLanguage === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setSimLanguage(code as SupportedLanguage)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <span>{lang.flag}</span>{" "}
                      <span>{lang.code === "TANGLISH" ? "Tanglish" : lang.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Suggested Review Card */}
              <div className="relative bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-3 text-left">
                <span className="text-2xl text-teal-500 font-serif leading-none block mb-1">
                  “
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {currentSentence}
                </p>
                <span className="text-2xl text-teal-500 font-serif leading-none block text-right mt-1">
                  ”
                </span>
              </div>

              {/* 1-Click Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleCopyPreviewText(currentSentence)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-all active:scale-98 cursor-pointer"
                  style={{ backgroundColor: tenant.primaryColor }}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Review & Open Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleShufflePreview}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Try Another (Non-Repeating)</span>
                </button>
              </div>

              <div className="mt-3 text-center">
                <span className="text-[11px] text-slate-400">
                  Customer can also skip and write their own review
                </span>
              </div>
            </div>

            {/* Explanatory footer */}
            <div className="mt-3 p-3 bg-slate-800/80 rounded-xl text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Zero Duplicate Penalties</span>
              </div>
              <p>
                Every customer tapping at your shop gets a fresh combination.
                Google search ranks reviews higher when distinct customers use
                your target keywords.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { KeywordsClient };
