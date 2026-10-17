"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, CheckCircle, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import type { AuthSessionUser } from "@/lib/auth-utils";

interface AdminTenantOption {
  id: string;
  name: string;
  maxCards: number;
  activeCardCount: number;
}

interface ClaimClientProps {
  initialCode: string;
  user: AuthSessionUser | null;
  tenant: {
    id: string;
    name: string;
    maxCards: number;
    activeCardCount: number;
  } | null;
  adminTenants?: AdminTenantOption[];
}

export default function ClaimClient({
  initialCode,
  user,
  tenant,
  adminTenants = [],
}: ClaimClientProps) {
  const router = useRouter();
  const [shortCode, setShortCode] = useState(initialCode);
  const [label, setLabel] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState(
    adminTenants.length > 0 ? adminTenants[0].id : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [assignedTenantName, setAssignedTenantName] = useState(tenant?.name || "");

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const hasNoTenant = !isSuperAdmin && !tenant;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortCode.trim()) {
      setError("Please enter the card activation code.");
      return;
    }

    if (isSuperAdmin && !selectedTenantId) {
      setError("Please select a business tenant to assign this card to.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/cards/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shortCode: shortCode.trim(),
          label: label.trim(),
          targetTenantId: isSuperAdmin ? selectedTenantId : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to activate card");
      }

      const matchedAdminTenant = adminTenants.find((t) => t.id === selectedTenantId);
      setAssignedTenantName(tenant?.name || matchedAdminTenant?.name || "the business");
      setSuccess(true);

      setTimeout(() => {
        if (isSuperAdmin) {
          router.push("/admin/inventory");
        } else {
          router.push("/dashboard/cards");
        }
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to activate card");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between p-4 sm:p-6">
      {/* Top Navbar */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-900">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black">
            T
          </div>
          <span>TapGate</span>
        </Link>
        {user ? (
          <Link
            href="/dashboard"
            className="text-xs sm:text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition-colors"
          >
            Go to Dashboard →
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 shadow-sm"
          >
            Sign In
          </Link>
        )}
      </header>

      {/* Main Claim Card */}
      <div className="flex-1 flex items-center justify-center py-6">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4 border border-teal-100">
            <CreditCard className="w-7 h-7" />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              Activate NFC Review Card
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Link your pre-printed NFC review card or stand directly to your business account.
            </p>
          </div>

          {!user ? (
            /* Prompt to Login first */
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
              <ShieldCheck className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                Business Sign In Required
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                To link this card to your location, please sign in or register your business on TapGate.
              </p>
              <Link
                href={`/login?redirect=/claim?code=${encodeURIComponent(shortCode)}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
              >
                <span>Sign In to Activate</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : hasNoTenant ? (
            /* User without tenant */
            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">
                No Business Account Associated
              </h3>
              <p className="text-xs text-slate-600">
                You are signed in as <span className="font-semibold text-slate-900">{user.email}</span>, but this account is not linked to any business tenant. Cards must be registered under a business.
              </p>
              <div className="pt-1">
                <Link
                  href={`/login?redirect=/claim?code=${encodeURIComponent(shortCode)}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-xl transition-colors shadow-sm"
                >
                  <span>Sign In as Business Owner</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : success ? (
            /* Success confirmation */
            <div className="text-center py-4 animate-in fade-in zoom-in-95">
              <CheckCircle className="w-12 h-12 text-teal-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Card Successfully Linked!
              </h3>
              <p className="text-xs text-slate-500 mb-2">
                Card <span className="font-semibold">{shortCode}</span> is now active for{" "}
                <strong className="text-slate-800">{assignedTenantName}</strong>.
              </p>
              <p className="text-xs text-teal-600 font-medium">
                {isSuperAdmin
                  ? "Returning to card inventory..."
                  : "Redirecting to your cards management dashboard..."}
              </p>
            </div>
          ) : (
            /* Claim Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSuperAdmin ? (
                <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-[11px] text-teal-400">
                      Super Admin Provisioning
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Fleet Assignment
                    </span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Select Target Business Tenant *
                    </label>
                    <select
                      value={selectedTenantId}
                      onChange={(e) => setSelectedTenantId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400"
                    >
                      {adminTenants.length === 0 ? (
                        <option value="">No active tenants found</option>
                      ) : (
                        adminTenants.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.activeCardCount}/{t.maxCards} active)
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              ) : tenant ? (
                <div className="bg-teal-50/70 p-3.5 rounded-2xl border border-teal-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block">Activating for:</span>
                    <strong className="text-slate-900 font-semibold">{tenant.name}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Quota:</span>
                    <strong className="text-teal-700 font-semibold">
                      {tenant.activeCardCount} / {tenant.maxCards} Active
                    </strong>
                  </div>
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Card Activation Code *
                </label>
                <input
                  type="text"
                  required
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value.toUpperCase())}
                  placeholder="e.g. TAP-801 or ART-01"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm uppercase tracking-wider font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Find the 6-character code printed on the back or box of your NFC card.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Card Placement / Label (Optional)
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Front Cashier, Table 12, Bar Stand"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-70 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
              >
                {isSubmitting ? (
                  <span>Verifying & Linking...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Activate Card to Business</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <footer className="text-center text-xs text-slate-400 py-2">
        TapGate B2B Platform — Instant NFC Activation
      </footer>
    </div>
  );
}
