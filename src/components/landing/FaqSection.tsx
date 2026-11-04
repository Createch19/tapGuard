"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Do my customers need to download an app or register an account?",
    answer:
      "No! TapGenie works 100% within the native web browser of any modern smartphone. Customers simply tap their phone on the NFC stand or scan the QR code with their camera. The interactive experience opens in under 0.5 seconds with zero downloads or logins required.",
  },
  {
    question: "Is TapGenie compliant with Google's Review policies?",
    answer:
      "Yes, completely. TapGenie never offers incentives, discounts, gifts, or cash in exchange for reviews (which violates Google's policies). Instead, we remove friction by letting satisfied customers easily draft helpful reviews, while offering an immediate private channel for guests who experienced an issue to reach your floor managers directly.",
  },
  {
    question: "Can I change my card's destination later without ordering new hardware?",
    answer:
      "Yes, 100%! All TapGenie cards are built on universal Ghost Link technology. You can change any physical card from Google Review Gate to Business Profile Microsite, 0% UPI Instant Pay, or Food Delivery with a single click in your dashboard. You never need to reprint or re-encode your physical hardware.",
  },
  {
    question: "Are there any payment gateway charges or deductions on UPI payments?",
    answer:
      "Zero commission. TapGenie is not a payment middleman and takes 0% cut. The UPI tile initiates a direct payment directly to your existing merchant UPI ID (Google Pay, PhonePe, Paytm, BHIM, or any bank). The money settles directly into your own bank account instantaneously.",
  },
  {
    question: "Can I manage multiple tables, counters, or branch locations?",
    answer:
      "Yes. You can assign separate cards to Table 1, Table 2, Counter, Drive-Thru, or separate physical branches. Each card tracks its own tap metrics, scans, and conversion rates, and higher plans allow multi-location branch management under one unified company login.",
  },
  {
    question: "How does the private feedback form handle 1 to 3 star ratings?",
    answer:
      "When a guest taps 1, 2, or 3 stars, they are guided to a private empathy resolution form instead of being sent to Google Maps. They can share what went wrong (cleanliness, service speed, food temperature, etc.) and leave their phone number. Your floor manager receives an instant notification so you can fix the problem right away.",
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
          Have questions about hardware compatibility, Google compliance, or setup? We&apos;ve got answers.
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

      <div className="text-center mt-8 text-xs text-slate-500">
        Still have questions?{" "}
        <a
          href="https://wa.me/919999999999?text=Hi%20TapGenie%20Team%2C%20I%20have%20a%20question%20about%20NFC%20cards"
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-600 font-bold hover:underline"
        >
          Chat with our team on WhatsApp
        </a>
      </div>
    </section>
  );
}

