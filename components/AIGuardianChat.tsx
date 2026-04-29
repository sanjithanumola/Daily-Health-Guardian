
import React, { useState, useRef, useEffect } from 'react';
import { HealthEntry } from '../types';
import { getHealthChatResponse } from '../services/geminiService';

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
    { role: 'ai', text: "Hello! I am your Guardian AI. I have analyzed your recent health data. How can I help you today? You can ask about your trends, symptom advice, or habit optimization.", timestamp: Date.now() }
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
      const errMsg: Message = { role: 'ai', text: "I encountered an error processing your request. Please ensure your AI connection is stable.", timestamp: Date.now() };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-220px)] animate-in fade-in duration-700">
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="px-10 py-6 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
          <div className="w-10 h-10 bg-[#5E5CE6] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100/50">G</div>
          <div>
            <h3 className="text-sm font-black text-slate-900 leading-none">Guardian AI Consultant</h3>
            <p className="text-[9px] font-black text-[#5E5CE6] uppercase tracking-widest mt-1">Intelligent Health Protocol</p>
          </div>
          {loading && (
            <div className="ml-auto flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#5E5CE6] rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-[#5E5CE6] rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-[#5E5CE6] rounded-full animate-bounce" />
            </div>
          )}
        </div>

        {/* Message Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth"
        >
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[80%] rounded-[2rem] px-6 py-4 text-sm font-medium leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-[#5E5CE6] text-white rounded-tr-none shadow-lg shadow-indigo-100' 
                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-8 border-t border-slate-50">
          <form onSubmit={handleSend} className="relative">
            <input 
              type="text" 
              placeholder="Ask anything about your health trends..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="w-full pl-8 pr-20 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 w-12 bg-[#5E5CE6] text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "Analyze my sleep trends",
              "How matches my stress with hydration?",
              "Recommend nutrition tips",
              "Am I recovering well?"
            ].map((suggest, j) => (
              <button 
                key={j}
                onClick={() => { setInput(suggest); }}
                className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 transition-all"
              >
                {suggest}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGuardianChat;
