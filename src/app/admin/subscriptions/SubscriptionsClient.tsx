"use client";

import React, { useState } from "react";
import { CreditCard, Search, TrendingUp, Sparkles } from "lucide-react";

interface SubscriptionItem {
  id: string;
  tenantName: string;
  tenantSlug: string;
  plan: string;
  status: string;
  billingCycle: string;
  pricePaid: number;
  currency: string;
  currentPeriodEnd?: string | null;
  createdAt: string;
}

interface SubscriptionsClientProps {
  subscriptions: SubscriptionItem[];
  mrr: number;
  lifetimeRev: number;
}

export default function SubscriptionsClient({
  subscriptions,
  mrr,
  lifetimeRev,
}: SubscriptionsClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = subscriptions.filter((sub) => {
    const q = search.toLowerCase();
    const matchesSearch =
      sub.tenantName.toLowerCase().includes(q) ||
      sub.plan.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === "all" ||
      sub.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Subscriptions & Revenue Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track B2B recurring cashflow, lifetime licenses, and subscription renewal cycles
          </p>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active MRR
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-0.5">
            ₹{mrr.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">Monthly recurring income</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Lifetime Collections
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-0.5">
            ₹{lifetimeRev.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">One-time basic lifetime plans</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Subscriptions
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-0.5">
            {subscriptions.length}
          </div>
          <div className="text-xs text-emerald-600 font-semibold">
            100% active billing
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tenant name or plan..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="trialing">Trialing</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">Subscriber Business</th>
                <th className="py-3.5 px-4">Plan & Billing</th>
                <th className="py-3.5 px-4">Price Paid</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Renewal / Expiry</th>
                <th className="py-3.5 px-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-bold text-slate-900">
                      {sub.tenantName}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      /{sub.tenantSlug}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-800">{sub.plan}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {sub.billingCycle}
                    </div>
                  </td>

                  <td className="py-4 px-4 font-bold text-slate-900 text-sm">
                    ₹{sub.pricePaid.toLocaleString()}
                  </td>

                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {sub.status}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-slate-500 text-xs">
                    {sub.billingCycle === "LIFETIME"
                      ? "Never (Lifetime)"
                      : sub.currentPeriodEnd
                      ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                      : "Ongoing"}
                  </td>

                  <td className="py-4 px-5 text-right">
                    <span className="text-[11px] text-slate-400">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
