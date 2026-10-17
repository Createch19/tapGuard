"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Store,
  UserPlus,
  Search,
  KeyRound,
  Trash2,
  X,
  Filter,
} from "lucide-react";

interface UserItem {
  id: string;
  name?: string | null;
  email: string;
  role: string;
  tenantId?: string | null;
  tenantName?: string | null;
  tenantSlug?: string | null;
  createdAt: string;
}

interface TenantOption {
  id: string;
  name: string;
  slug: string;
}

interface UsersClientProps {
  initialUsers: UserItem[];
  tenants: TenantOption[];
}

export default function UsersClient({
  initialUsers,
  tenants,
}: UsersClientProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [tenantFilter, setTenantFilter] = useState<string>("ALL");

  // Create User Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"OWNER" | "MANAGER" | "STAFF" | "SUPER_ADMIN">("OWNER");
  const [tenantId, setTenantId] = useState<string>(tenants[0]?.id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Reset Password Modal State
  const [resettingUser, setResettingUser] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState("");

  const generateAutoPassword = (setter: (val: string) => void) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
    let pwd = "Pass@";
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setter(pwd);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.tenantName || "").toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesTenant =
      tenantFilter === "ALL" ||
      (tenantFilter === "NONE" && !u.tenantId) ||
      u.tenantId === tenantFilter;

    return matchesSearch && matchesRole && matchesTenant;
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          tenantId: role === "SUPER_ADMIN" ? null : tenantId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");

      setUsers((prev) => [data.user, ...prev]);
      setIsModalOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      alert(`User ${data.user.email} created successfully!`);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Error creating user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: UserItem) => {
    if (
      !confirm(
        `Are you sure you want to delete user ${user.email}? This will revoke their platform access.`
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
    setIsResetting(true);

    try {
      const res = await fetch(`/api/admin/users/${resettingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      setResetSuccessMsg(`Password for ${resettingUser.email} updated.`);
      setTimeout(() => {
        setResettingUser(null);
        setNewPassword("");
        setResetSuccessMsg("");
      }, 2000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error resetting password");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Platform Users Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create and manage Super Admins, Business Owners, and Staff across all tenants
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            generateAutoPassword(setPassword);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-sm shrink-0"
        >
          <UserPlus className="w-4 h-4 text-teal-400" />
          <span>Create New User</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or tenant..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs text-slate-900"
          />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admins</option>
            <option value="OWNER">Tenant Owners</option>
            <option value="MANAGER">Managers</option>
            <option value="STAFF">Staff</option>
          </select>
        </div>

        <div>
          <select
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
          >
            <option value="ALL">All Tenants</option>
            <option value="NONE">No Tenant (Global Admins)</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
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
                <th className="py-3.5 px-5">User & Email</th>
                <th className="py-3.5 px-4">System Role</th>
                <th className="py-3.5 px-4">Tenant Association</th>
                <th className="py-3.5 px-4 text-center">Created Date</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                          {(u.name || u.email).slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {u.name || "Unnamed User"}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {u.role === "SUPER_ADMIN" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-teal-400">
                          <ShieldCheck className="w-3 h-3" />
                          Super Admin
                        </span>
                      ) : u.role === "OWNER" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          <Store className="w-3 h-3" />
                          Tenant Owner
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {u.role}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-800">
                      {u.tenantName ? (
                        <span className="font-bold text-slate-800">
                          {u.tenantName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">None (Global Admin)</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setResettingUser(u);
                            generateAutoPassword(setNewPassword);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="w-5 h-5 text-teal-600" />
              <h3 className="text-lg font-bold text-slate-900">
                Create Platform User
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Provision a new user account and assign their role and business venue.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    onClick={() => generateAutoPassword(setPassword)}
                    className="text-[11px] font-bold text-teal-600 hover:text-teal-800 underline"
                  >
                    Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    System Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) =>
                      setRole(
                        e.target.value as
                          | "OWNER"
                          | "MANAGER"
                          | "STAFF"
                          | "SUPER_ADMIN"
                      )
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  >
                    <option value="OWNER">OWNER</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="STAFF">STAFF</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>

                {role !== "SUPER_ADMIN" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Assigned Business *
                    </label>
                    <select
                      value={tenantId}
                      required
                      onChange={(e) => setTenantId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    >
                      {tenants.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
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
                  className="flex-1 px-3 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-70 text-white rounded-xl text-xs font-bold shadow-2xs"
                >
                  {isSubmitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
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
                Reset User Password
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
                      onClick={() => generateAutoPassword(setNewPassword)}
                      className="text-[11px] font-bold text-teal-600 hover:text-teal-800 underline"
                    >
                      Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                    disabled={isResetting}
                    className="flex-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white rounded-xl text-xs font-bold shadow-2xs"
                  >
                    {isResetting ? "Updating..." : "Update Password"}
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
