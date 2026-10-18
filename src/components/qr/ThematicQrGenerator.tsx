"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  QrCode,
  Download,
  Palette,
  Check,
  Sliders,
  Image as ImageIcon,
  FileImage,
  Upload,
} from "lucide-react";
import {
  INDUSTRY_PRESETS,
  QR_CENTERPIECES,
  QrPreset,
} from "@/lib/qr-presets";

interface ThematicQrGeneratorProps {
  initialUrl: string;
  cardShortCode?: string;
  cardLabel?: string;
  tenantName: string;
  tenantPlan?: string;
  compact?: boolean;
}

export default function ThematicQrGenerator({
  initialUrl,
  cardShortCode,
  cardLabel,
  tenantName,
  compact = false,
}: ThematicQrGeneratorProps) {
  const [targetUrl, setTargetUrl] = useState(initialUrl);

  // Geometric & Color Configuration
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

  // Initialize and Render Vector QR Code
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

    initQr();

    return () => {
      isMounted = false;
    };
  }, [
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

  // Handle Download (PNG or SVG)
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

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-teal-600" />
              <span>Smart QR Studio</span>
              <span className="text-[11px] font-semibold bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-200">
                Vector & SVG
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Target: <span className="font-mono text-teal-700 font-medium">{targetUrl}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Thematic Generator Content */}
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
    </div>
  );
}
