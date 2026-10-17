"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  QrCode,
  ExternalLink,
  Plus,
  Search,
  CheckCircle,
  PauseCircle,
  PlayCircle,
  Copy,
  Download,
  X,
  Edit2,
} from "lucide-react";

interface CardItem {
  id: string;
  shortCode: string;
  urlSlug: string;
  label?: string | null;
  status: "ACTIVE" | "DEACTIVATED" | "UNASSIGNED" | "LOST";
  activatedAt?: string | null;
  tapCount: number;
}

interface CardsClientProps {
  cards: CardItem[];
  tenantName: string;
  baseUrl: string;
  maxCards: number;
}

export default function CardsClient({
  cards: initialCards,
  tenantName,
  baseUrl,
  maxCards,
}: CardsClientProps) {
  const [cards, setCards] = useState<CardItem[]>(initialCards);
  const [search, setSearch] = useState("");
  const [selectedQrCard, setSelectedQrCard] = useState<CardItem | null>(null);
  const [editingCard, setEditingCard] = useState<CardItem | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const activeCardsCount = cards.filter((c) => c.status === "ACTIVE").length;

  const filteredCards = cards.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.shortCode.toLowerCase().includes(q) ||
      (c.label && c.label.toLowerCase().includes(q)) ||
      c.urlSlug.toLowerCase().includes(q)
    );
  });

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = async (card: CardItem) => {
    const newStatus = card.status === "ACTIVE" ? "DEACTIVATED" : "ACTIVE";
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/dashboard/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, status: newStatus } : c))
      );
    } catch {
      alert("Failed to change card status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/dashboard/cards/${editingCard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: editLabel }),
      });

      if (!res.ok) throw new Error("Failed to update label");

      setCards((prev) =>
        prev.map((c) =>
          c.id === editingCard.id ? { ...c, label: editLabel } : c
        )
      );
      setEditingCard(null);
    } catch {
      alert("Failed to update card label");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            NFC Cards & QR Touchpoints
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your hardware inventory, locations, and downloadable QR assets
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-slate-400 block font-semibold uppercase tracking-wider">
              Active Inventory
            </span>
            <span className="text-sm font-bold text-slate-800">
              {activeCardsCount} of {maxCards} Cards
            </span>
          </div>

          <Link
            href="/claim"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Claim New Card</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by card label, code (ART-01) or slug..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Cards Table / Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {filteredCards.length === 0 ? (
          <div className="text-center py-12 p-4">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              No matching NFC cards found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              You haven&apos;t claimed any NFC review cards matching this filter yet.
            </p>
            <Link
              href="/claim"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Claim a Card Now</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-5">Card Code & Label</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Tap Target URL</th>
                  <th className="py-3.5 px-4 text-center">Total Taps</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCards.map((card) => {
                  const tapUrl = `${baseUrl}/tap/${card.urlSlug}`;

                  return (
                    <tr
                      key={card.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Code & Label */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                            {card.shortCode.slice(-3)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{card.label || "Untitled Stand"}</span>
                              <button
                                onClick={() => {
                                  setEditingCard(card);
                                  setEditLabel(card.label || "");
                                }}
                                title="Edit Label"
                                className="text-slate-400 hover:text-teal-600"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 font-medium">
                              Code: {card.shortCode}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {card.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Paused
                          </span>
                        )}
                      </td>

                      {/* URL Slug & Copy */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600 bg-slate-50 py-1 px-2.5 rounded-lg border border-slate-200/80 max-w-[240px]">
                          <span className="truncate">{tapUrl}</span>
                          <button
                            onClick={() => handleCopy(tapUrl, card.id)}
                            title="Copy Tap URL"
                            className="text-slate-400 hover:text-teal-600 shrink-0"
                          >
                            {copiedId === card.id ? (
                              <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Tap Count */}
                      <td className="py-4 px-4 text-center">
                        <span className="font-bold text-slate-800 text-sm">
                          {card.tapCount}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* QR Code Modal Button */}
                          <button
                            onClick={() => setSelectedQrCard(card)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 transition-colors"
                            title="Generate QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          {/* Test Tap Link */}
                          <a
                            href={`/tap/${card.urlSlug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                            title="Test Tap Experience"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          {/* Toggle Active / Deactivate */}
                          <button
                            disabled={isUpdating}
                            onClick={() => handleToggleStatus(card)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                            title={
                              card.status === "ACTIVE"
                                ? "Pause Card"
                                : "Activate Card"
                            }
                          >
                            {card.status === "ACTIVE" ? (
                              <PauseCircle className="w-4 h-4 text-amber-600" />
                            ) : (
                              <PlayCircle className="w-4 h-4 text-emerald-600" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Code Generator Modal */}
      {selectedQrCard && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-xl text-center relative">
            <button
              onClick={() => setSelectedQrCard(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-0.5">
              Review Card QR Code
            </h3>
            <p className="text-xs text-slate-500 mb-1 font-semibold text-teal-700">
              {tenantName}
            </p>
            <p className="text-xs text-slate-500 mb-4">
              {selectedQrCard.label || selectedQrCard.shortCode}
            </p>

            {/* QR Code Container */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mb-4">
              {/* High Quality SVG QR Code using QR Server API */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                  `${baseUrl}/tap/${selectedQrCard.urlSlug}`
                )}&color=0d9488&bgcolor=ffffff&margin=8`}
                alt="Card QR Code"
                className="w-48 h-48 rounded-lg mx-auto shadow-2xs"
              />
            </div>

            <p className="text-[11px] font-mono text-slate-400 truncate mb-4">
              {baseUrl}/tap/{selectedQrCard.urlSlug}
            </p>

            <div className="flex gap-2">
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(
                  `${baseUrl}/tap/${selectedQrCard.urlSlug}`
                )}&color=0d9488&bgcolor=ffffff&margin=10`}
                download={`${selectedQrCard.shortCode}-qrcode.png`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download Print QR</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Edit Label Modal */}
      {editingCard && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-xl relative">
            <button
              onClick={() => setEditingCard(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Edit Card Placement Label
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Code: <span className="font-mono">{editingCard.shortCode}</span>
            </p>

            <form onSubmit={handleSaveLabel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Card Placement / Name
                </label>
                <input
                  type="text"
                  required
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  placeholder="e.g. Front Cashier, Table 4"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
