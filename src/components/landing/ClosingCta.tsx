import React from "react";
import Link from "next/link";
import { ArrowRight, CreditCard, Sparkles, ShieldCheck, QrCode } from "lucide-react";

export default function ClosingCta() {
  return (
    <section className="px-4 sm:px-8 py-20 max-w-6xl mx-auto w-full">
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white rounded-3xl p-8 sm:p-14 border border-teal-900/50 shadow-2xl relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold mb-4 border border-teal-400/30">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Ready to Modernize Your Storefront?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Simplify Customer Reviews &amp; Digital Touchpoints
          </h2>

          <p className="text-xs sm:text-base text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed font-normal">
            Whether you run a single neighborhood café or a multi-location brand, TapGenie makes it effortless for customers to connect with your business.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
            <a
              href="#pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-2xl shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.02]"
            >
              <span>Choose Your Plan</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              href="/claim"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl border border-white/15 backdrop-blur-sm transition-all"
            >
              <CreditCard className="w-4 h-4 text-teal-400" />
              <span>Activate Received Hardware</span>
            </Link>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-center gap-6 text-[11px] text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Honest &amp; Direct Reviews</span>
            </div>
            <div className="flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-teal-400" />
              <span>NFC &amp; QR Universal Fallback</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-teal-400" />
              <span>Direct Merchant UPI Settlement</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
