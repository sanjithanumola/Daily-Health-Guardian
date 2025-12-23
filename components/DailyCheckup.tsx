
import React, { useState } from 'react';
import { HealthEntry, HealthAnalysis } from '../types';
import { analyzeHealthCheckup } from '../services/geminiService';

interface Props {
  onComplete: (entry: HealthEntry) => void;
}

const DailyCheckup: React.FC<Props> = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    try {
      const data = { ...entry, id: Date.now().toString(), timestamp: Date.now() };
      const result = await analyzeHealthCheckup(data);
      setAnalysis(result);
      onComplete(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze checkup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (analysis) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100">
          <div className="flex items-center gap-5 mb-10">
            <div className="w-16 h-16 bg-emerald-100 rounded-[1.5rem] flex items-center justify-center text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Today's Insight</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Guardian AI Analysis</p>
            </div>
          </div>

          <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100/50 mb-10">
            <p className="text-xl text-indigo-900 leading-relaxed font-bold italic">
              "{analysis.summary}"
            </p>
          </div>

          <div className="grid gap-8 mb-10">
            {analysis.possibleConcern && (
              <div className="bg-amber-50 border border-amber-100/50 rounded-2xl p-6 flex gap-4">
                <div className="text-2xl shrink-0">💡</div>
                <div>
                  <h3 className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Observation</h3>
                  <p className="text-amber-900 text-sm font-semibold">{analysis.possibleConcern}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Health Recommendations</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {analysis.advice.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs shadow-sm shrink-0">{i+1}</div>
                    <span className="text-slate-700 text-sm font-bold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {analysis.warning && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 mb-10">
              <div className="flex items-center gap-2 text-rose-700 font-black text-[10px] uppercase tracking-widest mb-3">
                <span className="text-lg">⚠️</span> Important Precaution
              </div>
              <p className="text-rose-900 text-sm font-semibold leading-relaxed">{analysis.warning}</p>
            </div>
          )}

          <button 
            onClick={() => setAnalysis(null)}
            className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-[0.15em] rounded-2xl hover:bg-slate-800 transition-all active:scale-[0.98]"
          >
            Start New Checkup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-slate-900 mb-2">Daily Checkup</h2>
        <p className="text-slate-500 font-bold italic">Your health is your greatest wealth.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Sleep */}
          <section className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sleep Quality</label>
              <span className="text-indigo-600 font-black text-xl">{entry.sleep}h</span>
            </div>
            <input 
              type="range" min="0" max="15" step="0.5"
              value={entry.sleep}
              onChange={(e) => setEntry({ ...entry, sleep: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 rounded-full appearance-none accent-indigo-600"
            />
          </section>

          {/* Hydration */}
          <section className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hydration</label>
              <span className="text-indigo-600 font-black text-xl">{entry.water} <small className="text-[10px]">units</small></span>
            </div>
            <input 
              type="range" min="0" max="15"
              value={entry.water}
              onChange={(e) => setEntry({ ...entry, water: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 rounded-full appearance-none accent-indigo-600"
            />
          </section>

          {/* Stress */}
          <section className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stress Level</label>
              <span className="text-rose-500 font-black text-xl">{entry.stress}/10</span>
            </div>
            <input 
              type="range" min="1" max="10"
              value={entry.stress}
              onChange={(e) => setEntry({ ...entry, stress: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 rounded-full appearance-none accent-rose-500"
            />
          </section>

          {/* Energy */}
          <section className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Energy Level</label>
              <span className="text-emerald-500 font-black text-xl">{entry.energy}/10</span>
            </div>
            <input 
              type="range" min="1" max="10"
              value={entry.energy}
              onChange={(e) => setEntry({ ...entry, energy: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 rounded-full appearance-none accent-emerald-500"
            />
          </section>
        </div>

        {/* Nutrition */}
        <section>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Nutrition Quality</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['healthy', 'balanced', 'mostly processed', 'irregular'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setEntry({ ...entry, foodQuality: type })}
                className={`py-4 px-2 text-[10px] font-black uppercase tracking-tight rounded-2xl border transition-all ${entry.foodQuality === type ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </section>

        {/* Symptoms */}
        <section>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Physical Discomfort</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {symptomChips.map(sym => (
              <button 
                key={sym}
                type="button"
                onClick={() => handleSymptomClick(sym)}
                className="px-4 py-1.5 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider rounded-full border border-slate-100 hover:bg-slate-100"
              >
                + {sym}
              </button>
            ))}
          </div>
          <textarea 
            placeholder="Type any symptoms or discomforts here..."
            value={entry.discomfort}
            onChange={(e) => setEntry({ ...entry, discomfort: e.target.value })}
            className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[140px] text-slate-700 font-medium"
          />
        </section>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3">
            <span>⚠️</span> {error}
          </div>
        )}

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-6 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] rounded-3xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            "Analyze My Health"
          )}
        </button>
      </form>
    </div>
  );
};

export default DailyCheckup;
