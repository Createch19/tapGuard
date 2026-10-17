"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  PauseCircle,
  PlayCircle,
  X,
  ArrowUpRight,
  Briefcase,
  Tag,
  Check,
} from "lucide-react";

interface TenantItem {
  id: string;
  name: string;
  slug: string;
  plan: string;
  businessType: string;
  isActive: boolean;
  maxCards: number;
  createdAt: string;
  cardCount: number;
  tapCount: number;
}

interface BusinessTypeItem {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  isDefault: boolean;
}

interface TenantsClientProps {
  tenants: TenantItem[];
  initialBusinessTypes?: BusinessTypeItem[];
}

export default function TenantsClient({
  tenants: initialTenants,
  initialBusinessTypes = [],
}: TenantsClientProps) {
  const [tenants, setTenants] = useState<TenantItem[]>(initialTenants);
  const [businessTypes, setBusinessTypes] =
    useState<BusinessTypeItem[]>(initialBusinessTypes);
  const [search, setSearch] = useState("");
  const [businessTypeFilter, setBusinessTypeFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manage Business Types Modal State
  const [isManageTypesOpen, setIsManageTypesOpen] = useState(false);
  const [newTypeNameInput, setNewTypeNameInput] = useState("");
  const [isAddingType, setIsAddingType] = useState(false);

  // New tenant form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [plan, setPlan] = useState<"BASIC" | "PRO" | "ENTERPRISE">("BASIC");
  const [businessType, setBusinessType] = useState(
    initialBusinessTypes[0]?.name || "Restaurant & Café"
  );
  const [isCustomTypeMode, setIsCustomTypeMode] = useState(false);
  const [customTypeInput, setCustomTypeInput] = useState("");
  const [maxCards, setMaxCards] = useState(5);
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");

  // Owner account state
  const [createOwnerAccount, setCreateOwnerAccount] = useState(true);
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pwd = "Owner@";
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setOwnerPassword(pwd);
  };

  const handleAddNewBusinessType = async (typeName: string) => {
    if (!typeName.trim()) return null;
    setIsAddingType(true);

    try {
      const res = await fetch("/api/admin/business-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: typeName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create business type");

      const created: BusinessTypeItem = data.businessType;
      // Add if not already present
      setBusinessTypes((prev) => {
        if (prev.some((bt) => bt.id === created.id)) return prev;
        return [...prev, created];
      });

      return created.name;
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error adding business type");
      return null;
    } finally {
      setIsAddingType(false);
    }
  };

  const filteredTenants = tenants.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      t.name.toLowerCase().includes(q) ||
      t.slug.toLowerCase().includes(q) ||
      (t.businessType && t.businessType.toLowerCase().includes(q));

    const matchesType =
      businessTypeFilter === "ALL" || t.businessType === businessTypeFilter;

    return matchesSearch && matchesType;
  });

  const handleToggleStatus = async (tenant: TenantItem) => {
    const newStatus = !tenant.isActive;

    try {
      const res = await fetch(`/api/admin/tenants/${tenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update tenant status");

      setTenants((prev) =>
        prev.map((t) =>
          t.id === tenant.id ? { ...t, isActive: newStatus } : t
        )
      );
    } catch {
      alert("Failed to update status");
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalBusinessType = businessType;

      // If user typed a custom business type, save it to the DB first
      if (isCustomTypeMode && customTypeInput.trim()) {
        const savedName = await handleAddNewBusinessType(customTypeInput.trim());
        if (savedName) {
          finalBusinessType = savedName;
        }
      }

      const payload: Record<string, unknown> = {
        name,
        slug,
        plan,
        businessType: finalBusinessType,
        maxCards,
        googleReviewUrl,
      };

      if (createOwnerAccount) {
        if (!ownerEmail || !ownerPassword) {
          throw new Error(
            "Please enter both email and password for the owner account, or uncheck the owner creation option."
          );
        }
        if (ownerPassword.length < 6) {
          throw new Error("Owner password must be at least 6 characters.");
        }
        payload.ownerName = ownerName || `${name} Owner`;
        payload.ownerEmail = ownerEmail;
        payload.ownerPassword = ownerPassword;
      }

      const res = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create tenant");

      setTenants((prev) => [
        {
          id: data.tenant.id,
          name: data.tenant.name,
          slug: data.tenant.slug,
          plan: data.tenant.plan,
          businessType: data.tenant.businessType || finalBusinessType,
          isActive: data.tenant.isActive,
          maxCards: data.tenant.maxCards,
          createdAt: data.tenant.createdAt,
          cardCount: 0,
          tapCount: 0,
        },
        ...prev,
      ]);

      setIsModalOpen(false);
      setName("");
      setSlug("");
      setGoogleReviewUrl("");
      setOwnerName("");
      setOwnerEmail("");
      setOwnerPassword("");
      setIsCustomTypeMode(false);
      setCustomTypeInput("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Failed to create tenant");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Tenant Management Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage all onboarded venues, business classifications, plan allocations, and lifecycle states
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsManageTypesOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
          >
            <Tag className="w-4 h-4 text-slate-500" />
            <span>Business Types ({businessTypes.length})</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-teal-400" />
            <span>Onboard New Tenant</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter tenants by name, slug, or business category..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs text-slate-900"
          />
        </div>

        <div>
          <select
            value={businessTypeFilter}
            onChange={(e) => setBusinessTypeFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
          >
            <option value="ALL">All Business Types</option>
            {businessTypes.map((bt) => (
              <option key={bt.id} value={bt.name}>
                {bt.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">Tenant Name & Slug</th>
                <th className="py-3.5 px-4">Business Category</th>
                <th className="py-3.5 px-4">Plan Tier</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-center">Active Cards</th>
                <th className="py-3.5 px-4 text-center">Taps</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No tenants found matching your filter.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 font-black text-xs flex items-center justify-center shrink-0 border border-teal-100">
                          {t.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{t.name}</div>
                          <div className="text-[11px] font-mono text-slate-400">
                            /{t.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                        <Briefcase className="w-3 h-3 text-teal-600" />
                        <span>{t.businessType || "Restaurant & Café"}</span>
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-md font-bold text-[10px] uppercase bg-slate-100 text-slate-700">
                        {t.plan}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {t.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          Suspended
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-slate-800">
                      {t.cardCount} / {t.maxCards}
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-slate-800">
                      {t.tapCount}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(t)}
                          title={t.isActive ? "Suspend Tenant" : "Re-activate Tenant"}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
                        >
                          {t.isActive ? (
                            <PauseCircle className="w-4 h-4 text-amber-600" />
                          ) : (
                            <PlayCircle className="w-4 h-4 text-emerald-600" />
                          )}
                        </button>

                        <Link
                          href={`/admin/tenants/${t.id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 transition-colors"
                          title="View Deep Details"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ONBOARD NEW TENANT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-xl relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Onboard New Tenant
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Provision a new venue account, assign its business classification, and create login credentials.
            </p>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug) {
                      setSlug(
                        e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-")
                      );
                    }
                  }}
                  placeholder="e.g. Green Leaf Bistro, Royal Cuts Salon, Grand Palm Hotel"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
              </div>

              {/* BUSINESS TYPE DROPDOWN + ADD NEW OPTION */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Business Category / Type *
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
                  <div className="space-y-2 pt-1 animate-in fade-in">
                    <input
                      type="text"
                      required
                      value={customTypeInput}
                      onChange={(e) => setCustomTypeInput(e.target.value)}
                      placeholder="e.g. Pet Clinic, Co-working Space, Jewelers, Tattoo Studio"
                      className="w-full px-3.5 py-2.5 bg-white border border-teal-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <p className="text-[10px] text-slate-500">
                      This will be saved to your preloaded categories and made available for future tenants.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Unique Slug (URL identifier) *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  placeholder="green-leaf-bistro"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Plan Tier
                  </label>
                  <select
                    value={plan}
                    onChange={(e) => {
                      const newPlan = e.target.value as "BASIC" | "PRO" | "ENTERPRISE";
                      setPlan(newPlan);
                      setMaxCards(newPlan === "BASIC" ? 5 : newPlan === "PRO" ? 50 : 999999);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="BASIC">BASIC (₹999 Lifetime)</option>
                    <option value="PRO">PRO (₹499 / Month)</option>
                    <option value="ENTERPRISE">ENTERPRISE (Custom)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Max Cards Limit
                  </label>
                  <input
                    type="number"
                    value={maxCards}
                    onChange={(e) => setMaxCards(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Google Review URL
                </label>
                <input
                  type="url"
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                />
              </div>

              {/* Owner Account Box */}
              <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-950 uppercase tracking-wider">
                    Business Owner Login Account
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-teal-900">
                    <input
                      type="checkbox"
                      checked={createOwnerAccount}
                      onChange={(e) => setCreateOwnerAccount(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded border-teal-300 focus:ring-teal-500"
                    />
                    <span>Create User Now</span>
                  </label>
                </div>

                {createOwnerAccount ? (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-teal-900 uppercase tracking-wider mb-1">
                        Owner Full Name
                      </label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder={name ? `${name} Owner` : "e.g. John Doe"}
                        className="w-full px-3 py-2 bg-white border border-teal-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-teal-900 uppercase tracking-wider mb-1">
                        Owner Email (Login ID) *
                      </label>
                      <input
                        type="email"
                        required={createOwnerAccount}
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        placeholder="owner@business.com"
                        className="w-full px-3 py-2 bg-white border border-teal-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-teal-900 uppercase tracking-wider">
                          Initial Password *
                        </label>
                        <button
                          type="button"
                          onClick={generateRandomPassword}
                          className="text-[11px] font-bold text-teal-700 hover:text-teal-900 underline"
                        >
                          Auto-Generate
                        </button>
                      </div>
                      <input
                        type="text"
                        required={createOwnerAccount}
                        value={ownerPassword}
                        onChange={(e) => setOwnerPassword(e.target.value)}
                        placeholder="e.g. Owner@123456"
                        className="w-full px-3 py-2 bg-white border border-teal-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-teal-800">
                    No user will be created now. You can create one later in Tenant Details or Platform Users.
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  {isSubmitting ? "Provisioning..." : "Provision Tenant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE BUSINESS TYPES MODAL */}
      {isManageTypesOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-xl relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setIsManageTypesOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-5 h-5 text-teal-600" />
              <h3 className="text-lg font-bold text-slate-900">
                Business Categories
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Preloaded and custom categories available when onboarding business tenants.
            </p>

            {/* Quick Add Form */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTypeNameInput}
                onChange={(e) => setNewTypeNameInput(e.target.value)}
                placeholder="New type (e.g. Dental Clinic)"
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="button"
                disabled={isAddingType || !newTypeNameInput.trim()}
                onClick={async () => {
                  const saved = await handleAddNewBusinessType(newTypeNameInput);
                  if (saved) setNewTypeNameInput("");
                }}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-2xs shrink-0"
              >
                {isAddingType ? "Adding..." : "Add Type"}
              </button>
            </div>

            {/* List of Types */}
            <div className="overflow-y-auto divide-y divide-slate-100 flex-1 pr-1">
              {businessTypes.map((bt) => (
                <div
                  key={bt.id}
                  className="py-2.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-800">{bt.name}</span>
                    {bt.isDefault && (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-semibold">
                        System Default
                      </span>
                    )}
                  </div>
                  <Check className="w-4 h-4 text-teal-600" />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-2">
              <button
                type="button"
                onClick={() => setIsManageTypesOpen(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
