"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PackagePlus,
  ArrowLeft,
  CheckCircle,
  Cpu,
} from "lucide-react";

export default function BatchGeneratorPage() {
  const [name, setName] = useState(`Batch-${new Date().getFullYear()}-${new Date().toLocaleString("default", { month: "short" }).toUpperCase()}`);
  const [quantity, setQuantity] = useState(25);
  const [prefix, setPrefix] = useState("TAP");
  const [notes, setNotes] = useState("Standard PVC NFC cards with NTAG213 chip");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBatch, setGeneratedBatch] = useState<{
    batchId: string;
    quantity: number;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch("/api/admin/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          quantity,
          prefix,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Batch generation failed");

      setGeneratedBatch({
        batchId: data.batchId,
        quantity: data.quantity,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Failed to generate batch");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/inventory"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Card Inventory</span>
        </Link>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3.5 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <PackagePlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Generate NFC Card Production Batch
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Batch create pre-printed &ldquo;Ghost Link&rdquo; cards ready for factory NFC encoding
            </p>
          </div>
        </div>

        {generatedBatch ? (
          <div className="py-8 text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {generatedBatch.quantity} Ghost Cards Successfully Minted!
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              All cards have been assigned unique short codes and secure ghost slugs.
              They are in UNASSIGNED status waiting to be claimed by clients.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/admin/inventory"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm"
              >
                <span>View Full Inventory</span>
              </Link>
              <button
                type="button"
                onClick={() => setGeneratedBatch(null)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                <span>Generate Another Batch</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="py-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Batch Name / Production Run *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Quantity of NFC Cards to Generate *
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Short Code Prefix (e.g. TAP, NFC, REV)
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Example code: {prefix}-9011
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Production Notes (Hardware Specs)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
                />
              </div>
            </div>

            <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-100 flex items-start gap-3 text-xs text-slate-600">
              <Cpu className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block mb-0.5">
                  How Ghost Links Work:
                </strong>
                Each generated card will be assigned a permanent redirect URL and unique short code. The hardware printing factory writes this URL to the NFC chip. When a business receives the card, they claim it with the short code in 5 seconds.
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
              >
                <PackagePlus className="w-4 h-4 text-teal-400" />
                <span>
                  {isGenerating
                    ? "Minting Cards into Database..."
                    : `Generate ${quantity} Ghost Link Cards`}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
