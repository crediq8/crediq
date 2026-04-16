"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, ShieldCheck, TrendingUp, Calculator,
  BrainCircuit, LayoutDashboard, ChevronRight, Mic
} from "lucide-react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-x-0 border-t-0 rounded-none bg-black/40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <span className="font-bold text-xl tracking-tight">Crediq</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#solution" className="hover:text-white transition-colors">Solution</a>
            <a href="#assistant" className="hover:text-white transition-colors">AI Assistant</a>
          </div>
          <Link href="/dashboard" className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-semibold hover:scale-105 transition-transform">
            Start Journey
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 px-6 overflow-hidden">
        {/* Animated Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold uppercase tracking-wider w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Intelligent Finance
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
              Smarter wealth <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                driven by AI
              </span>
            </h1>
            
            <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
              Crediq seamlessly bridges the gap between your financial goals and reality. 
              Speak naturally, compare instantly, and plan flawlessly with our next-gen AI assistant.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <Link href="/dashboard" className="bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-slate-100 transition-colors flex items-center gap-2 group">
                Launch App
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-8 py-4 rounded-full font-medium text-white border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2">
                <Mic className="w-4 h-4 text-violet-400" />
                Try Voice Mode
              </button>
            </div>
          </motion.div>

          {/* 3D Orb Visualization */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative h-[500px] flex items-center justify-center"
          >
            {/* Core Orb */}
            <motion.div 
              animate={{ 
                boxShadow: [
                  "0 0 40px 10px rgba(99, 102, 241, 0.4)",
                  "0 0 80px 20px rgba(139, 92, 246, 0.6)",
                  "0 0 40px 10px rgba(99, 102, 241, 0.4)"
                ]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-48 h-48 rounded-full bg-gradient-to-tr from-indigo-600 via-violet-500 to-fuchsia-500 relative z-20"
            >
              <div className="absolute inset-0 rounded-full bg-black/10 backdrop-blur-sm mix-blend-overlay"></div>
            </motion.div>
            
            {/* Orbital Rings */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute w-[350px] h-[350px] border border-white/10 rounded-full border-dashed"
            ></motion.div>
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute w-[450px] h-[450px] border border-indigo-500/20 rounded-full"
            >
              <div className="absolute top-0 left-1/2 w-4 h-4 bg-violet-400 rounded-full blur-[2px] shadow-[0_0_15px_rgba(139,92,246,0.8)]"></div>
            </motion.div>
            
            {/* Floating UI Elements */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 right-10 glass-panel p-4 z-30"
            >
              <div className="text-xs text-slate-400">FD Return</div>
              <div className="text-xl font-bold text-green-400">+7.25%</div>
            </motion.div>
            
            <motion.div 
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-20 left-10 glass-panel p-4 z-30"
            >
              <div className="text-xs text-slate-400">Risk Assessment</div>
              <div className="flex items-center gap-2 mt-1">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold">Secure</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Unified Financial Intelligence</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">One platform that handles everything from comparing basic deposit rates to complex multi-year goal planning.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Calculator, title: "FD Calculator", desc: "Instantly calculate maturity amounts with dynamic compounding logic." },
              { icon: TrendingUp, title: "Smart Comparison", desc: "Sort and compare bank interest rates automatically to maximize returns." },
              { icon: BrainCircuit, title: "Goal Planning", desc: "AI creates a step-by-step savings roadmap to hit your targets." },
              { icon: LayoutDashboard, title: "Hybrid Dashboard", desc: "Seamlessly transition between conversational voice inputs and visual data cards." },
              { icon: ShieldCheck, title: "Fraud Detection", desc: "Core risk analysis engine to flag suspicious schemes." },
              { icon: Mic, title: "Voice Form Autofill", desc: "Speak naturally. We extract the parameters and fill the UI automatically." }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-panel glass-panel-interactive p-8"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Problem + Solution */}
      <section id="solution" className="py-24 px-6">
        <div className="max-w-7xl mx-auto glass-panel p-8 md:p-16 overflow-hidden relative">
          {/* Decorative gradients */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-fuchsia-500/20 blur-[100px]"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/20 blur-[100px]"></div>
          
          <div className="grid lg:grid-cols-2 gap-16 relative z-10">
            <div>
              <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-2">The Old Way</h3>
              <p className="text-2xl md:text-3xl font-medium leading-relaxed text-slate-300">
                Endless disjointed calculators, confusing banking portals, and manual tracking spreadsheets.
              </p>
              <div className="mt-8 space-y-4">
                <div className="h-12 w-full bg-white/5 rounded-lg flex items-center px-4 line-through text-slate-500 font-mono text-sm">Download generic PDF report</div>
                <div className="h-12 w-[80%] bg-white/5 rounded-lg flex items-center px-4 line-through text-slate-500 font-mono text-sm">Fill 20-field standard form</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-2">The Crediq Way</h3>
              <p className="text-2xl md:text-3xl font-medium leading-relaxed text-white">
                &quot;I want to save 50 Lakhs for a house in 3 years.&quot;
              </p>
              <div className="mt-8 space-y-4">
                <div className="glass-panel p-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-400">Monthly Target</span>
                    <span className="text-xl font-bold text-green-400">₹1,25,000/mo</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </div>
                <div className="glass-panel p-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-400">Best Vehicle</span>
                    <span className="text-xl font-bold text-indigo-300">HDFC Bank 7.20% FD</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voice Assistant Showcase */}
      <section id="assistant" className="py-24 px-6 text-center">
        <h2 className="text-4xl font-bold mb-6">Talk to your money.</h2>
        <p className="text-slate-400 max-w-xl mx-auto mb-12">
          Activate the intelligent voice module. It understands your intent, calculates the math, and constructs your UI on the fly.
        </p>
        
        <div className="flex justify-center">
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 0 0 0 rgba(139, 92, 246, 0)",
                "0 0 0 20px rgba(139, 92, 246, 0.1)",
                "0 0 0 0 rgba(139, 92, 246, 0)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center cursor-pointer relative z-10"
          >
            <Mic className="w-8 h-8 text-white" />
          </motion.div>
        </div>
        
        <div className="mt-12 h-16 w-full max-w-sm mx-auto flex items-center justify-center gap-1 opacity-50">
           {/* Visual Waveform mock */}
            {[20, 45, 30, 50, 25, 40, 15, 35, 55, 10].map((h, i) => (
              <motion.div 
                key={i}
                className="w-1.5 bg-indigo-400 rounded-full"
                animate={{ height: ["10px", `${10 + h}px`, "10px"] }}
                transition={{ duration: 0.5 + (h / 100), repeat: Infinity }}
             />
           ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500"></div>
            <span className="font-bold text-lg">Crediq</span>
          </div>
          <div className="text-sm text-slate-500">
            © 2026 Crediq Intelligence. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
