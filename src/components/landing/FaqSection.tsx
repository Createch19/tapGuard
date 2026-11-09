"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Is TapGenie 100% compliant with Google's Review Policy?",
    answer:
      "Yes, absolutely. TapGenie strictly adheres to Google's anti-gating and anti-incentive policies. We do not gate, filter, or restrict negative reviews, nor do we offer gifts, discounts, or compensation in exchange for reviews. We provide a frictionless NFC/QR touchpoint that directs customers directly to your official Google Maps listing, while empowering you with AI reply tools, competitor radar tracking, and profile health auditing.",
  },
  {
    question: "How does the Gemini AI Review Reply Auto-Pilot work?",
    answer:
      "TapGenie connects directly to your Google Business Profile API. When a new review arrives, Gemini AI analyzes the review sentiment, references your venue's custom knowledge base (menu items, services, atmosphere), and composes a warm, human-like response in your chosen brand tone. You can either review draft responses with one click or enable 24/7 Auto-Pilot to reply to 5-star reviews within minutes automatically.",
  },
  {
    question: "What is the Competitor Radar and how does it help my business?",
    answer:
      "Competitor Radar tracks competing businesses in your district or neighborhood on Google Maps. It monitors their review velocity (reviews added per week/month), average ratings, and public customer sentiment. TapGenie highlights competitor operational weak spots so you can highlight your strengths and capture more local footfall.",
  },
  {
    question: "What does the Google Profile Audit Score measure?",
    answer:
      "Our Profile Audit engine evaluates over 20 local SEO ranking signals across Profile Completeness, Visual Content, Operating & Holiday Hours, Service Menus, and Review Responsiveness. A higher audit score directly boosts your visibility in Google's coveted Top 3 Local Map Pack.",
  },
  {
    question: "Do my customers need to download an app or register an account?",
    answer:
      "No! TapGenie works 100% within the native web browser of any modern smartphone. Customers simply tap their phone on the NFC stand or scan the QR code with their camera. The interactive experience opens in under 0.5 seconds with zero downloads or logins required.",
  },
  {
    question: "Can I change my card's destination later without ordering new hardware?",
    answer:
      "Yes, 100%! All TapGenie cards are built on universal Ghost Link technology. You can change any physical card from Google Reviews to Business Profile Microsite, 0% UPI Instant Pay, or Food Delivery with a single click in your dashboard. You never need to reprint or re-encode your physical hardware.",
  },
  {
    question: "Can I manage multiple tables, counters, or branch locations?",
    answer:
      "Yes. You can assign separate cards to Table 1, Table 2, Front Counter, Drive-Thru, or separate physical branches. Each card tracks its own tap metrics, scans, and conversion rates, and higher plans allow multi-location branch management under one unified company login.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggle = (idx: number) => {
    setOpenIndex((current) => (current === idx ? null : idx));
  };

  return (
    <section id="faq" className="px-4 sm:px-8 py-20 max-w-4xl mx-auto w-full">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-3 border border-slate-200">
          <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Everything You Need to Know
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg mx-auto">
          Have questions about Google compliance, AI auto-pilot, hardware compatibility, or setup? We&apos;ve got answers.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? "bg-white border-teal-200 shadow-sm"
                  : "bg-white/80 border-slate-200/80 hover:border-slate-300"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-bold text-slate-900">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-teal-600" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-4.5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100/80 mt-1">
                  <p className="pt-2">{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
