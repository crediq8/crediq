"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getTtsAudio, orchestrateVoice, transcribeAudio } from "../lib/api";
import {
   ArrowRight,
   Cpu,
   Mic,
   ShieldCheck,
   Lock,
   Layers,
   CheckCircle2,
   Languages,
} from "lucide-react";

type UILang = "en" | "hi";
type InteractionMode = "manual" | "voice";
type VoiceStatus = "idle" | "listening" | "processing" | "error";

type VoiceResult = {
   principal: number;
   years: number;
   rate: number;
   maturity: number;
   recommendation: string;
};

const SECTION_ORDER = [
   "voice",
   "calculator",
   "howItWorks",
   "aiExplanation",
   "comparison",
   "scenarios",
   "trust",
   "footer",
] as const;

const TRANSLATIONS = {
   en: {
      nav: {
         home: "Home",
         advisor: "Vernacular FD Advisor",
         compare: "Compare Options",
         calculators: "Calculators",
         assistant: "AI Assistant",
         about: "About",
         switch: "हिंदी में देखें",
      },
      hero: {
         titleA: "Speak",
         titleB: "your financial goal",
         support: "बोलकर बताइए, हम सब कर देंगे",
         sub: "जैसे: 50,000 निवेश करना है 2 साल के लिए",
         floatingHint: "Try: I want to invest 50,000 for 2 years",
         statusListening: "Listening...",
         statusProcessing: "Processing your request...",
         statusIdle: "Tap the mic and speak naturally",
         placeholder: "Say your goal in Hindi, English, or Hinglish",
         fallback: "I could not understand clearly. Please speak again.",
         fallbackHi: "मुझे ठीक से समझ नहीं आया, फिर से बोलिए",
         modeVoice: "Voice Mode Active",
         modeManual: "Manual Mode Active",
         modeHint: "Voice users can say: 'next section', 'compare', 'low risk option'",
         suggestionsTitle: "Quick suggestions",
         suggestion1: "50,000 invest for 2 years",
         suggestion2: "मुझे best option दिखाओ",
         suggestion3: "low risk option बताओ",
         goDashboard: "Open Full Dashboard",
         analyzed: "Analyzed Successfully",
         recommendation: "Recommendation",
         voiceResponse: "Voice Response",
      },
      sections: {
         calculator: "Interactive Calculator",
         how: "How It Works",
         ai: "AI Explanation",
         compare: "Comparison Section",
         scenarios: "Scenarios",
         trust: "Trust Section",
         footer: "Footer",
      },
      calc: {
         title: "Interactive calculator",
         amount: "Investment Amount",
         years: "Duration (Years)",
         rate: "Estimated FD Rate",
         projected: "Projected Maturity",
      },
      how: {
         title: "You speak, Crediq guides",
         desc: "Voice, UI, and recommendations remain fully synchronized.",
         steps: [
            "1. Speak your target",
            "2. Crediq understands language and intent",
            "3. Results + section navigation happen automatically",
         ],
      },
      ai: {
         title: "AI explanation",
         body: "Your amount, duration, and risk preference are continuously mapped so the response stays short, clear, and guided.",
      },
      compare: {
         title: "Compare options",
         labels: {
            option: "Option",
            rate: "Estimated return",
            risk: "Risk",
         },
         rows: [
            ["Tier 1 Bank FD", "7.1%", "Low"],
            ["Sovereign Gold Bonds", "2.5% + capital", "Medium"],
            ["Nifty 50 Index", "12% historical", "High"],
         ],
      },
      scenarios: {
         title: "Guided scenarios",
         safe: "Safe option",
         balanced: "Balanced option",
         growth: "Growth option",
      },
      trust: {
         title: "Engineered for trust",
         one: "Bank-grade calculations",
         two: "Simple guidance for first-time users",
         three: "Works with voice and manual flow",
      },
      footer: {
         title: "Ready to plan smarter?",
         cta: "Enter the Application",
         sub: "Manual users can continue scrolling. Voice users can say: 'next section'.",
      },
      spoken: {
         best: "Best current option is Tier 1 Bank FD with stable return and low risk.",
         compare: "Showing comparison section now.",
         lowRisk: "Low risk option selected. I recommend Tier 1 Bank FD.",
         next: "Opening next section.",
         unsupported: "I did not understand the command. Please try again.",
         result: "For your investment, estimated return is",
         switchedManual: "Manual interaction detected. You can still use voice by tapping the mic.",
      },
   },
   hi: {
      nav: {
         home: "होम",
         advisor: "वर्नाक्युलर FD एडवाइज़र",
         compare: "तुलना विकल्प",
         calculators: "कैलकुलेटर",
         assistant: "AI सहायक",
         about: "हमारे बारे में",
         switch: "Switch to English",
      },
      hero: {
         titleA: "बोलिए",
         titleB: "और अपना लक्ष्य पाएं",
         support: "बोलकर बताइए, हम सब कर देंगे",
         sub: "जैसे: 50,000 निवेश करना है 2 साल के लिए",
         floatingHint: "उदाहरण: मुझे 50,000 दो साल के लिए निवेश करना है",
         statusListening: "सुन रहा हूँ…",
         statusProcessing: "आपकी बात समझ रहा हूँ…",
         statusIdle: "माइक दबाकर सामान्य भाषा में बोलिए",
         placeholder: "हिंदी, अंग्रेजी या हिंग्लिश में बोलिए",
         fallback: "मुझे ठीक से समझ नहीं आया, फिर से बोलिए",
         fallbackHi: "मुझे ठीक से समझ नहीं आया, फिर से बोलिए",
         modeVoice: "वॉइस मोड चालू",
         modeManual: "मैन्युअल मोड चालू",
         modeHint: "बोलकर चलाएं: 'next section', 'compare', 'low risk option'",
         suggestionsTitle: "तुरंत सुझाव",
         suggestion1: "50,000 को 2 साल निवेश करना है",
         suggestion2: "मुझे best option दिखाओ",
         suggestion3: "low risk option बताओ",
         goDashboard: "पूरा डैशबोर्ड खोलें",
         analyzed: "विश्लेषण पूरा",
         recommendation: "सुझाव",
         voiceResponse: "वॉइस जवाब",
      },
      sections: {
         calculator: "इंटरैक्टिव कैलकुलेटर",
         how: "कैसे काम करता है",
         ai: "AI समझाएगा",
         compare: "तुलना सेक्शन",
         scenarios: "सिनेरियो",
         trust: "भरोसा सेक्शन",
         footer: "फुटर",
      },
      calc: {
         title: "इंटरैक्टिव कैलकुलेटर",
         amount: "निवेश राशि",
         years: "अवधि (साल)",
         rate: "अनुमानित FD रेट",
         projected: "अनुमानित मैच्योरिटी",
      },
      how: {
         title: "आप बोलिए, Crediq मार्गदर्शन देगा",
         desc: "वॉइस, UI और सुझाव एक साथ अपडेट होते हैं।",
         steps: [
            "1. अपना लक्ष्य बोलिए",
            "2. Crediq भाषा और इरादा समझता है",
            "3. रिजल्ट और सेक्शन नेविगेशन अपने आप होते हैं",
         ],
      },
      ai: {
         title: "AI व्याख्या",
         body: "राशि, समय और जोखिम पसंद लगातार मैप होती है ताकि जवाब छोटा, स्पष्ट और आसान रहे।",
      },
      compare: {
         title: "विकल्प तुलना",
         labels: {
            option: "विकल्प",
            rate: "अनुमानित रिटर्न",
            risk: "जोखिम",
         },
         rows: [
            ["Tier 1 Bank FD", "7.1%", "कम"],
            ["Sovereign Gold Bonds", "2.5% + capital", "मध्यम"],
            ["Nifty 50 Index", "12% historical", "उच्च"],
         ],
      },
      scenarios: {
         title: "मार्गदर्शित सिनेरियो",
         safe: "सुरक्षित विकल्प",
         balanced: "संतुलित विकल्प",
         growth: "ग्रोथ विकल्प",
      },
      trust: {
         title: "भरोसे के लिए तैयार",
         one: "बैंक-ग्रेड गणना",
         two: "पहली बार उपयोग करने वालों के लिए सरल मार्गदर्शन",
         three: "वॉइस और मैन्युअल दोनों में काम करता है",
      },
      footer: {
         title: "स्मार्ट प्लानिंग शुरू करें",
         cta: "एप्लिकेशन में जाएँ",
         sub: "मैन्युअल यूजर स्क्रॉल कर सकते हैं। वॉइस यूजर बोलें: 'next section'.",
      },
      spoken: {
         best: "आपके लिए अभी सबसे अच्छा विकल्प Tier 1 Bank FD है।",
         compare: "तुलना सेक्शन खोल रहा हूँ।",
         lowRisk: "कम जोखिम विकल्प चुना गया है। Tier 1 Bank FD सुझाया गया है।",
         next: "अगला सेक्शन खोल रहा हूँ।",
         unsupported: "कमांड समझ नहीं आया। कृपया फिर से बोलिए।",
         result: "आपके निवेश पर अनुमानित रिटर्न है",
         switchedManual: "मैन्युअल इंटरैक्शन मिला। माइक दबाकर फिर से वॉइस चालू कर सकते हैं।",
      },
   },
} as const;

export default function Home() {
   const router = useRouter();
   const { scrollYProgress } = useScroll();
   const yParallax = useTransform(scrollYProgress, [0, 1], [0, -120]);

   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
   const audioChunksRef = useRef<Blob[]>([]);
   const lastAudioUrlRef = useRef<string | null>(null);
   const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

   const [interactionMode, setInteractionMode] = useState<InteractionMode>("manual");
   const [uiLang, setUiLang] = useState<UILang>("en");
   const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
   const [isListening, setIsListening] = useState(false);
   const [isVoiceBusy, setIsVoiceBusy] = useState(false);
   const [transcript, setTranscript] = useState("");
   const [voiceReply, setVoiceReply] = useState("");
   const [voiceError, setVoiceError] = useState("");
   const [activeSectionIndex, setActiveSectionIndex] = useState(0);

   const [calculator, setCalculator] = useState({ principal: 50000, years: 2, rate: 7.2 });
   const [voiceResult, setVoiceResult] = useState<VoiceResult | null>(null);

   const t = TRANSLATIONS[uiLang];

   const maturity = useMemo(() => {
      return Math.round(calculator.principal * Math.pow(1 + calculator.rate / 100, calculator.years));
   }, [calculator]);

   const playTts = async (text: string, lang: UILang) => {
      const audioBlob = await getTtsAudio(text, lang);
      if (lastAudioUrlRef.current) {
         URL.revokeObjectURL(lastAudioUrlRef.current);
      }
      const url = URL.createObjectURL(audioBlob);
      lastAudioUrlRef.current = url;
      const audio = new Audio(url);
      void audio.play();
   };

   const scrollToSection = (section: (typeof SECTION_ORDER)[number]) => {
      const node = sectionRefs.current[section];
      if (!node) return;

      node.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSectionIndex(SECTION_ORDER.indexOf(section));
   };

   const applyInvestment = (principal: number, years: number, rate: number, recommendation: string) => {
      const projected = Math.round(principal * Math.pow(1 + rate / 100, years));

      setCalculator({ principal, years, rate });
      setVoiceResult({ principal, years, rate, maturity: projected, recommendation });
   };

   const executeVoiceCommand = (command: string) => {
      if (command === "next_section") {
         const nextIndex = Math.min(activeSectionIndex + 1, SECTION_ORDER.length - 1);
         const nextSection = SECTION_ORDER[nextIndex];
         setActiveSectionIndex(nextIndex);
         scrollToSection(nextSection);
         return;
      }

      if (command === "open_compare") {
         scrollToSection("comparison");
         return;
      }

      if (command === "low_risk") {
         applyInvestment(50000, 2, 6.9, "Tier 1 Bank FD");
         scrollToSection("calculator");
         return;
      }

      if (command === "best_option") {
         applyInvestment(50000, 2, 7.1, "Tier 1 Bank FD");
         scrollToSection("comparison");
         return;
      }

      if (command === "open_dashboard") {
         router.push("/dashboard");
      }
   };

   const runVoiceFlow = async (text: string) => {
      if (!text.trim()) {
         setVoiceStatus("error");
         setVoiceError(t.hero.fallback);
         return;
      }

      try {
         setIsVoiceBusy(true);
         setVoiceStatus("processing");
         const orchestration = await orchestrateVoice(text, uiLang);
         const lang = orchestration.language === "hi" ? "hi" : "en";

         setUiLang(lang);
         setVoiceReply(orchestration.ui_response || orchestration.spoken_response);
         setVoiceError("");

         if (orchestration.data?.amount_in_rupees && orchestration.data?.years) {
            const principal = Number(orchestration.data.amount_in_rupees);
            const years = Number(orchestration.data.years);
            const rate = orchestration.data.rate ? Number(orchestration.data.rate) : 7.2;
            applyInvestment(principal, years, rate, "Tier 1 Bank FD");
            scrollToSection("calculator");
         }

         executeVoiceCommand(orchestration.command || "none");

         if (orchestration.spoken_response) {
            await playTts(orchestration.spoken_response, lang);
         }
         setVoiceStatus("idle");
      } catch {
         setVoiceStatus("error");
         setVoiceError(t.hero.fallback);
      } finally {
         setIsVoiceBusy(false);
      }
   };

   const startListening = async () => {
      if (isVoiceBusy) return;
      setInteractionMode("voice");
      setVoiceError("");

      if (!navigator.mediaDevices?.getUserMedia) {
         setVoiceStatus("error");
         setVoiceError("Audio recording is not supported in this browser.");
         return;
      }

      try {
         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
         const recorder = new MediaRecorder(stream);
         mediaRecorderRef.current = recorder;
         audioChunksRef.current = [];

         recorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunksRef.current.push(event.data);
         };

         recorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
            stream.getTracks().forEach((track) => track.stop());
            setIsListening(false);
            setVoiceStatus("processing");

            try {
               const stt = await transcribeAudio(audioBlob);
               setTranscript(stt.transcript);
               await runVoiceFlow(stt.transcript);
            } catch {
               setVoiceStatus("error");
               setVoiceError(t.hero.fallback);
            }
         };

         recorder.start();
         setIsListening(true);
         setVoiceStatus("listening");
         setTranscript("");
      } catch {
         setVoiceStatus("error");
         setVoiceError("Microphone permission denied or unavailable.");
      }
   };

   const stopListening = () => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
         recorder.stop();
      }
   };

   useEffect(() => {
      const manualSwitchHandler = (event: Event) => {
         if (interactionMode !== "voice") return;

         const target = event.target as HTMLElement | null;
         if (target?.closest("[data-voice-trigger='true']")) return;

         setInteractionMode("manual");
         setVoiceReply(t.spoken.switchedManual);
      };

      window.addEventListener("wheel", manualSwitchHandler, { passive: true });
      window.addEventListener("touchmove", manualSwitchHandler, { passive: true });
      window.addEventListener("mousedown", manualSwitchHandler);
      window.addEventListener("keydown", manualSwitchHandler);

      return () => {
         window.removeEventListener("wheel", manualSwitchHandler);
         window.removeEventListener("touchmove", manualSwitchHandler);
         window.removeEventListener("mousedown", manualSwitchHandler);
         window.removeEventListener("keydown", manualSwitchHandler);
      };
   }, [interactionMode, t.spoken.switchedManual]);

   useEffect(() => {
      return () => {
         const recorder = mediaRecorderRef.current;
         if (recorder && recorder.state !== "inactive") {
            recorder.stop();
         }
         if (lastAudioUrlRef.current) {
            URL.revokeObjectURL(lastAudioUrlRef.current);
         }
      };
   }, []);

   const navToDashboard = () => router.push("/dashboard");

   return (
      <div className="min-h-screen relative overflow-hidden bg-[#050508] text-white">
         <div className="fixed inset-0 z-0 pointer-events-none mix-blend-screen overflow-hidden">
            <motion.div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-linear-to-tr from-[#f70bff] to-[#00f0ff] rounded-full blur-[120px] animate-fluid-mesh opacity-10" />
         </div>

         <nav className="fixed w-full z-50 top-0 border-b border-white/5 bg-[#050508]/70 backdrop-blur-2xl px-4 md:px-10 py-4">
            <div className="flex items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                     <span className="text-black font-bold text-lg leading-none tracking-tighter">C</span>
                  </div>
                  <span className="font-semibold tracking-tighter text-xl hidden md:block">Crediq</span>
               </div>

               <div className="hidden lg:flex items-center gap-6 text-sm text-slate-300">
                  <button onClick={() => scrollToSection("voice")}>{t.nav.home}</button>
                  <button onClick={() => scrollToSection("voice")}>{t.nav.advisor}</button>
                  <button onClick={() => scrollToSection("comparison")}>{t.nav.compare}</button>
                  <button onClick={() => scrollToSection("calculator")}>{t.nav.calculators}</button>
                  <button onClick={() => scrollToSection("aiExplanation")}>{t.nav.assistant}</button>
                  <button onClick={() => scrollToSection("trust")}>{t.nav.about}</button>
               </div>

               <div className="flex items-center gap-3">
                  <button
                     onClick={() => setUiLang((prev) => (prev === "en" ? "hi" : "en"))}
                     className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs md:text-sm text-slate-200 flex items-center gap-2"
                  >
                     <Languages className="w-4 h-4" />
                     {t.nav.switch}
                  </button>
                  <button
                     onClick={navToDashboard}
                     className="px-4 py-2 rounded-full bg-white text-black font-semibold text-sm hover:scale-105 transition-transform hidden md:flex items-center gap-2"
                  >
                     {t.hero.goDashboard} <ArrowRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
         </nav>

         <section
            ref={(el) => {
               sectionRefs.current.voice = el;
            }}
            className="relative z-10 pt-36 md:pt-44 pb-16 px-6 mx-auto max-w-300 text-center min-h-[82vh]"
         >
            <h1 className="text-4xl md:text-7xl leading-tight tracking-tighter mb-4">
                <span className="font-black text-transparent bg-clip-text bg-linear-to-r from-white via-slate-200 to-slate-500">{t.hero.titleA}</span>{" "}
               <span className="font-light">{t.hero.titleB}</span>
            </h1>

            <p className="text-xl text-[#00f0ff] font-semibold mb-3">{t.hero.support}</p>
            <p className="text-slate-400 mb-10">{t.hero.sub}</p>

            <div className="relative max-w-3xl mx-auto p-6 rounded-4xl border border-white/10 bg-[#0a0b10]/80 backdrop-blur-xl">
               <motion.p
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                  transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.2 }}
                  className="absolute -top-7 left-1/2 -translate-x-1/2 text-sm text-[#00f0ff]"
               >
                  {t.hero.floatingHint}
               </motion.p>

               <div className="flex flex-col md:flex-row gap-4 md:items-center">
                  <motion.button
                     data-voice-trigger="true"
                     onClick={isListening ? stopListening : startListening}
                     whileTap={{ scale: 0.96 }}
                     className={`mx-auto md:mx-0 w-24 h-24 rounded-full flex items-center justify-center transition-all border-2 ${
                        isListening
                           ? "bg-red-500 text-white border-red-200 shadow-[0_0_40px_rgba(239,68,68,0.55)]"
                           : "bg-[#00f0ff] text-black border-cyan-200 shadow-[0_0_50px_rgba(0,240,255,0.55)]"
                     }`}
                     animate={{ scale: isListening ? [1, 1.05, 1] : [1, 1.03, 1] }}
                     transition={{ repeat: Infinity, duration: 1.6 }}
                     aria-label="Start voice recognition"
                  >
                     <Mic className="w-10 h-10" />
                  </motion.button>

                  <div className="text-left flex-1">
                     <p className="text-sm text-slate-400 mb-2">
                        {interactionMode === "voice" ? t.hero.modeVoice : t.hero.modeManual}
                     </p>
                     <p className="text-base md:text-lg font-medium text-white min-h-8">{transcript || t.hero.placeholder}</p>
                     <p className="text-sm text-slate-400 mt-1">
                        {voiceStatus === "listening" ? t.hero.statusListening : voiceStatus === "processing" ? t.hero.statusProcessing : t.hero.statusIdle}
                     </p>
                  </div>
               </div>

               <div className="mt-5 pt-5 border-t border-white/10 text-left">
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">{t.hero.voiceResponse}</p>
                  <p className="text-base text-slate-200 min-h-6">{voiceReply || t.hero.modeHint}</p>
                  {voiceError ? <p className="text-sm text-red-300 mt-2">{voiceError}</p> : null}
               </div>

               <div className="mt-6 flex flex-wrap gap-3">
                  <span className="text-xs text-slate-500 w-full">{t.hero.suggestionsTitle}</span>
                  <button
                     onClick={() => runVoiceFlow(t.hero.suggestion1)}
                     className="px-4 py-2 rounded-full text-sm bg-white/5 border border-white/10 hover:border-[#00f0ff]/40"
                  >
                     {t.hero.suggestion1}
                  </button>
                  <button
                     onClick={() => runVoiceFlow(t.hero.suggestion2)}
                     className="px-4 py-2 rounded-full text-sm bg-white/5 border border-white/10 hover:border-[#00f0ff]/40"
                  >
                     {t.hero.suggestion2}
                  </button>
                  <button
                     onClick={() => runVoiceFlow(t.hero.suggestion3)}
                     className="px-4 py-2 rounded-full text-sm bg-white/5 border border-white/10 hover:border-[#00f0ff]/40"
                  >
                     {t.hero.suggestion3}
                  </button>
               </div>
            </div>

            <AnimatePresence>
               {voiceResult ? (
                  <motion.div
                     initial={{ opacity: 0, y: 12 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="mt-8 max-w-3xl mx-auto bg-white/5 border border-green-500/30 rounded-2xl p-6 text-left"
                  >
                     <span className="text-xs text-green-400 font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4" /> {t.hero.analyzed}
                     </span>
                     <h3 className="text-2xl font-bold mb-2">
                        {t.calc.projected}: ₹{voiceResult.maturity.toLocaleString("en-IN")}
                     </h3>
                     <p className="text-slate-300 mb-3">
                        {t.hero.recommendation}: {voiceResult.recommendation}
                     </p>
                     <button onClick={navToDashboard} className="px-4 py-2 bg-white text-black font-bold rounded-full text-sm inline-flex items-center gap-2">
                        {t.hero.goDashboard} <ArrowRight className="w-4 h-4" />
                     </button>
                  </motion.div>
               ) : null}
            </AnimatePresence>
         </section>

         <main className="relative z-10">
            <section
               ref={(el) => {
                  sectionRefs.current.calculator = el;
               }}
                className="py-16 px-6 max-w-300 mx-auto border-t border-white/5"
            >
               <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">{t.calc.title}</h2>
               <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                     <p className="text-sm text-slate-400 mb-2">{t.calc.amount}</p>
                     <input
                        type="range"
                        min={10000}
                        max={1000000}
                        step={1000}
                        value={calculator.principal}
                        onChange={(e) => setCalculator((prev) => ({ ...prev, principal: Number(e.target.value) }))}
                        className="w-full accent-[#00f0ff]"
                     />
                     <p className="mt-2 font-semibold">₹{calculator.principal.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                     <p className="text-sm text-slate-400 mb-2">{t.calc.years}</p>
                     <input
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={calculator.years}
                        onChange={(e) => setCalculator((prev) => ({ ...prev, years: Number(e.target.value) }))}
                        className="w-full accent-[#00f0ff]"
                     />
                     <p className="mt-2 font-semibold">{calculator.years}</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                     <p className="text-sm text-slate-400 mb-2">{t.calc.rate}</p>
                     <p className="font-semibold text-[#00f0ff]">{calculator.rate}%</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                     <p className="text-sm text-slate-400 mb-2">{t.calc.projected}</p>
                     <p className="font-semibold text-green-300">₹{maturity.toLocaleString("en-IN")}</p>
                  </div>
               </div>
            </section>

            <section
               ref={(el) => {
                  sectionRefs.current.howItWorks = el;
               }}
                className="py-20 px-6 max-w-300 mx-auto"
            >
               <h2 className="text-3xl md:text-5xl font-light tracking-tighter mb-3">{t.how.title}</h2>
               <p className="text-slate-400 mb-8">{t.how.desc}</p>
               <div className="grid md:grid-cols-3 gap-6">
                  {t.how.steps.map((step: string, idx: number) => (
                     <div key={step} className="p-6 rounded-3xl bg-white/5 border border-white/10">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-4">
                           {idx + 1}
                        </div>
                        <p>{step}</p>
                     </div>
                  ))}
               </div>
            </section>

            <section
               ref={(el) => {
                  sectionRefs.current.aiExplanation = el;
               }}
               className="py-20 px-6 bg-[#0a0b10] border-y border-white/5"
            >
                <div className="max-w-300 mx-auto">
                  <h2 className="text-3xl font-semibold mb-4">{t.ai.title}</h2>
                  <p className="text-slate-300 max-w-3xl">{t.ai.body}</p>
               </div>
            </section>

            <section
               ref={(el) => {
                  sectionRefs.current.comparison = el;
               }}
                className="py-20 px-6 max-w-300 mx-auto"
            >
               <div className="flex items-center gap-3 mb-8">
                  <Layers className="w-6 h-6 text-[#f70bff]" />
                  <h2 className="text-3xl font-semibold tracking-tight">{t.compare.title}</h2>
               </div>
               <div className="rounded-3xl p-6 bg-white/5 border border-white/10">
                  <div className="grid grid-cols-3 text-sm text-slate-400 pb-3 border-b border-white/10">
                     <span>{t.compare.labels.option}</span>
                     <span>{t.compare.labels.rate}</span>
                     <span>{t.compare.labels.risk}</span>
                  </div>
                  {t.compare.rows.map((row) => (
                     <div key={row[0]} className="grid grid-cols-3 py-4 border-b border-white/5 last:border-b-0">
                        <span>{row[0]}</span>
                        <span>{row[1]}</span>
                        <span>{row[2]}</span>
                     </div>
                  ))}
               </div>
            </section>

            <section
               ref={(el) => {
                  sectionRefs.current.scenarios = el;
               }}
                className="py-16 px-6 max-w-300 mx-auto border-t border-white/5"
            >
               <h2 className="text-3xl font-semibold mb-6">{t.scenarios.title}</h2>
               <div className="flex flex-wrap gap-3">
                  <button onClick={() => runVoiceFlow("low risk option")} className="px-5 py-3 rounded-full bg-white/5 border border-white/10">
                     {t.scenarios.safe}
                  </button>
                  <button onClick={() => applyInvestment(100000, 3, 7.2, "Tier 1 Bank FD")} className="px-5 py-3 rounded-full bg-white/5 border border-white/10">
                     {t.scenarios.balanced}
                  </button>
                  <button onClick={() => applyInvestment(200000, 5, 8.1, "Blended Growth Basket")} className="px-5 py-3 rounded-full bg-white/5 border border-white/10">
                     {t.scenarios.growth}
                  </button>
               </div>
            </section>

            <section
               ref={(el) => {
                  sectionRefs.current.trust = el;
               }}
                className="py-24 px-6 max-w-300 mx-auto text-center border-y border-white/5"
            >
               <h2 className="text-2xl font-medium mb-10">{t.trust.title}</h2>
               <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                  <div className="flex flex-col items-center gap-3">
                     <ShieldCheck className="w-10 h-10 text-slate-400" />
                     <span className="font-medium text-slate-300">{t.trust.one}</span>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                     <Lock className="w-10 h-10 text-slate-400" />
                     <span className="font-medium text-slate-300">{t.trust.two}</span>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                     <Cpu className="w-10 h-10 text-slate-400" />
                     <span className="font-medium text-slate-300">{t.trust.three}</span>
                  </div>
               </div>
            </section>
         </main>

         <footer
            ref={(el) => {
               sectionRefs.current.footer = el;
            }}
            className="relative z-10 pt-24 pb-16 px-6 mx-auto max-w-400 text-center"
         >
            <motion.div style={{ y: yParallax }} className="max-w-3xl mx-auto">
               <h2 className="text-5xl md:text-7xl tracking-tighter font-light mb-8">
                  {t.footer.title}
               </h2>
               <button onClick={navToDashboard} className="inline-flex items-center gap-3 px-10 py-5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group shadow-2xl">
                  <span className="font-semibold text-lg text-white">{t.footer.cta}</span>
                  <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center group-hover:-rotate-45 transition-transform">
                     <ArrowRight className="w-4 h-4" />
                  </div>
               </button>
               <p className="mt-6 text-sm text-slate-500">{t.footer.sub}</p>
            </motion.div>
         </footer>
      </div>
   );
}
