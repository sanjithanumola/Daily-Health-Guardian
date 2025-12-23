
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
      setError(err.message || "Failed to get advice. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickClick = (sym: string) => {
    setQuery(sym);
    handleSearch(sym);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Symptom Helper</h2>
        <p className="text-slate-500 font-medium">Safe, non-medical advice for your peace of mind.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {commonSymptoms.map(sym => (
              <button 
                key={sym}
                onClick={() => handleQuickClick(sym)}
                className="px-4 py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100 uppercase tracking-wider"
              >
                {sym}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSearch(query); }} className="relative">
            <input 
              type="text" 
              placeholder="Describe your symptom..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              className="w-full pl-6 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700"
            />
            <button 
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              Get Help
            </button>
          </form>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                {error}
              </div>
              <button onClick={() => handleSearch(query)} className="text-xs font-black uppercase tracking-tighter text-rose-700 underline">Retry</button>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Consulting Knowledge Base...</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
          <div className="bg-indigo-50 border border-indigo-100 p-6 md:p-8 rounded-[2.5rem]">
            <h3 className="text-indigo-900 font-black text-2xl mb-6 flex items-center gap-3">
              <span className="text-3xl">🛡️</span> Guardian Advice: {result.symptom}
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-indigo-100/50">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Supportive Care</h4>
                <ul className="space-y-3">
                  {result.homeCare.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700 text-sm font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-200 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-rose-50/50 p-6 rounded-3xl shadow-sm border border-rose-100/50">
                <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-4">Red Flags / See Doctor</h4>
                <ul className="space-y-3">
                  {result.whenToSeeDoctor.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-rose-900 text-sm font-semibold">
                      <span className="text-rose-400 shrink-0">🚩</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white/60 rounded-2xl border border-indigo-100/50 text-xs text-indigo-800 font-bold italic">
              "Note: {result.precautions}"
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomHelper;
