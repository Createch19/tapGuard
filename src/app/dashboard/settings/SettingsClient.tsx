"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
} from "lucide-react";

interface SettingsClientProps {
  tenant: {
    id: string;
    name: string;
    googleReviewUrl?: string | null;
    smartGateEnabled: boolean;
    alertEmail?: string | null;
    webhookUrl?: string | null;
    googleBusinessEmail?: string | null;
    googleAccountId?: string | null;
    googleLocationId?: string | null;
    accountName?: string | null;
    lastSyncedAt?: string | null;
    isVerified?: boolean;
    geminiApiKey?: string | null;
    isGoogleConnected: boolean;
    hasGoogleCredentials?: boolean;
  };
}

export default function SettingsClient({ tenant }: SettingsClientProps) {
  const searchParams = useSearchParams();

  const [googleReviewUrl, setGoogleReviewUrl] = useState(
    tenant.googleReviewUrl || ""
  );
  const [smartGateEnabled, setSmartGateEnabled] = useState(
    tenant.smartGateEnabled
  );
  const [alertEmail, setAlertEmail] = useState(tenant.alertEmail || "");
  const [webhookUrl, setWebhookUrl] = useState(tenant.webhookUrl || "");

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
  const [isGoogleConnected, setIsGoogleConnected] = useState(
    tenant.isGoogleConnected
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(
    tenant.lastSyncedAt || null
  );
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false);
  const [showManualFields, setShowManualFields] = useState(false);

  // Gemini API provisioning
  const [geminiApiKey, setGeminiApiKey] = useState(tenant.geminiApiKey || "");
  const [showApiKey, setShowApiKey] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (searchParams.get("google_connected") === "true") {
      setIsGoogleConnected(true);
      setSaveSuccess(true);
      setStatusMessage("Google Business Profile successfully authorized and connected!");
      setTimeout(() => setSaveSuccess(false), 5000);
    } else if (searchParams.get("error")) {
      const err = searchParams.get("error");
      alert(`Google Connection Notice: ${err}`);
    }
  }, [searchParams]);

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
          googleBusinessEmail,
          googleAccountId,
          googleLocationId,
          geminiApiKey,
        }),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      if (googleBusinessEmail || googleAccountId) {
        setIsGoogleConnected(true);
      }

      setSaveSuccess(true);
      setStatusMessage("Settings and Google provisions saved successfully!");
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch {
      alert("Error updating settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!confirm("Are you sure you want to disconnect your Google Business Profile connection?")) {
      return;
    }

    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disconnectGoogle: true }),
      });

      if (res.ok) {
        setIsGoogleConnected(false);
        setGoogleBusinessEmail("");
        setGoogleAccountId("");
        setGoogleLocationId("");
        setSaveSuccess(true);
        setStatusMessage("Google Business Profile disconnected.");
        setTimeout(() => setSaveSuccess(false), 4000);
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
                  Authorize TapGate to sync live Google Maps reviews, customer Q&A, and menu availability
                </p>
              </div>
            </div>

            {isGoogleConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Authorized & Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                Action Required: Not Authorized
              </span>
            )}
          </div>

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
                    Authorize TapGate on Google Business Profile
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Connect your official business account to delegate permissions. Once connected, TapGate automatically fetches your live storefront reviews, enables Gemini AI reply drafting, and monitors Google Maps Q&A.
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

                {/* Mode Indicator notice */}
                {!tenant.hasGoogleCredentials ? (
                  <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-950">Development Sandbox Mode Active</p>
                      <p className="text-amber-800 text-[11px] mt-0.5">
                        <code className="bg-amber-100 font-mono px-1 rounded">GOOGLE_CLIENT_ID</code> is currently empty in <code className="bg-amber-100 font-mono px-1 rounded">.env</code>. Clicking below simulates Google's permission handshake instantly for testing. Once you add your Google Cloud OAuth keys to <code className="bg-amber-100 font-mono px-1 rounded">.env</code>, this button will redirect to the real Google login and consent screen (<code className="bg-amber-100 font-mono px-1 rounded">accounts.google.com</code>).
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-800">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="font-semibold">Live Google Cloud OAuth mode active. Clicking below redirects to Google accounts consent screen.</span>
                  </div>
                )}

                {/* 1-Click Authorize Button */}
                <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-3">
                  <a
                    href="/api/auth/google/connect"
                    className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-2xs transition-all hover:scale-101 active:scale-99 cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>
                      {tenant.hasGoogleCredentials
                        ? "Connect with Google (Real OAuth Screen)"
                        : "Connect with Google (Sandbox Simulation)"}
                    </span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowManualFields(!showManualFields)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer px-2 py-1"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{showManualFields ? "Hide manual entry" : "Enter IDs manually"}</span>
                  </button>
                </div>
              </div>

              {/* Manual Entry Fallback */}
              {showManualFields && (
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-4 animate-in fade-in duration-200">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Manual Credential Provisioning
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
                placeholder="AIzaSy... (Leave empty to use TapGate managed Gemini key)"
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
              Provides dedicated AI quota for your business. If left blank, TapGate platform-managed Gemini AI is used.
            </p>
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
