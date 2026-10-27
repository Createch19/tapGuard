"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  SlidersHorizontal,
  PackagePlus,
  ScrollText,
  Users,
  LogOut,
  ArrowLeftRight,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email: string;
    role: string;
  };
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      name: "Platform Overview",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Tenants Directory",
      href: "/admin/tenants",
      icon: Building2,
    },
    {
      name: "Subscriptions & MRR",
      href: "/admin/subscriptions",
      icon: CreditCard,
    },
    {
      name: "Plan Configurator",
      href: "/admin/plan-config",
      icon: SlidersHorizontal,
    },
    {
      name: "Card Inventory",
      href: "/admin/inventory",
      icon: PackagePlus,
    },
    {
      name: "Platform Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Audit Trail",
      href: "/admin/audit-logs",
      icon: ScrollText,
    },
  ];

  return (
    <>
      {/* Mobile Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 text-white sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="TapGate Logo" className="w-8 h-8 rounded-lg object-contain shadow-xs" />
          <div>
            <div className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider">
              Super Admin
            </div>
            <div className="text-sm font-bold">TapGate Control</div>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Admin Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-5 flex-1 flex flex-col">
          {/* Header */}
          <div className="mb-6">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <img src="/logo.png" alt="TapGate Logo" className="w-8 h-8 rounded-xl object-contain shadow-xs" />
              <div>
                <span className="font-extrabold text-base tracking-tight text-white">
                  TapGate
                </span>
                <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block -mt-1">
                  Control Center
                </span>
              </div>
            </Link>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">Super Admin Mode</span>
              </div>
              <ShieldAlert className="w-4 h-4 text-teal-400" />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 flex-1">
            {navLinks.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-teal-500 text-slate-950 font-bold shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <item.icon
                    className={`w-4 h-4 ${
                      isActive ? "text-slate-950" : "text-slate-400"
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Switch to Tenant Portal */}
          <div className="pt-4 border-t border-slate-800 mb-2">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors border border-slate-700"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-teal-400" />
              <span>Switch to Tenant View</span>
            </Link>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-bold text-white truncate">
              {user.name || "Super Admin"}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
