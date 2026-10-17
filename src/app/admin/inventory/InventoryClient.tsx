"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Plus,
  Search,
  Download,
  ExternalLink,
  PackageCheck,
  PackageOpen,
} from "lucide-react";

interface InventoryCardItem {
  id: string;
  shortCode: string;
  urlSlug: string;
  label?: string | null;
  status: "UNASSIGNED" | "ACTIVE" | "DEACTIVATED" | "LOST";
  tenantName?: string | null;
  batchName?: string | null;
  createdAt: string;
}

interface InventoryClientProps {
  cards: InventoryCardItem[];
  unassignedCount: number;
  activeCount: number;
  baseUrl: string;
}

export default function InventoryClient({
  cards,
  unassignedCount,
  activeCount,
  baseUrl,
}: InventoryClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = cards.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.shortCode.toLowerCase().includes(q) ||
      c.urlSlug.toLowerCase().includes(q) ||
      (c.tenantName && c.tenantName.toLowerCase().includes(q)) ||
      (c.label && c.label.toLowerCase().includes(q));
    const matchesStatus =
      statusFilter === "all" ||
      c.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = "Short Code,Tap URL,Status,Tenant,Batch,Created At\n";
    const rows = filtered
      .map(
        (c) =>
          `"${c.shortCode}","${baseUrl}/tap/${c.urlSlug}","${c.status}","${
            c.tenantName || "Unassigned"
          }","${c.batchName || "N/A"}","${new Date(
            c.createdAt
          ).toLocaleDateString()}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tapgate-card-inventory-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            NFC Hardware Inventory & Batches
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Fleet overview of all pre-printed ghost links, active cards, and production runs
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/admin/inventory/generate"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4 text-teal-400" />
            <span>Generate New Batch</span>
          </Link>
        </div>
      </div>

      {/* Inventory Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Ghost Links In Stock
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <PackageOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-0.5">
            {unassignedCount}
          </div>
          <div className="text-xs text-amber-700 font-semibold">
            Ready for customer pairing
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Assigned & Active Cards
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-0.5">
            {activeCount}
          </div>
          <div className="text-xs text-slate-400">Deployed in retail & venues</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Manufactured
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-0.5">
            {cards.length}
          </div>
          <div className="text-xs text-slate-400">Lifetime inventory size</div>
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
            placeholder="Search by code (TAP-801), business name or slug..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
        >
          <option value="all">All Statuses ({cards.length})</option>
          <option value="unassigned">Unassigned Ghost Links ({unassignedCount})</option>
          <option value="active">Active Only ({activeCount})</option>
          <option value="deactivated">Deactivated</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">Activation Code</th>
                <th className="py-3.5 px-4">Hardware Status</th>
                <th className="py-3.5 px-4">Assigned Tenant</th>
                <th className="py-3.5 px-4">Production Batch</th>
                <th className="py-3.5 px-4">Direct Tap Link</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((card) => (
                <tr key={card.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5">
                    <span className="font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
                      {card.shortCode}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    {card.status === "UNASSIGNED" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        Ghost Link (Unassigned)
                      </span>
                    ) : card.status === "ACTIVE" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        {card.status}
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4">
                    {card.tenantName ? (
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {card.tenantName}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {card.label || "No location label"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unclaimed</span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-slate-600 font-medium">
                    {card.batchName || "Direct Provision"}
                  </td>

                  <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                    /tap/{card.urlSlug}
                  </td>

                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {card.status === "UNASSIGNED" && (
                        <Link
                          href={`/claim?code=${encodeURIComponent(card.shortCode)}`}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-semibold transition-colors shadow-2xs"
                        >
                          Assign
                        </Link>
                      )}
                      <a
                        href={`/tap/${card.urlSlug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 inline-flex items-center gap-1 text-[11px] font-semibold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Test Scan</span>
                      </a>
                    </div>
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
