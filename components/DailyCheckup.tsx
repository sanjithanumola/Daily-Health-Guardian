
import React, { useState } from 'react';
import { HealthEntry, HealthAnalysis } from '../types';
import { analyzeHealthCheckup } from '../services/geminiService';

interface Props {
  onComplete: (entry: HealthEntry) => void;
}

const DailyCheckup: React.FC<Props> = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);
  const [entry, setEntry] = useState<HealthEntry>({
    id: '',
    timestamp: 0,
    sleep: 7,
    water: 4,
    stress: 5,
    energy: 5,
    discomfort: '',
    foodQuality: 'balanced'
  });

  const symptomChips = ["Fever", "Headache", "Cough", "Stomach Pain", "Fatigue", "Back Pain"];

  const handleSymptomClick = (sym: string) => {
    const current = entry.discomfort.trim();
    if (current.includes(sym)) return;
    const newVal = current ? `${current}, ${sym}` : sym;
    setEntry({ ...entry, discomfort: newVal });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...entry, id: Date.now().toString(), timestamp: Date.now() };
      const result = await analyzeHealthCheckup(data);
      setAnalysis(result);
      onComplete(data);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze health checkup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (analysis) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 shadow-sm shadow-green-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Checkup Complete</h2>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Health Insights for Today</p>
            </div>
          </div>

          <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-50 mb-8">
            <p className="text-lg text-indigo-900 leading-relaxed font-medium italic">
              "{analysis.summary}"
            </p>
          </div>

          {analysis.possibleConcern && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-8 flex gap-4">
              <div className="text-2xl">👀</div>
              <div>
                <h3 className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">Observation</h3>
                <p className="text-amber-900 text-sm leading-relaxed">{analysis.possibleConcern}</p>
              </div>
            </div>
          )}

          <div className="space-y-4 mb-10">
            <h3 className="font-bold text-slate-800 px-1">Daily Action Plan</h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {analysis.advice.map((item, i) => (
                <li key={i} className="flex items-start gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all group">
                  <div className="w-8 h-8 bg-white border border-slate-100 text-indigo-600 rounded-xl flex items-center justify-center text-sm font-black shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                    {i + 1}
                  </div>
                  <span className="text-slate-700 text-sm font-medium leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {analysis.warning && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 mb-8">
              <div className="flex items-center gap-2 text-rose-700 font-bold mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="uppercase tracking-widest text-xs">Important Precaution</span>
              </div>
              <p className="text-rose-900 text-sm font-medium">{analysis.warning}</p>
            </div>
          )}

          <button 
            onClick={() => setAnalysis(null)}
            className="w-full py-4 px-6 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
          >
            Start Fresh Tomorrow
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-slate-900 mb-2">Daily Checkup</h2>
        <p className="text-slate-500 font-medium italic">"A small check today prevents a big worry tomorrow."</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          <section>
            <label className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-slate-800 uppercase tracking-widest">Sleep</span>
              <span className="text-indigo-600 font-black text-lg">{entry.sleep} <small className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Hrs</small></span>
            </label>
            <input 
              type="range" min="0" max="15" step="0.5"
              value={entry.sleep}
              onChange={(e) => setEntry({ ...entry, sleep: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-300 mt-2 font-black uppercase tracking-widest">
              <span>Too Little</span>
              <span>Perfect</span>
              <span>Too Much</span>
            </div>
          </section>

          <section>
            <label className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-slate-800 uppercase tracking-widest">Hydration</span>
              <span className="text-indigo-600 font-black text-lg">{entry.water} <small className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Units</small></span>
            </label>
            <input 
              type="range" min="0" max="15"
              value={entry.water}
              onChange={(e) => setEntry({ ...entry, water: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
             <div className="flex justify-between text-[10px] text-slate-300 mt-2 font-black uppercase tracking-widest">
              <span>Dry</span>
              <span>Refreshing</span>
              <span>Drowned</span>
            </div>
          </section>

          <section>
            <label className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-slate-800 uppercase tracking-widest">Stress</span>
              <span className="text-rose-500 font-black text-lg">{entry.stress}/10</span>
            </label>
            <input 
              type="range" min="1" max="10"
              value={entry.stress}
              onChange={(e) => setEntry({ ...entry, stress: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </section>

          <section>
            <label className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-slate-800 uppercase tracking-widest">Energy</span>
              <span className="text-emerald-500 font-black text-lg">{entry.energy}/10</span>
            </label>
            <input 
              type="range" min="1" max="10"
              value={entry.energy}
              onChange={(e) => setEntry({ ...entry, energy: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </section>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-800 mb-4 uppercase tracking-widest">Nutrition Quality</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['healthy', 'balanced', 'mostly processed', 'irregular'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setEntry({ ...entry, foodQuality: type })}
                className={`py-3 px-2 text-[10px] font-black uppercase tracking-tighter rounded-xl border transition-all ${entry.foodQuality === type ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2 uppercase tracking-widest">Physical Discomfort?</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {symptomChips.map(sym => (
              <button 
                key={sym}
                type="button"
                onClick={() => handleSymptomClick(sym)}
                className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full hover:bg-slate-200 transition-colors"
              >
                + {sym}
              </button>
            ))}
          </div>
          <textarea 
            placeholder="Tell me if you have a fever, headache, stomach pain..."
            value={entry.discomfort}
            onChange={(e) => setEntry({ ...entry, discomfort: e.target.value })}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[120px] text-slate-700 font-medium"
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardian is Analyzing...
            </>
          ) : (
            <>
              Generate My Insight
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default DailyCheckup;
