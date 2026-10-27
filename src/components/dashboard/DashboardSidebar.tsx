"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CreditCard,
  MessageSquareWarning,
  Palette,
  Settings,
  Sparkles,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Store,
  QrCode,
  Tag,
  MapPin,
} from "lucide-react";

interface SidebarProps {
  tenant: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    maxCards: number;
    activeCards: number;
  };
  user: {
    name?: string | null;
    email: string;
    role: string;
  };
  unresolvedFeedbackCount: number;
}

export default function DashboardSidebar({
  tenant,
  user,
  unresolvedFeedbackCount,
}: SidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Google Hub",
      href: "/dashboard/google",
      icon: MapPin,
    },
    {
      name: "Cards & NFC",
      href: "/dashboard/cards",
      icon: CreditCard,
    },
    {
      name: "QR Studio",
      href: "/dashboard/qr-studio",
      icon: QrCode,
    },
    {
      name: "Private Feedback",
      href: "/dashboard/feedback",
      icon: MessageSquareWarning,
      badge: unresolvedFeedbackCount > 0 ? unresolvedFeedbackCount : null,
    },
    {
      name: "Branding & Gate",
      href: "/dashboard/branding",
      icon: Palette,
    },
    {
      name: "Keywords",
      href: "/dashboard/keywords",
      icon: Tag,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
    {
      name: "Subscription",
      href: "/dashboard/subscription",
      icon: Sparkles,
      planBadge: tenant.plan,
    },
  ];

  const quotaPercent = Math.min(
    100,
    Math.round((tenant.activeCards / (tenant.maxCards || 1)) * 100)
  );

  return (
    <>
      {/* Mobile Top Navbar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="TapGate Logo" className="w-8 h-8 rounded-lg object-contain shadow-xs" />
          <div>
            <div className="text-xs text-slate-400 font-medium leading-none">TapGate</div>
            <div className="text-sm font-bold text-slate-900 leading-tight truncate max-w-[180px]">
              {tenant.name}
            </div>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          {/* Logo & Tenant Header */}
          <div className="mb-6">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" alt="TapGate Logo" className="w-8 h-8 rounded-xl object-contain shadow-xs" />
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  TapGate
                </span>
                <span className="text-[10px] text-teal-600 font-semibold uppercase tracking-wider block -mt-1">
                  B2B Portal
                </span>
              </div>
            </Link>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-2 mb-1.5">
                <Store className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="text-xs font-bold text-slate-900 truncate">
                  {tenant.name}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                <span>Plan Quota</span>
                <span className="font-semibold text-slate-700">
                  {tenant.activeCards} / {tenant.maxCards} Cards
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full transition-all"
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Nav Links */}
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
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-teal-50 text-teal-700 font-bold border border-teal-200/80 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon
                      className={`w-4 h-4 ${
                        isActive ? "text-teal-600" : "text-slate-400"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}

                  {item.planBadge && !isActive && (
                    <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-100/60 px-1.5 py-0.5 rounded-md">
                      {item.planBadge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Super Admin Switcher if role is SUPER_ADMIN */}
          {user.role === "SUPER_ADMIN" && (
            <div className="pt-2 mb-2">
              <Link
                href="/admin"
                className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Super Admin Panel</span>
              </Link>
            </div>
          )}
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-bold text-slate-800 truncate">
              {user.name || "Business User"}
            </p>
            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
