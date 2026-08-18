import React, { useState, useRef, useEffect } from 'react';
import { HealthEntry } from '../types';
import { getHealthChatResponse } from '../services/geminiService';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

interface Props {
  history: HealthEntry[];
}

const AIGuardianChat: React.FC<Props> = ({ history }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Hello! I am your Guardian AI. I have analyzed your recent biometric trends. How can I help you today? You can ask about your symptoms, sleep patterns, nutrition, or custom habit optimization.", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await getHealthChatResponse(input, history);
      const aiMsg: Message = { role: 'ai', text: response, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: Message = { role: 'ai', text: "I encountered an issue connecting to the AI model. Please verify your connection or try again.", timestamp: Date.now() };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-220px)] animate-in fade-in duration-700">
      <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-sm border border-slate-200/80 dark:border-slate-700/80 flex-1 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-[#5E5CE6] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
              G
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white leading-none">Guardian AI Consultant</h3>
              <p className="text-[9px] font-black text-[#5E5CE6] dark:text-indigo-400 uppercase tracking-widest mt-1">Intelligent Biometric Protocol</p>
            </div>
          </div>
          {loading && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-full border border-indigo-100 dark:border-indigo-800/40">
              <span className="text-[10px] font-black text-[#5E5CE6] dark:text-indigo-400 uppercase tracking-wider">Analyzing</span>
              <div className="w-1.5 h-1.5 bg-[#5E5CE6] rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-[#5E5CE6] rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-[#5E5CE6] rounded-full animate-bounce" />
            </div>
          )}
        </div>

        {/* Message Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scroll-smooth"
        >
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-[2rem] px-6 py-4 text-sm font-medium leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-[#5E5CE6] text-white rounded-tr-none shadow-lg shadow-indigo-500/20' 
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-6 sm:p-8 border-t border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Ask anything about your health trends, sleep, or symptoms..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="w-full pl-6 pr-16 py-4.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-[#5E5CE6] outline-none transition-all font-bold text-slate-800 dark:text-slate-100 text-sm"
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2.5 w-11 h-11 bg-[#5E5CE6] text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 disabled:opacity-40 disabled:hover:bg-[#5E5CE6]"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIGuardianChat;
