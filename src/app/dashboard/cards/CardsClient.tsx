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
  X,
  Edit2,
  Sparkles,
  Sliders,
  RotateCcw,
  Globe,
  Utensils,
  Star,
  Layers,
  CheckSquare,
  Square,
} from "lucide-react";
import ThematicQrGenerator from "@/components/qr/ThematicQrGenerator";

export interface CardItem {
  id: string;
  shortCode: string;
  urlSlug: string;
  label?: string | null;
  status: "ACTIVE" | "DEACTIVATED" | "UNASSIGNED" | "LOST";
  activatedAt?: string | null;
  tapCount: number;
  overrideGate?: boolean;
  gateTemplate?: "GOOGLE_REVIEW" | "SOCIAL_HUB" | "DELIVERY_DINING" | "CUSTOM_REDIRECT" | null;
  customRedirectUrl?: string | null;
  customRedirectTitle?: string | null;
  customRedirectDirect?: boolean | null;
  googleReviewUrl?: string | null;
  smartGateEnabled?: boolean | null;
  zomatoUrl?: string | null;
  swiggyUrl?: string | null;
}

export interface TenantDefaults {
  gateTemplate?: "GOOGLE_REVIEW" | "SOCIAL_HUB" | "DELIVERY_DINING" | "CUSTOM_REDIRECT";
  googleReviewUrl?: string | null;
  zomatoUrl?: string | null;
  swiggyUrl?: string | null;
  customRedirectUrl?: string | null;
  smartGateEnabled?: boolean;
}

interface CardsClientProps {
  cards: CardItem[];
  tenantName: string;
  tenantPlan?: "BASIC" | "PRO" | "ENTERPRISE";
  baseUrl: string;
  maxCards: number;
  tenantDefaults?: TenantDefaults;
}

export default function CardsClient({
  cards: initialCards,
  tenantName,
  tenantPlan = "BASIC",
  baseUrl,
  maxCards,
  tenantDefaults = {},
}: CardsClientProps) {
  const [cards, setCards] = useState<CardItem[]>(initialCards);
  const [search, setSearch] = useState("");
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [selectedQrCard, setSelectedQrCard] = useState<CardItem | null>(null);
  const [editingCard, setEditingCard] = useState<CardItem | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Modal States
  const [gateModalCard, setGateModalCard] = useState<CardItem | null>(null);
  const [showResetAllModal, setShowResetAllModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkMode, setBulkMode] = useState<"ALL" | "SELECTED">("SELECTED");
  const [bulkPreset, setBulkPreset] = useState<"ZOMATO" | "GOOGLE" | "CUSTOM_URL" | "DEFAULT">("ZOMATO");
  const [bulkUrl, setBulkUrl] = useState(tenantDefaults.zomatoUrl || "");
  const [bulkTitle, setBulkTitle] = useState("Order on Zomato");
  const [bulkDirect, setBulkDirect] = useState(true);

  // Individual Card Gate Form State
  const [gateOverrideEnabled, setGateOverrideEnabled] = useState(false);
  const [gatePreset, setGatePreset] = useState<"ZOMATO" | "GOOGLE" | "CUSTOM_URL" | "SWIGGY">("ZOMATO");
  const [formZomatoUrl, setFormZomatoUrl] = useState("");
  const [formSwiggyUrl, setFormSwiggyUrl] = useState("");
  const [formGoogleUrl, setFormGoogleUrl] = useState("");
  const [formCustomUrl, setFormCustomUrl] = useState("");
  const [formCustomTitle, setFormCustomTitle] = useState("View Online Menu");
  const [formDirectRedirect, setFormDirectRedirect] = useState(true);
  const [formSmartGate, setFormSmartGate] = useState(true);

  const activeCardsCount = cards.filter((c) => c.status === "ACTIVE").length;

  const showToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

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
      showToast(`Card ${card.shortCode} marked as ${newStatus.toLowerCase()}`);
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
      showToast("Card label updated");
    } catch {
      alert("Failed to update card label");
    } finally {
      setIsUpdating(false);
    }
  };

  // Open Card Gate Modal with prefilled values
  const handleOpenGateModal = (card: CardItem) => {
    setGateModalCard(card);
    setGateOverrideEnabled(Boolean(card.overrideGate));

    const isZomato =
      card.zomatoUrl ||
      (card.customRedirectUrl && card.customRedirectUrl.toLowerCase().includes("zomato"));
    const isSwiggy =
      card.swiggyUrl ||
      (card.customRedirectUrl && card.customRedirectUrl.toLowerCase().includes("swiggy"));

    if (isZomato) {
      setGatePreset("ZOMATO");
    } else if (isSwiggy) {
      setGatePreset("SWIGGY");
    } else if (card.gateTemplate === "GOOGLE_REVIEW") {
      setGatePreset("GOOGLE");
    } else if (card.gateTemplate === "CUSTOM_REDIRECT") {
      setGatePreset("CUSTOM_URL");
    } else {
      setGatePreset("ZOMATO");
    }

    setFormZomatoUrl(card.zomatoUrl || tenantDefaults.zomatoUrl || "");
    setFormSwiggyUrl(card.swiggyUrl || tenantDefaults.swiggyUrl || "");
    setFormGoogleUrl(card.googleReviewUrl || tenantDefaults.googleReviewUrl || "");
    setFormCustomUrl(card.customRedirectUrl || tenantDefaults.customRedirectUrl || "");
    setFormCustomTitle(card.customRedirectTitle || "View Online Menu");
    setFormDirectRedirect(card.customRedirectDirect ?? true);
    setFormSmartGate(card.smartGateEnabled ?? true);
  };

  // Save Card Gate Form
  const handleSaveCardGate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gateModalCard) return;

    setIsUpdating(true);
    try {
      let payload: Record<string, unknown> = {};

      if (!gateOverrideEnabled) {
        payload = {
          overrideGate: false,
        };
      } else if (gatePreset === "ZOMATO") {
        payload = {
          overrideGate: true,
          gateTemplate: formDirectRedirect ? "CUSTOM_REDIRECT" : "DELIVERY_DINING",
          customRedirectUrl: formDirectRedirect ? formZomatoUrl : null,
          customRedirectTitle: "Order on Zomato",
          customRedirectDirect: formDirectRedirect,
          zomatoUrl: formZomatoUrl,
        };
      } else if (gatePreset === "GOOGLE") {
        payload = {
          overrideGate: true,
          gateTemplate: "GOOGLE_REVIEW",
          googleReviewUrl: formGoogleUrl,
          smartGateEnabled: formSmartGate,
          customRedirectDirect: !formSmartGate,
        };
      } else if (gatePreset === "CUSTOM_URL") {
        payload = {
          overrideGate: true,
          gateTemplate: "CUSTOM_REDIRECT",
          customRedirectUrl: formCustomUrl,
          customRedirectTitle: formCustomTitle || "View Online Menu",
          customRedirectDirect: formDirectRedirect,
        };
      } else if (gatePreset === "SWIGGY") {
        payload = {
          overrideGate: true,
          gateTemplate: formDirectRedirect ? "CUSTOM_REDIRECT" : "DELIVERY_DINING",
          customRedirectUrl: formDirectRedirect ? formSwiggyUrl : null,
          customRedirectTitle: "Order on Swiggy",
          customRedirectDirect: formDirectRedirect,
          swiggyUrl: formSwiggyUrl,
        };
      }

      const res = await fetch(`/api/dashboard/cards/${gateModalCard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save gate configuration");
      const data = await res.json();

      setCards((prev) =>
        prev.map((c) => (c.id === gateModalCard.id ? { ...c, ...data.card } : c))
      );
      setGateModalCard(null);
      showToast(`Gate settings updated for ${gateModalCard.shortCode}!`);
    } catch {
      alert("Failed to save gate settings. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 1-Click Reset ALL Cards to Default Google Review Gate
  const handleResetAllToDefault = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/dashboard/cards/bulk-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET_ALL_TO_DEFAULT" }),
      });

      if (!res.ok) throw new Error("Reset failed");

      setCards((prev) =>
        prev.map((c) => ({
          ...c,
          overrideGate: false,
        }))
      );
      setShowResetAllModal(false);
      showToast("⚡ All cards set to Default Google Review Gate!");
    } catch {
      alert("Failed to reset all cards to default.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Bulk Apply Handler (for selected or all cards)
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      if (bulkMode === "ALL") {
        if (bulkPreset === "DEFAULT") {
          await handleResetAllToDefault();
          setShowBulkModal(false);
          return;
        }

        const action = bulkPreset === "ZOMATO" ? "SET_ALL_ZOMATO" : "SET_ALL_CUSTOM_URL";
        const res = await fetch("/api/dashboard/cards/bulk-gate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            zomatoUrl: bulkUrl,
            customRedirectUrl: bulkUrl,
            customRedirectTitle: bulkTitle,
            customRedirectDirect: bulkDirect,
          }),
        });

        if (!res.ok) throw new Error("Bulk update failed");

        // Refresh state
        setCards((prev) =>
          prev.map((c) => ({
            ...c,
            overrideGate: true,
            gateTemplate: bulkDirect ? "CUSTOM_REDIRECT" : "DELIVERY_DINING",
            customRedirectUrl: bulkDirect ? bulkUrl : null,
            customRedirectDirect: bulkDirect,
            customRedirectTitle: bulkTitle,
            zomatoUrl: bulkPreset === "ZOMATO" ? bulkUrl : c.zomatoUrl,
          }))
        );
        setShowBulkModal(false);
        showToast("⚡ All cards updated successfully!");
      } else {
        // SELECTED CARDS
        if (selectedCardIds.length === 0) return;

        let updateData: Record<string, unknown> = {};
        if (bulkPreset === "DEFAULT") {
          updateData = { overrideGate: false };
        } else if (bulkPreset === "ZOMATO") {
          updateData = {
            overrideGate: true,
            gateTemplate: bulkDirect ? "CUSTOM_REDIRECT" : "DELIVERY_DINING",
            customRedirectUrl: bulkDirect ? bulkUrl : null,
            customRedirectTitle: "Order on Zomato",
            customRedirectDirect: bulkDirect,
            zomatoUrl: bulkUrl,
          };
        } else if (bulkPreset === "GOOGLE") {
          updateData = {
            overrideGate: true,
            gateTemplate: "GOOGLE_REVIEW",
            googleReviewUrl: bulkUrl || tenantDefaults.googleReviewUrl,
            smartGateEnabled: true,
          };
        } else if (bulkPreset === "CUSTOM_URL") {
          updateData = {
            overrideGate: true,
            gateTemplate: "CUSTOM_REDIRECT",
            customRedirectUrl: bulkUrl,
            customRedirectTitle: bulkTitle,
            customRedirectDirect: bulkDirect,
          };
        }

        const res = await fetch("/api/dashboard/cards/bulk-gate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "UPDATE_SELECTED",
            cardIds: selectedCardIds,
            ...updateData,
          }),
        });

        if (!res.ok) throw new Error("Bulk update failed");

        setCards((prev) =>
          prev.map((c) =>
            selectedCardIds.includes(c.id) ? { ...c, ...updateData } : c
          )
        );
        setSelectedCardIds([]);
        setShowBulkModal(false);
        showToast(`⚡ Updated ${selectedCardIds.length} selected card(s)!`);
      }
    } catch {
      alert("Failed to perform bulk update.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle selection for a card
  const handleToggleSelect = (cardId: string) => {
    setSelectedCardIds((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCardIds.length === filteredCards.length) {
      setSelectedCardIds([]);
    } else {
      setSelectedCardIds(filteredCards.map((c) => c.id));
    }
  };

  // Badge Renderer
  const renderGateBadge = (card: CardItem) => {
    if (!card.overrideGate) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
          <Sparkles className="w-3 h-3 text-teal-600" />
          <span>Default: Google Review</span>
        </span>
      );
    }

    const t = card.gateTemplate || "GOOGLE_REVIEW";

    if (t === "CUSTOM_REDIRECT") {
      const isZomato =
        card.zomatoUrl ||
        (card.customRedirectUrl && card.customRedirectUrl.toLowerCase().includes("zomato"));
      if (isZomato) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>Zomato {card.customRedirectDirect ? "Direct" : "Gate"}</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <Globe className="w-3 h-3 text-purple-600" />
          <span>Custom URL {card.customRedirectDirect ? "(Direct)" : "(Gate)"}</span>
        </span>
      );
    }

    if (t === "DELIVERY_DINING") {
      if (card.zomatoUrl) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Utensils className="w-3 h-3 text-rose-600" />
            <span>Zomato Delivery</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Utensils className="w-3 h-3 text-amber-600" />
          <span>Delivery Hub</span>
        </span>
      );
    }

    if (t === "GOOGLE_REVIEW") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Star className="w-3 h-3 text-blue-600" />
          <span>Google Review {card.smartGateEnabled ? "(Smart 5★)" : "(Direct)"}</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
        <Layers className="w-3 h-3 text-indigo-600" />
        <span>Social Hub</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>NFC Cards & QR Touchpoints</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure each card&apos;s brand gate independently (Zomato, Google Review, Custom URL) with zero reprinting
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="text-right hidden xl:block mr-2">
            <span className="text-[11px] text-slate-400 block font-semibold uppercase tracking-wider">
              Active Inventory
            </span>
            <span className="text-xs font-bold text-slate-800">
              {activeCardsCount} of {maxCards} Cards
            </span>
          </div>

          {/* ONE-CLICK SET TO DEFAULT GOOGLE REVIEW GATE */}
          <button
            onClick={() => setShowResetAllModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold transition-all shadow-2xs hover:border-teal-300"
            title="1-Click reset all cards to default Google Review Brand Gate"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>1-Click: Reset All to Default</span>
          </button>

          {/* BULK CHANGE ALL CARDS (CUSTOM URL / PROMO / ZOMATO) */}
          <button
            onClick={() => {
              setBulkMode("ALL");
              setBulkPreset("CUSTOM_URL");
              setBulkUrl("");
              setBulkTitle("View Online Menu");
              setShowBulkModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all shadow-2xs"
            title="Change all cards to a custom URL or promo simultaneously"
          >
            <Globe className="w-3.5 h-3.5 text-slate-600" />
            <span>Set All to Custom URL</span>
          </button>

          <Link
            href="/dashboard/qr-studio"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>QR Studio</span>
          </Link>

          <Link
            href="/claim"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Claim New Card</span>
          </Link>
        </div>
      </div>

      {/* Floating / Sticky Bulk Action Bar when cards are selected */}
      {selectedCardIds.length > 0 && (
        <div className="bg-slate-900 text-white p-3.5 px-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center">
              {selectedCardIds.length}
            </span>
            <span className="text-xs font-medium text-slate-200">
              card(s) selected:
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Set to Zomato */}
            <button
              onClick={() => {
                setBulkMode("SELECTED");
                setBulkPreset("ZOMATO");
                setBulkUrl(tenantDefaults.zomatoUrl || "");
                setBulkTitle("Order on Zomato");
                setBulkDirect(true);
                setShowBulkModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Utensils className="w-3 h-3" />
              <span>Set to Zomato</span>
            </button>

            {/* Quick Set to Google Review */}
            <button
              onClick={() => {
                setBulkMode("SELECTED");
                setBulkPreset("GOOGLE");
                setBulkUrl(tenantDefaults.googleReviewUrl || "");
                setBulkTitle("Google Review");
                setBulkDirect(false);
                setShowBulkModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Star className="w-3 h-3" />
              <span>Set to Google Review</span>
            </button>

            {/* Quick Set to Custom URL */}
            <button
              onClick={() => {
                setBulkMode("SELECTED");
                setBulkPreset("CUSTOM_URL");
                setBulkUrl("");
                setBulkTitle("View Online Menu");
                setBulkDirect(true);
                setShowBulkModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Globe className="w-3 h-3" />
              <span>Set Custom URL</span>
            </button>

            {/* Reset Selected to Default */}
            <button
              onClick={async () => {
                setIsUpdating(true);
                try {
                  const res = await fetch("/api/dashboard/cards/bulk-gate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "UPDATE_SELECTED",
                      cardIds: selectedCardIds,
                      overrideGate: false,
                    }),
                  });
                  if (!res.ok) throw new Error();
                  setCards((prev) =>
                    prev.map((c) =>
                      selectedCardIds.includes(c.id)
                        ? { ...c, overrideGate: false }
                        : c
                    )
                  );
                  setSelectedCardIds([]);
                  showToast("Selected cards reset to Default Brand Gate!");
                } catch {
                  alert("Failed to reset selected cards.");
                } finally {
                  setIsUpdating(false);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Default</span>
            </button>

            <button
              onClick={() => setSelectedCardIds([])}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
                  <th className="py-3.5 px-4 w-10 text-center">
                    <button
                      onClick={handleSelectAll}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Select all cards"
                    >
                      {selectedCardIds.length === filteredCards.length && filteredCards.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-teal-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Card Code & Label</th>
                  <th className="py-3.5 px-4">Brand Gate / Target</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Tap Target URL</th>
                  <th className="py-3.5 px-4 text-center">Total Taps</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCards.map((card) => {
                  const tapUrl = `${baseUrl}/tap/${card.urlSlug}`;
                  const isSelected = selectedCardIds.includes(card.id);

                  return (
                    <tr
                      key={card.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isSelected ? "bg-teal-50/30" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleSelect(card.id)}
                          className="cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-teal-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                          )}
                        </button>
                      </td>

                      {/* Code & Label */}
                      <td className="py-4 px-4">
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

                      {/* BRAND GATE COLUMN */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {renderGateBadge(card)}
                          <button
                            onClick={() => handleOpenGateModal(card)}
                            className="p-1 text-slate-400 hover:text-teal-600 rounded-md hover:bg-slate-100 transition-colors"
                            title="Configure Card Brand Gate / Target"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
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
                        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600 bg-slate-50 py-1 px-2.5 rounded-lg border border-slate-200/80 max-w-[220px]">
                          <span className="truncate">{tapUrl}</span>
                          <button
                            onClick={() => handleCopy(tapUrl, card.id)}
                            title="Copy Tap URL"
                            className="text-slate-400 hover:text-teal-600 shrink-0 cursor-pointer"
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
                          {/* Quick Configure Gate button */}
                          <button
                            onClick={() => handleOpenGateModal(card)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 transition-colors"
                            title="Configure Brand Gate"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>

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

      {/* MODAL 1: Individual Card Gate Configuration Modal */}
      {gateModalCard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl relative my-8">
            <button
              onClick={() => setGateModalCard(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                <Sliders className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Card Brand Gate: {gateModalCard.label || gateModalCard.shortCode}
                </h3>
                <p className="text-xs text-slate-500">
                  Code: <span className="font-mono">{gateModalCard.shortCode}</span> • Permanent URL: /tap/{gateModalCard.urlSlug}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCardGate} className="space-y-4">
              {/* Choose Mode: Default VS Override */}
              <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setGateOverrideEnabled(false)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    !gateOverrideEnabled
                      ? "bg-white text-teal-800 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🏢 Inherit Business Default
                </button>
                <button
                  type="button"
                  onClick={() => setGateOverrideEnabled(true)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    gateOverrideEnabled
                      ? "bg-white text-teal-800 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ⚡ Card-Specific Override
                </button>
              </div>

              {!gateOverrideEnabled ? (
                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-teal-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Inheriting Global Branding Gate</span>
                  </div>
                  <p className="text-xs text-teal-800 leading-relaxed">
                    This card will automatically route to your company default (Google Review Gate). When you update your business settings in Branding Gate, this card adapts automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pt-1 animate-in fade-in">
                  {/* Preset Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Target Destination Preset
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {/* Zomato */}
                      <button
                        type="button"
                        onClick={() => {
                          setGatePreset("ZOMATO");
                          if (!formZomatoUrl && tenantDefaults.zomatoUrl) {
                            setFormZomatoUrl(tenantDefaults.zomatoUrl);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          gatePreset === "ZOMATO"
                            ? "border-rose-500 bg-rose-50/80 text-rose-900 font-bold ring-2 ring-rose-300/40"
                            : "border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <span className="block text-base">🔴</span>
                        <span className="text-[11px] font-semibold block mt-0.5">Zomato</span>
                      </button>

                      {/* Google Review */}
                      <button
                        type="button"
                        onClick={() => {
                          setGatePreset("GOOGLE");
                          if (!formGoogleUrl && tenantDefaults.googleReviewUrl) {
                            setFormGoogleUrl(tenantDefaults.googleReviewUrl);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          gatePreset === "GOOGLE"
                            ? "border-blue-500 bg-blue-50/80 text-blue-900 font-bold ring-2 ring-blue-300/40"
                            : "border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <span className="block text-base">⭐</span>
                        <span className="text-[11px] font-semibold block mt-0.5">Google Review</span>
                      </button>

                      {/* Swiggy */}
                      <button
                        type="button"
                        onClick={() => {
                          setGatePreset("SWIGGY");
                          if (!formSwiggyUrl && tenantDefaults.swiggyUrl) {
                            setFormSwiggyUrl(tenantDefaults.swiggyUrl);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          gatePreset === "SWIGGY"
                            ? "border-orange-500 bg-orange-50/80 text-orange-900 font-bold ring-2 ring-orange-300/40"
                            : "border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <span className="block text-base">🟠</span>
                        <span className="text-[11px] font-semibold block mt-0.5">Swiggy</span>
                      </button>

                      {/* Custom URL */}
                      <button
                        type="button"
                        onClick={() => setGatePreset("CUSTOM_URL")}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          gatePreset === "CUSTOM_URL"
                            ? "border-purple-500 bg-purple-50/80 text-purple-900 font-bold ring-2 ring-purple-300/40"
                            : "border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <span className="block text-base">🌐</span>
                        <span className="text-[11px] font-semibold block mt-0.5">Custom URL</span>
                      </button>
                    </div>
                  </div>

                  {/* PRESET FIELDS */}
                  {gatePreset === "ZOMATO" && (
                    <div className="space-y-3 p-3.5 bg-rose-50/50 border border-rose-200 rounded-2xl">
                      <div>
                        <label className="block text-xs font-semibold text-rose-950 mb-1">
                          Zomato Restaurant Link *
                        </label>
                        <input
                          type="url"
                          required
                          value={formZomatoUrl}
                          onChange={(e) => setFormZomatoUrl(e.target.value)}
                          placeholder="https://www.zomato.com/restaurant-slug"
                          className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="text-xs font-semibold text-slate-800 block">
                            Direct 307 Redirect to Zomato
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            Customer jumps straight to Zomato upon tap
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={formDirectRedirect}
                          onChange={(e) => setFormDirectRedirect(e.target.checked)}
                          className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {gatePreset === "GOOGLE" && (
                    <div className="space-y-3 p-3.5 bg-blue-50/50 border border-blue-200 rounded-2xl">
                      <div>
                        <label className="block text-xs font-semibold text-blue-950 mb-1">
                          Google Review URL *
                        </label>
                        <input
                          type="url"
                          required
                          value={formGoogleUrl}
                          onChange={(e) => setFormGoogleUrl(e.target.value)}
                          placeholder="https://g.page/r/your-id/review"
                          className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="text-xs font-semibold text-slate-800 block">
                            Smart 5-Star Gate Filtering
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            4-5★ to Google, 1-3★ to private feedback form
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={formSmartGate}
                          onChange={(e) => setFormSmartGate(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {gatePreset === "SWIGGY" && (
                    <div className="space-y-3 p-3.5 bg-orange-50/50 border border-orange-200 rounded-2xl">
                      <div>
                        <label className="block text-xs font-semibold text-orange-950 mb-1">
                          Swiggy Restaurant Link *
                        </label>
                        <input
                          type="url"
                          required
                          value={formSwiggyUrl}
                          onChange={(e) => setFormSwiggyUrl(e.target.value)}
                          placeholder="https://www.swiggy.com/restaurants/..."
                          className="w-full px-3 py-2 bg-white border border-orange-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="text-xs font-semibold text-slate-800 block">
                            Direct 307 Redirect to Swiggy
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            Customer jumps straight to Swiggy menu
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={formDirectRedirect}
                          onChange={(e) => setFormDirectRedirect(e.target.checked)}
                          className="w-4 h-4 text-orange-600 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {gatePreset === "CUSTOM_URL" && (
                    <div className="space-y-3 p-3.5 bg-purple-50/50 border border-purple-200 rounded-2xl">
                      <div>
                        <label className="block text-xs font-semibold text-purple-950 mb-1">
                          Destination URL (Menu PDF, Website, Promo) *
                        </label>
                        <input
                          type="url"
                          required
                          value={formCustomUrl}
                          onChange={(e) => setFormCustomUrl(e.target.value)}
                          placeholder="https://yourbrand.com/menu.pdf"
                          className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Button Title (if showing gate screen)
                        </label>
                        <input
                          type="text"
                          value={formCustomTitle}
                          onChange={(e) => setFormCustomTitle(e.target.value)}
                          placeholder="View Online Menu"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="text-xs font-semibold text-slate-800 block">
                            Direct Instant Redirect
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            Hop directly to URL without showing intermediate screen
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={formDirectRedirect}
                          onChange={(e) => setFormDirectRedirect(e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGateModalCard(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Save Gate Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: 1-Click Reset ALL Cards to Default Google Review Gate */}
      {showResetAllModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setShowResetAllModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Reset All Cards to Default Brand Gate?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              This will immediately set all <strong className="text-slate-900">{cards.length} cards</strong> back to your business&apos;s Default Google Review Brand Gate. Any individual overrides (such as Zomato or custom URLs) will be cleared.
            </p>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl mb-5 space-y-1 text-xs">
              <div className="text-slate-700 font-semibold">
                ✓ No Hardware Changes:
              </div>
              <div className="text-slate-500">
                All physical NFC stands & printed QR codes will instantly route to your Google Review Gate.
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowResetAllModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleResetAllToDefault}
                className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm"
              >
                Yes, Reset All Cards
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Bulk Update (Selected or All Cards) */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setShowBulkModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              {bulkMode === "ALL"
                ? `Update All (${cards.length}) Cards`
                : `Update (${selectedCardIds.length}) Selected Cards`}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select what all targeted cards should point to:
            </p>

            <form onSubmit={handleBulkSubmit} className="space-y-4">
              {/* Preset selection */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBulkPreset("ZOMATO");
                    setBulkUrl(tenantDefaults.zomatoUrl || "");
                    setBulkTitle("Order on Zomato");
                  }}
                  className={`p-2 rounded-xl border text-center text-xs font-semibold ${
                    bulkPreset === "ZOMATO"
                      ? "border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-200"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  🔴 Zomato
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBulkPreset("CUSTOM_URL");
                    setBulkUrl("");
                    setBulkTitle("View Online Menu");
                  }}
                  className={`p-2 rounded-xl border text-center text-xs font-semibold ${
                    bulkPreset === "CUSTOM_URL"
                      ? "border-purple-500 bg-purple-50 text-purple-900 ring-2 ring-purple-200"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  🌐 Custom URL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBulkPreset("DEFAULT");
                  }}
                  className={`p-2 rounded-xl border text-center text-xs font-semibold ${
                    bulkPreset === "DEFAULT"
                      ? "border-teal-500 bg-teal-50 text-teal-900 ring-2 ring-teal-200"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  ⭐ Default Gate
                </button>
              </div>

              {bulkPreset !== "DEFAULT" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {bulkPreset === "ZOMATO" ? "Zomato URL *" : "Destination URL *"}
                    </label>
                    <input
                      type="url"
                      required
                      value={bulkUrl}
                      onChange={(e) => setBulkUrl(e.target.value)}
                      placeholder={
                        bulkPreset === "ZOMATO"
                          ? "https://www.zomato.com/..."
                          : "https://yourbrand.com/special-menu"
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {bulkPreset === "CUSTOM_URL" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Title / Label
                      </label>
                      <input
                        type="text"
                        value={bulkTitle}
                        onChange={(e) => setBulkTitle(e.target.value)}
                        placeholder="View Online Menu"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-xs font-semibold text-slate-800 block">
                        Direct 307 Redirect
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Redirect immediately without intermediate screen
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={bulkDirect}
                      onChange={(e) => setBulkDirect(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Apply to Cards
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Generator Modal */}
      {selectedQrCard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-4 sm:p-6 max-w-4xl w-full border border-slate-200 shadow-2xl relative my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Smart QR Code Studio — {selectedQrCard.shortCode}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedQrCard.label || selectedQrCard.shortCode} • {tenantName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/qr-studio"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Full Screen Studio</span>
                </Link>

                <button
                  onClick={() => setSelectedQrCard(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <ThematicQrGenerator
              initialUrl={`${baseUrl}/tap/${selectedQrCard.urlSlug}`}
              cardShortCode={selectedQrCard.shortCode}
              cardLabel={selectedQrCard.label || selectedQrCard.shortCode}
              tenantName={tenantName}
              tenantPlan={tenantPlan}
              compact={true}
            />
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
