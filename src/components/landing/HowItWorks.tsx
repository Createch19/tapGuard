import React from "react";
import { Smartphone, CreditCard, Sparkles, QrCode } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      badge: "Easy Setup",
      title: "Place Your Touchpoint",
      description:
        "Place your physical NFC card, counter stand, or table tent at customer touchpoints. Each card is ready to use out of the box with zero programming needed.",
      icon: CreditCard,
      highlight: "Compact NFC & QR Stand",
    },
    {
      step: "02",
      badge: "Zero Friction",
      title: "Customer Taps or Scans",
      description:
        "Customers simply tap their phone or scan the high-resolution QR code. Works natively without installing any app.",
      icon: Smartphone,
      highlight: "Works on iPhone XR+ and most Android phones",
    },
    {
      step: "03",
      badge: "Direct Link",
      title: "Customer Leaves a Review",
      description:
        "Customers are taken directly to your official Google Maps review screen where they can write an authentic review in their own words.",
      icon: Sparkles,
      highlight: "100% direct official Google review link",
    },
  ];

  return (
    <section id="how-it-works" className="px-4 sm:px-8 py-20 max-w-6xl mx-auto w-full">
      <div className="text-center mb-14">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600 block mb-1">
          Simple 3-Step Process
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          How TapGenie Powers Your Storefront
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl mx-auto">
          No apps, no complex setup, and no tech experience needed. Your venue goes live in minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-2xl font-black text-teal-600/30">
                    {item.step}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
                    {item.badge}
                  </span>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-teal-700">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{item.highlight}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
