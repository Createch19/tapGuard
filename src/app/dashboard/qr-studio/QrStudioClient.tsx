"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  QrCode,
  CreditCard,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import ThematicQrGenerator from "@/components/qr/ThematicQrGenerator";

interface CardOption {
  id: string;
  shortCode: string;
  urlSlug: string;
  label?: string | null;
  fullUrl: string;
}

interface QrStudioClientProps {
  tenantName: string;
  tenantPlan: "BASIC" | "PRO" | "ENTERPRISE";
  businessType?: string | null;
  cards: CardOption[];
  defaultUrl: string;
}

export default function QrStudioClient({
  tenantName,
  tenantPlan,
  businessType,
  cards,
  defaultUrl,
}: QrStudioClientProps) {
  const [selectedCardId, setSelectedCardId] = useState<string>(
    cards[0]?.id || "custom"
  );
  const [customInputUrl, setCustomInputUrl] = useState<string>(defaultUrl);

  const selectedCard = cards.find((c) => c.id === selectedCardId);
  const activeUrl = selectedCard ? selectedCard.fullUrl : customInputUrl;

  return (
    <div className="space-y-6">
      {/* Page Title & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              QR Code Studio
            </h1>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                tenantPlan === "PRO" || tenantPlan === "ENTERPRISE"
                  ? "bg-violet-100 text-violet-800 border-violet-200"
                  : "bg-teal-100 text-teal-800 border-teal-200"
              }`}
            >
              {tenantPlan} Plan
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Design industry-themed vector QR codes with custom brand colors, geometry, and center logos for your counter stands and table tents.
          </p>
        </div>
      </div>

      {/* Target Card Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Selected NFC Card / Destination URL
            </label>
            <p className="text-xs text-slate-500">
              Pick an active card or enter a direct review/menu link
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {cards.length > 0 && (
            <select
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              className="text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800"
            >
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.shortCode} - {c.label || "Card Stand"}
                </option>
              ))}
              <option value="custom">✏️ Custom Direct URL</option>
            </select>
          )}

          {selectedCardId === "custom" && (
            <input
              type="url"
              value={customInputUrl}
              onChange={(e) => setCustomInputUrl(e.target.value)}
              placeholder="https://..."
              className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800 min-w-[240px]"
            />
          )}
        </div>
      </div>

      {/* Main Thematic Generator Component */}
      <ThematicQrGenerator
        initialUrl={activeUrl}
        cardShortCode={selectedCard?.shortCode}
        cardLabel={selectedCard?.label || tenantName}
        tenantName={tenantName}
        tenantPlan={tenantPlan}
      />

      {/* Commercial & Printing Best Practices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>Optimal Print Sizes</span>
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            For table stands and counter acrylics, print at 4×4 cm or 5×5 cm minimum for effortless 0.5-second smartphone scanning.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>Vector SVG for Signage</span>
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Download SVG for high-resolution laser engraving, wood stands, wall vinyls, or professional printing shop cut-outs without pixelation.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>High-Contrast Scannability</span>
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Custom styled fluid dots and high-contrast error correction ensure flawless smartphone scanning even in dim restaurant lighting.
          </p>
        </div>
      </div>
    </div>
  );
}
