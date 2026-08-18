import React, { useState } from 'react';
import { SymptomAdvice } from '../types';
import { getSymptomAdvice } from '../services/geminiService';
import { Thermometer, Search, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

const SymptomHelper: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SymptomAdvice | null>(null);
  const [error, setError] = useState<string | null>(null);

  const commonSymptoms = ["Fever", "Headache", "Stomach Ache", "Cough", "Back Pain", "Sore Throat"];

  const handleSearch = async (symptomText: string) => {
    const q = symptomText || query;
    if (!q.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await getSymptomAdvice(q);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to get advice. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickClick = (sym: string) => {
    setQuery(sym);
    handleSearch(sym);
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Symptom Helper</h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold italic">Intelligent, non-medical comfort guidance.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-slate-200/80 dark:border-slate-700/80 mb-8 flex flex-col items-center">
        <div className="w-14 h-14 bg-[#5E5CE6] rounded-[1.25rem] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-500/20 mb-8 animate-in zoom-in duration-500">
          G
        </div>
        
        <div className="w-full space-y-8">
          <div className="flex flex-wrap justify-center gap-2">
            {commonSymptoms.map(sym => (
              <button 
                key={sym}
                onClick={() => handleQuickClick(sym)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 text-[10px] font-black rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-[#5E5CE6] dark:hover:text-indigo-400 transition-all border border-slate-200/80 dark:border-slate-700 uppercase tracking-widest"
              >
                {sym}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSearch(query); }} className="relative w-full">
            <input 
              type="text" 
              placeholder="Describe what you're experiencing (e.g. throbbing headache, tight cough)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              className="w-full pl-7 pr-36 py-5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-[2.2rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-[#5E5CE6] outline-none transition-all font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base sm:text-lg shadow-inner"
            />
            <button 
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-3 top-2.5 bottom-2.5 px-7 bg-[#5E5CE6] text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 active:scale-95 flex items-center gap-2"
            >
              <Search size={16} />
              <span>Analyze</span>
            </button>
          </form>

          {error && (
            <div className="p-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-3xl text-rose-600 dark:text-rose-400 text-[11px] font-black uppercase tracking-widest flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
              <button onClick={() => handleSearch(query)} className="underline decoration-2">Retry</button>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-6 py-20">
          <div className="w-12 h-12 border-4 border-indigo-100 dark:border-slate-700 border-t-[#5E5CE6] rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Guardian AI Thinking...</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700 ease-out">
          <div className="bg-[#F8F9FF] dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 p-8 md:p-12 rounded-[3.5rem]">
            <h3 className="text-slate-900 dark:text-white font-black text-3xl mb-10 tracking-tight">
              Support Strategy
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-900/80 p-8 rounded-[2.5rem] shadow-sm border border-indigo-100/40 dark:border-slate-700/60">
                <h4 className="text-[11px] font-black text-[#5E5CE6] dark:text-indigo-400 uppercase tracking-[0.3em] mb-6">Home Care Items</h4>
                <ul className="space-y-4">
                  {result.homeCare.map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-slate-700 dark:text-slate-200 text-sm font-bold">
                      <div className="w-2 h-2 rounded-full bg-[#5E5CE6] mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-rose-50/50 dark:bg-rose-950/30 p-8 rounded-[2.5rem] border border-rose-100/60 dark:border-rose-800/40">
                <h4 className="text-[11px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-[0.3em] mb-6">Escalation Triggers</h4>
                <ul className="space-y-4">
                  {result.whenToSeeDoctor.map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-rose-950 dark:text-rose-200 text-sm font-black">
                      <span className="shrink-0">🚩</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10 p-6 bg-white/80 dark:bg-slate-900/60 rounded-3xl border border-indigo-100/50 dark:border-slate-700/60 text-[11px] text-indigo-900 dark:text-indigo-300 font-bold uppercase tracking-wide leading-relaxed">
              <span className="font-black mr-2">NOTICE:</span> {result.precautions}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomHelper;
