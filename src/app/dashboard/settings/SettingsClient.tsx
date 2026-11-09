"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Save,
  CheckCircle,
  ShieldCheck,
  Mail,
  Globe,
  HelpCircle,
  Sparkles,
  MapPin,
  ExternalLink,
  Key,
  Building2,
  Unlink,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sliders,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Bell,
  Send,
} from "lucide-react";

interface SettingsClientProps {
  tenant: {
    id: string;
    name: string;
    googleReviewUrl?: string | null;
    smartGateEnabled: boolean;
    alertEmail?: string | null;
    webhookUrl?: string | null;
    reviewAlertFilter?: string | null;
    reviewAlertEmail?: string | null;
    reviewAlertWebhook?: boolean;
    googleBusinessEmail?: string | null;
    googleAccountId?: string | null;
    googleLocationId?: string | null;
    accountName?: string | null;
    lastSyncedAt?: string | null;
    isVerified?: boolean;
    geminiApiKey?: string | null;
    brandTone?: string | null;
    replyLength?: string | null;
    customGoogleClientId?: string | null;
    customGoogleClientSecret?: string | null;
    isGoogleConnected: boolean;
    connectionStatus?: "CONNECTED" | "NEEDS_RECONNECT" | "DISCONNECTED";
    locations?: Array<{
      id: string;
      googleLocationId: string;
      title: string;
      storeCode?: string | null;
      locality?: string;
      addressLine?: string;
      isPrimaryBranch?: boolean;
    }>;
    hasGoogleCredentials?: boolean;
    isTenantCustomCredential?: boolean;
    suggestedRedirectUri?: string;
  };
  initialQuery?: {
    googleConnected?: boolean;
    accountEmail?: string | null;
    error?: string | null;
    redirectUri?: string | null;
  };
}

export default function SettingsClient({ tenant, initialQuery }: SettingsClientProps) {
  const queryGoogleConnected = initialQuery?.googleConnected || false;
  const queryAccountEmail = initialQuery?.accountEmail || null;
  const queryError = initialQuery?.error || null;
  const queryRedirectUri = initialQuery?.redirectUri || null;

  const [googleReviewUrl, setGoogleReviewUrl] = useState(
    tenant.googleReviewUrl || ""
  );
  const [smartGateEnabled, setSmartGateEnabled] = useState(
    tenant.smartGateEnabled
  );
  const [alertEmail, setAlertEmail] = useState(tenant.alertEmail || "");
  const [webhookUrl, setWebhookUrl] = useState(tenant.webhookUrl || "");

  // Review Alerts (F3)
  const [reviewAlertFilter, setReviewAlertFilter] = useState(
    tenant.reviewAlertFilter || "ALL"
  );
  const [reviewAlertEmail, setReviewAlertEmail] = useState(
    tenant.reviewAlertEmail || ""
  );
  const [reviewAlertWebhook, setReviewAlertWebhook] = useState(
    tenant.reviewAlertWebhook ?? true
  );
  const [isTestingAlert, setIsTestingAlert] = useState(false);
  const [testAlertSuccess, setTestAlertSuccess] = useState<string | null>(null);

  // Google Business Profile & Gmail provisioning
  const [googleBusinessEmail, setGoogleBusinessEmail] = useState(
    tenant.googleBusinessEmail || ""
  );
  const [googleAccountId, setGoogleAccountId] = useState(
    tenant.googleAccountId || ""
  );
  const [googleLocationId, setGoogleLocationId] = useState(
    tenant.googleLocationId || ""
  );
  const [customGoogleClientId, setCustomGoogleClientId] = useState(
    tenant.customGoogleClientId || ""
  );
  const [customGoogleClientSecret, setCustomGoogleClientSecret] = useState(
    tenant.customGoogleClientSecret || ""
  );
  const [isGoogleConnected, setIsGoogleConnected] = useState(
    tenant.isGoogleConnected
  );
  const [connectionStatus, setConnectionStatus] = useState<"CONNECTED" | "NEEDS_RECONNECT" | "DISCONNECTED">(
    tenant.connectionStatus || (tenant.isGoogleConnected ? "CONNECTED" : "DISCONNECTED")
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(
    tenant.lastSyncedAt || null
  );
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false);
  const [showManualFields, setShowManualFields] = useState(false);

  // Multi-location mapping
  const locations = tenant.locations || [];
  const [mappedLocationId, setMappedLocationId] = useState(
    tenant.googleLocationId || locations[0]?.googleLocationId || ""
  );
  const [isMappingLocation, setIsMappingLocation] = useState(false);

  const handleMapLocation = async (newLocationId: string) => {
    setMappedLocationId(newLocationId);
    setIsMappingLocation(true);
    try {
      const res = await fetch("/api/dashboard/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "map_location", locationId: newLocationId }),
      });
      const json = await res.json().catch(() => ({}));
      if (json.success) {
        setGoogleLocationId(newLocationId);
        setStatusMessage(json.message || "Location mapped successfully!");
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert(json.error || "Failed to map location");
      }
    } catch {
      alert("Error mapping location");
    } finally {
      setIsMappingLocation(false);
    }
  };

  // Gemini API provisioning & Reply behavior
  const [geminiApiKey, setGeminiApiKey] = useState(tenant.geminiApiKey || "");
  const [brandTone, setBrandTone] = useState(tenant.brandTone || "SOFT");
  const [replyLength, setReplyLength] = useState(tenant.replyLength || "2_SENTENCES");
  const [showApiKey, setShowApiKey] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [copiedRedirectUri, setCopiedRedirectUri] = useState(false);
  const [liveRedirectUri, setLiveRedirectUri] = useState<string>(() => {
    return queryRedirectUri || tenant.suggestedRedirectUri || "/api/auth/google/callback";
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.origin) {
      const origin = window.location.origin;
      if (queryRedirectUri && !queryRedirectUri.includes("localhost")) {
        setLiveRedirectUri(queryRedirectUri);
      } else if (
        !tenant.suggestedRedirectUri ||
        (tenant.suggestedRedirectUri.includes("localhost") && !origin.includes("localhost"))
      ) {
        setLiveRedirectUri(`${origin}/api/auth/google/callback`);
      } else {
        setLiveRedirectUri(tenant.suggestedRedirectUri);
      }
    }
  }, [tenant.suggestedRedirectUri, queryRedirectUri]);

  useEffect(() => {
    if (queryGoogleConnected) {
      setIsGoogleConnected(true);
      setSaveSuccess(true);
      if (queryAccountEmail) {
        setGoogleBusinessEmail(queryAccountEmail);
      }
      setStatusMessage(
        queryAccountEmail
          ? `Google Account (${queryAccountEmail}) successfully verified and connected!`
          : "Google Business Profile successfully authorized and connected!"
      );
      setTimeout(() => setSaveSuccess(false), 5000);
    } else if (queryError === "google_credentials_missing") {
      setStatusMessage("Google Cloud OAuth credentials not configured on server.");
    } else if (queryError) {
      alert(`Google Connection Notice: ${queryError}`);
    }
  }, [queryGoogleConnected, queryAccountEmail, queryError]);

  const handleSyncGoogle = async () => {
    setIsSyncingGoogle(true);
    try {
      const res = await fetch("/api/dashboard/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resync" }),
      });
      const json = await res.json();
      if (json.success) {
        setLastSyncedAt(new Date().toISOString());
        setSaveSuccess(true);
        setStatusMessage(json.message || "Google Profile & Reviews synchronized!");
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert(json.error || "Failed to synchronize with Google.");
      }
    } catch {
      alert("Failed to synchronize with Google.");
    } finally {
      setIsSyncingGoogle(false);
    }
  };

  const handleSendTestAlert = async (rating = 5) => {
    setIsTestingAlert(true);
    setTestAlertSuccess(null);
    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testAlert: true,
          testRating: rating,
          alertEmail,
          reviewAlertEmail,
          webhookUrl,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to send test alert");
      }
      setTestAlertSuccess(data.message || "Test alert dispatched successfully!");
      setTimeout(() => setTestAlertSuccess(null), 5000);
    } catch (err: any) {
      alert(err.message || "Error sending test alert");
    } finally {
      setIsTestingAlert(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleReviewUrl,
          smartGateEnabled,
          alertEmail,
          webhookUrl,
          reviewAlertFilter,
          reviewAlertEmail,
          reviewAlertWebhook,
          googleBusinessEmail,
          googleAccountId,
          googleLocationId,
          geminiApiKey,
          brandTone,
          replyLength,
          customGoogleClientId,
          customGoogleClientSecret,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to save settings");

      if (googleBusinessEmail || googleAccountId) {
        setIsGoogleConnected(true);
      }

      setSaveSuccess(true);
      setStatusMessage("Settings and Google provisions saved successfully!");
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      alert(err?.message || "Error updating settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!confirm("Are you sure you want to disconnect Google Business Profile? This will revoke the OAuth authorization and remove all cached reviews, locations, and analytics from TapGenie.")) {
      return;
    }

    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disconnectGoogle: true }),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        setIsGoogleConnected(false);
        setConnectionStatus("DISCONNECTED");
        setGoogleBusinessEmail("");
        setGoogleAccountId("");
        setGoogleLocationId("");
        setSaveSuccess(true);
        setStatusMessage(json.message || "Google Business connection revoked and cached data cleared.");
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert(json.error || "Failed to disconnect Google account.");
      }
    } catch {
      alert("Failed to disconnect Google account.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Tenant Settings & Integrations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure your destination Google Review URL, Google Business Profile credentials, and Gemini AI API
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>{statusMessage || "Settings saved successfully!"}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Google Review Direct Link */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              G
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Google Review Direct Link
              </h2>
              <p className="text-xs text-slate-400">
                Where happy customers (4-5 stars) will be directed to leave their live review.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Google Review Direct Link *
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="url"
                required
                value={googleReviewUrl}
                onChange={(e) => setGoogleReviewUrl(e.target.value)}
                placeholder="https://g.page/r/your-business/review or https://search.google.com/local/writereview?placeid=..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-slate-700"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Copy this link from your Google Business Profile dashboard by clicking "Ask for reviews".
            </p>
          </div>
        </div>

        {/* SECTION 2: Google Business Profile & Permissions */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Google Business Profile & Permissions
                </h2>
                <p className="text-xs text-slate-400">
                  Authorize TapGenie to sync live Google Maps reviews, customer Q&A, and menu availability
                </p>
              </div>
            </div>

            {connectionStatus === "CONNECTED" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Connected & Verified
              </span>
            ) : connectionStatus === "NEEDS_RECONNECT" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Needs Reconnect
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                Not Connected
              </span>
            )}
          </div>

          {/* Reconnect Prompt Banner when token expired or revoked */}
          {connectionStatus === "NEEDS_RECONNECT" && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-950">Google Authorization Expired or Revoked</h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Your Google OAuth authorization has expired or was revoked. Reconnect your account to resume syncing reviews and managing your business profile.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/api/auth/google/connect"
                  prefetch={false}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reconnect Account</span>
                </Link>
                <button
                  type="button"
                  onClick={handleDisconnectGoogle}
                  className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                >
                  Clear Cached Data
                </button>
              </div>
            </div>
          )}

          {isGoogleConnected ? (
            /* --- STATE A: CONNECTED & VERIFIED --- */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-slate-50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-sm font-bold text-slate-900">
                      {tenant.accountName || tenant.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                      Google Maps Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    {googleBusinessEmail || "Verified Owner / Manager"}
                  </p>
                  {lastSyncedAt && (
                    <p className="text-[11px] text-slate-400">
                      Last synchronized: {new Date(lastSyncedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isSyncingGoogle}
                    onClick={handleSyncGoogle}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${isSyncingGoogle ? "animate-spin" : ""}`} />
                    <span>{isSyncingGoogle ? "Syncing..." : "Sync Now"}</span>
                  </button>

                  <Link
                    href="/dashboard/google"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors"
                  >
                    <span>Google Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={handleDisconnectGoogle}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>

              {/* Mapped Location Picker Card */}
              {locations.length > 0 && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Mapped Storefront Location
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {locations.length} {locations.length === 1 ? "Storefront Discovered" : "Storefronts Discovered"}
                    </span>
                  </div>

                  {locations.length > 1 ? (
                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-500">
                        Choose which Google Maps storefront maps to this TapGenie dashboard, review gate, and NFC card set:
                      </p>
                      <div className="flex items-center gap-2">
                        <select
                          value={mappedLocationId}
                          onChange={(e) => handleMapLocation(e.target.value)}
                          disabled={isMappingLocation}
                          className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer disabled:opacity-50"
                        >
                          {locations.map((loc) => (
                            <option key={loc.id} value={loc.googleLocationId}>
                              {loc.title} {loc.locality ? `— ${loc.locality}` : ""} {loc.isPrimaryBranch ? "⭐ (Active Primary)" : ""}
                            </option>
                          ))}
                        </select>
                        {isMappingLocation && (
                          <RefreshCw className="w-4 h-4 text-teal-600 animate-spin shrink-0" />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-900">{locations[0]?.title || tenant.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {[locations[0]?.addressLine, locations[0]?.locality].filter(Boolean).join(", ") || "Active Verified Location"}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                        Active Primary
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Collapsible Advanced Credentials view */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowManualFields(!showManualFields)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{showManualFields ? "Hide Technical Profile IDs" : "View Technical Profile IDs (Account & Location)"}</span>
                  {showManualFields ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showManualFields && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Google Business Account ID
                      </label>
                      <input
                        type="text"
                        value={googleAccountId}
                        onChange={(e) => setGoogleAccountId(e.target.value)}
                        placeholder="accounts/1098471209348128..."
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Google Location / Place ID
                      </label>
                      <input
                        type="text"
                        value={googleLocationId}
                        onChange={(e) => setGoogleLocationId(e.target.value)}
                        placeholder="locations/8923471029..."
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Tenant Custom Google Client ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={customGoogleClientId}
                        onChange={(e) => setCustomGoogleClientId(e.target.value)}
                        placeholder="Overrides platform app for this tenant"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Tenant Custom Google Client Secret (Optional)
                      </label>
                      <input
                        type="password"
                        value={customGoogleClientSecret}
                        onChange={(e) => setCustomGoogleClientSecret(e.target.value)}
                        placeholder="Overrides platform app for this tenant"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* --- STATE B: UNCONNECTED - 1-CLICK GOOGLE AUTHORIZATION --- */
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900">
                    Authorize TapGenie on Google Business Profile
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Connect your official business account to delegate permissions. Once connected, TapGenie automatically fetches your live storefront reviews, enables Gemini AI reply drafting, and monitors Google Maps Q&A.
                  </p>
                </div>

                {/* Permissions Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Read & Reply Reviews</p>
                      <p className="text-[10px] text-slate-400">Sync customer reviews in real-time</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Google Maps Q&A</p>
                      <p className="text-[10px] text-slate-400">Detect & answer store questions</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Live Menu & Hours</p>
                      <p className="text-[10px] text-slate-400">Push availability directly to Search</p>
                    </div>
                  </div>
                </div>

                {/* Live Google Cloud Setup Warning if keys missing */}
                {(!tenant.hasGoogleCredentials || queryError === "google_credentials_missing") ? (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/90 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-amber-950">
                          Google Cloud OAuth Credentials Required for Live Accounts
                        </p>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          To connect real Google accounts and request permission on <code className="bg-amber-100 font-mono px-1 rounded">accounts.google.com</code>, add <code className="bg-amber-100 font-mono px-1 rounded">GOOGLE_CLIENT_ID</code> and <code className="bg-amber-100 font-mono px-1 rounded">GOOGLE_CLIENT_SECRET</code> to your production environment variables (e.g. Netlify / Vercel), or configure them in Super Admin under <Link href="/admin/plan-config" className="underline font-bold text-amber-950 hover:text-black">Plan Config</Link> (takes effect immediately without redeploy).
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-200/60">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                        <span className="text-[11px] font-bold text-amber-900">
                          Authorized Redirect URI for Google Cloud Console:
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(liveRedirectUri);
                            setCopiedRedirectUri(true);
                            setTimeout(() => setCopiedRedirectUri(false), 2500);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-200/70 hover:bg-amber-200 text-amber-950 rounded-lg text-[11px] font-bold transition-colors cursor-pointer self-start sm:self-auto"
                        >
                          {copiedRedirectUri ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedRedirectUri ? "Copied to Clipboard!" : "Copy URI"}</span>
                        </button>
                      </div>
                      <div className="px-3 py-2 bg-white rounded-xl border border-amber-200/80 font-mono text-[11px] text-slate-700 select-all overflow-x-auto">
                        {liveRedirectUri}
                      </div>
                    </div>
                  </div>
                ) : tenant.isTenantCustomCredential ? (
                  <div className="flex items-center gap-2 p-2.5 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-800">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    <span className="font-semibold">Tenant Custom OAuth Active: Using custom Google Cloud credentials configured specifically for this business in the database.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold">Platform Integration Active: Live Google Cloud OAuth ready. Clicking below redirects to Google accounts consent screen.</span>
                  </div>
                )}

                {/* 1-Click Authorize Button */}
                <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-3">
                  <Link
                    href="/api/auth/google/connect"
                    prefetch={false}
                    className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-2xs transition-all hover:scale-101 active:scale-99 cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Connect Official Google Account</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setShowManualFields(!showManualFields)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer px-2 py-1"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{showManualFields ? "Hide manual entry" : "Enter IDs & Custom Keys manually"}</span>
                  </button>
                </div>
              </div>


              {/* Manual Entry Fallback */}
              {showManualFields && (
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-4 animate-in fade-in duration-200">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Manual Credential Provisioning & Custom App
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Management Gmail
                      </label>
                      <input
                        type="email"
                        value={googleBusinessEmail}
                        onChange={(e) => setGoogleBusinessEmail(e.target.value)}
                        placeholder="owner@business.com"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Google Business Account ID
                      </label>
                      <input
                        type="text"
                        value={googleAccountId}
                        onChange={(e) => setGoogleAccountId(e.target.value)}
                        placeholder="accounts/1098471209348128..."
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-700"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Google Location ID or Place ID
                      </label>
                      <input
                        type="text"
                        value={googleLocationId}
                        onChange={(e) => setGoogleLocationId(e.target.value)}
                        placeholder="locations/8923471029 or Place ID (e.g. ChIJ...)"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Tenant Custom Google Client ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={customGoogleClientId}
                        onChange={(e) => setCustomGoogleClientId(e.target.value)}
                        placeholder="Overrides platform app for this tenant"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Tenant Custom Google Client Secret (Optional)
                      </label>
                      <input
                        type="password"
                        value={customGoogleClientSecret}
                        onChange={(e) => setCustomGoogleClientSecret(e.target.value)}
                        placeholder="Overrides platform app for this tenant"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 3: Google Gemini AI API Provisioning */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Google Gemini AI API Provisioning
                </h2>
                <p className="text-xs text-slate-400">
                  Powers instant smart review replies and automated Maps Q&A grounding.
                </p>
              </div>
            </div>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-purple-700 hover:text-purple-800 inline-flex items-center gap-1"
            >
              <span>Get Free Gemini Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Gemini API Key (Google AI Studio)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showApiKey ? "text" : "password"}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy... (Leave empty to use TapGenie managed Gemini key)"
                className="w-full pl-10 pr-20 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-slate-700"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
              >
                {showApiKey ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Provides dedicated AI quota for your business. If left blank, TapGenie platform-managed Gemini AI is used.
            </p>
          </div>

          {/* AI Review Reply Preferences (Tone & Sentence Length) */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                AI Reply Tone
              </label>
              <select
                value={brandTone}
                onChange={(e) => setBrandTone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="SOFT">🌸 Soft & Humble (Gentle & Modest)</option>
                <option value="WARM">☀️ Warm & Hospitable (Friendly & Welcoming)</option>
                <option value="PROFESSIONAL">💼 Professional (Polite & Formal)</option>
                <option value="ENTHUSIASTIC">⚡ Enthusiastic (Energetic & Excited)</option>
                <option value="CASUAL">☕ Casual & Friendly (Relaxed & Modern)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Defines the attitude and personality Gemini uses when replying to customer comments.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Reply Sentence Length
              </label>
              <select
                value={replyLength}
                onChange={(e) => setReplyLength(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="1_SENTENCE">1 Sentence (Quick, punchy & direct)</option>
                <option value="2_SENTENCES">2 Sentences (Standard balanced reply)</option>
                <option value="3_4_SENTENCES">3 to 4 Sentences (Detailed & in-depth)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                How many sentences Gemini writes. It strictly respects this length limit.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 4: Smart Gate & Negative Review Alerts */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Review Gate & Alert Channels
              </h2>
              <p className="text-xs text-slate-400">
                Route ratings and capture negative feedback privately.
              </p>
            </div>
          </div>

          <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={smartGateEnabled}
              onChange={(e) => setSmartGateEnabled(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
            />
            <div>
              <span className="font-bold text-xs text-slate-800 block">
                Enable Smart Review Gate
              </span>
              <span className="text-[11px] text-slate-500">
                4-5 stars route to Google Reviews. 1-3 stars open your private internal feedback box.
              </span>
            </div>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Alert Email (for negative reviews)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  placeholder="manager@venue.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Webhook URL (Slack, WhatsApp, CRM)
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: Real-time Google Review Alerts (Resend Email & Webhook) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <span>Google Review Alerts</span>
                  <span className="px-2 py-0.5 text-[10px] bg-amber-100 text-amber-800 rounded-md font-extrabold">LIVE NOTIFICATIONS</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Receive instant alerts via email and webhooks whenever a customer leaves a review on Google.
                </p>
              </div>
            </div>

            {/* Test Alert Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isTestingAlert || (!alertEmail && !reviewAlertEmail && !webhookUrl)}
                onClick={() => handleSendTestAlert(5)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
                title="Send a sample test notification to verify delivery"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isTestingAlert ? "Sending Test..." : "Send Test Alert"}</span>
              </button>
            </div>
          </div>

          {testAlertSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{testAlertSuccess}</span>
            </div>
          )}

          {/* Alert Preference / Rating Range */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Alert Trigger Preference (Rating Range)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "ALL",
                  label: "All Reviews (1★ to 5★)",
                  desc: "Get notified for every single review on Google.",
                  badge: "Recommended",
                },
                {
                  id: "CRITICAL",
                  label: "Critical Only (1★ to 3★)",
                  desc: "Only alert when negative ratings require urgent recovery.",
                  badge: "Urgent focus",
                },
                {
                  id: "OFF",
                  label: "Disabled",
                  desc: "Mute review alerts. Reviews will still sync to inbox.",
                  badge: "Muted",
                },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setReviewAlertFilter(opt.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    reviewAlertFilter === opt.id
                      ? "border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900">{opt.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      reviewAlertFilter === opt.id
                        ? "bg-amber-200/80 text-amber-900"
                        : "bg-slate-200/60 text-slate-600"
                    }`}>
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Recipient Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={reviewAlertEmail}
                  onChange={(e) => setReviewAlertEmail(e.target.value)}
                  placeholder={alertEmail || "owner@business.com"}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {reviewAlertEmail
                  ? "Custom email for Google review alerts."
                  : alertEmail
                  ? `Defaults to primary alert email (${alertEmail}).`
                  : "Leave blank to use primary alert email above, or specify a dedicated recipient."}
              </p>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Webhook Dispatch
                </label>
                <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reviewAlertWebhook}
                    onChange={(e) => setReviewAlertWebhook(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">
                      Post to Webhook URL
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Dispatches JSON payload with reviewer, stars, comment & direct inbox link to your configured Webhook URL.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm inline-flex items-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save Settings & Provisions"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
