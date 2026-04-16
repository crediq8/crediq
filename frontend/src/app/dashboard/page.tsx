"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiJson, transcribeAudio } from "../../lib/api";
import { 
  Send, Mic, Search, User, 
  Calculator, TrendingUp, Heart,
  BrainCircuit, Activity, CheckCircle2, Info
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Message = {
  id: string;
  role: "system" | "user" | "ai";
  text: string;
  isTyping?: boolean;
};

type ChatApiResponse = {
  status: string;
  reply: string;
};

type AnalyzeApiResponse = {
  status: string;
  insight: string;
};

type ParsedIntent = {
  intent: string;
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
  const [activeModule, setActiveModule] = useState<string>("fd");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "system", text: "Crediq Real-Time Engine Active. Voice dictation is ready." }
  ]);

  const [insight, setInsight] = useState<string>("");
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  // Centralized Live State
  const [amount, setAmount] = useState<number>(500000);
  const [years, setYears] = useState<number>(3);
  const [rate, setRate] = useState<number>(7.2);
  const [maturity, setMaturity] = useState<number>(0);
  const [chartData, setChartData] = useState<Array<{ year: string; principal: number; projected: number }>>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 1. REAL-TIME CALCULATION ENGINE
  useEffect(() => {
    const finalMaturity = amount * Math.pow(1 + rate / 100, years);
    setMaturity(Math.round(finalMaturity));

    // Dynamic Chart Generation
    const newChartData = [];
    for (let i = 0; i <= years; i++) {
        const val = amount * Math.pow(1 + rate / 100, i);
        newChartData.push({
            year: `Yr ${i}`,
            principal: amount,
            projected: Math.round(val)
        });
    }
    setChartData(newChartData);

  }, [amount, years, rate]);

  // 2. CONTEXTUAL AI DEBOUNCER
  useEffect(() => {
    const fetchInsight = async () => {
        setIsInsightLoading(true);
        try {
          const data = await apiJson<AnalyzeApiResponse>("/ai/analyze", {
            method: "POST",
            body: JSON.stringify({ amount, years, rate, maturity, intent: activeModule }),
          });
            setInsight(data.insight);
        } catch {
            setInsight("Live connection to Crediq AI lost. Calculating strictly offline.");
        } finally {
            setIsInsightLoading(false);
        }
    };

    const timer = setTimeout(() => {
       fetchInsight();
    }, 800); // 800ms debounce

    return () => clearTimeout(timer);
  }, [amount, years, rate, activeModule, maturity]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages]);

  useEffect(() => {
    return () => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") recorder.stop();
    };
  }, []);

  // 3. VOICE MODE (BACKEND STT)
  const toggleRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "system", text: "Voice capture is not supported in this browser." }]);
      return;
    }

    if (isRecording) {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") recorder.stop();
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
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

        try {
          const stt = await transcribeAudio(audioBlob);
          setInputText(stt.transcript);
          setTimeout(() => handleVoiceSend(stt.transcript), 150);
        } catch {
          setMessages((prev) => [...prev, { id: Date.now().toString(), role: "system", text: "Voice processing failed. Please try again." }]);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "system", text: "Microphone permission denied or unavailable." }]);
    }
  };

  const handleVoiceSend = async (textOveride: string) => {
      handleSendLogic(textOveride);
  };

  const handleSend = async () => handleSendLogic(inputText);

  const handleSendLogic = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: text };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsProcessing(true);

    try {
      const result = await apiJson<ChatApiResponse>("/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message: userMsg.text }),
      });

      let parsedResponse: ParsedIntent;
      try {
        parsedResponse = JSON.parse(result.reply) as ParsedIntent;
      } catch {
        parsedResponse = { intent: "general", data: {} };
      }

      setActiveModule(parsedResponse.intent === "general" ? "fd" : parsedResponse.intent);
      
      // Auto-update variables based on NLP
      if (parsedResponse.data.amount_in_rupees) setAmount(parsedResponse.data.amount_in_rupees);
      if (parsedResponse.data.years) setYears(parsedResponse.data.years);
      if (parsedResponse.data.rate) setRate(parsedResponse.data.rate);

      setMessages(prev => [...prev, { 
         id: Date.now().toString(), 
         role: "ai", 
         text: `I've mapped your parameters. Updating interactive view for ₹${parsedResponse.data.amount_in_rupees?.toLocaleString('en-IN') || "current amount"}.` 
      }]);

    } catch {
      setMessages(prev => [...prev, { id: "error", role: "system", text: "Error: Connection failed." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#050508] text-slate-100 relative">
      {/* 4. BACKGROUND ANIMATION LAYER */}
      <div className="absolute inset-0 pointer-events-none z-0 mix-blend-screen opacity-30 overflow-hidden">
         <motion.div 
            className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-indigo-600/20 to-[#00f0ff]/20 blur-[120px]"
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
         />
      </div>

      {/* Sidebar Navigation */}
      <nav className="relative z-10 w-20 md:w-64 border-r border-white/5 flex flex-col items-center md:items-start py-6 bg-[#0a0b10]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-6 mb-12">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#f70bff] to-[#00f0ff] flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="font-semibold tracking-tighter text-xl hidden md:block">Crediq</span>
        </div>

        <div className="flex flex-col gap-2 w-full px-4">
           {[
             { icon: Search, label: "Assistant", id: "greeting" },
             { icon: Calculator, label: "FD Calculator", id: "fd" },
             { icon: TrendingUp, label: "Live Compare", id: "compare" },
             { icon: Heart, label: "Goal Planner", id: "plan" }
           ].map((nav, i) => (
             <button 
                key={i} 
                onClick={() => setActiveModule(nav.id)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${activeModule === nav.id ? "bg-white/10 text-white shadow-[0_0_15px_rgba(0,240,255,0.1)]" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}
             >
               <nav.icon className={`w-5 h-5 shrink-0 ${activeModule === nav.id ? "text-[#00f0ff]" : ""}`} />
               <span className="font-medium text-sm hidden md:block">{nav.label}</span>
             </button>
           ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10">
        
        {/* Header - Trust Layer */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#050508]/50 backdrop-blur-md sticky top-0">
          <div className="flex items-center gap-3">
             <BrainCircuit className="w-5 h-5 text-indigo-400" />
             <h1 className="font-medium text-sm text-slate-300">Analysis Engine</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-md border border-green-500/20">
               <CheckCircle2 className="w-3.5 h-3.5" />
               <span className="text-xs font-semibold">Live Feed Secured</span>
            </div>
            <button className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <User className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </header>

        {/* Split View */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left panel: Conversation */}
          <div className="flex-1 border-r border-white/5 flex flex-col relative bg-[#0a0b10]/40 backdrop-blur-sm">
            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 scrollbar-hide">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-lg ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-tr from-indigo-600 to-[#00f0ff]/80 text-white rounded-br-none' 
                        : msg.role === 'system'
                        ? 'bg-transparent border border-white/5 text-slate-500 text-xs uppercase tracking-widest font-medium'
                        : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none backdrop-blur-xl'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
                
                {isProcessing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex gap-2 items-center">
                      <div className="w-2 h-2 bg-[#00f0ff] rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-[#f70bff] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-[#0a0b10]">
              <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-[#00f0ff]/50 focus-within:shadow-[0_0_20px_rgba(0,240,255,0.1)] transition-all">
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                  placeholder={isRecording ? "Listening to your voice..." : "E.g., What if I invest 10 Lakhs for 5 years?"} 
                  className="flex-1 bg-transparent border-none outline-none text-sm text-slate-200 p-3 resize-none max-h-32"
                  rows={inputText.split('\n').length > 1 ? Math.min(inputText.split('\n').length, 5) : 1}
                />
                <div className="flex items-center gap-2 p-2">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleRecording}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                      isRecording ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    disabled={!inputText.trim() || isProcessing}
                    className="w-10 h-10 rounded-xl bg-[#00f0ff] text-black shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50 disabled:shadow-none shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Interactive Modules */}
          <div className="w-full lg:w-[500px] xl:w-[600px] bg-[#050508] p-4 md:p-8 overflow-y-auto border-l border-white/5">
            <AnimatePresence mode="wait">
              
              {(activeModule === "fd" || activeModule === "plan") && (
                <motion.div 
                  key="calc-module"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="w-full"
                >
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-[#00f0ff]">
                           <Activity className="w-5 h-5" />
                        </div>
                        <div>
                           <h2 className="text-lg font-semibold tracking-tight text-white">Live Trajectory</h2>
                           <p className="text-xs text-slate-400">Synchronized Engine</p>
                        </div>
                     </div>
                  </div>

                  {/* Contextual AI Insight Box */}
                  <motion.div className="mb-8 relative overflow-hidden bg-white/5 border border-[#f70bff]/30 rounded-2xl p-5">
                     <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#f70bff] to-[#00f0ff]" />
                     <div className="flex items-start gap-3">
                        <Info className="w-4 h-4 text-[#f70bff] shrink-0 mt-0.5" />
                        <div className="flex-1">
                           <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-2">
                             AI Insight {isInsightLoading && <div className="w-2 h-2 rounded-full border border-t-transparent border-white animate-spin" />}
                           </h3>
                           <p className="text-sm text-slate-200 leading-relaxed min-h-[40px]">
                              {insight || "Analyzing current mathematical spread..."}
                           </p>
                        </div>
                     </div>
                  </motion.div>

                  {/* Interactive Sliders Form */}
                  <div className="space-y-6">
                     <motion.div whileHover={{ scale: 1.01 }} className="bg-white/5 border border-white/10 rounded-2xl p-5 transition-colors hover:border-white/20">
                        <div className="flex justify-between items-end mb-4">
                           <span className="text-xs text-slate-400 uppercase tracking-widest font-medium">Principal Investment</span>
                           <span className="text-2xl font-bold font-mono tracking-tighter text-[#00f0ff]">₹{amount.toLocaleString('en-IN')}</span>
                        </div>
                        <input 
                           type="range" min="10000" max="10000000" step="10000"
                           value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                           className="w-full accent-[#00f0ff] h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                     </motion.div>

                     <div className="grid grid-cols-2 gap-4">
                        <motion.div whileHover={{ scale: 1.02 }} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                           <span className="text-xs text-slate-400 uppercase tracking-widest font-medium block mb-2">Duration (Yrs)</span>
                           <input type="number" min="1" max="30" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full bg-transparent text-xl font-bold font-mono outline-none" />
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} className="bg-white/5 border border-white/10 rounded-2xl p-4 cursor-not-allowed opacity-80">
                           <span className="text-xs text-slate-400 uppercase tracking-widest font-medium block mb-2">Interest Rate</span>
                           <div className="text-xl font-bold font-mono text-green-400">{rate}%</div>
                           <span className="text-[10px] text-slate-500 block mt-1">Locked by comparison</span>
                        </motion.div>
                     </div>

                     {/* Dynamic Recharts Visualization */}
                     <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-2xl h-[250px] relative">
                         <h3 className="text-xs font-medium text-slate-400 mb-4 uppercase tracking-widest">Growth Visualization</h3>
                         <ResponsiveContainer width="100%" height="80%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="year" fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" />
                              <YAxis fontSize={10} tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} tickLine={false} axisLine={false} stroke="#64748b" />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }}
                                itemStyle={{ color: '#00f0ff', fontWeight: 'bold' }}
                                formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, "Value"]}
                              />
                              <Area type="monotone" dataKey="projected" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#colorProjected)" />
                            </AreaChart>
                         </ResponsiveContainer>
                     </div>

                     {/* Highlight Best Option Conclusion */}
                     <div className="mt-6 flex flex-col pt-6 border-t border-white/10">
                        <span className="text-xs text-slate-500 uppercase tracking-widest font-medium mb-1">Projected Maturity</span>
                        <div className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                           ₹{maturity.toLocaleString('en-IN')}
                        </div>
                     </div>
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
