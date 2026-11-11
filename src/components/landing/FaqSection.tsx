"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "How does TapGenie comply with Google's Review Policies?",
    answer:
      "TapGenie is built around authentic, unfiltered customer feedback. We strictly adhere to Google's anti-gating and anti-incentive policies: every single customer tap or scan links directly to your official Google Maps review screen. We never gate, filter, or intercept negative reviews, nor do we offer gifts, discounts, or incentives. Private feedback forms are strictly optional and never act as a barrier to leaving a public Google review.",
  },
  {
    question: "How does Google Account connection work and what permissions are requested?",
    answer:
      "When you connect your Google Business Profile, we request only the authorized https://www.googleapis.com/auth/business.manage permission. We read your public reviews, profile details (operating hours, categories, services), and performance metrics so you can view them in one organized dashboard. We never publish replies, posts, or changes without your explicit review and approval unless you turn on an automated setting.",
  },
  {
    question: "Can I disconnect my Google Account or delete my data?",
    answer:
      "Yes, at any time. You can disconnect your Google account in 1 click from your TapGenie dashboard settings or revoke access directly via https://myaccount.google.com/permissions. When disconnected, our tokens are revoked immediately and cached Google data is deleted within 30 days.",
  },
  {
    question: "How does the AI Review Reply Assistant work?",
    answer:
      "When enabled, the AI assistant drafts thoughtful, personalized response suggestions for your customer reviews based on your store's offerings and preferred tone. You can review, edit, or customize every draft before anything is published to your live Google profile.",
  },
  {
    question: "Which smartphones are compatible with TapGenie NFC cards?",
    answer:
      "TapGenie NFC touchpoints work natively with iPhone XR and newer (running iOS 13+), and the vast majority of NFC-enabled Android smartphones. In addition, every physical card and stand comes with a high-resolution dynamic QR code so any camera phone can scan instantly.",
  },
  {
    question: "How do UPI payments work through TapGenie?",
    answer:
      "Payments go directly to your merchant UPI ID. Customers tap their phone or scan your on-screen QR code and complete the transfer in their own UPI app (Google Pay, PhonePe, Paytm, etc.). TapGenie does not process, hold, or touch transaction funds, ensuring 0% commission directly into your merchant bank account.",
  },
  {
    question: "Can I manage multiple tables, counters, or branch locations?",
    answer:
      "Yes. You can assign separate cards to Table 1, Table 2, Front Counter, or separate physical branches. Each card tracks its own tap metrics and scans, and higher plans allow multi-location branch management under one unified company login.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
          Have questions about Google connection, review integrity, hardware compatibility, or setup? We&apos;ve got answers.
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
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
