
import React, { useState } from 'react';
import { SymptomAdvice } from '../types';
import { getSymptomAdvice } from '../services/geminiService';

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
        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Symptom Helper</h2>
        <p className="text-slate-500 font-bold italic">Intelligent, non-medical comfort guidance.</p>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-slate-100 mb-8 flex flex-col items-center">
        {/* The Branded G Logo above search */}
        <div className="w-14 h-14 bg-[#5E5CE6] rounded-[1.25rem] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-100/50 mb-8 animate-in zoom-in duration-500">G</div>
        
        <div className="w-full space-y-8">
          <div className="flex flex-wrap justify-center gap-2">
            {commonSymptoms.map(sym => (
              <button 
                key={sym}
                onClick={() => handleQuickClick(sym)}
                className="px-4 py-2 bg-slate-50 text-slate-600 text-[10px] font-black rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100 uppercase tracking-widest"
              >
                {sym}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSearch(query); }} className="relative w-full">
            <input 
              type="text" 
              placeholder="How are you feeling today?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              className="w-full pl-8 pr-32 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
            />
            <button 
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2.5 top-2.5 bottom-2.5 px-6 bg-[#5E5CE6] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 active:scale-95"
            >
              Analyze
            </button>
          </form>

          {error && (
            <div className="p-5 bg-rose-50 border border-rose-100 rounded-3xl text-rose-600 text-[11px] font-black uppercase tracking-widest flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <span className="text-lg">⚠️</span>
                {error}
              </div>
              <button onClick={() => handleSearch(query)} className="underline decoration-2">Retry</button>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-6 py-20">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-[#5E5CE6] rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Guardian AI Thinking...</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700 ease-out">
          <div className="bg-[#F8F9FF] border border-indigo-50 p-8 md:p-12 rounded-[3.5rem]">
            <h3 className="text-[#1A1A1A] font-black text-3xl mb-10 tracking-tight">
              Support Strategy
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-indigo-100/30">
                <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">Action Items</h4>
                <ul className="space-y-4">
                  {result.homeCare.map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-slate-700 text-sm font-bold">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-rose-50/50 p-8 rounded-[2.5rem] border border-rose-100/40">
                <h4 className="text-[11px] font-black text-rose-400 uppercase tracking-[0.3em] mb-6">Escalation Triggers</h4>
                <ul className="space-y-4">
                  {result.whenToSeeDoctor.map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-rose-900 text-sm font-black">
                      <span className="shrink-0">🚩</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10 p-6 bg-white/60 rounded-3xl border border-indigo-100/30 text-[11px] text-indigo-800 font-bold uppercase tracking-wide leading-relaxed">
              <span className="font-black mr-2">NOTICE:</span> {result.precautions}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomHelper;
