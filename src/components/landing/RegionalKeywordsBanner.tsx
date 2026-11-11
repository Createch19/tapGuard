"use client";

import React, { useState } from "react";
import { MessageSquare, Sparkles, HelpCircle, Check, Languages } from "lucide-react";

interface LanguagePrompt {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  question: string;
  subPrompt: string;
  exampleTopic: string;
}

const LANGUAGE_PROMPTS: LanguagePrompt[] = [
  {
    code: "EN",
    name: "English",
    nativeName: "English",
    flag: "🌐",
    question: "What did you order or enjoy most today?",
    subPrompt: "Share a quick word about the food, atmosphere, or our team's service.",
    exampleTopic: "e.g., Favorite dish, ambience, staff friendliness",
  },
  {
    code: "TA",
    name: "Tamil",
    nativeName: "தமிழ்",
    flag: "🇮🇳",
    question: "இன்று நீங்கள் என்ன சுவைத்தீர்கள்? எங்கள் உபசரிப்பு எப்படி இருந்தது?",
    subPrompt: "உணவின் சுவை மற்றும் சேவை பற்றிய உங்கள் கருத்துக்களை உங்கள் சொந்த வார்த்தைகளில் பகிருங்கள்.",
    exampleTopic: "உதாரணம்: பிடித்த உணவு, உபசரிப்பு, தூய்மை",
  },
  {
    code: "HI",
    name: "Hindi",
    nativeName: "हिन्दी",
    flag: "🇮🇳",
    question: "आज आपने क्या ऑर्डर किया और आपको क्या सबसे अच्छा लगा?",
    subPrompt: "खाने के स्वाद, सेवा या माहौल के बारे में अपने खुद के शब्दों में बताएं।",
    exampleTopic: "उदाहरण: पसंदीदा व्यंजन, सर्विस, माहौल",
  },
  {
    code: "TE",
    name: "Telugu",
    nativeName: "తెలుగు",
    flag: "🇮🇳",
    question: "ఈ రోజు మీరు ఏమి ఆర్డర్ చేశారు? మా సేవ ఎలా అనిపించింది?",
    subPrompt: "రుచి, వాతావరణం లేదా మా సిబ్బంది సేవల గురించి మీ సొంత మాటల్లో సమీక్ష రాయండి.",
    exampleTopic: "ఉదాహరణ: ఇష్టమైన వంటకం, సర్వీస్",
  },
  {
    code: "KN",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    flag: "🇮🇳",
    question: "ಇಂದು ನೀವು ಏನು ಆರ್ಡರ್ ಮಾಡಿದ್ದೀರಿ ಮತ್ತು ನಮ್ಮ ಸೇವೆ ಹೇಗಿತ್ತು?",
    subPrompt: "ಆಹಾರದ ರುಚಿ, ವಾತಾವರಣ ಅಥವಾ ಸಿಬ್ಬಂದಿ ಸೇವೆಯ ಕುರಿತು ನಿಮ್ಮ ಸ್ವಂತ ಮಾತುಗಳಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ.",
    exampleTopic: "ಉದಾಹರಣೆ: ನೆಚ್ಚಿನ ತಿನಿಸು, ಸೇವೆ",
  },
];

export default function RegionalKeywordsBanner() {
  const [selectedLang, setSelectedLang] = useState<number>(0);

  const current = LANGUAGE_PROMPTS[selectedLang];

  return (
    <section className="px-4 sm:px-8 py-20 bg-gradient-to-b from-white via-teal-50/20 to-white border-y border-slate-200/80 w-full overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/70 text-teal-800 text-xs font-bold mb-3 border border-teal-200/80">
            <Languages className="w-3.5 h-3.5 text-teal-600" />
            <span>Honest Customer Guidance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Review Prompts in the Customer&apos;s Own Words
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl mx-auto leading-relaxed">
            Customers often want to leave a review but don&apos;t know where to start. TapGenie provides gentle, open-ended reflection prompts in regional languages — with <strong>no ready-made text or pre-written answers</strong>. Every review is 100% genuine and written by the customer.
          </p>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {LANGUAGE_PROMPTS.map((item, idx) => (
            <button
              key={item.code}
              type="button"
              onClick={() => setSelectedLang(idx)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                selectedLang === idx
                  ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:border-slate-300"
              }`}
            >
              <span>{item.flag}</span>
              <span>{item.nativeName}</span>
            </button>
          ))}
        </div>

        {/* Prompt Card Display */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <MessageSquare className="w-4 h-4 text-teal-600" />
              <span>Customer Screen Preview ({current.name})</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/60">
              Zero Pre-Filled Copy
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Reflective Thought Prompt
              </span>
              <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                &ldquo;{current.question}&rdquo;
              </p>
              <p className="text-xs text-slate-600 mt-2">
                {current.subPrompt}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Prompt suggestions: <span className="text-slate-700 font-medium">{current.exampleTopic}</span></span>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span className="text-[11.5px]">Authentic feedback from real customer experiences</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span className="text-[11.5px]">No copy-pasting or automated script repetition</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span className="text-[11.5px]">Direct link straight to official Google Maps form</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
