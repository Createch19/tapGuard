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

export type GateTemplateType =
  | "GOOGLE_REVIEW"
  | "SOCIAL_HUB"
  | "DELIVERY_DINING"
  | "CUSTOM_REDIRECT";

export interface CardItem {
  id: string;
  shortCode: string;
  urlSlug: string;
  label?: string | null;
  status: "ACTIVE" | "DEACTIVATED" | "UNASSIGNED" | "LOST";
  activatedAt?: string | null;
  tapCount: number;
  overrideGate?: boolean;
  gateTemplate?: GateTemplateType | null;
  customRedirectUrl?: string | null;
  customRedirectTitle?: string | null;
  customRedirectDirect?: boolean | null;
  googleReviewUrl?: string | null;
  smartGateEnabled?: boolean | null;
  zomatoUrl?: string | null;
  swiggyUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  deliveryOfferText?: string | null;
  deliveryPhone?: string | null;
  greetingTitle?: string | null;
  greetingSubtitle?: string | null;
}

export interface TenantDefaults {
  gateTemplate?: GateTemplateType;
  googleReviewUrl?: string | null;
  zomatoUrl?: string | null;
  swiggyUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  deliveryOfferText?: string | null;
  deliveryPhone?: string | null;
  customRedirectUrl?: string | null;
  customRedirectTitle?: string | null;
  customRedirectDirect?: boolean;
  greetingTitle?: string | null;
  greetingSubtitle?: string | null;
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

const TEMPLATE_PRESETS = [
  {
    id: "DELIVERY_DINING" as GateTemplateType,
    name: "Swiggy & Zomato Delivery",
    badge: "Food & Delivery Hub",
    description: "Branded delivery gateway with Swiggy, Zomato, phone takeaway & offers",
    icon: "🛵",
    borderActive: "border-rose-500 bg-rose-50/70 ring-2 ring-rose-300",
  },
  {
    id: "GOOGLE_REVIEW" as GateTemplateType,
    name: "Google Review Smart Gate",
    badge: "Reviews & SEO",
    description: "5-Star rating gate with AI review sentences & negative feedback capture",
    icon: "⭐",
    borderActive: "border-amber-500 bg-amber-50/70 ring-2 ring-amber-300",
  },
  {
    id: "SOCIAL_HUB" as GateTemplateType,
    name: "Social Media Hub",
    badge: "Social Following",
    description: "Direct customer access to your Instagram, Facebook, and YouTube channels",
    icon: "📱",
    borderActive: "border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-300",
  },
  {
    id: "CUSTOM_REDIRECT" as GateTemplateType,
    name: "Digital Menu / Custom Link",
    badge: "Online Menu & Web",
    description: "Display an interactive menu card, PDF catalog, or direct instant redirect",
    icon: "📖",
    borderActive: "border-purple-500 bg-purple-50/70 ring-2 ring-purple-300",
  },
];

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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Single Unified Card Edit & Template Modal State
  const [editingCard, setEditingCard] = useState<CardItem | null>(null);
  const [formLabel, setFormLabel] = useState("");
  const [formStatus, setFormStatus] = useState<"ACTIVE" | "DEACTIVATED">("ACTIVE");
  const [formOverrideGate, setFormOverrideGate] = useState(false);
  const [formGateTemplate, setFormGateTemplate] = useState<GateTemplateType>("GOOGLE_REVIEW");

  // Template Form Fields
  const [formSwiggyUrl, setFormSwiggyUrl] = useState("");
  const [formZomatoUrl, setFormZomatoUrl] = useState("");
  const [formDeliveryPhone, setFormDeliveryPhone] = useState("");
  const [formDeliveryOfferText, setFormDeliveryOfferText] = useState("");
  const [formGoogleUrl, setFormGoogleUrl] = useState("");
  const [formSmartGate, setFormSmartGate] = useState(true);
  const [formInstagramUrl, setFormInstagramUrl] = useState("");
  const [formFacebookUrl, setFormFacebookUrl] = useState("");
  const [formYoutubeUrl, setFormYoutubeUrl] = useState("");
  const [formCustomUrl, setFormCustomUrl] = useState("");
  const [formCustomTitle, setFormCustomTitle] = useState("View Online Menu");
  const [formDirectRedirect, setFormDirectRedirect] = useState(false);
  const [formGreetingTitle, setFormGreetingTitle] = useState("");

  // Bulk Modal State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkMode, setBulkMode] = useState<"ALL" | "SELECTED">("SELECTED");
  const [bulkTemplate, setBulkTemplate] = useState<GateTemplateType | "DEFAULT">("DELIVERY_DINING");
  const [bulkSwiggyUrl, setBulkSwiggyUrl] = useState(tenantDefaults.swiggyUrl || "");
  const [bulkZomatoUrl, setBulkZomatoUrl] = useState(tenantDefaults.zomatoUrl || "");
  const [bulkDeliveryPhone, setBulkDeliveryPhone] = useState(tenantDefaults.deliveryPhone || "");
  const [bulkDeliveryOffer, setBulkDeliveryOffer] = useState(tenantDefaults.deliveryOfferText || "");
  const [bulkGoogleUrl, setBulkGoogleUrl] = useState(tenantDefaults.googleReviewUrl || "");
  const [bulkCustomUrl, setBulkCustomUrl] = useState(tenantDefaults.customRedirectUrl || "");
  const [bulkCustomTitle, setBulkCustomTitle] = useState("View Online Menu");
  const [bulkDirect, setBulkDirect] = useState(false);

  // Reset All Modal
  const [showResetAllModal, setShowResetAllModal] = useState(false);

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

  // Open Unified Card Edit & Template Modal
  const handleOpenEditModal = (card: CardItem) => {
    setEditingCard(card);
    setFormLabel(card.label || "");
    setFormStatus(card.status === "DEACTIVATED" ? "DEACTIVATED" : "ACTIVE");
    setFormOverrideGate(Boolean(card.overrideGate));

    const initialTemplate =
      card.gateTemplate || tenantDefaults.gateTemplate || "GOOGLE_REVIEW";
    setFormGateTemplate(initialTemplate);

    setFormSwiggyUrl(card.swiggyUrl || tenantDefaults.swiggyUrl || "");
    setFormZomatoUrl(card.zomatoUrl || tenantDefaults.zomatoUrl || "");
    setFormDeliveryPhone(card.deliveryPhone || tenantDefaults.deliveryPhone || "");
    setFormDeliveryOfferText(card.deliveryOfferText || tenantDefaults.deliveryOfferText || "");
    setFormGoogleUrl(card.googleReviewUrl || tenantDefaults.googleReviewUrl || "");
    setFormSmartGate(card.smartGateEnabled ?? tenantDefaults.smartGateEnabled ?? true);
    setFormInstagramUrl(card.instagramUrl || tenantDefaults.instagramUrl || "");
    setFormFacebookUrl(card.facebookUrl || tenantDefaults.facebookUrl || "");
    setFormYoutubeUrl(card.youtubeUrl || tenantDefaults.youtubeUrl || "");
    setFormCustomUrl(card.customRedirectUrl || tenantDefaults.customRedirectUrl || "");
    setFormCustomTitle(card.customRedirectTitle || tenantDefaults.customRedirectTitle || "View Online Menu");
    setFormDirectRedirect(card.customRedirectDirect ?? tenantDefaults.customRedirectDirect ?? false);
    setFormGreetingTitle(card.greetingTitle || "");
  };

  // Save Card Settings (Label + Gate Template)
  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    setIsUpdating(true);
    try {
      const payload: Record<string, unknown> = {
        label: formLabel.trim(),
        status: formStatus,
        overrideGate: formOverrideGate,
      };

      if (formOverrideGate) {
        payload.gateTemplate = formGateTemplate;
        if (formGateTemplate === "DELIVERY_DINING") {
          payload.swiggyUrl = formSwiggyUrl || null;
          payload.zomatoUrl = formZomatoUrl || null;
          payload.deliveryPhone = formDeliveryPhone || null;
          payload.deliveryOfferText = formDeliveryOfferText || null;
          payload.customRedirectDirect = false;
        } else if (formGateTemplate === "GOOGLE_REVIEW") {
          payload.googleReviewUrl = formGoogleUrl || null;
          payload.smartGateEnabled = formSmartGate;
          payload.customRedirectDirect = !formSmartGate;
        } else if (formGateTemplate === "SOCIAL_HUB") {
          payload.instagramUrl = formInstagramUrl || null;
          payload.facebookUrl = formFacebookUrl || null;
          payload.youtubeUrl = formYoutubeUrl || null;
          payload.customRedirectDirect = false;
        } else if (formGateTemplate === "CUSTOM_REDIRECT") {
          payload.customRedirectUrl = formCustomUrl || null;
          payload.customRedirectTitle = formCustomTitle || "View Online Menu";
          payload.customRedirectDirect = formDirectRedirect;
        }
        payload.greetingTitle = formGreetingTitle ? formGreetingTitle.trim() : null;
      }

      const res = await fetch(`/api/dashboard/cards/${editingCard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save card settings");
      const data = await res.json();

      setCards((prev) =>
        prev.map((c) => (c.id === editingCard.id ? { ...c, ...data.card } : c))
      );
      setEditingCard(null);
      showToast(`Updated card ${formLabel || editingCard.shortCode} successfully!`);
    } catch {
      alert("Failed to save card settings. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 1-Click Reset ALL Cards to Default Business Gate
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
      showToast("All cards reset to default business gate!");
    } catch {
      alert("Failed to reset cards.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Bulk Apply Handler (for selected or all cards)
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const isAll = bulkMode === "ALL";
      const targetIds = isAll ? cards.map((c) => c.id) : selectedCardIds;

      if (!isAll && targetIds.length === 0) return;

      if (bulkTemplate === "DEFAULT") {
        const res = await fetch("/api/dashboard/cards/bulk-gate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: isAll ? "RESET_ALL_TO_DEFAULT" : "SET_TEMPLATE",
            cardIds: isAll ? undefined : targetIds,
            overrideGate: false,
          }),
        });

        if (!res.ok) throw new Error("Failed to reset cards");

        setCards((prev) =>
          prev.map((c) =>
            targetIds.includes(c.id) ? { ...c, overrideGate: false } : c
          )
        );
      } else {
        const updateData: Record<string, unknown> = {
          overrideGate: true,
          gateTemplate: bulkTemplate,
        };

        if (bulkTemplate === "DELIVERY_DINING") {
          updateData.swiggyUrl = bulkSwiggyUrl || null;
          updateData.zomatoUrl = bulkZomatoUrl || null;
          updateData.deliveryPhone = bulkDeliveryPhone || null;
          updateData.deliveryOfferText = bulkDeliveryOffer || null;
          updateData.customRedirectDirect = false;
        } else if (bulkTemplate === "GOOGLE_REVIEW") {
          updateData.googleReviewUrl = bulkGoogleUrl || null;
          updateData.smartGateEnabled = true;
          updateData.customRedirectDirect = false;
        } else if (bulkTemplate === "CUSTOM_REDIRECT") {
          updateData.customRedirectUrl = bulkCustomUrl || null;
          updateData.customRedirectTitle = bulkCustomTitle || "View Online Menu";
          updateData.customRedirectDirect = bulkDirect;
        }

        const res = await fetch("/api/dashboard/cards/bulk-gate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "SET_TEMPLATE",
            cardIds: isAll ? undefined : targetIds,
            ...updateData,
          }),
        });

        if (!res.ok) throw new Error("Failed bulk update");

        setCards((prev) =>
          prev.map((c) =>
            targetIds.includes(c.id) ? { ...c, ...updateData } : c
          )
        );
      }

      setSelectedCardIds([]);
      setShowBulkModal(false);
      showToast(`Updated ${targetIds.length} card(s) successfully!`);
    } catch {
      alert("Failed to perform bulk update.");
    } finally {
      setIsUpdating(false);
    }
  };

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
      const defaultName =
        tenantDefaults.gateTemplate === "DELIVERY_DINING"
          ? "Swiggy & Zomato Delivery"
          : tenantDefaults.gateTemplate === "SOCIAL_HUB"
          ? "Social Media Hub"
          : tenantDefaults.gateTemplate === "CUSTOM_REDIRECT"
          ? "Digital Menu"
          : "Google Review";

      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <Sparkles className="w-3 h-3 text-teal-600" />
          <span>Default: {defaultName}</span>
        </span>
      );
    }

    const t = card.gateTemplate || "GOOGLE_REVIEW";

    if (t === "DELIVERY_DINING") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <Utensils className="w-3 h-3 text-rose-600" />
          <span>🛵 Swiggy & Zomato Delivery</span>
        </span>
      );
    }

    if (t === "GOOGLE_REVIEW") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
          <span>⭐ Google Review {card.smartGateEnabled ? "(Smart 5★)" : "(Direct)"}</span>
        </span>
      );
    }

    if (t === "SOCIAL_HUB") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Layers className="w-3 h-3 text-indigo-600" />
          <span>📱 Social Media Hub</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
        <Globe className="w-3 h-3 text-purple-600" />
        <span>📖 Digital Menu {card.customRedirectDirect ? "(Direct)" : "(Gate)"}</span>
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
            <span>NFC Cards & Dynamic Gate Touchpoints</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Assign dynamic gate templates (Swiggy & Zomato Delivery, Google Review Smart Gate, Social Hub) per card with zero reprinting
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

          {/* Reset All to Business Default */}
          <button
            onClick={() => setShowResetAllModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-2xs"
            title="Reset all cards to company default gate template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All to Default</span>
          </button>

          {/* Bulk Update All Cards */}
          <button
            onClick={() => {
              setBulkMode("ALL");
              setBulkTemplate("DELIVERY_DINING");
              setBulkSwiggyUrl(tenantDefaults.swiggyUrl || "");
              setBulkZomatoUrl(tenantDefaults.zomatoUrl || "");
              setBulkDeliveryPhone(tenantDefaults.deliveryPhone || "");
              setBulkDeliveryOffer(tenantDefaults.deliveryOfferText || "");
              setShowBulkModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-semibold transition-all shadow-2xs"
            title="Batch configure template for all cards"
          >
            <Sliders className="w-3.5 h-3.5 text-teal-600" />
            <span>Batch Assign All Cards</span>
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

      {/* Floating Bulk Action Bar when cards are selected */}
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
            {/* Quick Set to Swiggy & Zomato Delivery */}
            <button
              onClick={() => {
                setBulkMode("SELECTED");
                setBulkTemplate("DELIVERY_DINING");
                setBulkSwiggyUrl(tenantDefaults.swiggyUrl || "");
                setBulkZomatoUrl(tenantDefaults.zomatoUrl || "");
                setBulkDeliveryPhone(tenantDefaults.deliveryPhone || "");
                setBulkDeliveryOffer(tenantDefaults.deliveryOfferText || "");
                setShowBulkModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Utensils className="w-3 h-3" />
              <span>🛵 Swiggy & Zomato Delivery</span>
            </button>

            {/* Quick Set to Google Review */}
            <button
              onClick={() => {
                setBulkMode("SELECTED");
                setBulkTemplate("GOOGLE_REVIEW");
                setBulkGoogleUrl(tenantDefaults.googleReviewUrl || "");
                setShowBulkModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Star className="w-3 h-3" />
              <span>⭐ Google Review Gate</span>
            </button>

            {/* Quick Set to Social Hub */}
            <button
              onClick={() => {
                setBulkMode("SELECTED");
                setBulkTemplate("SOCIAL_HUB");
                setShowBulkModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Layers className="w-3 h-3" />
              <span>📱 Social Hub</span>
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
                      action: "SET_TEMPLATE",
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
                  showToast(`Reset ${selectedCardIds.length} card(s) to company default!`);
                } catch {
                  alert("Failed to reset selected cards");
                } finally {
                  setIsUpdating(false);
                }
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Default</span>
            </button>
          </div>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by code, label, or URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filteredCards.length}</strong> of{" "}
            {cards.length} cards
          </span>
        </div>
      </div>

      {/* Cards Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {filteredCards.length === 0 ? (
          <div className="text-center py-12 px-4">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No cards found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search
                ? "No NFC cards matched your search query. Try another term."
                : "You don't have any cards claimed yet. Claim your first card to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 w-10 text-center">
                    <button onClick={handleSelectAll} className="cursor-pointer">
                      {selectedCardIds.length === filteredCards.length && filteredCards.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-teal-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Card / Placement</th>
                  <th className="py-3.5 px-4">Dynamic Gate Template</th>
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
                                onClick={() => handleOpenEditModal(card)}
                                title="Edit Placement & Template"
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

                      {/* Dynamic Gate Template Badge & Quick Edit */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {renderGateBadge(card)}
                          <button
                            onClick={() => handleOpenEditModal(card)}
                            className="p-1 text-slate-400 hover:text-teal-700 rounded-md hover:bg-slate-100 transition-colors"
                            title="Change Gate Template"
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

                      {/* Total Taps */}
                      <td className="py-4 px-4 text-center">
                        <span className="font-bold text-slate-800 text-sm">
                          {card.tapCount}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Card & Template button */}
                          <button
                            onClick={() => handleOpenEditModal(card)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 font-semibold transition-colors"
                            title="Edit Card & Gate Template"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
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
                            title="Test Tap Experience (Customer View)"
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

      {/* UNIFIED MODAL: Edit NFC Card Placement & Gate Template */}
      {editingCard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-xl w-full border border-slate-200 shadow-2xl relative my-8 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setEditingCard(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5 pr-8">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center font-bold text-base">
                  <CreditCard className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Card & Gate Template
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hardware Code: <span className="font-mono font-bold text-slate-700">{editingCard.shortCode}</span>
                  </p>
                </div>
              </div>

              <a
                href={`/tap/${editingCard.urlSlug}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                title="Preview live tap landing"
              >
                <span>Live Test</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-5">
              {/* Card Placement Label & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Card Placement Label *
                  </label>
                  <input
                    type="text"
                    required
                    value={formLabel}
                    onChange={(e) => setFormLabel(e.target.value)}
                    placeholder="e.g. Table 4, Billing Counter, Bar"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Card Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as "ACTIVE" | "DEACTIVATED")}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900 font-semibold"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="DEACTIVATED">Paused</option>
                  </select>
                </div>
              </div>

              {/* Choose Mode: Business Default VS Card Template Override */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Gate Mode
                </label>
                <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setFormOverrideGate(false)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      !formOverrideGate
                        ? "bg-white text-teal-800 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    🏢 Inherit Business Default
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormOverrideGate(true)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      formOverrideGate
                        ? "bg-white text-teal-800 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    ⚡ Card Template Override
                  </button>
                </div>
              </div>

              {!formOverrideGate ? (
                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-teal-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Inheriting Company Default Gate Template</span>
                  </div>
                  <p className="text-xs text-teal-800 leading-relaxed">
                    This card automatically follows your company template set in <strong className="text-teal-950">Branding Gate</strong> (currently {tenantDefaults.gateTemplate || "Google Review Smart Gate"}). Whenever you update your branding, this card updates automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pt-1 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Select Dynamic Gate Template for this Card
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {TEMPLATE_PRESETS.map((preset) => {
                        const isSelected = formGateTemplate === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setFormGateTemplate(preset.id)}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                              isSelected
                                ? preset.borderActive
                                : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="text-2xl shrink-0">{preset.icon}</span>
                              <div>
                                <span className="font-bold text-xs text-slate-900 block">
                                  {preset.name}
                                </span>
                                <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                                  {preset.description}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center">
                                <CheckCircle className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 1. SWIGGY & ZOMATO DELIVERY TEMPLATE FIELDS */}
                  {formGateTemplate === "DELIVERY_DINING" && (
                    <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-3 animate-in fade-in">
                      <div className="flex items-center gap-2 text-rose-950 font-bold text-xs">
                        <Utensils className="w-4 h-4 text-rose-600" />
                        <span>Swiggy & Zomato Delivery Portal Settings</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Swiggy Restaurant URL
                          </label>
                          <input
                            type="url"
                            value={formSwiggyUrl}
                            onChange={(e) => setFormSwiggyUrl(e.target.value)}
                            placeholder="https://www.swiggy.com/restaurants/..."
                            className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Zomato Restaurant URL
                          </label>
                          <input
                            type="url"
                            value={formZomatoUrl}
                            onChange={(e) => setFormZomatoUrl(e.target.value)}
                            placeholder="https://www.zomato.com/..."
                            className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Direct Takeaway Phone (Optional)
                          </label>
                          <input
                            type="tel"
                            value={formDeliveryPhone}
                            onChange={(e) => setFormDeliveryPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Offer Banner Text (Optional)
                          </label>
                          <input
                            type="text"
                            value={formDeliveryOfferText}
                            onChange={(e) => setFormDeliveryOfferText(e.target.value)}
                            placeholder="Flat 15% OFF on takeaway orders!"
                            className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. GOOGLE REVIEW SMART GATE FIELDS */}
                  {formGateTemplate === "GOOGLE_REVIEW" && (
                    <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3 animate-in fade-in">
                      <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                        <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
                        <span>Google Review Smart Gate Settings</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Google Business Review URL *
                        </label>
                        <input
                          type="url"
                          required
                          value={formGoogleUrl}
                          onChange={(e) => setFormGoogleUrl(e.target.value)}
                          placeholder="https://g.page/r/your-id/review"
                          className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white border border-amber-200 rounded-xl">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            Smart 5-Star Gate Protection
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            4-5★ routes to Google Review with AI sentence suggestions; 1-3★ opens private manager feedback form
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={formSmartGate}
                          onChange={(e) => setFormSmartGate(e.target.checked)}
                          className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {/* 3. SOCIAL MEDIA HUB FIELDS */}
                  {formGateTemplate === "SOCIAL_HUB" && (
                    <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-3 animate-in fade-in">
                      <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs">
                        <Layers className="w-4 h-4 text-indigo-600" />
                        <span>Social Media Channels</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Instagram URL
                          </label>
                          <input
                            type="url"
                            value={formInstagramUrl}
                            onChange={(e) => setFormInstagramUrl(e.target.value)}
                            placeholder="https://instagram.com/yourhandle"
                            className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Facebook URL
                          </label>
                          <input
                            type="url"
                            value={formFacebookUrl}
                            onChange={(e) => setFormFacebookUrl(e.target.value)}
                            placeholder="https://facebook.com/yourpage"
                            className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          YouTube Channel (Optional)
                        </label>
                        <input
                          type="url"
                          value={formYoutubeUrl}
                          onChange={(e) => setFormYoutubeUrl(e.target.value)}
                          placeholder="https://youtube.com/@channel"
                          className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* 4. CUSTOM REDIRECTION / DIGITAL MENU FIELDS */}
                  {formGateTemplate === "CUSTOM_REDIRECT" && (
                    <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-3 animate-in fade-in">
                      <div className="flex items-center gap-2 text-purple-950 font-bold text-xs">
                        <Globe className="w-4 h-4 text-purple-600" />
                        <span>Digital Menu / Custom Destination</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Target URL (Online Menu, Website, PDF) *
                        </label>
                        <input
                          type="url"
                          required
                          value={formCustomUrl}
                          onChange={(e) => setFormCustomUrl(e.target.value)}
                          placeholder="https://yourbrand.com/menu"
                          className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Button Title (Shown on Gate Screen)
                        </label>
                        <input
                          type="text"
                          value={formCustomTitle}
                          onChange={(e) => setFormCustomTitle(e.target.value)}
                          placeholder="View Online Menu"
                          className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white border border-purple-200 rounded-xl">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            Direct Instant Redirect
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            Bypass intermediate gate screen and hop straight to target URL
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

                  {/* Optional Greeting Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Custom Greeting Title on Screen (Optional)
                    </label>
                    <input
                      type="text"
                      value={formGreetingTitle}
                      onChange={(e) => setFormGreetingTitle(e.target.value)}
                      placeholder="e.g. Order Online & Takeaway, How was your meal?"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save Card & Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: 1-Click Reset ALL Cards to Default Business Gate */}
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
              This will immediately set all <strong className="text-slate-900">{cards.length} cards</strong> back to your business&apos;s Default Brand Gate. Any individual overrides (such as delivery or custom URLs) will be cleared.
            </p>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl mb-5 space-y-1 text-xs">
              <div className="text-slate-700 font-semibold">
                ✓ No Hardware Changes:
              </div>
              <div className="text-slate-500">
                All physical NFC stands & printed QR codes will instantly route to your default business template.
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
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setShowBulkModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              {bulkMode === "ALL"
                ? `Assign Template to All (${cards.length}) Cards`
                : `Assign Template to (${selectedCardIds.length}) Selected Cards`}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select which dynamic gate template all targeted cards should display:
            </p>

            <form onSubmit={handleBulkSubmit} className="space-y-4">
              {/* Template selection */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBulkTemplate("DELIVERY_DINING")}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                    bulkTemplate === "DELIVERY_DINING"
                      ? "border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-200"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  <span className="block text-sm">🛵</span>
                  <span className="block mt-0.5">Swiggy & Zomato</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBulkTemplate("GOOGLE_REVIEW")}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                    bulkTemplate === "GOOGLE_REVIEW"
                      ? "border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-200"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  <span className="block text-sm">⭐</span>
                  <span className="block mt-0.5">Google Review Gate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBulkTemplate("CUSTOM_REDIRECT")}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                    bulkTemplate === "CUSTOM_REDIRECT"
                      ? "border-purple-500 bg-purple-50 text-purple-900 ring-2 ring-purple-200"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  <span className="block text-sm">📖</span>
                  <span className="block mt-0.5">Digital Menu / URL</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBulkTemplate("DEFAULT")}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                    bulkTemplate === "DEFAULT"
                      ? "border-teal-500 bg-teal-50 text-teal-900 ring-2 ring-teal-200"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  <span className="block text-sm">🏢</span>
                  <span className="block mt-0.5">Company Default</span>
                </button>
              </div>

              {/* Template specific fields */}
              {bulkTemplate === "DELIVERY_DINING" && (
                <div className="space-y-3 p-3.5 bg-rose-50/60 border border-rose-200 rounded-2xl">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Swiggy URL
                    </label>
                    <input
                      type="url"
                      value={bulkSwiggyUrl}
                      onChange={(e) => setBulkSwiggyUrl(e.target.value)}
                      placeholder="https://www.swiggy.com/..."
                      className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Zomato URL
                    </label>
                    <input
                      type="url"
                      value={bulkZomatoUrl}
                      onChange={(e) => setBulkZomatoUrl(e.target.value)}
                      placeholder="https://www.zomato.com/..."
                      className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              {bulkTemplate === "GOOGLE_REVIEW" && (
                <div className="space-y-3 p-3.5 bg-amber-50/60 border border-amber-200 rounded-2xl">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Google Review URL
                    </label>
                    <input
                      type="url"
                      value={bulkGoogleUrl}
                      onChange={(e) => setBulkGoogleUrl(e.target.value)}
                      placeholder="https://g.page/r/..."
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              {bulkTemplate === "CUSTOM_REDIRECT" && (
                <div className="space-y-3 p-3.5 bg-purple-50/60 border border-purple-200 rounded-2xl">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Target Destination URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={bulkCustomUrl}
                      onChange={(e) => setBulkCustomUrl(e.target.value)}
                      placeholder="https://yourbrand.com/menu"
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Button Title
                    </label>
                    <input
                      type="text"
                      value={bulkCustomTitle}
                      onChange={(e) => setBulkCustomTitle(e.target.value)}
                      placeholder="View Online Menu"
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white border border-purple-200 rounded-xl">
                    <span className="text-xs font-semibold text-slate-800">
                      Direct Instant Redirect
                    </span>
                    <input
                      type="checkbox"
                      checked={bulkDirect}
                      onChange={(e) => setBulkDirect(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? "Applying..." : "Apply to Cards"}
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
    </div>
  );
}
