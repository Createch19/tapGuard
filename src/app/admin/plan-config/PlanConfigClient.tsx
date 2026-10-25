"use client";

import React, { useState } from "react";
import { Save, CheckCircle, Copy, Check, Key, AlertCircle } from "lucide-react";

interface PlanConfigItem {
  id: string;
  plan: "BASIC" | "PRO" | "ENTERPRISE";
  displayName: string;
  description?: string | null;
  price: number;
  currency: string;
  billingCycle: "LIFETIME" | "MONTHLY" | "YEARLY" | "CUSTOM";
  maxCards: number;
  smartGate: boolean;
  multiGateTemplates?: boolean;
  customBranding: boolean;
  webhookAlerts: boolean;
  keywordSuggestions?: boolean;
  googleHub?: boolean;
  qrCodeTier: string;
  analyticsRetDays: number;
  prioritySupport: boolean;
  isActive: boolean;
}

interface PlatformGoogleOAuth {
  clientId: string;
  clientSecret: string;
  hasCredentials: boolean;
  redirectUri: string;
}

interface PlanConfigClientProps {
  configs: PlanConfigItem[];
  platformGoogleOAuth?: PlatformGoogleOAuth;
}

export default function PlanConfigClient({
  configs: initialConfigs,
  platformGoogleOAuth,
}: PlanConfigClientProps) {
  const [configs, setConfigs] = useState<PlanConfigItem[]>(initialConfigs);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const [googleClientId, setGoogleClientId] = useState(
    platformGoogleOAuth?.clientId || ""
  );
  const [googleClientSecret, setGoogleClientSecret] = useState(
    platformGoogleOAuth?.clientSecret || ""
  );
  const [isSavingOauth, setIsSavingOauth] = useState(false);
  const [oauthSaved, setOauthSaved] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);

  const handleFieldChange = (
    id: string,
    field: keyof PlanConfigItem,
    value: unknown
  ) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleSavePlan = async (config: PlanConfigItem) => {
    setSavingId(config.id);
    setSuccessId(null);

    try {
      const res = await fetch("/api/admin/plan-configs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save plan configuration");
      }

      setSuccessId(config.id);
      setTimeout(() => setSuccessId(null), 3000);
    } catch (err) {
      alert((err as Error).message || "Error saving plan configuration");
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveOAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingOauth(true);
    setOauthSaved(false);

    try {
      const res = await fetch("/api/admin/platform-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleClientId,
          googleClientSecret,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save OAuth credentials");

      setOauthSaved(true);
      setTimeout(() => setOauthSaved(false), 4000);
    } catch (err) {
      alert((err as Error).message || "Error saving credentials");
    } finally {
      setIsSavingOauth(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Admin Pricing Engine
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Subscription Plans & Quota Configurator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Super Admin master pricing editor: Adjust pricing in INR, card quotas, and feature flags directly in the database
          </p>
        </div>
      </div>

      {/* Platform Google Cloud OAuth Settings Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Platform Google Cloud OAuth & Business API Setup
              </h2>
              <p className="text-xs text-slate-500">
                Configure your official Google Cloud credentials so business tenants can connect their live Google accounts
              </p>
            </div>
          </div>

          <div>
            {googleClientId ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live OAuth Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5" />
                Credentials Needed
              </span>
            )}
          </div>
        </div>

        {/* Authorized Redirect URI */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <span className="text-xs font-bold text-slate-700">
              Authorized OAuth Redirect URI (Paste into Google Cloud Console):
            </span>
            <button
              type="button"
              onClick={() => {
                const uri =
                  platformGoogleOAuth?.redirectUri ||
                  `${typeof window !== "undefined" ? window.location.origin : ""}/api/auth/google/callback`;
                navigator.clipboard.writeText(uri);
                setCopiedUri(true);
                setTimeout(() => setCopiedUri(false), 2500);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              {copiedUri ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUri ? "Copied!" : "Copy Redirect URI"}</span>
            </button>
          </div>
          <div className="px-3 py-2 bg-white rounded-xl border border-slate-200 font-mono text-xs text-slate-700 select-all overflow-x-auto">
            {platformGoogleOAuth?.redirectUri || (typeof window !== "undefined" ? `${window.location.origin}/api/auth/google/callback` : "/api/auth/google/callback")}
          </div>
        </div>

        <form onSubmit={handleSaveOAuth} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Google Client ID
            </label>
            <input
              type="text"
              value={googleClientId}
              onChange={(e) => setGoogleClientId(e.target.value)}
              placeholder="e.g. 10293847291-xxxx.apps.googleusercontent.com"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Google Client Secret
            </label>
            <input
              type="password"
              value={googleClientSecret}
              onChange={(e) => setGoogleClientSecret(e.target.value)}
              placeholder="e.g. GOCSPX-xxxxxxxxxxxxxxxx"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-400">
              Saved securely to the database. Works immediately for all business tenants without redeployment.
            </span>
            <button
              type="submit"
              disabled={isSavingOauth}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer self-start sm:self-auto"
            >
              {oauthSaved ? (
                <>
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>Credentials Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isSavingOauth ? "Saving..." : "Save Platform Credentials"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {configs.map((config) => {
          const isSaving = savingId === config.id;
          const isSuccess = successId === config.id;

          return (
            <div
              key={config.id}
              className={`bg-white rounded-3xl p-6 border shadow-2xs transition-all flex flex-col justify-between ${
                config.plan === "PRO"
                  ? "border-teal-400 ring-2 ring-teal-500/10"
                  : "border-slate-200/90"
              }`}
            >
              <div className="space-y-4">
                {/* Header & Plan Identifier */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-600 block">
                      Tier Key: {config.plan}
                    </span>
                    <input
                      type="text"
                      value={config.displayName}
                      onChange={(e) =>
                        handleFieldChange(config.id, "displayName", e.target.value)
                      }
                      className="font-bold text-lg text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 focus:outline-none -ml-1 px-1 py-0.5 rounded"
                    />
                  </div>

                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Order #{config.plan === "BASIC" ? "1" : config.plan === "PRO" ? "2" : "3"}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={config.description || ""}
                    onChange={(e) =>
                      handleFieldChange(config.id, "description", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>

                {/* Pricing & Billing Cycle */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Price (INR ₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={config.price}
                        onChange={(e) =>
                          handleFieldChange(
                            config.id,
                            "price",
                            Number(e.target.value)
                          )
                        }
                        className="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Billing Cycle
                    </label>
                    <select
                      value={config.billingCycle}
                      onChange={(e) =>
                        handleFieldChange(
                          config.id,
                          "billingCycle",
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="LIFETIME">LIFETIME (One-time)</option>
                      <option value="MONTHLY">MONTHLY</option>
                      <option value="YEARLY">YEARLY</option>
                      <option value="CUSTOM">CUSTOM</option>
                    </select>
                  </div>
                </div>

                {/* Card Quota Limit */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Max NFC & QR Cards Limit
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={config.maxCards}
                      onChange={(e) =>
                        handleFieldChange(
                          config.id,
                          "maxCards",
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                    />
                    <span className="text-xs text-slate-400 shrink-0">
                      {config.maxCards > 1000 ? "Unlimited" : "Cards"}
                    </span>
                  </div>
                </div>

                {/* Feature Toggles */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Feature Privileges
                  </span>

                  {/* Smart Gate */}
                  <label className="flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl cursor-pointer text-xs">
                    <span className="font-medium text-slate-700">
                      Smart Rating Gate
                    </span>
                    <input
                      type="checkbox"
                      checked={config.smartGate}
                      onChange={(e) =>
                        handleFieldChange(config.id, "smartGate", e.target.checked)
                      }
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                    />
                  </label>

                  {/* Multi-Template Dynamic Gate */}
                  <label className="flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl cursor-pointer text-xs">
                    <span className="font-medium text-slate-700">
                      Multi-Template Dynamic Gate (Social, Delivery, Menu)
                    </span>
                    <input
                      type="checkbox"
                      checked={Boolean(config.multiGateTemplates)}
                      onChange={(e) =>
                        handleFieldChange(
                          config.id,
                          "multiGateTemplates",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                    />
                  </label>

                  {/* Custom Branding */}
                  <label className="flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl cursor-pointer text-xs">
                    <span className="font-medium text-slate-700">
                      Custom Tenant Branding
                    </span>
                    <input
                      type="checkbox"
                      checked={config.customBranding}
                      onChange={(e) =>
                        handleFieldChange(
                          config.id,
                          "customBranding",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                    />
                  </label>

                  {/* Webhook Alerts */}
                  <label className="flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl cursor-pointer text-xs">
                    <span className="font-medium text-slate-700">
                      Webhook & Bad Review Alerts
                    </span>
                    <input
                      type="checkbox"
                      checked={config.webhookAlerts}
                      onChange={(e) =>
                        handleFieldChange(
                          config.id,
                          "webhookAlerts",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                    />
                  </label>

                  {/* Smart Keyword Reviews (Tanglish & Regional) */}
                  <label className="flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl cursor-pointer text-xs">
                    <span className="font-medium text-slate-700 flex items-center gap-1.5">
                      <span>Smart Keyword SEO Reviews</span>
                      <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-semibold">
                        Pro
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={Boolean(config.keywordSuggestions)}
                      onChange={(e) =>
                        handleFieldChange(
                          config.id,
                          "keywordSuggestions",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                    />
                  </label>

                  {/* Google Hub & Maps AI Command Center */}
                  <label className="flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl cursor-pointer text-xs">
                    <span className="font-medium text-slate-700 flex items-center gap-1.5">
                      <span>Google Hub & Gemini Command</span>
                      <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-semibold">
                        Pro
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={Boolean(config.googleHub)}
                      onChange={(e) =>
                        handleFieldChange(
                          config.id,
                          "googleHub",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                    />
                  </label>

                  {/* QR Code Tier */}
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl text-xs">
                    <span className="font-medium text-slate-700">QR Generator</span>
                    <select
                      value={config.qrCodeTier}
                      onChange={(e) =>
                        handleFieldChange(config.id, "qrCodeTier", e.target.value)
                      }
                      className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold"
                    >
                      <option value="Basic">Basic</option>
                      <option value="Branded">Branded</option>
                      <option value="White-label">White-label</option>
                    </select>
                  </div>

                  {/* Analytics Retention */}
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl text-xs">
                    <span className="font-medium text-slate-700">Retention</span>
                    <select
                      value={config.analyticsRetDays}
                      onChange={(e) =>
                        handleFieldChange(
                          config.id,
                          "analyticsRetDays",
                          Number(e.target.value)
                        )
                      }
                      className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold"
                    >
                      <option value={30}>30 Days</option>
                      <option value={365}>1 Year (365d)</option>
                      <option value={3650}>Unlimited (10y)</option>
                    </select>
                  </div>

                  {/* Priority Support */}
                  <label className="flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl cursor-pointer text-xs">
                    <span className="font-medium text-slate-700">
                      Priority Support & SLA
                    </span>
                    <input
                      type="checkbox"
                      checked={config.prioritySupport}
                      onChange={(e) =>
                        handleFieldChange(
                          config.id,
                          "prioritySupport",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                    />
                  </label>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-slate-100">
                {isSuccess ? (
                  <div className="w-full py-2.5 text-center text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5 animate-in fade-in">
                    <CheckCircle className="w-4 h-4" />
                    <span>Saved to Database!</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSavePlan(config)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs"
                  >
                    <Save className="w-3.5 h-3.5 text-teal-400" />
                    <span>
                      {isSaving
                        ? "Writing to Database..."
                        : `Save ${config.displayName}`}
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
