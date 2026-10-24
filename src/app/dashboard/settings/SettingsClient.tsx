"use client";

import React, { useState } from "react";
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
    geminiApiKey?: string | null;
    isGoogleConnected: boolean;
  };
}

export default function SettingsClient({ tenant }: SettingsClientProps) {
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

  // Gemini API provisioning
  const [geminiApiKey, setGeminiApiKey] = useState(tenant.geminiApiKey || "");
  const [showApiKey, setShowApiKey] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

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

        {/* SECTION 2: Google Business Profile & Gmail Connection */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Google Business Profile & Gmail Connection
                </h2>
                <p className="text-xs text-slate-400">
                  Required to activate Google Hub for live review replies, Maps Q&A, and menu sync.
                </p>
              </div>
            </div>

            {isGoogleConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Connected to Google Hub
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Not Connected
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Connected Gmail / Business Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={googleBusinessEmail}
                  onChange={(e) => setGoogleBusinessEmail(e.target.value)}
                  placeholder="e.g. owner@artisanbakery.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                The primary Google account holding owner/manager access to the listing.
              </p>
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
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-700"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Found under Business Profile Settings → Advanced Settings → Business Profile ID.
              </p>
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
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-700"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Identifies this physical storefront location on Google Maps.
              </p>
            </div>
          </div>

          {isGoogleConnected && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleDisconnectGoogle}
                className="text-xs text-rose-600 hover:text-rose-800 font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Disconnect Google Business Account</span>
              </button>
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
