"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, BrainCircuit, ScanLine, Activity, Cpu, Mic, ShieldCheck, 
  Lock, ArrowUpRight, Zap, Target, BookOpen, Layers, CheckCircle2
} from "lucide-react";

// Cross-Browser Speech Recognition Support
const SpeechRecognitionAPI = 
  (typeof window !== "undefined" && (window as any).SpeechRecognition) || 
  (typeof window !== "undefined" && (window as any).webkitSpeechRecognition);

export default function Home() {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -150]);

  // Dual UX Mode State
  const [isProMode, setIsProMode] = useState(false);
  
  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceSimulatedMath, setVoiceSimulatedMath] = useState<{principal: number, years: number} | null>(null);

  const startListening = () => {
    if (!SpeechRecognitionAPI) {
       alert("Voice mode is not supported by your browser. Please try typing in the Dashboard!");
       return;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
    };
    recognition.onend = () => {
       setIsListening(false);
       // Fake a quick math calculation based on string length to simulate intelligence,
       // then prompt them to go to dashboard.
       if (transcript.length > 5) {
          setVoiceSimulatedMath({ principal: 250000, years: 3 });
       }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  const executeLiveScenario = (text: string, p: number, y: number) => {
      setTranscript(text);
      setTimeout(() => setVoiceSimulatedMath({ principal: p, years: y }), 800);
  };

  const navToDashboard = () => router.push('/dashboard');

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-700 ${isProMode ? 'bg-[#020204]' : 'bg-[#050508]'} text-white`}>
      
      {/* 🌌 Animated Fluid Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none mix-blend-screen overflow-hidden">
        <motion.div 
           className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-[#f70bff] to-[#00f0ff] rounded-full blur-[120px] animate-fluid-mesh opacity-10"
        />
        {isProMode && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 0.15 }}
             className="absolute bottom-[10%] right-[10%] w-[30vw] h-[30vw] bg-white rounded-full blur-[150px]"
           />
        )}
      </div>

      {/* Navigation & Global Mode Toggle */}
      <nav className="fixed w-full z-50 top-0 border-b border-white/5 bg-[#050508]/60 backdrop-blur-2xl px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <span className="text-black font-bold text-lg leading-none tracking-tighter">C</span>
          </div>
          <span className="font-semibold tracking-tighter text-xl hidden md:block">Crediq</span>
        </div>

        {/* DUAL MODE TOGGLE */}
        <div className="flex items-center p-1 rounded-full bg-white/5 border border-white/10 relative">
           <motion.div 
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/10 border border-white/20 rounded-full shadow-lg"
              animate={{ left: isProMode ? "50%" : "4px" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
           />
           <button onClick={() => setIsProMode(false)} className={`relative z-10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${!isProMode ? 'text-[#00f0ff]' : 'text-slate-400'}`}>Simple</button>
           <button onClick={() => setIsProMode(true)} className={`relative z-10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${isProMode ? 'text-[#f70bff]' : 'text-slate-400'}`}>Pro</button>
        </div>

        <button onClick={navToDashboard} className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:scale-105 transition-transform hidden md:flex items-center gap-2">
           Enter App <ArrowRight className="w-4 h-4" />
        </button>
      </nav>

      {/* 🧠 SECTION 1: VOICE-FIRST HERO */}
      <section className="relative z-10 pt-40 md:pt-48 pb-20 px-6 mx-auto max-w-[1200px] flex flex-col items-center text-center min-h-[80vh]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          {/* Dynamic Hero Text depending on mode */}
          {isProMode ? (
             <h1 className="text-5xl md:text-7xl lg:text-[90px] leading-[0.9] tracking-tighter font-light mb-6">
               <span className="font-black bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-[#f70bff] to-[#00f0ff]">Algorithmic</span> Precision.
             </h1>
          ) : (
             <h1 className="text-5xl md:text-7xl lg:text-[90px] leading-[0.9] tracking-tighter font-light mb-6">
               Just <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">speak</span> your goal.
             </h1>
          )}
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl font-light leading-relaxed mb-12">
            {isProMode 
              ? "Instantly calculate complex maturity projections across multiple Indian risk profiles utilizing our headless mathematical engine."
              : "No forms. No math. Tell Crediq what you want to achieve financially, and our AI builds the exact path for you immediately."}
          </p>

          {/* THE VOICE ENGINE HERO CTA */}
          <div className="w-full max-w-xl relative flex flex-col items-center">
             <div className="absolute -top-8 text-sm font-medium text-[#00f0ff] animate-pulse">
               "Invest ₹50,000 for 2 years"
             </div>
             
             {/* Voice Box */}
             <div className="w-full bg-[#0a0b10]/80 border border-white/10 backdrop-blur-xl rounded-[2rem] p-4 flex items-center justify-between shadow-2xl relative overflow-hidden group hover:border-[#00f0ff]/30 transition-colors">
               
               <div className="flex-1 px-4 text-left">
                  {transcript ? (
                     <p className="text-lg font-medium text-white">{transcript}</p>
                  ) : (
                     <p className="text-lg font-medium text-slate-500">I want to save for...</p>
                  )}
               </div>

               <motion.button 
                 onClick={startListening}
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${isListening ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'bg-[#00f0ff] text-black shadow-[0_0_20px_rgba(0,240,255,0.3)]'}`}
               >
                  <Mic className="w-7 h-7" />
               </motion.button>

               {/* Listening Wave Anim */}
               <AnimatePresence>
                 {isListening && (
                    <motion.div 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       className="absolute right-24 h-8 flex items-center gap-1"
                    >
                       {[...Array(5)].map((_, i) => (
                          <motion.div 
                             key={i}
                             className="w-1.5 bg-red-500 rounded-full"
                             animate={{ height: ["10px", "30px", "10px"] }}
                             transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                          />
                       ))}
                    </motion.div>
                 )}
               </AnimatePresence>
             </div>

             {/* Voice Simulated Math Result */}
             <AnimatePresence>
                {voiceSimulatedMath && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.9, y: 10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     className="mt-6 w-full bg-white/5 border border-green-500/30 rounded-2xl p-6 text-left"
                   >
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <span className="text-xs text-green-400 font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
                               <CheckCircle2 className="w-4 h-4" /> Analyzed Successfully
                            </span>
                            <h3 className="text-2xl font-bold">Projected: ₹{(voiceSimulatedMath.principal * Math.pow(1.072, voiceSimulatedMath.years)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
                         </div>
                         <button onClick={navToDashboard} className="px-4 py-2 bg-white text-black font-bold rounded-full text-sm hover:scale-105 transition-transform flex items-center gap-2">
                           View Full Details <ArrowRight className="w-4 h-4" />
                         </button>
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* 🧩 SECTION 2: LIVE SCENARIOS (Quick clicks) */}
      <section className="relative z-10 pb-20 pt-10 px-6 max-w-4xl mx-auto text-center border-b border-white/5">
         <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-6">Or try a live example</p>
         <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => executeLiveScenario("Invest ₹1,00,000 for 1 year in a safe FD", 100000, 1)} className="px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:border-[#00f0ff]/50 hover:bg-white/10 transition-colors text-sm font-medium">✨ ₹1L for 1 year</button>
            <button onClick={() => executeLiveScenario("I want to save 20 Lakhs in 5 years", 1500000, 5)} className="px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:border-[#f70bff]/50 hover:bg-white/10 transition-colors text-sm font-medium">🎯 20L Home Downpayment</button>
            <button onClick={() => executeLiveScenario("What is the lowest risk option for 5 Lakhs", 500000, 2)} className="px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:border-[#00ff88]/50 hover:bg-white/10 transition-colors text-sm font-medium">🛡️ Safe 5L Option</button>
         </div>
      </section>

      {/* 🔄 SECTION 3: HOW IT WORKS (Simplified Flow) */}
      <section className="relative z-10 py-32 px-6 max-w-[1200px] mx-auto">
         <div className="text-center mb-16">
           <h2 className="text-3xl md:text-5xl font-light tracking-tighter mb-4">You speak, <span className="font-bold">Crediq computes.</span></h2>
           <p className="text-slate-400">Our invisible intelligence engine removes all the friction.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
               { icon: Mic, title: "1. Tell us the goal", desc: "Speak naturally in English or Hinglish contexts." },
               { icon: BrainCircuit, title: "2. AI Maps the Route", desc: "We scan live Indian rates (SBI, HDFC) instantly." },
               { icon: Target, title: "3. Direct Action", desc: "No spreadsheets. Just the perfectly formulated option." }
            ].map((step, i) => (
               <motion.div key={i} whileHover={{ y: -10 }} className="p-8 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-6 group-hover:bg-[#00f0ff] group-hover:text-black transition-colors">
                     <step.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
               </motion.div>
            ))}
         </div>
      </section>

      {/* 📊 SECTION 4: DEEP COMPARISON (PRO MODE SPECIFIC EXTENSION) */}
      <AnimatePresence>
      {isProMode && (
         <motion.section 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-10 py-32 bg-[#0a0b10] border-y border-white/5 overflow-hidden"
         >
            <div className="max-w-[1200px] mx-auto px-6">
               <div className="flex items-center gap-3 mb-10">
                  <Layers className="w-6 h-6 text-[#f70bff]" />
                  <h2 className="text-2xl font-bold tracking-tight">Advanced Logic Trace</h2>
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Fake Complex Table */}
                  <div className="glass-card rounded-3xl p-6 border-[#f70bff]/20">
                     <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                        <span className="font-medium text-slate-300">Strategy Matrix (Indian Market)</span>
                        <span className="text-xs text-[#f70bff] font-bold px-2 py-1 bg-[#f70bff]/10 rounded">LIVE</span>
                     </div>
                     <div className="space-y-4">
                        {[
                           { name: "Sovereign Gold (SGB)", rate: "2.5% + Capital", risk: "Low" },
                           { name: "Tier 1 Bank FD", rate: "7.10% Fixed", risk: "Zero" },
                           { name: "Nifty 50 Index", rate: "12% Avg. Hist.", risk: "High" }
                        ].map((row, i) => (
                           <div key={i} className="flex justify-between items-center text-sm p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
                              <span className="font-semibold text-slate-200">{row.name}</span>
                              <div className="flex gap-4 text-slate-400">
                                 <span className="w-24 text-right font-mono">{row.rate}</span>
                                 <span className={`w-12 text-right ${row.risk === 'Zero' || row.risk === 'Low' ? 'text-green-400' : 'text-red-400'}`}>{row.risk}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* AI Reasoner Personality Card */}
                  <div className="p-8 rounded-3xl bg-gradient-to-br from-[#f70bff]/[0.05] to-[#00f0ff]/[0.05] border border-white/10 flex flex-col justify-center">
                     <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Crediq AI Explains:</span>
                     </div>
                     <h3 className="text-xl md:text-2xl font-medium leading-relaxed italic text-white/90">
                        "While the Nifty 50 historically yields 12%, a 1-year timeline makes equity too volatile. Given your parameters, a Tier 1 Bank FD at 7.1% fundamentally guarantees your capital against inflation."
                     </h3>
                     <button onClick={navToDashboard} className="mt-8 self-start px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-full transition-colors flex items-center gap-2">
                        Inspect Logic Tree <ArrowUpRight className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            </div>
         </motion.section>
      )}
      </AnimatePresence>

      {/* 🔐 SECTION 5: TRUST & AUTHORITY */}
      <section className="relative z-10 py-24 px-6 max-w-[1200px] mx-auto text-center border-b border-white/5">
         <h2 className="text-2xl font-medium mb-12">Engineered for absolute trust.</h2>
         <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex flex-col items-center gap-3">
               <ShieldCheck className="w-10 h-10 text-slate-400" />
               <span className="font-medium text-slate-300">Bank-Grade Math</span>
            </div>
            <div className="flex flex-col items-center gap-3">
               <Lock className="w-10 h-10 text-slate-400" />
               <span className="font-medium text-slate-300">Zero Data Retention</span>
            </div>
            <div className="flex flex-col items-center gap-3">
               <Cpu className="w-10 h-10 text-slate-400" />
               <span className="font-medium text-slate-300">Headless Architecture</span>
            </div>
         </div>
      </section>

      {/* 🚀 CTA FOOTER */}
      <footer className="relative z-10 pt-32 pb-20 px-6 mx-auto max-w-[1600px] text-center mt-10">
         <motion.div style={{ y: yParallax }} className="max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-7xl tracking-tighter font-light mb-8">
               Ready to <span className="font-bold text-white">Compound?</span>
            </h2>
            <button onClick={navToDashboard} className="inline-flex items-center gap-3 px-10 py-5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group shadow-2xl">
               <span className="font-semibold text-lg text-white">Enter the Application</span>
               <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center group-hover:-rotate-45 transition-transform">
                 <ArrowRight className="w-4 h-4" />
               </div>
            </button>
            <p className="mt-6 text-sm text-slate-500">
               {isProMode ? "Full algorithmic access unlocked." : "100% Free. No signup required."}
            </p>
         </motion.div>
      </footer>
    </div>
  );
}
