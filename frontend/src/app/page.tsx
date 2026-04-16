"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BrainCircuit, ScanLine, Activity, Cpu } from "lucide-react";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const yParallaxFast = useTransform(scrollYProgress, [0, 1], [0, -400]);

  // 3D Magnetic Hover Logic for Hero Card
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { damping: 20, stiffness: 100 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), { damping: 20, stiffness: 100 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = event.clientX - rect.left;
    const mouseYPos = event.clientY - rect.top;
    
    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;
    
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Seeded values to avoid hydration errors (replacing Math.random)
  const soundWaves = [20, 45, 30, 50, 25, 40, 15, 35, 55, 10];
  const chartPoints = [200, 250, 230, 300, 280, 350, 400];

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050508] text-white">
      
      {/* 🌌 Animated Fluid Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen">
        <motion.div 
           className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-[#f70bff] to-[#00f0ff] rounded-full blur-[120px] animate-fluid-mesh opacity-20"
        />
        <motion.div 
           className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-gradient-to-bl from-[#00f0ff] to-[#00ff88] rounded-full blur-[150px] animate-fluid-mesh opacity-10"
           style={{ animationDelay: '5s' }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 border-b border-white/5 bg-[#050508]/40 backdrop-blur-2xl px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <span className="text-black font-bold text-lg leading-none tracking-tighter">C</span>
          </div>
          <span className="font-semibold tracking-tighter text-xl">Crediq</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
           <a href="#features" className="hover:text-white transition-colors">Features</a>
           <a href="#tech" className="hover:text-white transition-colors">Intelligence</a>
           <a href="#demo" className="hover:text-white transition-colors">Compare</a>
        </div>
        <Link href="/dashboard" className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:scale-105 transition-transform flex items-center gap-2">
           Enter App <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* 🧠 HERO SECTION */}
      <section className="relative z-10 pt-48 pb-32 px-6 md:px-12 mx-auto max-w-[1600px] flex flex-col lg:flex-row items-center min-h-[90vh]">
        
        {/* Left: Asymmetric Typography */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:w-7/12 flex flex-col items-start z-20"
        >
          <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-8 backdrop-blur-md flex items-center gap-2 text-xs font-medium tracking-wide uppercase text-slate-300">
            <Activity className="w-4 h-4 text-[#00f0ff]" />
            Intelligence Engine v2.0 Live
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-[100px] leading-[0.9] tracking-tighter font-light mb-6">
            The sum of <br/>
            <span className="font-black gradient-text inline-block">Human intent</span><br/>
            & artificial scale.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-xl font-light leading-relaxed mb-10">
             Crediq doesn't do boring spreadsheets. You type what you want to achieve financially, and our multi-layered AI architectures structure your wealth path instantly.
          </p>

          <Link href="/dashboard" className="glow-btn relative overflow-hidden group px-8 py-4 rounded-full bg-white/5 border border-white/10 flex items-center gap-3 backdrop-blur-xl transition-all duration-300 hover:border-white/30">
            <span className="font-semibold text-white group-hover:text-[#00f0ff] transition-colors relative z-10">Initialize Session</span>
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center group-hover:bg-[#00f0ff] group-hover:text-black transition-colors relative z-10">
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </motion.div>

        {/* Right: Interactive 3D Mockup */}
        <div className="lg:w-5/12 w-full mt-20 lg:mt-0 perspective-1000 hidden md:block">
          <motion.div
            style={{ rotateX, rotateY }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full aspect-[4/5] relative preserve-3d"
          >
            {/* Main Floating Glass Panel */}
            <div className="absolute inset-x-8 inset-y-12 glass-card rounded-3xl p-6 flex flex-col justify-between">
              
              <div className="flex justify-between items-start">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f70bff] to-[#00f0ff] flex items-center justify-center">
                     <BrainCircuit className="w-5 h-5 text-white" />
                   </div>
                   <div>
                     <div className="text-xs text-slate-400 font-medium">Active Analysis</div>
                     <div className="font-bold tracking-tight">HDFC Core Logic</div>
                   </div>
                 </div>
                 <ScanLine className="w-6 h-6 text-[#00ff88]" />
              </div>

              {/* Live Data Visualizer */}
              <div className="flex-1 mt-8 relative">
                 <svg className="w-full h-full overflow-visible" viewBox="0 0 200 100">
                    <motion.path 
                       d="M 0 80 Q 25 50 50 60 T 100 40 T 150 20 T 200 10"
                       fill="none"
                       stroke="url(#neonGradient)"
                       strokeWidth="4"
                       strokeLinecap="round"
                       initial={{ pathLength: 0 }}
                       animate={{ pathLength: 1 }}
                       transition={{ duration: 2, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f70bff" />
                        <stop offset="100%" stopColor="#00f0ff" />
                      </linearGradient>
                    </defs>
                 </svg>
                 
                 {/* Floating Data Nodes */}
                 <motion.div 
                   className="absolute top-[10%] right-[0%] px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold text-[#00f0ff] backdrop-blur-md border border-[#00f0ff]/30"
                   animate={{ y: [0, -5, 0] }}
                   transition={{ duration: 3, repeat: Infinity }}
                 >
                   ₹2.5Cr Projected
                 </motion.div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10">
                 <div className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-medium">Neural State</div>
                 <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[#00f0ff] to-[#00ff88]"
                      initial={{ width: "0%" }}
                      animate={{ width: "85%" }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                 </div>
              </div>
            </div>

            {/* Parallax Overlapping Sub-Cards */}
            <motion.div 
              style={{ translateZ: 50 }}
              className="absolute bottom-4 left-0 glass-card rounded-2xl p-4 flex items-center gap-4 border-[#00ff88]/20 bg-[#00ff88]/5"
            >
               <div className="w-12 h-12 rounded-full bg-[#00ff88]/20 flex items-center justify-center relative">
                 <div className="w-3 h-3 bg-[#00ff88] rounded-full absolute animate-ping opacity-50" />
                 <div className="w-3 h-3 bg-[#00ff88] rounded-full relative z-10" />
               </div>
               <div>
                 <div className="text-xs text-white/50 mb-1">Intent Captured</div>
                 <div className="font-semibold text-sm">"Goal: Buy House 2029"</div>
               </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 🧩 THE BENTO GRID (FEATURES) */}
      <section id="features" className="relative z-10 py-32 px-6 md:px-12 max-w-[1600px] mx-auto">
         <motion.div style={{ y: yParallax }} className="mb-20">
           <h2 className="text-4xl md:text-5xl tracking-tighter font-light mb-4">
             Bypassing the <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-[#f70bff]">Spreadsheet Era.</span>
           </h2>
           <p className="text-slate-400 max-w-lg text-lg">
             Complex financial decisions executed with zero friction.
           </p>
         </motion.div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[350px]">
           {/* Big Asymmetric Left Card */}
           <motion.div 
             whileHover={{ y: -10 }}
             className="md:col-span-2 glass-card rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden group"
           >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#f70bff]/10 rounded-full blur-[80px] group-hover:bg-[#f70bff]/20 transition-colors" />
              <div className="relative z-10">
                <Cpu className="w-10 h-10 text-[#f70bff] mb-6" />
                <h3 className="text-3xl font-bold tracking-tight mb-4">Semantic Natural Parsing</h3>
                <p className="text-slate-400 max-w-sm text-lg">
                  Speak normally. "Show me FDs giving more than 7% that let me pull out money anytime." We parse the logic, analyze live Indian bank data, and render the exact interface you need.
                </p>
              </div>
              <div className="relative z-10 mt-8 h-20 flex items-center justify-start gap-1">
                 {soundWaves.map((h, i) => (
                   <motion.div 
                      key={i}
                      className="w-2 rounded-full bg-[#f70bff]/50"
                      animate={{ height: [`${h/2}px`, `${h * 1.5}px`, `${h/2}px`] }}
                      transition={{ duration: 1 + (h/100), repeat: Infinity }}
                   />
                 ))}
                 <span className="ml-6 text-sm text-[#00f0ff] font-medium tracking-wide">Listening...</span>
              </div>
           </motion.div>

           {/* Stacked Right Cards */}
           <motion.div 
             whileHover={{ y: -10 }}
             className="glass-card rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group"
           >
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#00ff88]/10 rounded-full blur-[50px] group-hover:bg-[#00ff88]/20 transition-colors" />
             <div className="relative z-10">
                <Activity className="w-8 h-8 text-[#00ff88] mb-4" />
                <h3 className="text-xl font-bold tracking-tight mb-2">Live Rate Aggregation</h3>
                <p className="text-sm text-slate-400">Constant pulse-checks on SBI, HDFC, and RBI limits.</p>
             </div>
             <div className="relative z-10 flex items-end gap-2 mt-6">
                {[10, 20, 15, 30, 45, 60].map((h, i) => (
                   <div key={i} className="w-full bg-white/5 rounded-t-sm" style={{ height: `${h}%` }}>
                      <div className="w-full bg-[#00ff88]/50 h-1 rounded-full" />
                   </div>
                ))}
             </div>
           </motion.div>

           {/* Bottom Right Span */}
           <motion.div 
             whileHover={{ y: -10 }}
             className="md:col-span-1 glass-card rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group bg-gradient-to-br from-white/[0.02] to-[#00f0ff]/[0.05]"
           >
             <div className="relative z-10">
                <BrainCircuit className="w-8 h-8 text-[#00f0ff] mb-4" />
                <h3 className="text-xl font-bold tracking-tight mb-2">Multi-Modal Flow</h3>
                <p className="text-sm text-slate-400">Audio, text, or visual inputs perfectly unified into one session.</p>
             </div>
           </motion.div>
         </div>
      </section>

      {/* 🚀 CTA FOOTER */}
      <footer className="relative z-10 pt-40 pb-20 px-6 mx-auto max-w-[1600px] text-center border-t border-white/5 mt-20">
         <motion.div style={{ y: yParallaxFast }} className="max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-7xl tracking-tighter font-light mb-8">
               Start your <span className="font-bold text-white">Engine.</span>
            </h2>
            <Link href="/dashboard" className="glow-btn inline-flex items-center gap-3 px-10 py-5 rounded-full glass-card hover:bg-white/10 transition-colors group">
               <span className="font-semibold text-lg text-white">Enter Crediq Platform</span>
               <div className="w-8 h-8 rounded-full bg-[#00f0ff]/20 text-[#00f0ff] flex items-center justify-center group-hover:rotate-45 transition-transform">
                 <ArrowRight className="w-4 h-4" />
               </div>
            </Link>
         </motion.div>
         
         <div className="mt-40 text-sm text-slate-600 flex flex-col md:flex-row justify-between items-center px-12">
            <span>© 2026 Crediq AI Framework. Built for the Indian System.</span>
            <div className="flex gap-6 mt-4 md:mt-0">
               <span className="hover:text-white transition-colors cursor-pointer">Security</span>
               <span className="hover:text-white transition-colors cursor-pointer">Intelligence Policy</span>
            </div>
         </div>
      </footer>
    </div>
  );
}
