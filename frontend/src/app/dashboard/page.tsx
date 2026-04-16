"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Mic, Search, Settings, User, 
  Calculator, TrendingUp, ShieldCheck, Heart,
  BrainCircuit, ArrowRight, CornerDownRight, Landmark
} from "lucide-react";

type Message = {
  id: string;
  role: "system" | "user" | "ai";
  text: string;
};

type IntentData = {
  intent: "fd" | "compare" | "plan" | "fraud" | "general" | string;
  data: {
    amount_in_rupees?: number | null;
    years?: number | null;
    rate?: number | null;
  };
};

export default function Dashboard() {
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeModule, setActiveModule] = useState<string>("greeting");
  const [moduleData, setModuleData] = useState<IntentData["data"] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "system", text: "Hello. I am the Crediq AI Core. I'm optimized for Indian financial contexts. What can I help you calculate or plan today?" }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsProcessing(true);

    try {
      // Hit our Python FastAPI Backend
      const response = await fetch("http://127.0.0.1:8000/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text }),
      });

      const result = await response.json();
      
      // The API returns a JSON string embedded in the reply. Parse it.
      let parsedResponse: IntentData;
      try {
        parsedResponse = JSON.parse(result.reply);
      } catch {
        parsedResponse = { intent: "general", data: {} };
      }

      // Route the UI
      setActiveModule(parsedResponse.intent);
      setModuleData(parsedResponse.data);

      let aiResponseText = "";
      
      if (parsedResponse.intent === "fd") {
        aiResponseText = `I've opened the FD calculator for you. I extracted ₹${parsedResponse.data.amount_in_rupees?.toLocaleString('en-IN') || "your amount"} ${parsedResponse.data.years ? `over ${parsedResponse.data.years} years` : ""}.`;
      } else if (parsedResponse.intent === "plan") {
        aiResponseText = `Goal Planner initiated for ₹${parsedResponse.data.amount_in_rupees?.toLocaleString('en-IN') || "your target"} ${parsedResponse.data.years ? `in ${parsedResponse.data.years} years` : ""}. Here is your structural breakdown.`;
      } else if (parsedResponse.intent === "compare") {
        aiResponseText = "Fetching live interest rates for top Indian banks like SBI, HDFC, and ICICI...";
      } else {
        aiResponseText = "I understand. Can you provide a few more specific details like the amount or timeline?";
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", text: aiResponseText }]);

    } catch (error) {
      console.error("Backend connection failed:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "system", text: "Error: Backend connection failed. Ensure FastAPI is running on port 8000." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
             { icon: Search, label: "Assistant", id: "greeting" },
             { icon: Calculator, label: "FD Calculator", id: "fd" },
             { icon: TrendingUp, label: "Bank Compare", id: "compare" },
             { icon: Heart, label: "Goal Planning", id: "plan" },
             { icon: ShieldCheck, label: "Fraud Check", id: "fraud" }
           ].map((nav, i) => (
             <button 
                key={i} 
                onClick={() => setActiveModule(nav.id)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${activeModule === nav.id ? "bg-indigo-500/10 text-indigo-400" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}
             >
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
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative bg-[#0a0b10]">
        
        {/* Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#050508]/50 backdrop-blur-md sticky top-0 z-10">
          <h1 className="font-semibold text-lg text-slate-200">Intelligence Core</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold px-2 py-1 bg-green-500/10 text-green-400 rounded-md border border-green-500/20">Backend Connected</span>
            <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
              <User className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </header>

        {/* Dashboard Split View */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left panel: Conversation */}
          <div className="flex-1 border-r border-white/10 flex flex-col relative">
            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : msg.role === 'system'
                        ? 'bg-transparent border border-white/10 text-slate-400 text-sm italic'
                        : 'glass-panel bg-white/5 text-slate-200 rounded-tl-none border-t-indigo-500/30'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
                
                {isProcessing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="glass-panel bg-white/5 p-4 rounded-2xl rounded-tl-none flex gap-2 items-center">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-[#0a0b10]">
              <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-[#12131a] border border-white/10 rounded-2xl p-2 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about FDs, say 'I want to save 5 Lakhs', or talk..." 
                  className="flex-1 bg-transparent border-none outline-none text-sm text-slate-200 p-3 resize-none max-h-32"
                  rows={inputText.split('\n').length > 1 ? Math.min(inputText.split('\n').length, 5) : 1}
                />
                <div className="flex items-center gap-2 p-2">
                  <button 
                    onClick={() => setIsRecording(!isRecording)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
                      isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleSend}
                    disabled={!inputText.trim() || isProcessing}
                    className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Dynamic Functional Output */}
          <div className="w-full lg:w-[450px] xl:w-[500px] bg-[#050508] p-4 md:p-8 overflow-y-auto">
            <AnimatePresence mode="wait">
              
              {/* DEFAULT STATE */}
              {(activeModule === "greeting" || activeModule === "general" || !activeModule) && (
                <motion.div 
                  key="greeting"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col items-center justify-center text-center p-6"
                >
                  <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 flex items-center justify-center mb-8 border border-white/5 relative">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 blur-2xl absolute"
                    />
                    <BrainCircuit className="w-10 h-10 text-indigo-300 relative z-10" />
                  </div>
                  <h2 className="text-2xl font-medium text-slate-200 mb-3">Intelligence Engine Ready</h2>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">
                    I process your natural language into powerful financial calculators instantly.
                  </p>
                  
                  <div className="w-full space-y-3">
                    <div className="glass-panel p-4 flex items-center gap-3 text-left">
                      <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><Calculator className="w-4 h-4" /></div>
                      <div>
                        <div className="text-sm font-medium">Try saying:</div>
                        <div className="text-xs text-slate-400">&quot;Calculate FD returns for ₹5 Lakhs over 3 years&quot;</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* FD CALCULATOR MODULE */}
              {activeModule === "fd" && (
                <motion.div 
                  key="fd"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
                      <Calculator className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">FD Calculator</h2>
                      <p className="text-sm text-slate-400">Fixed Deposit Maturity</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="glass-panel p-6 border-indigo-500/30 bg-gradient-to-b from-indigo-500/10 to-transparent">
                      <p className="text-sm text-slate-400 mb-1">Principal Amount</p>
                      <div className="text-3xl font-bold flex items-baseline gap-1">
                        <span className="text-indigo-400">₹</span>
                        {moduleData?.amount_in_rupees?.toLocaleString('en-IN') || "0"}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass-panel p-4">
                        <p className="text-xs text-slate-400 mb-1">Time Period</p>
                        <div className="text-lg font-semibold">{moduleData?.years || 0} Years</div>
                      </div>
                      <div className="glass-panel p-4">
                        <p className="text-xs text-slate-400 mb-1">Interest Rate</p>
                        <div className="text-lg font-semibold text-green-400">{moduleData?.rate || 7.1}%</div>
                      </div>
                    </div>

                    {/* Calculated Outcome */}
                    <div className="glass-panel p-6 mt-6 bg-[#12131a]">
                      <div className="flex justify-between items-center mb-4">
                         <span className="text-sm font-medium">Estimated Maturity</span>
                         <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Tax Applicable</span>
                      </div>
                      <div className="text-4xl font-bold text-white mb-2">
                        ₹
                        {moduleData?.amount_in_rupees && moduleData?.years 
                          ? Math.round(moduleData.amount_in_rupees * Math.pow(1 + (moduleData.rate || 7.1) / 100, moduleData.years)).toLocaleString('en-IN')
                          : "0"}
                      </div>
                      <p className="text-xs text-slate-500 border-t border-white/10 pt-4 mt-4">
                        *Calculated using standard cumulative compounding. Subject to bank policies.
                      </p>
                    </div>
                    
                    <button className="w-full py-4 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2">
                      Save to Portfolio <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* GOAL PLANNER MODULE */}
              {activeModule === "plan" && (
                <motion.div 
                  key="plan"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-xl bg-violet-500/20 text-violet-400">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Goal Planner</h2>
                      <p className="text-sm text-slate-400">Path to your target</p>
                    </div>
                  </div>

                  <div className="glass-panel p-6 border-violet-500/30 text-center mb-6">
                    <p className="text-sm text-slate-400 mb-2">Target Goal</p>
                    <div className="text-4xl font-bold text-white">
                      ₹{moduleData?.amount_in_rupees?.toLocaleString('en-IN') || "0"}
                    </div>
                    {moduleData?.years && (
                      <div className="mt-2 text-sm text-violet-300">in {moduleData.years} years</div>
                    )}
                  </div>

                  {moduleData?.amount_in_rupees && moduleData?.years && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-slate-300 mb-2">Required Action Plan</h3>
                      <div className="glass-panel p-4 flex justify-between items-center bg-[#12131a]">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-400 uppercase tracking-wider">SIP Required</span>
                          <span className="text-xl font-bold text-green-400">
                            ₹{Math.round(moduleData.amount_in_rupees / (moduleData.years * 12)).toLocaleString('en-IN')}/mo
                          </span>
                        </div>
                        <CornerDownRight className="w-5 h-5 text-slate-600" />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* COMPARE BANKS MODULE */}
              {activeModule === "compare" && (
                <motion.div 
                   key="compare"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="w-full"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-xl bg-orange-500/20 text-orange-400">
                      <Landmark className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Bank Compare</h2>
                      <p className="text-sm text-slate-400">Top Indian FD Rates</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { bank: "SBI (State Bank)", rate: "7.10%", popular: true },
                      { bank: "HDFC Bank", rate: "7.25%", popular: false },
                      { bank: "ICICI Bank", rate: "7.20%", popular: false },
                      { bank: "Axis Bank", rate: "7.20%", popular: false },
                      { bank: "Kotak Mahindra", rate: "7.40%", popular: false }
                    ].map((row, i) => (
                      <div key={i} className={`glass-panel p-4 flex items-center justify-between ${row.popular ? 'border-indigo-500/50 bg-indigo-500/10' : ''}`}>
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">{row.bank.charAt(0)}</div>
                            <span className="font-medium text-sm">{row.bank}</span>
                         </div>
                         <div className="text-green-400 font-bold">{row.rate}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </main>
    </div>
  );
}
