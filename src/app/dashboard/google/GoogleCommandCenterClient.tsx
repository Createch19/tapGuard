"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Sparkles,
  Star,
  MessageSquare,
  HelpCircle,
  UtensilsCrossed,
  Clock,
  Send,
  Camera,
  BarChart3,
  Settings,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Flag,
  Plus,
  ChevronDown,
  Globe,
  Phone,
  Eye,
  Sliders,
  Check,
  Smartphone,
  Tag,
  Share2,
  Calendar,
  Building2,
  Store,
  Layers,
  Percent,
  Lock,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { GoogleHubData } from "@/lib/google-business";

interface GoogleCommandCenterProps {
  tenant: {
    id: string;
    name: string;
    plan: string;
    businessType: string;
    googleReviewUrl: string | null;
    googleBusinessEmail?: string | null;
    googleLocationId?: string | null;
    hasGeminiKey?: boolean;
    primaryColor: string;
    isPlanAllowed: boolean;
  };
  initialData: GoogleHubData;
}

type ActiveTab =
  | "reviews"
  | "qa"
  | "menu"
  | "hours"
  | "posts"
  | "photos"
  | "analytics"
  | "settings";

export default function GoogleCommandCenterClient({
  tenant,
  initialData,
}: GoogleCommandCenterProps) {
  const [data, setData] = useState<GoogleHubData>(initialData);
  const [activeTab, setActiveTab] = useState<ActiveTab>("reviews");
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    initialData.locations[0]?.id || ""
  );
  const [isResyncing, setIsResyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reviews Tab state
  const [reviewRatingFilter, setReviewRatingFilter] = useState<number | "all">("all");
  const [unrepliedOnly, setUnrepliedOnly] = useState(false);
  const [generatingReplyId, setGeneratingReplyId] = useState<string | null>(null);
  const [publishingReplyId, setPublishingReplyId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyTone, setReplyTone] = useState<string>(data.geminiConfig.brandTone || "WARM");

  // Q&A Tab state
  const [generatingQAId, setGeneratingQAId] = useState<string | null>(null);
  const [publishingQAId, setPublishingQAId] = useState<string | null>(null);
  const [qaDrafts, setQaDrafts] = useState<Record<string, string>>({});

  // Menu Tab state
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({
    name: "",
    description: "",
    price: "",
    sectionId: data.menuSections[0]?.id || "",
    categoryName: "",
    dietaryTag: "VEGETARIAN",
  });

  // Hours Tab state
  const [weeklyHours, setWeeklyHours] = useState(
    data.locations[0]?.regularHours || {
      monday: { open: "08:00", close: "22:00" },
      tuesday: { open: "08:00", close: "22:00" },
      wednesday: { open: "08:00", close: "22:00" },
      thursday: { open: "08:00", close: "22:00" },
      friday: { open: "08:00", close: "23:00" },
      saturday: { open: "08:00", close: "23:30" },
      sunday: { open: "08:30", close: "22:30" },
    }
  );
  const [isSavingHours, setIsSavingHours] = useState(false);

  // Sync hours if activeLocation changes
  useEffect(() => {
    if (data.locations[0]?.regularHours && Object.keys(data.locations[0].regularHours).length > 0) {
      setWeeklyHours(data.locations[0].regularHours);
    }
  }, [data.locations]);

  // Posts Tab state
  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [newPost, setNewPost] = useState({
    topicType: "OFFER",
    summary: "",
    couponCode: "",
    callToAction: "VIEW_ITEM",
    actionUrl: tenant.googleReviewUrl || "https://tapgate.io",
    daysValid: "7",
  });
  const [isPublishingPost, setIsPublishingPost] = useState(false);

  // Photos Tab state
  const [photoCategoryFilter, setPhotoCategoryFilter] = useState("all");
  const [flaggingMediaId, setFlaggingMediaId] = useState<string | null>(null);

  // Gemini Settings Tab state
  const [geminiModel, setGeminiModel] = useState(data.geminiConfig.model || "gemini-1.5-flash");
  const [geminiTone, setGeminiTone] = useState(data.geminiConfig.brandTone || "WARM");
  const [knowledgeBase, setKnowledgeBase] = useState(data.geminiConfig.knowledgeBase || "");
  const [escalationPhone, setEscalationPhone] = useState(data.geminiConfig.escalationPhone || "");
  const [autoPilot5Star, setAutoPilot5Star] = useState(data.geminiConfig.autoPilot5Star);
  const [customApiKey, setCustomApiKey] = useState("");
  const [isSavingGemini, setIsSavingGemini] = useState(false);

  // Simulator Toggle
  const [showMobileSimulator, setShowMobileSimulator] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Re-sync with Google
  const handleResync = async () => {
    setIsResyncing(true);
    try {
      const res = await fetch("/api/dashboard/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resync" }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        showToast("Google Profile and Maps metrics re-synced successfully!");
      }
    } catch {
      showToast("Failed to re-sync with Google.");
    } finally {
      setIsResyncing(false);
    }
  };

  // Generate Review Reply with Gemini
  const handleGenerateReply = async (reviewId: string) => {
    setGeneratingReplyId(reviewId);
    try {
      const res = await fetch("/api/dashboard/google/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_reply",
          reviewId,
          customTone: replyTone,
        }),
      });
      const json = await res.json();
      if (json.success && json.draft) {
        setReplyDrafts((prev) => ({ ...prev, [reviewId]: json.draft }));
        showToast("Gemini AI drafted a personalized reply!");
      }
    } catch {
      showToast("Error generating reply.");
    } finally {
      setGeneratingReplyId(null);
    }
  };

  // Publish Reply to Google
  const handlePublishReply = async (reviewId: string) => {
    const text = replyDrafts[reviewId];
    if (!text || !text.trim()) return;

    setPublishingReplyId(reviewId);
    try {
      const res = await fetch("/api/dashboard/google/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish_reply",
          reviewId,
          replyText: text,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setData((prev) => ({
          ...prev,
          reviews: prev.reviews.map((r) =>
            r.id === reviewId
              ? { ...r, replyComment: text, replyUpdatedAt: new Date().toISOString() }
              : r
          ),
        }));
        showToast("Official reply published to Google Maps!");
      }
    } catch {
      showToast("Failed to publish reply.");
    } finally {
      setPublishingReplyId(null);
    }
  };

  // Generate Answer for Google Question
  const handleGenerateQA = async (questionId: string) => {
    setGeneratingQAId(questionId);
    try {
      const res = await fetch("/api/dashboard/google/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_answer", questionId }),
      });
      const json = await res.json();
      if (json.success && json.draft) {
        setQaDrafts((prev) => ({ ...prev, [questionId]: json.draft }));
        showToast("Gemini drafted a grounded answer!");
      }
    } catch {
      showToast("Failed to generate answer.");
    } finally {
      setGeneratingQAId(null);
    }
  };

  // Publish Answer to Google Q&A
  const handlePublishQA = async (questionId: string) => {
    const text = qaDrafts[questionId];
    if (!text || !text.trim()) return;

    setPublishingQAId(questionId);
    try {
      const res = await fetch("/api/dashboard/google/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish_answer",
          questionId,
          answerText: text,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setData((prev) => ({
          ...prev,
          questions: prev.questions.map((q) =>
            q.id === questionId
              ? { ...q, officialAnswer: text, isAnswered: true }
              : q
          ),
        }));
        showToast("Answer published live to Google Maps Q&A!");
      }
    } catch {
      showToast("Failed to publish answer.");
    } finally {
      setPublishingQAId(null);
    }
  };

  // Toggle Menu Item Stock Availability
  const handleToggleStock = async (itemId: string) => {
    setTogglingItemId(itemId);
    try {
      const res = await fetch("/api/dashboard/google/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_stock", itemId }),
      });
      const json = await res.json();
      if (json.success && json.item) {
        setData((prev) => ({
          ...prev,
          menuSections: prev.menuSections.map((sec) => ({
            ...sec,
            items: sec.items.map((it) =>
              it.id === itemId ? { ...it, isAvailable: json.item.isAvailable } : it
            ),
          })),
        }));
        showToast(json.message);
      }
    } catch {
      showToast("Error updating stock availability.");
    } finally {
      setTogglingItemId(null);
    }
  };

  // Add Menu Item
  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/dashboard/google/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_item",
          sectionId: newMenuItem.sectionId === "NEW" ? "" : newMenuItem.sectionId,
          categoryName: newMenuItem.categoryName,
          name: newMenuItem.name,
          description: newMenuItem.description,
          price: Number(newMenuItem.price),
          dietaryTags: [newMenuItem.dietaryTag],
        }),
      });
      const json = await res.json();
      if (json.success && json.item) {
        // Re-fetch complete data bundle to reflect updated sections & items
        const refreshRes = await fetch("/api/dashboard/google");
        const refreshJson = await refreshRes.json();
        if (refreshJson.success && refreshJson.data) {
          setData(refreshJson.data);
        }
        setShowAddMenuModal(false);
        setNewMenuItem({
          name: "",
          description: "",
          price: "",
          sectionId: data.menuSections[0]?.id || "",
          categoryName: "",
          dietaryTag: "VEGETARIAN",
        });
        showToast("Item added to Google Structured Menu!");
      } else {
        showToast(json.error || "Failed to add menu item.");
      }
    } catch {
      showToast("Failed to add menu item.");
    }
  };

  // Save Operating Hours
  const handleSaveHours = async () => {
    setIsSavingHours(true);
    try {
      const res = await fetch("/api/dashboard/google/hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: selectedLocationId,
          regularHours: weeklyHours,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Operating hours synced to Google Search & Maps!");
      }
    } catch {
      showToast("Failed to save hours.");
    } finally {
      setIsSavingHours(false);
    }
  };

  // Create & Publish Google Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishingPost(true);
    try {
      const endDate = new Date(Date.now() + Number(newPost.daysValid) * 86400000);
      const res = await fetch("/api/dashboard/google/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: selectedLocationId,
          topicType: newPost.topicType,
          summary: newPost.summary,
          couponCode: newPost.couponCode,
          callToAction: newPost.callToAction,
          actionUrl: newPost.actionUrl,
          endDate: endDate.toISOString(),
        }),
      });
      const json = await res.json();
      if (json.success && json.post) {
        setData((prev) => ({
          ...prev,
          posts: [json.post, ...prev.posts],
        }));
        setShowAddPostModal(false);
        setNewPost({
          topicType: "OFFER",
          summary: "",
          couponCode: "",
          callToAction: "VIEW_ITEM",
          actionUrl: tenant.googleReviewUrl || "https://tapgate.io",
          daysValid: "7",
        });
        showToast("Google Post published live to Google Search & Maps!");
      }
    } catch {
      showToast("Failed to publish Google Post.");
    } finally {
      setIsPublishingPost(false);
    }
  };

  // Flag Customer Photo
  const handleFlagPhoto = async (mediaId: string) => {
    setFlaggingMediaId(mediaId);
    try {
      const res = await fetch("/api/dashboard/google/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "flag_photo",
          mediaId,
          flagReason: "Inappropriate / Not relevant to business",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setData((prev) => ({
          ...prev,
          mediaItems: prev.mediaItems.map((m) =>
            m.id === mediaId ? { ...m, flaggedForRemoval: true } : m
          ),
        }));
        showToast("Removal request flagged and sent to Google Content Review team.");
      }
    } catch {
      showToast("Failed to flag image.");
    } finally {
      setFlaggingMediaId(null);
    }
  };

  // Save Gemini Configuration
  const handleSaveGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGemini(true);
    try {
      const res = await fetch("/api/dashboard/google/gemini", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: geminiModel,
          brandTone: geminiTone,
          knowledgeBase,
          escalationPhone,
          autoPilot5Star,
          customApiKey: customApiKey || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Gemini AI grounding configuration updated successfully!");
      }
    } catch {
      showToast("Failed to update Gemini settings.");
    } finally {
      setIsSavingGemini(false);
    }
  };

  // Filter reviews
  const filteredReviews = data.reviews.filter((r) => {
    if (reviewRatingFilter !== "all" && r.rating !== reviewRatingFilter) return false;
    if (unrepliedOnly && r.replyComment) return false;
    return true;
  });

  // Filter photos
  const filteredPhotos = data.mediaItems.filter((p) => {
    if (photoCategoryFilter === "all") return true;
    if (photoCategoryFilter === "customer") return p.isCustomerUser;
    return p.category.toLowerCase() === photoCategoryFilter.toLowerCase();
  });

  // 1. Subscription Tier Gate Check:
  if (!tenant.isPlanAllowed) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Pro & Enterprise Feature
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Google Hub & Gemini Command Center
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Supercharge your local search presence with real-time Google Business Profile synchronization, Gemini AI review reply autopilot, structured digital menu updates, and automated Google Maps Q&A management.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard/subscription"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-teal-500/20 transition-all hover:scale-102 active:scale-98"
              >
                <span>Upgrade to Pro Plan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard/settings"
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-2xl border border-white/15 transition-colors"
              >
                Configure Settings
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Grid Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 text-lg">Gemini AI Review Autopilot</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Draft or automatically publish contextually grounded review replies in seconds matching your brand tone (Warm, Professional, Casual, or Luxury).
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 text-lg">Google Maps Q&A Assistant</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Detect new customer questions on Google Maps and automatically answer with knowledge base grounding (parking, dietary tags, operating hours).
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 text-lg">Live Menu & Out-of-Stock Sync</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Push items, descriptions, and dietary labels directly into Google Search. Mark items out of stock in one click to prevent customer disappointment.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 text-lg">Search vs. Maps Performance</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Unpack customer discovery trends, phone call clicks, website visits, and top search queries driving customers to your venue.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Connection Provisioning Check:
  if (!data.connection.isConnected || data.locations.length === 0) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-16">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Google Business Profile Connection Required
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Provision your Google Business details and Gemini API in Settings to activate the command center
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/settings"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors shrink-0"
            >
              <Settings className="w-4 h-4" />
              <span>Configure in Settings</span>
            </Link>
          </div>

          {/* Provisioning Checklist */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Integration Requirements Checklist
            </p>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-start gap-4">
              <div className="mt-0.5">
                {tenant.googleReviewUrl ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Google Review Direct Link</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    tenant.googleReviewUrl ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {tenant.googleReviewUrl ? "Configured" : "Action Required"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tenant.googleReviewUrl
                    ? `Routing to: ${tenant.googleReviewUrl}`
                    : "Enter your official Google Maps write-a-review link (e.g., https://g.page/r/.../review)"}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-start gap-4">
              <div className="mt-0.5">
                {tenant.googleBusinessEmail ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Google Business Account & Gmail</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    tenant.googleBusinessEmail ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {tenant.googleBusinessEmail ? "Configured" : "Action Required"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tenant.googleBusinessEmail
                    ? `Connected email: ${tenant.googleBusinessEmail}`
                    : "Add your business management email or Google Account ID in Tenant Settings"}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-start gap-4">
              <div className="mt-0.5">
                {tenant.hasGeminiKey ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Google Gemini AI API Key</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    tenant.hasGeminiKey ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                  }`}>
                    {tenant.hasGeminiKey ? "Configured" : "Recommended"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tenant.hasGeminiKey
                    ? "Custom Gemini API Key active for ground-truth reviews & Q&A replies"
                    : "Provide your Google AI Studio API key in Settings to power automated review replies"}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/dashboard/settings"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
            >
              <span>Open Settings to Connect Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleResync}
              disabled={isResyncing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isResyncing ? "animate-spin" : ""}`} />
              <span>{isResyncing ? "Checking..." : "Recheck Connection"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeLocation =
    data.locations.find((l) => l.id === selectedLocationId) || data.locations[0];

  const unansweredQACount = data.questions.filter((q) => !q.isAnswered).length;
  const unrepliedReviewsCount = data.reviews.filter((r) => !r.replyComment).length;

  // Dynamic review metrics
  const totalReviewsCount = data.reviews.length;
  const averageRatingNum =
    totalReviewsCount > 0
      ? data.reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalReviewsCount
      : 0;
  const averageRating = totalReviewsCount > 0 ? averageRatingNum.toFixed(1) : "0.0";

  // Recent reviews (last 30 days)
  const nowMs = Date.now();
  const thirtyDaysMs = 30 * 86400000;
  const recentReviewsThisMonth = data.reviews.filter(
    (r) => nowMs - new Date(r.reviewCreatedAt).getTime() < thirtyDaysMs
  ).length;

  const repliedReviewsCount = totalReviewsCount - unrepliedReviewsCount;
  const responseRatePercent =
    totalReviewsCount > 0
      ? Math.round((repliedReviewsCount / totalReviewsCount) * 100)
      : 100;

  // Monthly impressions & trend
  const monthlyImpressionsRaw = data.performance?.monthlyImpressions || 0;
  const monthlyImpressionsFormatted =
    monthlyImpressionsRaw >= 1000
      ? `${(monthlyImpressionsRaw / 1000).toFixed(1)}K`
      : `${monthlyImpressionsRaw}`;
  const impressionsTrend = data.performance?.impressionsTrendPercent ?? 18.2;

  // Operating status for today (used in mobile preview)
  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const currentDayName = daysOfWeek[new Date().getDay()];
  const todaySchedule = weeklyHours?.[currentDayName] || { open: "08:00", close: "22:00", isClosed: false };

  let hoursStatusText = "Open · Closes 10:00 PM";
  let isStoreOpen = true;
  if (todaySchedule?.isClosed) {
    hoursStatusText = "Closed today";
    isStoreOpen = false;
  } else if (todaySchedule?.open && todaySchedule?.close) {
    const formatTimeStr = (t: string) => {
      const [hStr, mStr] = t.split(":");
      const h = parseInt(hStr, 10);
      if (isNaN(h)) return t;
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      return `${h12}:${mStr || "00"} ${ampm}`;
    };
    hoursStatusText = `Open · Closes ${formatTimeStr(todaySchedule.close)}`;
  }

  // Photo categories dynamically extracted from mediaItems
  const availablePhotoCategories = Array.from(
    new Set(data.mediaItems.map((m) => m.category).filter(Boolean))
  );
  const hasCustomerPhotos = data.mediaItems.some((m) => m.isCustomerUser);

  const renderStars = (rating: number) => {
    const rounded = Math.round(rating);
    const clamped = Math.min(5, Math.max(0, rounded));
    return "★".repeat(clamped) + "☆".repeat(5 - clamped);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Hero Bar: Location Switcher + Connection Health + Resync */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              {data.connection.isVerified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Google Maps Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Verification Pending
                </span>
              )}
              <span className="text-xs text-slate-400 font-mono">
                {data.connection.connectedEmail}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {activeLocation?.title || tenant.name}
              </h1>
              {data.locations.length > 1 && (
                <div className="relative">
                  <select
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                    className="bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/20 focus:outline-none cursor-pointer"
                  >
                    {data.locations.map((loc) => (
                      <option key={loc.id} value={loc.id} className="text-slate-900">
                        {loc.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Official Google Business Profile Command Center. Manage customer reviews,
              grounded Gemini AI answers, live digital menu stock, and local search visibility.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleResync}
              disabled={isResyncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResyncing ? "animate-spin" : ""}`} />
              <span>{isResyncing ? "Syncing..." : "Re-sync with Google"}</span>
            </button>

            {tenant.googleReviewUrl && (
              <a
                href={tenant.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-sm"
              >
                <span>View Google Listing</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={() => setShowMobileSimulator(!showMobileSimulator)}
              className="hidden lg:inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-teal-400" />
              <span>{showMobileSimulator ? "Hide Simulator" : "Show Simulator"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Executive KPI Metric Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rating */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Google Rating
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-slate-900">
              {totalReviewsCount > 0 ? averageRating : "0.0"}
            </div>
            <div className="flex text-amber-400 text-sm">
              {renderStars(averageRatingNum)}
            </div>
          </div>
          <div className="text-xs text-slate-500 font-semibold mt-1">
            {totalReviewsCount > 0
              ? `Based on ${totalReviewsCount} customer review${totalReviewsCount === 1 ? "" : "s"}`
              : "No reviews synced yet"}
          </div>
        </div>

        {/* Total Reviews */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Reviews
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{totalReviewsCount.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-600 font-semibold">+{recentReviewsThisMonth} this month</span>
            <span>·</span>
            <span>{responseRatePercent}% response rate</span>
          </div>
        </div>

        {/* Unanswered Q&A */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Maps Q&A Pending
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-slate-900">{unansweredQACount}</div>
            {unansweredQACount > 0 ? (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Action Needed
              </span>
            ) : (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                All Answered
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {unansweredQACount > 0 ? "Gemini ground-truth drafts ready" : "All customer questions up to date"}
          </div>
        </div>

        {/* Search Impressions */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Monthly Impressions
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{monthlyImpressionsFormatted}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            +{impressionsTrend}% from previous month
          </div>
        </div>
      </div>

      {/* Unified Command Tabs Bar */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-1 overflow-x-auto">
        {[
          { id: "reviews", label: "Reviews & AI Replies", icon: Star, badge: unrepliedReviewsCount },
          { id: "qa", label: "Maps Q&A", icon: HelpCircle, badge: unansweredQACount },
          { id: "menu", label: "Live Menu & Stock", icon: UtensilsCrossed },
          { id: "hours", label: "Store Hours", icon: Clock },
          { id: "posts", label: "Google Posts", icon: Send },
          { id: "photos", label: "Photo Showcase", icon: Camera },
          { id: "analytics", label: "Search Analytics", icon: BarChart3 },
          { id: "settings", label: "Gemini & Account Settings", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              {typeof tab.badge === "number" && tab.badge > 0 && (
                <span
                  className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                    isActive ? "bg-teal-500 text-white" : "bg-teal-100 text-teal-800"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Workspace Layout (Left: Selected Tool, Right: Live Simulator) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Command Tab Body */}
        <div className={showMobileSimulator ? "lg:col-span-8 space-y-6" : "lg:col-span-12 space-y-6"}>
          {/* TAB 1: REVIEWS & AI REPLIES */}
          {activeTab === "reviews" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Google Reviews & Gemini Smart Replies
                  </h2>
                  <p className="text-xs text-slate-500">
                    Directly reply to Google customer reviews with contextual AI drafting
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={replyTone}
                    onChange={(e) => setReplyTone(e.target.value)}
                    className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
                  >
                    <option value="WARM">Voice: Warm & Hospitable</option>
                    <option value="PROFESSIONAL">Voice: Professional & Reassuring</option>
                    <option value="CASUAL">Voice: Casual & Friendly</option>
                    <option value="SHORT">Voice: Short & Direct</option>
                    <option value="LUXURY">Voice: Luxury & Refined</option>
                  </select>

                  <button
                    onClick={() => setUnrepliedOnly(!unrepliedOnly)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                      unrepliedOnly
                        ? "bg-teal-50 text-teal-800 border-teal-200 font-bold"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {unrepliedOnly ? "Showing Unreplied Only" : "All Reviews"}
                  </button>
                </div>
              </div>

              {/* Reviews List */}
              {filteredReviews.length === 0 ? (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                    <Star className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800">No reviews found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {unrepliedOnly
                        ? "Great job! All customer reviews have been replied to."
                        : "Customer reviews from Google Maps will automatically appear here once synchronized."}
                    </p>
                  </div>
                  {unrepliedOnly && (
                    <button
                      onClick={() => setUnrepliedOnly(false)}
                      className="text-xs text-teal-600 font-bold hover:underline cursor-pointer"
                    >
                      View all reviews
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReviews.map((rev) => {
                    const isGenerating = generatingReplyId === rev.id;
                    const isPublishing = publishingReplyId === rev.id;
                    const draftText = replyDrafts[rev.id] ?? rev.geminiDraftReply ?? "";

                    return (
                      <div
                        key={rev.id}
                        className="p-5 rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-all space-y-3 bg-white"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={rev.reviewerPhotoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                              alt={rev.reviewerName}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <div className="font-bold text-sm text-slate-900">
                                {rev.reviewerName}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <div className="flex text-amber-400 text-xs">
                                  {"★".repeat(rev.rating)}
                                  <span className="text-slate-200">
                                    {"★".repeat(5 - rev.rating)}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400">
                                  {new Date(rev.reviewCreatedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {rev.replyComment ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Replied on Google
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Awaiting Response
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                          "{rev.comment || "Left 5-star rating without text."}"
                        </p>

                        {/* Existing Published Reply */}
                        {rev.replyComment && (
                          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              <Store className="w-3.5 h-3.5 text-teal-600" />
                              <span>Response from the owner</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                ({rev.replyUpdatedAt ? new Date(rev.replyUpdatedAt).toLocaleDateString() : "Live"})
                              </span>
                            </div>
                            <p className="text-slate-600 leading-relaxed">{rev.replyComment}</p>
                          </div>
                        )}

                        {/* Gemini Reply Drafting Area (for unreplied reviews) */}
                        {!rev.replyComment && (
                          <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                                <span>Gemini Suggested Reply</span>
                              </div>
                              <button
                                onClick={() => handleGenerateReply(rev.id)}
                                disabled={isGenerating}
                                className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 cursor-pointer"
                              >
                                <RefreshCw className={`w-3 h-3 ${isGenerating ? "animate-spin" : ""}`} />
                                <span>{isGenerating ? "Drafting with Gemini..." : "Re-draft with Gemini"}</span>
                              </button>
                            </div>

                            <textarea
                              value={draftText}
                              onChange={(e) =>
                                setReplyDrafts((prev) => ({
                                  ...prev,
                                  [rev.id]: e.target.value,
                                }))
                              }
                              placeholder="Gemini will craft an authentic response here..."
                              rows={3}
                              className="w-full text-xs text-slate-800 p-3 bg-white rounded-xl border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
                            />

                            <div className="flex items-center justify-between gap-3 pt-1">
                              <span className="text-[11px] text-slate-400">
                                Voice: <strong>{replyTone}</strong> · Grounded in store knowledge
                              </span>
                              <button
                                onClick={() => handlePublishReply(rev.id)}
                                disabled={isPublishing || !draftText.trim()}
                                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>{isPublishing ? "Publishing..." : "Publish to Google Maps"}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MAPS Q&A */}
          {activeTab === "qa" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Google Maps Public Q&A Manager
                  </h2>
                  <p className="text-xs text-slate-500">
                    Monitor public customer questions and publish accurate answers grounded in your store policies
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-full">
                  {unansweredQACount} Questions Pending
                </span>
              </div>

              {data.questions.length === 0 ? (
                <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800">No pending public questions</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Google Search & Maps now automatically synthesize answers for customer questions using verified business Ground Truth. Configure your store policies and FAQ in the Gemini AI tab so Google delivers 100% accurate information to searchers.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Configure Gemini Ground Truth</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.questions.map((q) => {
                    const draftAnswer = qaDrafts[q.id] ?? q.geminiDraftAnswer ?? "";
                    const isGenerating = generatingQAId === q.id;
                    const isPublishing = publishingQAId === q.id;

                    return (
                      <div
                        key={q.id}
                        className="p-5 rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-all space-y-3 bg-white"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                {q.authorName}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                · asked {new Date(q.questionCreatedAt).toLocaleDateString()}
                              </span>
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                                ▲ {q.upvoteCount} upvotes
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">
                              "{q.questionText}"
                            </h3>
                          </div>

                          {q.isAnswered ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Official Answer Live
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Unanswered
                            </span>
                          )}
                        </div>

                        {/* Official Live Answer if already published */}
                        {q.officialAnswer && (
                          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Official Owner Answer on Google Maps</span>
                            </div>
                            <p className="text-slate-600 leading-relaxed">{q.officialAnswer}</p>
                          </div>
                        )}

                        {/* Gemini Answer Drafting Section */}
                        {!q.isAnswered && (
                          <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-950">
                                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                                <span>Gemini Grounded Answer (Based on Store Policies)</span>
                              </div>
                              <button
                                onClick={() => handleGenerateQA(q.id)}
                                disabled={isGenerating}
                                className="text-[11px] font-semibold text-sky-700 hover:text-sky-900 inline-flex items-center gap-1 cursor-pointer"
                              >
                                <RefreshCw className={`w-3 h-3 ${isGenerating ? "animate-spin" : ""}`} />
                                <span>{isGenerating ? "Drafting..." : "Re-draft with Gemini"}</span>
                              </button>
                            </div>

                            <textarea
                              value={draftAnswer}
                              onChange={(e) =>
                                setQaDrafts((prev) => ({
                                  ...prev,
                                  [q.id]: e.target.value,
                                }))
                              }
                              placeholder="Gemini will craft an accurate answer grounded in your business details..."
                              rows={2}
                              className="w-full text-xs text-slate-800 p-3 bg-white rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed"
                            />

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[11px] text-slate-400">
                                Grounded in FAQs, menu items, and opening hours
                              </span>
                              <button
                                onClick={() => handlePublishQA(q.id)}
                                disabled={isPublishing || !draftAnswer.trim()}
                                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>{isPublishing ? "Posting..." : "Approve & Post to Google Maps"}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LIVE MENU & STOCK */}
          {activeTab === "menu" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Google Structured Menu & Real-Time Stock
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pushes categories, prices, and instant Out-of-Stock toggles directly into Google Maps & Search
                  </p>
                </div>
                <button
                  onClick={() => setShowAddMenuModal(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Menu Item</span>
                </button>
              </div>

              {/* Menu Sections */}
              {data.menuSections.length === 0 ? (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                    <UtensilsCrossed className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800">No menu or catalogue items yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Add items and sections to showcase your offerings directly on Google Maps and search results.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddMenuModal(true)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add First Menu Item</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {data.menuSections.map((section) => (
                    <div key={section.id} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                        <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                          {section.title}
                        </h3>
                        <span className="text-xs text-slate-400">
                          ({section.items.length} items synced)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {section.items.map((item) => (
                          <div
                            key={item.id}
                            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                              item.isAvailable
                                ? "bg-white border-slate-200/90 hover:border-slate-300"
                                : "bg-slate-50/80 border-slate-200 opacity-60"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                                />
                              )}
                              <div>
                                <div className="font-bold text-xs sm:text-sm text-slate-900">
                                  {item.name}
                                </div>
                                <div className="text-xs font-black text-teal-700 mt-0.5">
                                  ₹{item.price}
                                </div>
                                <div className="flex gap-1 mt-1">
                                  {item.dietaryTags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded font-bold"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleToggleStock(item.id)}
                              disabled={togglingItemId === item.id}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                item.isAvailable
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-rose-100 hover:text-rose-800"
                                  : "bg-rose-100 text-rose-800 hover:bg-emerald-100 hover:text-emerald-800"
                              }`}
                            >
                              {togglingItemId === item.id
                                ? "Updating..."
                                : item.isAvailable
                                ? "● In Stock"
                                : "✕ Out of Stock"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: STORE HOURS */}
          {activeTab === "hours" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Store Operating Hours & Special Days
                  </h2>
                  <p className="text-xs text-slate-500">
                    Keep your opening schedule accurate across Google Maps and Search Knowledge Panels
                  </p>
                </div>
                <button
                  onClick={handleSaveHours}
                  disabled={isSavingHours}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isSavingHours ? "Saving..." : "Save & Sync to Google"}</span>
                </button>
              </div>

              {/* Timetable Editor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(weeklyHours).map(([day, hours]: any) => (
                  <div
                    key={day}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                  >
                    <span className="font-bold text-xs text-slate-800 capitalize w-24">
                      {day}
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) =>
                          setWeeklyHours((prev: any) => ({
                            ...prev,
                            [day]: { ...prev[day], open: e.target.value },
                          }))
                        }
                        className="bg-white px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono"
                      />
                      <span className="text-slate-400">to</span>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) =>
                          setWeeklyHours((prev: any) => ({
                            ...prev,
                            [day]: { ...prev[day], close: e.target.value },
                          }))
                        }
                        className="bg-white px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Special Holidays */}
              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-2">
                <div className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  <span>Upcoming Special / Holiday Hours</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(activeLocation?.specialHours || []).length === 0 ? (
                    <div className="col-span-full py-2 text-slate-400 text-xs italic">
                      No upcoming special or holiday hours configured.
                    </div>
                  ) : (
                    (activeLocation?.specialHours || []).map((sh, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-white rounded-xl border border-teal-200/80 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{sh.note}</span>
                          <div className="text-[11px] text-slate-400 font-mono">{sh.date}</div>
                        </div>
                        <span className="text-xs font-bold text-teal-700">
                          {sh.open} – {sh.close}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GOOGLE POSTS */}
          {activeTab === "posts" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Google Posts, Offers & Announcements
                  </h2>
                  <p className="text-xs text-slate-500">
                    Publish rich promotional cards directly onto your Google Search knowledge panel
                  </p>
                </div>
                <button
                  onClick={() => setShowAddPostModal(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Google Post</span>
                </button>
              </div>

              {/* Posts Cards Grid */}
              {data.posts.length === 0 ? (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                    <Send className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800">No Google Posts published yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Publish offers, announcements, and events directly to your Google Search and Maps profile to engage visitors.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddPostModal(true)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Your First Post</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.posts.map((post) => (
                    <div
                      key={post.id}
                      className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white shadow-2xs space-y-3"
                    >
                      {post.mediaUrl && (
                        <img
                          src={post.mediaUrl}
                          alt="Post media"
                          className="w-full h-36 object-cover"
                        />
                      )}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                            {post.topicType}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Draft"}
                          </span>
                        </div>

                        <p className="text-xs font-medium text-slate-800 leading-relaxed">
                          {post.summary}
                        </p>

                        {post.couponCode && (
                          <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-xs font-mono font-bold text-amber-900 text-center">
                            Promo Code: {post.couponCode}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-400">Action: {post.callToAction || "View"}</span>
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Live on Google
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: PHOTOS */}
          {activeTab === "photos" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Google Maps Media & Customer Photo Moderation
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage high-resolution showcase photos and flag irrelevant customer uploads for Google removal
                  </p>
                </div>
                <div className="flex gap-2">
                  <select
                    value={photoCategoryFilter}
                    onChange={(e) => setPhotoCategoryFilter(e.target.value)}
                    className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none capitalize"
                  >
                    <option value="all">All Photos ({data.mediaItems.length})</option>
                    {availablePhotoCategories.map((cat) => (
                      <option key={cat} value={cat.toLowerCase()}>
                        {cat.replace(/_/g, " ")} ({data.mediaItems.filter((m) => m.category.toLowerCase() === cat.toLowerCase()).length})
                      </option>
                    ))}
                    {hasCustomerPhotos && (
                      <option value="customer">
                        Customer Uploads ({data.mediaItems.filter((m) => m.isCustomerUser).length})
                      </option>
                    )}
                  </select>
                </div>
              </div>

              {filteredPhotos.length === 0 ? (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800">No photos in this category</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {photoCategoryFilter !== "all"
                        ? "Try choosing another category or viewing all photos."
                        : "Showcase photos synced from your Google Business Profile will appear here."}
                    </p>
                  </div>
                  {photoCategoryFilter !== "all" && (
                    <button
                      onClick={() => setPhotoCategoryFilter("all")}
                      className="text-xs text-teal-600 font-bold hover:underline cursor-pointer"
                    >
                      View all photos
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {filteredPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square"
                    >
                      <img
                        src={photo.thumbnailUrl || photo.sourceUrl}
                        alt="Google Maps photo"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      <div className="absolute top-2 left-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs">
                          {photo.category}
                        </span>
                      </div>

                      {photo.isCustomerUser && (
                        <div className="absolute top-2 right-2">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500 text-white shadow-xs">
                            Customer
                          </span>
                        </div>
                      )}

                      {photo.isCustomerUser && !photo.flaggedForRemoval && (
                        <div className="absolute bottom-2 inset-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleFlagPhoto(photo.id)}
                            disabled={flaggingMediaId === photo.id}
                            className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-xl shadow-xs inline-flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Flag className="w-3 h-3" />
                            <span>Flag for Removal</span>
                          </button>
                        </div>
                      )}

                      {photo.flaggedForRemoval && (
                        <div className="absolute inset-0 bg-rose-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-center text-white">
                          <Flag className="w-5 h-5 text-rose-300 mb-1" />
                          <span className="text-[10px] font-bold">Removal Requested</span>
                          <span className="text-[8px] text-rose-200 mt-0.5">Under Google Review</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: SEARCH ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-900">
                  Google Search & Maps Performance Analytics
                </h2>
                <p className="text-xs text-slate-500">
                  Daily tracking of search impressions, call button taps, direction requests, and discovery queries
                </p>
              </div>

              {/* Impressions Area Chart */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Profile Impressions: Google Search vs. Google Maps (Last 14 Days)
                  </span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-teal-700 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Google Maps ({data.performance.searchVsMaps.mapsPercent}%)
                    </span>
                    <span className="flex items-center gap-1 text-indigo-700 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Google Search ({data.performance.searchVsMaps.searchPercent}%)
                    </span>
                  </div>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.performance.dailyMetrics}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="mapsImpressions"
                        name="Google Maps"
                        stroke="#0D9488"
                        fill="#CCFBF1"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="searchImpressions"
                        name="Google Search"
                        stroke="#6366F1"
                        fill="#E0E7FF"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Customer Actions Bar Chart */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-800">
                  Direct Customer Actions (Calls, Directions, Website Taps)
                </span>
                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.performance.dailyMetrics}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                      <Tooltip />
                      <Bar dataKey="directionsRequests" name="Directions" fill="#0D9488" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="callClicks" name="Phone Calls" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="websiteClicks" name="Website Clicks" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Search Queries Table */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <span className="text-xs font-bold text-slate-800">
                  Top Customer Search Discovery Queries
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Search Query</th>
                        <th className="py-2.5 px-3 text-right">Searches</th>
                        <th className="py-2.5 px-3 text-right">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {data.performance.topSearchQueries.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-bold text-slate-800">
                            "{item.query}"
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-700">
                            {item.count}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span
                              className={`text-[11px] font-bold ${
                                item.changePercent >= 0 ? "text-emerald-600" : "text-rose-600"
                              }`}
                            >
                              {item.changePercent >= 0 ? `+${item.changePercent}%` : `${item.changePercent}%`}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: GEMINI AI & ACCOUNT SETTINGS */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-900">
                  Gemini AI Grounding & Google Business Connection
                </h2>
                <p className="text-xs text-slate-500">
                  Fine-tune your brand voice, store knowledge policies, and auto-reply rules
                </p>
              </div>

              <form onSubmit={handleSaveGemini} className="space-y-6">
                {/* Engine Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-900 block">
                    Gemini AI Model
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      onClick={() => setGeminiModel("gemini-1.5-flash")}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        geminiModel === "gemini-1.5-flash"
                          ? "bg-teal-50/60 border-teal-500 ring-1 ring-teal-500"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          Gemini 1.5 Flash (Recommended)
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Sub-second latency, ideal for high-volume instant review drafting and live chat
                        </p>
                      </div>
                    </label>

                    <label
                      onClick={() => setGeminiModel("gemini-1.5-pro")}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        geminiModel === "gemini-1.5-pro"
                          ? "bg-teal-50/60 border-teal-500 ring-1 ring-teal-500"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          Gemini 1.5 Pro
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Advanced multi-lingual sentiment and reasoning for complex corporate policies
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Tone Persona */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-900 block">
                    Brand Voice & Reply Persona
                  </label>
                  <select
                    value={geminiTone}
                    onChange={(e) => setGeminiTone(e.target.value)}
                    className="w-full text-xs font-semibold p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="WARM">Warm, Hospitable & Foodie (Cafes, Restaurants, Bakeries)</option>
                    <option value="PROFESSIONAL">Professional, Courteous & Reassuring (Clinics, Salons, Law Offices)</option>
                    <option value="CASUAL">Friendly, Hip & Casual (Boutiques, Gyms, Lounges)</option>
                    <option value="SHORT">Concise & Direct (1–2 punchy sentences)</option>
                    <option value="LUXURY">Luxury & Refined (Hotels, Fine Dining, Spas)</option>
                  </select>
                </div>

                {/* Store Grounding Knowledge Base */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 block">
                      Ground Truth Knowledge Base (Zero Hallucination Context)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Grounded for Q&A and Reviews
                    </span>
                  </div>
                  <textarea
                    value={knowledgeBase}
                    onChange={(e) => setKnowledgeBase(e.target.value)}
                    rows={5}
                    placeholder="Enter store policies, parking instructions, pet rules, dietary info (Halal/Vegan), and escalation instructions..."
                    className="w-full text-xs text-slate-800 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono leading-relaxed"
                  />
                </div>

                {/* Escalation Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-900 block">
                      Escalation Phone (for negative reviews & Q&A)
                    </label>
                    <input
                      type="text"
                      value={escalationPhone}
                      onChange={(e) => setEscalationPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-900 block">
                      Custom Gemini API Key (Optional)
                    </label>
                    <input
                      type="password"
                      value={customApiKey}
                      onChange={(e) => setCustomApiKey(e.target.value)}
                      placeholder="Leave blank to use platform-managed Gemini"
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>
                </div>

                {/* Auto-Pilot Rules */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        5-Star Review Auto-Pilot
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Automatically draft and publish Gemini replies for 5-star reviews with positive sentiment
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoPilot5Star}
                      onChange={(e) => setAutoPilot5Star(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                    />
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingGemini}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isSavingGemini ? "Saving..." : "Save Gemini Grounding Configuration"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Live Google Maps Mobile Simulator */}
        {showMobileSimulator && (
          <div className="lg:col-span-4 sticky top-6">
            <div className="bg-slate-900 p-3.5 rounded-[42px] border-4 border-slate-800 shadow-2xl max-w-sm mx-auto">
              {/* iPhone Island / Speaker */}
              <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2" />

              {/* Simulator Screen */}
              <div className="bg-white rounded-[32px] overflow-hidden text-slate-900 min-h-[580px] flex flex-col justify-between text-xs">
                {/* Google Maps Search Bar Mock */}
                <div className="bg-slate-100 p-2.5 m-2.5 rounded-2xl flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-semibold text-[11px] truncate max-w-[170px]">
                      {activeLocation?.title || tenant.name}
                    </span>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                    G
                  </div>
                </div>

                {/* Hero Header */}
                <div className="px-4 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm text-slate-900">
                      {activeLocation?.title || tenant.name}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="font-bold text-amber-500">
                      {totalReviewsCount > 0 ? averageRating : "0.0"}
                    </span>
                    <div className="flex text-amber-400 text-[10px]">
                      {renderStars(averageRatingNum)}
                    </div>
                    <span className="text-slate-400">({totalReviewsCount.toLocaleString()})</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600 font-semibold">{tenant.businessType}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
                    <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                    <span className="truncate">
                      {activeLocation?.address?.addressLines?.[0] || "Main Store"}, {activeLocation?.address?.locality || ""}
                    </span>
                  </div>

                  <div className={`text-[11px] font-bold flex items-center gap-1 ${isStoreOpen ? "text-emerald-600" : "text-rose-600"}`}>
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{hoursStatusText}</span>
                  </div>
                </div>

                {/* Action Buttons Mock */}
                <div className="flex items-center justify-around py-3 px-2 border-y border-slate-100 text-[10px] font-bold text-blue-600">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <span>Call</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <span>Directions</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <span>Website</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                      <Share2 className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <span>Share</span>
                  </div>
                </div>

                {/* Latest Google Post Showcase */}
                {data.posts[0] && (
                  <div className="p-3 mx-2.5 my-1.5 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl border border-teal-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-teal-800 uppercase">
                        📢 Latest Post
                      </span>
                      {data.posts[0].couponCode && (
                        <span className="font-mono bg-white px-1.5 py-0.2 rounded border border-teal-200 text-teal-700 font-bold">
                          {data.posts[0].couponCode}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-700 leading-tight font-medium line-clamp-2">
                      {data.posts[0].summary}
                    </p>
                  </div>
                )}

                {/* Structured Menu Live Highlight */}
                <div className="p-3 mx-2.5 my-1 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>Live Google Menu</span>
                    <span className="text-teal-700">Real-Time Sync</span>
                  </div>
                  <div className="space-y-1">
                    {data.menuSections[0]?.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-slate-800">{item.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold">₹{item.price}</span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.isAvailable ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Review Highlight */}
                {data.reviews[0] && (
                  <div className="p-3 m-2.5 bg-white rounded-2xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-900">
                        {data.reviews[0].reviewerName}
                      </span>
                      <div className="flex text-amber-400 text-[9px]">{renderStars(data.reviews[0].rating)}</div>
                    </div>
                    <p className="text-[10px] text-slate-600 line-clamp-2">
                      "{data.reviews[0].comment}"
                    </p>
                    {data.reviews[0].replyComment && (
                      <div className="pl-2 border-l-2 border-teal-500 text-[9px] text-teal-900 font-medium">
                        Owner: {data.reviews[0].replyComment.slice(0, 70)}...
                      </div>
                    )}
                  </div>
                )}

                {/* Footer indicator */}
                <div className="p-2 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400">
                  Live Google Maps Mobile Preview
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add Menu Item */}
      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Add Menu Item to Google</h3>
              <button
                onClick={() => setShowAddMenuModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMenuItem} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pistachio Cardamom Danish"
                  value={newMenuItem.name}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Category</label>
                {data.menuSections.length > 0 ? (
                  <select
                    value={newMenuItem.sectionId}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, sectionId: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold mb-2"
                  >
                    {data.menuSections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.title}
                      </option>
                    ))}
                    <option value="NEW">+ Create New Category...</option>
                  </select>
                ) : null}

                {(data.menuSections.length === 0 || newMenuItem.sectionId === "NEW") && (
                  <input
                    type="text"
                    required
                    placeholder="e.g. Starters, Main Course, Beverages, Services"
                    value={newMenuItem.categoryName}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, categoryName: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="220"
                    value={newMenuItem.price}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Dietary Tag</label>
                  <select
                    value={newMenuItem.dietaryTag}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, dietaryTag: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold"
                  >
                    <option value="VEGETARIAN">Vegetarian</option>
                    <option value="VEGAN">Vegan</option>
                    <option value="HALAL">Halal</option>
                    <option value="GLUTEN_FREE">Gluten-Free</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Description (Optional)</label>
                <textarea
                  placeholder="Ingredients and culinary preparation details..."
                  rows={2}
                  value={newMenuItem.description}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMenuModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Add to Google Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Google Post */}
      {showAddPostModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Publish Google Post</h3>
              <button
                onClick={() => setShowAddPostModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Post Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {["OFFER", "STANDARD", "EVENT"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewPost({ ...newPost, topicType: type })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        newPost.topicType === type
                          ? "bg-teal-50 text-teal-800 border-teal-500"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Post Announcement</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share a seasonal offer, chef special, or announcement..."
                  value={newPost.summary}
                  onChange={(e) => setNewPost({ ...newPost, summary: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none leading-relaxed"
                />
              </div>

              {newPost.topicType === "OFFER" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">Promo Code</label>
                    <input
                      type="text"
                      placeholder="e.g. TASTE20"
                      value={newPost.couponCode}
                      onChange={(e) => setNewPost({ ...newPost, couponCode: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">Valid Days</label>
                    <select
                      value={newPost.daysValid}
                      onChange={(e) => setNewPost({ ...newPost, daysValid: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold"
                    >
                      <option value="3">3 Days</option>
                      <option value="7">7 Days</option>
                      <option value="14">14 Days</option>
                      <option value="30">30 Days</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Call to Action Button</label>
                <select
                  value={newPost.callToAction}
                  onChange={(e) => setNewPost({ ...newPost, callToAction: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold"
                >
                  <option value="VIEW_ITEM">View Offer / Menu</option>
                  <option value="BOOK">Book Appointment / Table</option>
                  <option value="ORDER">Order Online</option>
                  <option value="LEARN_MORE">Learn More</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPostModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishingPost}
                  className="px-4 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isPublishingPost ? "Publishing..." : "Publish to Google Maps"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export { GoogleCommandCenterClient };
