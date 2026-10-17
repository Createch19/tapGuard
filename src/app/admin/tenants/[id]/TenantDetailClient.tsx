"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Save,
  CheckCircle,
  ArrowLeft,
  Trash2,
  AlertTriangle,
  UserPlus,
  KeyRound,
  Store,
  ShieldAlert,
  X,
  Users,
} from "lucide-react";

interface TenantUser {
  id: string;
  name?: string | null;
  email: string;
  role: string;
}

interface BusinessTypeItem {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  isDefault: boolean;
}

interface TenantDetailProps {
  tenant: {
    id: string;
    name: string;
    slug: string;
    plan: "BASIC" | "PRO" | "ENTERPRISE";
    businessType?: string | null;
    isActive: boolean;
    maxCards: number;
    googleReviewUrl?: string | null;
    smartGateEnabled: boolean;
    alertEmail?: string | null;
    webhookUrl?: string | null;
    createdAt: string;
    cards: Array<{
      id: string;
      shortCode: string;
      urlSlug: string;
      label?: string | null;
      status: string;
      tapCount: number;
    }>;
    users: TenantUser[];
    subscription?: {
      id: string;
      plan: string;
      status: string;
      pricePaid: number;
      billingCycle: string;
    } | null;
  };
  initialBusinessTypes?: BusinessTypeItem[];
}

export default function TenantDetailClient({
  tenant,
  initialBusinessTypes = [],
}: TenantDetailProps) {
  const router = useRouter();
  const [name, setName] = useState(tenant.name);
  const [plan, setPlan] = useState(tenant.plan);
  const [businessType, setBusinessType] = useState(
    tenant.businessType || "Restaurant & Café"
  );
  const [businessTypes, setBusinessTypes] =
    useState<BusinessTypeItem[]>(initialBusinessTypes);
  const [isCustomTypeMode, setIsCustomTypeMode] = useState(false);
  const [customTypeInput, setCustomTypeInput] = useState("");
  const [maxCards, setMaxCards] = useState(tenant.maxCards);
  const [isActive, setIsActive] = useState(tenant.isActive);
  const [googleReviewUrl, setGoogleReviewUrl] = useState(
    tenant.googleReviewUrl || ""
  );
  const [smartGateEnabled, setSmartGateEnabled] = useState(
    tenant.smartGateEnabled
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Users State
  const [users, setUsers] = useState<TenantUser[]>(tenant.users);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"OWNER" | "MANAGER" | "STAFF">(
    users.length === 0 ? "OWNER" : "STAFF"
  );
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [userError, setUserError] = useState("");

  // Reset Password State
  const [resettingUser, setResettingUser] = useState<TenantUser | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState("");

  const generateAutoPassword = (setter: (val: string) => void) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
    let pwd = "Pass@";
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setter(pwd);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      let finalBusinessType = businessType;

      if (isCustomTypeMode && customTypeInput.trim()) {
        try {
          const typeRes = await fetch("/api/admin/business-types", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: customTypeInput.trim() }),
          });
          const typeData = await typeRes.json();
          if (typeData.businessType) {
            finalBusinessType = typeData.businessType.name;
            setBusinessTypes((prev) => {
              if (prev.some((bt) => bt.id === typeData.businessType.id)) return prev;
              return [...prev, typeData.businessType];
            });
            setBusinessType(finalBusinessType);
            setIsCustomTypeMode(false);
            setCustomTypeInput("");
          }
        } catch (err) {
          console.error("Failed to add custom business type:", err);
        }
      }

      const res = await fetch(`/api/admin/tenants/${tenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          plan,
          businessType: finalBusinessType,
          maxCards,
          isActive,
          googleReviewUrl,
          smartGateEnabled,
        }),
      });

      if (!res.ok) throw new Error("Failed to save changes");

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      router.refresh();
    } catch {
      alert("Error saving tenant details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingUser(true);
    setUserError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
          tenantId: tenant.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");

      setUsers((prev) => [...prev, data.user]);
      setIsAddUserOpen(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      alert(`User ${data.user.email} created successfully! They can now log in at /login.`);
    } catch (err: unknown) {
      setUserError(err instanceof Error ? err.message : "Error creating user");
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleDeleteUser = async (user: TenantUser) => {
    if (
      !confirm(
        `Are you sure you want to delete user ${user.email}? This will revoke their access.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error deleting user");
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    setIsSubmittingReset(true);

    try {
      const res = await fetch(`/api/admin/users/${resettingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: resetPasswordValue,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      setResetSuccessMsg(`Password for ${resettingUser.email} has been updated.`);
      setTimeout(() => {
        setResettingUser(null);
        setResetPasswordValue("");
        setResetSuccessMsg("");
      }, 2500);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error resetting password");
    } finally {
      setIsSubmittingReset(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to PERMANENTLY delete "${tenant.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/tenants/${tenant.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete tenant");

      router.push("/admin/tenants");
      router.refresh();
    } catch {
      alert("Error deleting tenant.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/tenants"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tenants</span>
        </Link>

        {saveSuccess && (
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>Saved successfully!</span>
          </div>
        )}
      </div>

      {/* Header Info */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {tenant.name}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {isActive ? "Active Account" : "Suspended"}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400">
            Tenant ID: {tenant.id} • Slug: /{tenant.slug}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-teal-800 bg-teal-50 border border-teal-200/80 px-3 py-1.5 rounded-xl">
            Category: {businessType}
          </span>
          <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
            Plan: {plan}
          </span>
          <span className="font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl">
            Cards: {tenant.cards.length} / {maxCards}
          </span>
        </div>
      </div>

      {/* TENANT USERS SECTION (CRITICAL) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Tenant User Accounts & Team ({users.length})
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Users who can log in at <code className="text-teal-700 font-mono">/login</code> to manage this business and view feedback
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setNewUserRole(users.length === 0 ? "OWNER" : "STAFF");
              setNewUserName(tenant.name ? `${tenant.name} Owner` : "");
              generateAutoPassword(setNewUserPassword);
              setIsAddUserOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create User for this Tenant</span>
          </button>
        </div>

        {/* Zero User Warning Banner */}
        {users.length === 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-amber-900 block">
                  No Login Account Associated with {tenant.name}!
                </strong>
                <p className="text-amber-800 mt-0.5">
                  The business owner has no credentials to log into their dashboard. Click &quot;Create User for this Tenant&quot; to assign their login account.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setNewUserRole("OWNER");
                setNewUserName(`${tenant.name} Owner`);
                generateAutoPassword(setNewUserPassword);
                setIsAddUserOpen(true);
              }}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shrink-0 shadow-2xs"
            >
              Create Owner Account
            </button>
          </div>
        )}

        {/* Users Table */}
        {users.length > 0 && (
          <div className="divide-y divide-slate-100">
            {users.map((u) => (
              <div
                key={u.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 font-bold text-xs flex items-center justify-center border border-teal-100 shrink-0">
                    {(u.name || u.email).slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {u.name || "Unnamed Account"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === "OWNER"
                            ? "bg-teal-50 text-teal-700 border border-teal-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {u.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResettingUser(u);
                      generateAutoPassword(setResetPasswordValue);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                    title="Reset User Password"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Reset Password</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteUser(u)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Tenant Settings Form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Business Profile & Policies
        </h3>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Business Legal Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Business Category / Classification */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Business Category / Type
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomTypeMode(!isCustomTypeMode);
                  setCustomTypeInput("");
                }}
                className="text-[11px] font-bold text-teal-600 hover:text-teal-800 underline"
              >
                {isCustomTypeMode ? "Choose from existing" : "+ Add new category"}
              </button>
            </div>

            {!isCustomTypeMode ? (
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {businessTypes.map((bt) => (
                  <option key={bt.id} value={bt.name}>
                    {bt.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-1.5 pt-1 animate-in fade-in">
                <input
                  type="text"
                  value={customTypeInput}
                  onChange={(e) => setCustomTypeInput(e.target.value)}
                  placeholder="e.g. Pet Care, Co-working Space, Jewelers"
                  className="w-full px-3.5 py-2.5 bg-white border border-teal-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-[10px] text-slate-500">
                  Saving tenant updates will automatically add this category to your system list.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Plan Tier
              </label>
              <select
                value={plan}
                onChange={(e) =>
                  setPlan(e.target.value as "BASIC" | "PRO" | "ENTERPRISE")
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="BASIC">BASIC (₹999 Lifetime)</option>
                <option value="PRO">PRO (₹499 / Month)</option>
                <option value="ENTERPRISE">ENTERPRISE (Custom)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Hardware Cards Quota
              </label>
              <input
                type="number"
                value={maxCards}
                onChange={(e) => setMaxCards(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Account Status
              </label>
              <select
                value={isActive ? "ACTIVE" : "SUSPENDED"}
                onChange={(e) => setIsActive(e.target.value === "ACTIVE")}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Google Review Destination URL
            </label>
            <input
              type="url"
              value={googleReviewUrl}
              onChange={(e) => setGoogleReviewUrl(e.target.value)}
              placeholder="https://search.google.com/local/writereview?placeid=..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={smartGateEnabled}
              onChange={(e) => setSmartGateEnabled(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
            />
            <span className="font-semibold text-slate-800">
              Enable Smart Rating Gate (Shield 1-3 star reviews privately)
            </span>
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs"
            >
              <Save className="w-4 h-4 text-teal-400" />
              <span>{isSaving ? "Saving..." : "Save Tenant Updates"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Cards List Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Assigned Cards ({tenant.cards.length} / {tenant.maxCards})
        </h3>

        {tenant.cards.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No cards assigned yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {tenant.cards.map((c) => (
              <div
                key={c.id}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-md border border-teal-200">
                    {c.shortCode}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-800 block">
                      {c.label || "Untitled Stand"}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      /tap/{c.urlSlug}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-semibold">
                    {c.tapCount} taps
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-50/70 p-6 rounded-3xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Danger Zone</span>
          </h4>
          <p className="text-xs text-rose-700 mt-0.5">
            Deleting this tenant will remove all associated cards, feedback, and user accounts.
          </p>
        </div>

        <button
          type="button"
          disabled={isDeleting}
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shrink-0 shadow-2xs transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>{isDeleting ? "Deleting..." : "Delete Tenant"}</span>
        </button>
      </div>

      {/* MODAL: ADD USER TO TENANT */}
      {isAddUserOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-xl relative">
            <button
              onClick={() => setIsAddUserOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="w-5 h-5 text-teal-600" />
              <h3 className="text-lg font-bold text-slate-900">
                Create Tenant User
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Add a user account linked to <span className="font-bold text-slate-700">{tenant.name}</span>.
            </p>

            {userError && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-medium">
                {userError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Vikram Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address (Login ID) *
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. owner@genzsports.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => generateAutoPassword(setNewUserPassword)}
                    className="text-[11px] font-bold text-teal-600 hover:text-teal-800 underline"
                  >
                    Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  User Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) =>
                    setNewUserRole(e.target.value as "OWNER" | "MANAGER" | "STAFF")
                  }
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                >
                  <option value="OWNER">OWNER (Full control of venue & branding)</option>
                  <option value="MANAGER">MANAGER (Review and feedback operations)</option>
                  <option value="STAFF">STAFF (Frontdesk read-only operations)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="flex-1 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="flex-1 px-3 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-70 text-white rounded-xl text-xs font-bold shadow-2xs"
                >
                  {isSubmittingUser ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET PASSWORD */}
      {resettingUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-slate-200 shadow-xl relative">
            <button
              onClick={() => setResettingUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <KeyRound className="w-5 h-5 text-teal-600" />
              <h3 className="text-base font-bold text-slate-900">
                Reset Password
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 font-mono">
              For: {resettingUser.email}
            </p>

            {resetSuccessMsg ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold">
                {resetSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      New Password
                    </label>
                    <button
                      type="button"
                      onClick={() => generateAutoPassword(setResetPasswordValue)}
                      className="text-[11px] font-bold text-teal-600 hover:text-teal-800 underline"
                    >
                      Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={resetPasswordValue}
                    onChange={(e) => setResetPasswordValue(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResettingUser(null)}
                    className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReset}
                    className="flex-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white rounded-xl text-xs font-bold shadow-2xs"
                  >
                    {isSubmittingReset ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
