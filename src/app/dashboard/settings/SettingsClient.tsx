"use client";

import React, { useState } from "react";
import { Save, CheckCircle, ShieldCheck, Mail, Globe, HelpCircle } from "lucide-react";

interface SettingsClientProps {
  tenant: {
    id: string;
    name: string;
    googleReviewUrl?: string | null;
    smartGateEnabled: boolean;
    alertEmail?: string | null;
    webhookUrl?: string | null;
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

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
        }),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      alert("Error updating settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Settings & Review Destination
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure your destination Google Review URL and negative review alert channels
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Google Review URL */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              G
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Google Business Review URL
              </h2>
              <p className="text-xs text-slate-400">
                Where happy customers (4-5 stars) will be directed to leave their review.
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
                placeholder="https://search.google.com/local/writereview?placeid=..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900 font-mono"
              />
            </div>
          </div>

          {/* Quick Guide on finding Google review link */}
          <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 flex items-start gap-3 text-xs text-slate-600">
            <HelpCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 block mb-0.5">
                How to find your direct Google Review Link:
              </strong>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-600 text-[11px]">
                <li>Search your business profile on Google or Google Maps.</li>
                <li>Click the <strong>&ldquo;Ask for reviews&rdquo;</strong> button in your business manager.</li>
                <li>Copy the short review URL and paste it into the field above.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Section 2: Smart Review Gate Toggle */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Smart Rating Gate (Negative Review Shield)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 max-w-lg">
                  When enabled, 4-5 star customers go straight to Google Reviews, while 1-3 star customers are guided to a private feedback form so your team can resolve their complaint privately.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={smartGateEnabled}
                onChange={(e) => setSmartGateEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>

        {/* Section 3: Alerts & Webhooks */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Alerts & Automation
              </h2>
              <p className="text-xs text-slate-400">
                Get alerted immediately when a customer submits private negative feedback.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Urgent Alert Notification Email
            </label>
            <input
              type="email"
              value={alertEmail}
              onChange={(e) => setAlertEmail(e.target.value)}
              placeholder="manager@yourbusiness.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Webhook Dispatch URL (Slack, Zapier, Webhook.site)
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900 font-mono"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-70 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save All Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
