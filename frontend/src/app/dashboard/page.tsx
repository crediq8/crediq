"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Mic, Search, Bell, Settings, User, 
  Calculator, TrendingUp, ShieldCheck, Heart 
} from "lucide-react";

export default function Dashboard() {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: "system", text: "Hello. I am the Crediq AI Core. How can I structure your financial goals today?" }
  ]);
  const [activeModule, setActiveModule] = useState<"greeting" | "fd" | "goals" | "fraud">("greeting");

  const toggleRecord = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-black text-slate-100">
      
      {/* Sidebar Navigation */}
      <nav className="w-20 md:w-64 border-r border-white/10 flex flex-col items-center md:items-start py-6 bg-[#050508]">
        <div className="flex items-center gap-3 px-6 mb-12">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shrink-0">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className="font-bold text-xl tracking-tight hidden md:block">Crediq</span>
        </div>

        <div className="flex flex-col gap-2 w-full px-4">
           {[
             { icon: Search, label: "Assistant", active: true },
             { icon: Calculator, label: "FD Calculator" },
             { icon: TrendingUp, label: "Bank Compare" },
             { icon: Heart, label: "Goal Planning" },
             { icon: ShieldCheck, label: "Fraud Check" }
           ].map((nav, i) => (
             <button key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${nav.active ? "bg-indigo-500/10 text-indigo-400" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}>
               <nav.icon className="w-5 h-5 shrink-0" />
               <span className="font-medium text-sm hidden md:block">{nav.label}</span>
             </button>
           ))}
        </div>

        <div className="mt-auto px-4 w-full flex flex-col gap-2">
           <button className="flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors">
              <Settings className="w-5 h-5 shrink-0" />
              <span className="font-medium text-sm hidden md:block">Settings</span>
           </button>
           <button className="flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors">
              <User className="w-5 h-5 shrink-0" />
              <span className="font-medium text-sm hidden md:block">Profile</span>
           </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative bg-[#0a0b10]">
        {/* Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#050508]/50 backdrop-blur-md sticky top-0 z-10">
          <h1 className="font-semibold text-lg text-slate-200">Intelligence Core</h1>
          <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
            <Bell className="w-4 h-4 text-slate-400" />
          </button>
        </header>

        {/* Dashboard Split View */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left panel: Conversation */}
          <div className="flex-1 border-r border-white/10 flex flex-col relative">
            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'glass-panel bg-white/5 text-slate-300 rounded-bl-none'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-6 bg-gradient-to-t from-[#0a0b10] to-transparent">
              <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-[#12131a] border border-white/10 rounded-2xl p-2 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
                <textarea 
                  rows={1}
                  placeholder="Type a query or use voice..." 
                  className="flex-1 bg-transparent border-none outline-none text-sm text-slate-200 p-3 resize-none max-h-32"
                />
                <div className="flex items-center gap-2 p-2">
                  <button 
                    onClick={toggleRecord}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Dynamic Functional Output */}
          <div className="w-full lg:w-[450px] bg-[#050508] flex items-center justify-center p-8">
            <AnimatePresence mode="wait">
              {activeModule === "greeting" && (
                <motion.div 
                  key="greeting"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center"
                >
                  <div className="w-32 h-32 rounded-full mx-auto bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 flex items-center justify-center mb-6 border border-white/5 relative">
                    {/* Breathing core */}
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 blur-xl"
                    />
                    <BrainCircuit className="w-8 h-8 text-indigo-300 absolute" />
                  </div>
                  <h2 className="text-xl font-medium text-slate-200 mb-2">Systems Online</h2>
                  <p className="text-sm text-slate-500">Awaiting voice or text command to render module.</p>
                </motion.div>
              )}
              {/* Here we will drop in the real FD calculator / Graphs based on state */}
            </AnimatePresence>
          </div>

        </div>
      </main>
    </div>
  );
}
