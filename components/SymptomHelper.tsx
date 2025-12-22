
import React, { useState } from 'react';
import { SymptomAdvice } from '../types';
import { getSymptomAdvice } from '../services/geminiService';

const SymptomHelper: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SymptomAdvice | null>(null);

  const commonSymptoms = ["Fever", "Headache", "Stomach Ache", "Cough", "Back Pain", "Sore Throat"];

  const handleSearch = async (symptomText: string) => {
    const q = symptomText || query;
    if (!q.trim()) return;
    
    setLoading(true);
    try {
      const data = await getSymptomAdvice(q);
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to get advice. Please try again.");
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
        <p className="text-slate-500">Feeling unwell? Get quick, safe, non-medical advice for common issues.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {commonSymptoms.map(sym => (
              <button 
                key={sym}
                onClick={() => handleQuickClick(sym)}
                className="px-4 py-2 bg-slate-50 text-slate-600 text-sm font-semibold rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
              >
                {sym}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSearch(query); }} className="relative">
            <input 
              type="text" 
              placeholder="Describe your symptom (e.g., 'Fever and chills', 'Upset stomach')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              className="w-full pl-6 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            <button 
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              Get Help
            </button>
          </form>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-4 py-20 animate-pulse">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Searching Medical Knowledge...</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl">
            <h3 className="text-indigo-900 font-bold text-xl mb-4 flex items-center gap-2">
              <span className="text-2xl">✨</span> Advice for {result.symptom}
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100/50">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Comfort & Home Care</h4>
                <ul className="space-y-2">
                  {result.homeCare.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                      <span className="text-indigo-400 font-bold">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-rose-50 p-5 rounded-2xl shadow-sm border border-rose-100/50">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-3">When to see a doctor</h4>
                <ul className="space-y-2">
                  {result.whenToSeeDoctor.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-rose-900 text-sm font-medium">
                      <span className="text-rose-400 font-bold">!</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white/60 rounded-xl border border-indigo-100/50 text-xs text-indigo-800 font-medium italic">
              "Remember: {result.precautions}"
            </div>
          </div>
          
          <div className="bg-slate-100 p-4 rounded-xl text-center">
            <p className="text-xs text-slate-500">
              Disclaimer: This assistant provides general health tips and is not a replacement for professional medical diagnosis. 
              Always consult a doctor for serious symptoms.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomHelper;
