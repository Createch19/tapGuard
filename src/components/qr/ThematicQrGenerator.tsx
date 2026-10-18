"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  QrCode,
  Sparkles,
  Download,
  Palette,
  Check,
  Lock,
  ArrowRight,
  RefreshCw,
  Sliders,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Wand2,
  FileImage,
  Upload,
} from "lucide-react";
import {
  INDUSTRY_PRESETS,
  QR_CENTERPIECES,
  AI_ARTWORK_SHOWCASE,
  QrPreset,
} from "@/lib/qr-presets";

interface ThematicQrGeneratorProps {
  initialUrl: string;
  cardShortCode?: string;
  cardLabel?: string;
  tenantName: string;
  tenantPlan: "BASIC" | "PRO" | "ENTERPRISE";
  compact?: boolean;
}

export default function ThematicQrGenerator({
  initialUrl,
  cardShortCode,
  cardLabel,
  tenantName,
  tenantPlan,
  compact = false,
}: ThematicQrGeneratorProps) {
  const [activeMethod, setActiveMethod] = useState<"thematic" | "ai">("thematic");
  const [targetUrl, setTargetUrl] = useState(initialUrl);

  // Method 1 (Thematic SVG) State
  const [selectedPresetId, setSelectedPresetId] = useState<string>("tapguard");
  const [dotType, setDotType] = useState<
    "rounded" | "dots" | "classy" | "classy-rounded" | "square" | "extra-rounded"
  >("rounded");
  const [cornerSquareType, setCornerSquareType] = useState<
    "dot" | "square" | "extra-rounded"
  >("extra-rounded");
  const [cornerDotType, setCornerDotType] = useState<"dot" | "square">("dot");
  const [dotsColor, setDotsColor] = useState("#0d9488");
  const [gradientColor, setGradientColor] = useState("#14b8a6");
  const [useGradient, setUseGradient] = useState(true);
  const [selectedCenterpiece, setSelectedCenterpiece] = useState<string>("tapguard");
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [qrCodeInstance, setQrCodeInstance] = useState<any>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  // Method 2 (AI Blended) State
  const normalizedPlan = String(tenantPlan || "BASIC").toUpperCase();
  const isAiUnlocked =
    normalizedPlan === "PRO" ||
    normalizedPlan === "ENTERPRISE" ||
    normalizedPlan === "SUPER_ADMIN";
  const [aiPrompt, setAiPrompt] = useState(
    "A neon cyberpunk coffee cup with glowing espresso steam, dark futuristic café table, 8k cinematic lighting"
  );
  const [aiStyle, setAiStyle] = useState("Cyberpunk Neon");
  const [aiStrength, setAiStrength] = useState(1.15);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiResult, setAiResult] = useState<{
    imageUrl: string;
    qrOverlayUrl?: string;
    isRealAi?: boolean;
    message?: string;
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Apply Industry Preset
  const handleApplyPreset = (preset: QrPreset) => {
    setSelectedPresetId(preset.id);
    setDotType(preset.dotType);
    setCornerSquareType(preset.cornerSquareType);
    setCornerDotType(preset.cornerDotType);
    setDotsColor(preset.dotsColor);
    if (preset.dotsGradient?.colorStops[1]) {
      setGradientColor(preset.dotsGradient.colorStops[1].color);
      setUseGradient(true);
    } else {
      setUseGradient(false);
    }
    setSelectedCenterpiece(preset.centerpieceIcon);
    setCustomLogoUrl(null);
  };

  // Initialize and Render Method 1 QR Code
  useEffect(() => {
    let isMounted = true;

    async function initQr() {
      if (typeof window === "undefined" || !qrRef.current) return;

      try {
        const QRCodeStyling = (await import("qr-code-styling")).default;

        const centerpieceSrc =
          customLogoUrl ||
          (selectedCenterpiece !== "none" && QR_CENTERPIECES[selectedCenterpiece]
            ? QR_CENTERPIECES[selectedCenterpiece].svgDataUri
            : undefined);

        const options: any = {
          width: compact ? 260 : 320,
          height: compact ? 260 : 320,
          type: "svg",
          data: targetUrl || "https://tapguard.io",
          image: centerpieceSrc,
          margin: 12,
          qrOptions: {
            typeNumber: 0,
            mode: "Byte",
            errorCorrectionLevel: "Q", // High error correction so centerpiece scans flawlessly
          },
          imageOptions: {
            hideBackgroundDots: true,
            imageSize: 0.28,
            margin: 6,
            crossOrigin: "anonymous",
          },
          dotsOptions: {
            type: dotType,
            color: dotsColor,
            ...(useGradient
              ? {
                  gradient: {
                    type: "linear",
                    rotation: 45,
                    colorStops: [
                      { offset: 0, color: dotsColor },
                      { offset: 1, color: gradientColor },
                    ],
                  },
                }
              : {}),
          },
          cornersSquareOptions: {
            type: cornerSquareType,
            color: dotsColor,
          },
          cornersDotOptions: {
            type: cornerDotType,
            color: gradientColor || dotsColor,
          },
          backgroundOptions: {
            color: "#ffffff",
          },
        };

        if (qrCodeInstance) {
          qrCodeInstance.update(options);
        } else {
          const qr = new QRCodeStyling(options);
          if (qrRef.current) {
            qrRef.current.innerHTML = "";
            qr.append(qrRef.current);
            if (isMounted) setQrCodeInstance(qr);
          }
        }
      } catch (err) {
        console.error("Failed to render QR Code:", err);
      }
    }

    if (activeMethod === "thematic") {
      initQr();
    }

    return () => {
      isMounted = false;
    };
  }, [
    activeMethod,
    targetUrl,
    dotType,
    cornerSquareType,
    cornerDotType,
    dotsColor,
    gradientColor,
    useGradient,
    selectedCenterpiece,
    customLogoUrl,
    compact,
  ]);

  // Handle Download Method 1
  const handleDownload = (format: "png" | "svg") => {
    if (!qrCodeInstance) return;
    const filename = `${cardShortCode || "tapguard"}-${selectedPresetId}-qr`;
    qrCodeInstance.download({
      name: filename,
      extension: format,
    });
  };

  // Handle Custom Center Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomLogoUrl(reader.result as string);
        setSelectedCenterpiece("custom");
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Method 2 AI QR Generation
  const handleGenerateAiQr = async () => {
    if (!isAiUnlocked) return;
    setIsGeneratingAi(true);
    setAiError(null);

    try {
      const res = await fetch("/api/qr/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: targetUrl,
          prompt: aiPrompt,
          style: aiStyle,
          strength: aiStrength,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to generate AI QR");
      }

      setAiResult(data);
    } catch (err: any) {
      setAiError(err.message || "Failed to generate AI QR Code.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Tab Switcher Header */}
      <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-teal-600" />
              <span>Smart QR Studio</span>
              <span className="text-[11px] font-semibold bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-200">
                Vector & AI Tier
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Target: <span className="font-mono text-teal-700 font-medium">{targetUrl}</span>
            </p>
          </div>

          {/* Method Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveMethod("thematic")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeMethod === "thematic"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Method 1: Thematic SVG</span>
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 bg-teal-700/40 text-teal-100 rounded-md">
                Basic & Pro
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMethod("ai")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeMethod === "ai"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Method 2: AI-Blended Artwork</span>
              <span
                className={`text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded-md ${
                  isAiUnlocked
                    ? "bg-indigo-700 text-indigo-100"
                    : "bg-amber-100 text-amber-800 border border-amber-200 font-bold"
                }`}
              >
                {isAiUnlocked ? "Pro / Enterprise" : "🔒 Pro Upsell"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* METHOD 1: THEMATIC SVG GENERATOR (Available for All Plans)   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeMethod === "thematic" && (
        <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Industry Presets */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-teal-600" />
                  <span>1. Choose Industry Vibe</span>
                </label>
                <span className="text-[11px] text-slate-400">1-Click Layouts</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {INDUSTRY_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-3 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? "border-teal-500 bg-teal-50/70 shadow-2xs ring-1 ring-teal-400"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: preset.dotsColor }}
                        />
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {preset.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        {preset.industry}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pattern & Eye Styling */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-600" />
                <span>2. Fine-Tune Geometry (Dots & Corners)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Dot Style */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Dot Pattern (Pixels)
                  </label>
                  <select
                    value={dotType}
                    onChange={(e) => setDotType(e.target.value as any)}
                    className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="rounded">Rounded (Modern)</option>
                    <option value="extra-rounded">Extra-Rounded (Fluid)</option>
                    <option value="classy">Classy (Diamond-Cut)</option>
                    <option value="classy-rounded">Classy-Rounded</option>
                    <option value="dots">Dots (Circular)</option>
                    <option value="square">Square (Classic)</option>
                  </select>
                </div>

                {/* Corner Square */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Corner Eyes (Outer)
                  </label>
                  <select
                    value={cornerSquareType}
                    onChange={(e) => setCornerSquareType(e.target.value as any)}
                    className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="extra-rounded">Extra-Rounded / Circle</option>
                    <option value="dot">Smooth Dot</option>
                    <option value="square">Sharp Square</option>
                  </select>
                </div>

                {/* Corner Dot */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Eye Pupil (Inner)
                  </label>
                  <select
                    value={cornerDotType}
                    onChange={(e) => setCornerDotType(e.target.value as any)}
                    className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="dot">Circular Dot</option>
                    <option value="square">Square</option>
                  </select>
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={dotsColor}
                      onChange={(e) => setDotsColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={dotsColor}
                      onChange={(e) => setDotsColor(e.target.value)}
                      className="flex-1 text-xs font-mono px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Secondary Gradient Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={gradientColor}
                      onChange={(e) => {
                        setGradientColor(e.target.value);
                        setUseGradient(true);
                      }}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={gradientColor}
                      onChange={(e) => {
                        setGradientColor(e.target.value);
                        setUseGradient(true);
                      }}
                      className="flex-1 text-xs font-mono px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Centerpiece Icon Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                  <span>3. Centerpiece Logo / SVG Icon</span>
                </label>
                <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-800">
                  <Upload className="w-3 h-3" />
                  <span>Upload Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {Object.entries(QR_CENTERPIECES).map(([key, item]) => {
                  const isSelected = selectedCenterpiece === key && !customLogoUrl;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedCenterpiece(key);
                        setCustomLogoUrl(null);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? "border-teal-500 bg-teal-50 ring-1 ring-teal-400"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <img
                        src={item.svgDataUri}
                        alt={item.label}
                        className="w-6 h-6 object-contain"
                      />
                      <span className="text-[10px] font-medium text-slate-700 truncate w-full">
                        {item.label.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}

                {/* None Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCenterpiece("none");
                    setCustomLogoUrl(null);
                  }}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    selectedCenterpiece === "none" && !customLogoUrl
                      ? "border-teal-500 bg-teal-50 ring-1 ring-teal-400"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-xs text-slate-400 font-bold">∅</span>
                  <span className="text-[10px] font-medium text-slate-500">None</span>
                </button>
              </div>

              {customLogoUrl && (
                <div className="mt-2.5 p-2 bg-teal-50 rounded-xl border border-teal-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={customLogoUrl}
                      alt="Custom logo"
                      className="w-6 h-6 object-contain rounded-sm"
                    />
                    <span className="text-xs font-semibold text-teal-900">
                      Custom Logo Centerpiece Active
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomLogoUrl(null);
                      setSelectedCenterpiece("tapguard");
                    }}
                    className="text-[11px] text-red-600 font-semibold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Live Preview & Download Column */}
          <div className="lg:col-span-5 bg-slate-50/70 p-6 rounded-3xl border border-slate-200/90 text-center flex flex-col items-center justify-center sticky top-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100/80 px-3 py-1 rounded-full mb-3 border border-teal-200">
              Live Vector Preview
            </span>

            {/* QR Canvas Container */}
            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-md inline-block mb-4">
              <div ref={qrRef} className="flex items-center justify-center" />
            </div>

            <div className="w-full text-center mb-4">
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {cardLabel || tenantName}
              </h4>
              <p className="text-[11px] text-slate-500 font-mono truncate max-w-xs mx-auto">
                {targetUrl}
              </p>
            </div>

            {/* Download Buttons */}
            <div className="w-full space-y-2">
              <button
                type="button"
                onClick={() => handleDownload("png")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-[0.99]"
              >
                <Download className="w-4 h-4" />
                <span>Download Print PNG (1200×1200 High-Res)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownload("svg")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-2xs"
              >
                <FileImage className="w-3.5 h-3.5 text-teal-600" />
                <span>Download Scalable SVG (Vector for Signage)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* METHOD 2: AI-BLENDED QR CODES (Pro & Enterprise Tier)         */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeMethod === "ai" && (
        <div className="p-4 sm:p-6 lg:p-8">
          {/* If on Basic Plan: Show Locked Showcase */}
          {!isAiUnlocked ? (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Lock Banner */}
              <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-indigo-500/30">
                <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-2xl relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-bold uppercase tracking-wider mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Exclusive Pro & Enterprise Upsell</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                    Turn Your QR Code Into A Scannable Work of Art
                  </h3>
                  <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                    Invisible AI-Blended QR codes blend your Google review link directly into
                    hyper-realistic oil paintings, cyberpunk neon coffee cups, and luxury floral
                    arrangements. They scan perfectly while looking like framed art on your counter!
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href="/dashboard/subscription"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg hover:from-amber-300 hover:to-amber-400 transition-all active:scale-[0.99]"
                    >
                      <span>Upgrade to Pro Plan (₹499/mo)</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <span className="text-xs text-indigo-200">
                      ⚡ Commercial value: Agencies charge ₹500–₹1,500 per custom AI QR artwork!
                    </span>
                  </div>
                </div>
              </div>

              {/* Showcase Grid of AI Artwork QRs */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-violet-600" />
                  <span>Sample AI QR Styles Available in Pro</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {AI_ARTWORK_SHOWCASE.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow group"
                    >
                      <div className="relative aspect-square overflow-hidden bg-slate-100">
                        <img
                          src={item.sampleImage}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                          <span className="text-[11px] font-semibold text-white">
                            {item.title}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {item.style}
                        </div>
                      </div>

                      <div className="p-3">
                        <span className="text-[10px] uppercase font-bold text-violet-600 tracking-wider">
                          {item.tag}
                        </span>
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                          &ldquo;{item.prompt}&rdquo;
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* If on Pro or Enterprise: Fully Unlocked AI Studio */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* AI Controls */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-gradient-to-r from-violet-50 to-indigo-50 p-4 rounded-2xl border border-violet-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-violet-900 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>ControlNet AI Art Generator Unlocked</span>
                  </div>
                  <p className="text-xs text-violet-700">
                    Type a prompt describing your ideal artwork, or choose one of our industry
                    presets below. The AI will weave your card link into an aesthetic masterpiece.
                  </p>
                </div>

                {/* Prompt Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Artwork Prompt
                  </label>
                  <textarea
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. A neon cyberpunk coffee cup with glowing espresso steam, dark futuristic café table, 8k cinematic lighting"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-violet-500 focus:bg-white text-slate-900"
                  />
                </div>

                {/* Fast Prompt Inspiration Chips */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-2">
                    ⚡ Quick Inspiration Presets
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AI_ARTWORK_SHOWCASE.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAiPrompt(item.prompt);
                          setAiStyle(item.style);
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-violet-50 hover:text-violet-700 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors"
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      Art Style Preset
                    </label>
                    <select
                      value={aiStyle}
                      onChange={(e) => setAiStyle(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="Cyberpunk Neon">Cyberpunk Neon</option>
                      <option value="Watercolor Art">Botanical Watercolor</option>
                      <option value="Luxury Gold">Luxury Gold & Velvet</option>
                      <option value="Athletic Neon">Athletic Neon Studio</option>
                      <option value="Minimalist Studio">Minimalist Marble & Glass</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Scan Contrast Strength
                      </label>
                      <span className="text-xs font-mono font-bold text-violet-700">
                        {aiStrength}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="1.5"
                      step="0.05"
                      value={aiStrength}
                      onChange={(e) => setAiStrength(parseFloat(e.target.value))}
                      className="w-full accent-violet-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>More Artistic</span>
                      <span>Balanced</span>
                      <span>Maximum Scannability</span>
                    </div>
                  </div>
                </div>

                {aiError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{aiError}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={isGeneratingAi}
                  onClick={handleGenerateAiQr}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 via-indigo-600 to-teal-600 hover:from-violet-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.99] disabled:opacity-60"
                >
                  {isGeneratingAi ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing AI Artwork (Weaving QR Matrix)...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Generate AI-Blended QR Artwork</span>
                    </>
                  )}
                </button>
              </div>

              {/* AI Output Preview Column */}
              <div className="lg:col-span-5 bg-slate-900 rounded-3xl p-6 text-white text-center flex flex-col items-center justify-center relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300 bg-violet-500/20 px-3 py-1 rounded-full mb-3 border border-violet-500/30">
                  AI Blended Artwork Output
                </span>

                <div className="relative aspect-square w-full max-w-[300px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black mb-4 group">
                  {aiResult?.imageUrl ? (
                    <>
                      <img
                        src={aiResult.imageUrl}
                        alt="AI QR Artwork"
                        className="w-full h-full object-cover"
                      />
                      {aiResult.qrOverlayUrl && (
                        <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/20 backdrop-blur-[1px]">
                          <img
                            src={aiResult.qrOverlayUrl}
                            alt="Scannable QR"
                            className="w-48 h-48 mix-blend-multiply opacity-80"
                          />
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-xs text-[10px] text-emerald-400 py-1 px-2 rounded-lg flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ready to Print & Scan</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-slate-400">
                      <Sparkles className="w-10 h-10 text-violet-400 mb-2 opacity-50 animate-pulse" />
                      <p className="text-xs font-medium">No artwork generated yet.</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Select a prompt and click Generate to weave your QR code into art!
                      </p>
                    </div>
                  )}
                </div>

                {aiResult?.imageUrl && (
                  <a
                    href={aiResult.imageUrl}
                    download={`${cardShortCode || "tapguard"}-ai-artwork.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download High-Res Print Artwork</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
