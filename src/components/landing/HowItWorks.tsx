import React from "react";
import { Smartphone, ShieldCheck, CreditCard, Sparkles, ArrowRight } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      badge: "Plug & Play Hardware",
      title: "Place Your Touchpoint",
      description:
        "Position pre-printed acrylic table tents, counter pucks, or weatherproof NFC stands at customer touchpoints. Zero chip programming needed.",
      icon: CreditCard,
      highlight: "Universal Ghost Link Technology",
    },
    {
      step: "02",
      badge: "Zero Friction",
      title: "Customer Taps or Scans",
      description:
        "Customers simply tap their phone or scan the high-res vector QR code. Opens natively in 0.5s without installing any app.",
      icon: Smartphone,
      highlight: "Works on 99% of iOS & Android phones",
    },
    {
      step: "03",
      badge: "Intelligent Outcome",
      title: "Instant 5-Star Reviews",
      description:
        "Customers are guided to your official Google Review page with 1-click AI sentence suggestions and target SEO keywords, maximizing your rating conversion.",
      icon: Sparkles,
      highlight: "10x higher review conversion with 1 tap",
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
          No apps, no complex setup, and no tech experience needed. Your venue goes live in less than 2 minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {steps.map((item, idx) => {
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

