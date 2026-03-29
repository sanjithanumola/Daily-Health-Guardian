
import React, { useState } from 'react';
import { MedicineInfo } from '../types';
import { scanMedicine } from '../services/geminiService';

const MedicineScanner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [medicineInfo, setMedicineInfo] = useState<MedicineInfo | null>(null);
  const [inputName, setInputName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setImagePreview(reader.result as string);
      setLoading(true);
      try {
        const result = await scanMedicine(undefined, base64);
        setMedicineInfo(result);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to scan. Try typing the name.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTextSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await scanMedicine(inputName);
      setMedicineInfo(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Search failed. Check spelling.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMedicineInfo(null);
    setImagePreview(null);
    setInputName('');
    setError(null);
  };

  if (medicineInfo) {
    return (
      <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-8 duration-700 pb-16">
        <div className="bg-white rounded-[3.5rem] overflow-hidden shadow-sm border border-slate-100">
          <div className="bg-[#5E5CE6] px-10 py-12 text-white relative">
            <h2 className="text-4xl font-black mb-3 leading-tight tracking-tight">{medicineInfo.name}</h2>
            <p className="text-indigo-100 font-bold opacity-90 uppercase tracking-widest text-[11px]">{medicineInfo.usage}</p>
          </div>

          <div className="p-10 md:p-12 space-y-12">
            <section>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6">Bio-Administration</h3>
              <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100/30">
                <p className="text-indigo-950 leading-relaxed font-bold text-lg italic">"{medicineInfo.howToTake}"</p>
              </div>
            </section>

            <div className="grid md:grid-cols-2 gap-10">
              <section>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6">Observed Effects</h4>
                <ul className="space-y-4">
                  {medicineInfo.sideEffects.map((eff, i) => (
                    <li key={i} className="flex items-center gap-4 text-sm text-slate-700 font-bold">
                      <div className="w-2 h-2 rounded-full bg-indigo-200" />
                      {eff}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6">Interaction Risks</h4>
                <ul className="space-y-4">
                  {medicineInfo.precautions.map((pre, i) => (
                    <li key={i} className="flex items-center gap-4 text-sm text-slate-700 font-bold">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      {pre}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="bg-rose-50/50 p-8 rounded-[2.5rem] border border-rose-100/30">
              <h4 className="text-rose-700 font-black text-[11px] uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                <span className="text-xl">🛡️</span> Guardian Alert
              </h4>
              <p className="text-rose-950 text-sm leading-relaxed font-black">{medicineInfo.safetyWarnings}</p>
            </div>

            <button 
              onClick={reset}
              className="w-full py-6 bg-slate-900 text-white font-black uppercase tracking-[0.2em] rounded-[2rem] hover:bg-black transition-all active:scale-[0.98] shadow-2xl shadow-slate-200"
            >
              Reset Scanner
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Medicine Hub</h2>
        <p className="text-slate-500 font-bold italic">Safety-first identification engine.</p>
      </div>

      <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-sm border border-slate-100 flex flex-col items-center">
        {/* The Branded G Logo above search */}
        <div className="w-14 h-14 bg-[#5E5CE6] rounded-[1.25rem] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-100/50 mb-10 animate-pulse">G</div>

        <div className="w-full space-y-12">
          <section>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 text-center">Visual Recognition</h3>
            <label className="group relative block">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload}
                disabled={loading}
                className="hidden" 
              />
              <div className="border-2 border-dashed border-indigo-100 rounded-[3rem] p-16 flex flex-col items-center gap-6 group-hover:border-[#5E5CE6] group-hover:bg-indigo-50/30 transition-all cursor-pointer bg-slate-50/50">
                <div className="w-20 h-20 bg-white shadow-xl shadow-indigo-100/20 rounded-[1.75rem] flex items-center justify-center text-[#5E5CE6] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-black text-slate-800 uppercase tracking-[0.2em] text-sm">Upload Label</p>
                  <p className="text-[11px] text-slate-400 font-bold mt-2">AI-Powered Extraction</p>
                </div>
              </div>
            </label>
          </section>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.4em]">
              <span className="bg-white px-8 text-slate-300">Identity Check</span>
            </div>
          </div>

          <section>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 text-center">Manual Index</h3>
            <form onSubmit={handleTextSearch}>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Enter medication name..."
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  disabled={loading}
                  className="w-full pl-8 pr-36 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
                />
                <button 
                  type="submit"
                  disabled={loading || !inputName.trim()}
                  className="absolute right-2.5 top-2.5 bottom-2.5 px-8 bg-[#5E5CE6] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50"
                >
                  Lookup
                </button>
              </div>
            </form>
          </section>

          {error && (
            <div className="p-6 bg-rose-50 border border-rose-100 rounded-[2rem] text-rose-600 text-[11px] font-black uppercase tracking-[0.1em] flex items-center gap-4">
              <span className="text-2xl">⚠️</span> {error}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-6 py-6">
              <div className="w-12 h-12 border-4 border-indigo-50 border-t-[#5E5CE6] rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Cross-Referencing FDA Data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicineScanner;
