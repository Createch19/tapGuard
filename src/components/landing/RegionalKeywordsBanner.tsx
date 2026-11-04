"use client";

import React, { useState } from "react";
import { Sparkles, Copy, Check, Globe2, ShieldCheck, TrendingUp, Flame } from "lucide-react";

interface LanguageSample {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  keyword: string;
  sentence: string;
}

const LANGUAGES: LanguageSample[] = [
  {
    code: "EN",
    name: "English",
    nativeName: "English",
    flag: "🌐",
    keyword: "Authentic Filter Coffee",
    sentence:
      "Visited today and had a wonderful experience! The authentic filter coffee was absolutely delicious and the service was super courteous. Highly recommended!",
  },
  {
    code: "TANGLISH",
    name: "Tanglish",
    nativeName: "Tanglish (Tamil)",
    flag: "🌴",
    keyword: "Crispy Ghee Roast",
    sentence:
      "Semma experience! Crispy ghee roast taste vera level, quick service and clean ambience. Definitely coming back with friends!",
  },
  {
    code: "TA",
    name: "Tamil",
    nativeName: "தமிழ்",
    flag: "🇮🇳",
    keyword: "பாரம்பரிய சுவை",
    sentence:
      "மிகவும் அருமையான உணவகம்! பாரம்பரிய சுவை மற்றும் தரம் மிக அற்புதம். உபசரிப்பு மிகச்சிறப்பாக இருந்தது. வாழ்த்துகள்!",
  },
  {
    code: "HI",
    name: "Hindi / Hinglish",
    nativeName: "हिन्दी / Hinglish",
    flag: "🇮🇳",
    keyword: "Lajawab Biryani",
    sentence:
      "Bahut hi shandar experience raha! Lajawab biryani aur staff ki service ekdam lajawab thi. Family ke sath visit karne ke liye best jagah hai.",
  },
  {
    code: "TE",
    name: "Telugu",
    nativeName: "తెలుగు",
    flag: "🇮🇳",
    keyword: "రుచికరమైన భోజనం",
    sentence:
      "చాలా అద్భుతమైన అనుభవం! రుచికరమైన భోజనం మరియు సిబ్బంది సేవలు సూపర్ గా ఉన్నాయి. ఖచ్చితంగా మళ్లీ వస్తాము.",
  },
  {
    code: "KN",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    flag: "🇮🇳",
    keyword: "ಅತ್ಯುತ್ತಮ ರುಚಿ",
    sentence:
      "ತುಂಬಾ ಅದ್ಭುತವಾದ ಅನುಭವ! ಅತ್ಯುತ್ತಮ ರುಚಿ ಮತ್ತು ಸೇವೆ ಶ್ರೇಷ್ಠವಾಗಿದೆ. ಕುಟುಂಬದೊಂದಿಗೆ ಭೇಟಿ ನೀಡಲು ಉತ್ತಮ ಸ್ಥಳ.",
  },
];

export default function RegionalKeywordsBanner() {
  const [selectedLang, setSelectedLang] = useState<number>(1); // Default to Tanglish
  const [copied, setCopied] = useState(false);

  const current = LANGUAGES[selectedLang];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.sentence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section className="px-4 sm:px-8 py-20 bg-gradient-to-b from-white via-teal-50/30 to-white border-y border-slate-200/80 w-full overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/70 text-teal-800 text-xs font-bold mb-3 border border-teal-200/80">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>AI Review Sentence Generator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Customers Want to Leave 5 Stars — But Don&apos;t Know What to Write
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl mx-auto leading-relaxed">
            TapGenie solves writer&apos;s block by generating high-converting review sentences with your target local SEO keywords injected. Non-repeating mathematical permutations protect your profile from Google duplicate flags.
          </p>
        </div>

        {/* Interactive Language Selector Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {LANGUAGES.map((lang, idx) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setSelectedLang(idx);
                setCopied(false);
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedLang === idx
                  ? "bg-teal-600 text-white shadow-md shadow-teal-600/25 scale-102"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
              <span className="text-[10px] opacity-75 font-normal hidden sm:inline">
                ({lang.nativeName})
              </span>
            </button>
          ))}
        </div>

        {/* Live Sentence Card Preview */}
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl relative">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{current.flag}</span>
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  Generated in {current.name}
                </span>
                <span className="text-[10px] text-teal-600 font-semibold">
                  Target Keyword: &quot;{current.keyword}&quot;
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                ⭐ 5-Star Recommendation
              </span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 mb-5 border border-slate-100 relative group">
            <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed italic">
              &ldquo;{current.sentence}&rdquo;
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 text-center sm:text-left">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>1-tap copies to clipboard and launches official Google Review box</span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                copied
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Test 1-Click Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3 Key Benefits Underneath */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-center">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-2 font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">Local Maps SEO</h4>
            <p className="text-[11px] text-slate-500 leading-snug">
              Keywords like &ldquo;best cafe&rdquo; or &ldquo;crispy dosa&rdquo; push your store to rank #1 on Google Maps.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-center">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">Anti-Duplicate Safe</h4>
            <p className="text-[11px] text-slate-500 leading-snug">
              Permutation engine alters prefixes, phrases, and punctuation so Google never detects pattern repetition.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-center">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2 font-bold">
              <Globe2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">6 Regional Dialects</h4>
            <p className="text-[11px] text-slate-500 leading-snug">
              Full support for English, Tanglish, Tamil, Hindi, Telugu, and Kannada for maximum customer comfort.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

