import React, { useState } from 'react';
import { MedicineInfo } from '../types';
import { scanMedicine } from '../services/geminiService';
import { Camera, Search, Pill, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';

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
        setError(err.message || "Failed to scan. Try typing the medication name.");
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
      setError(err.message || "Search failed. Please check the spelling.");
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
        <div className="bg-white dark:bg-slate-800 rounded-[3.5rem] overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-700/80">
          <div className="bg-[#5E5CE6] px-10 py-12 text-white relative">
            <div className="flex items-center gap-3 mb-2">
              <Pill size={24} className="text-indigo-200" />
              <span className="text-xs font-black uppercase tracking-widest text-indigo-200">Verified Identification</span>
            </div>
            <h2 className="text-4xl font-black mb-2 leading-tight tracking-tight">{medicineInfo.name}</h2>
            <p className="text-indigo-100 font-bold uppercase tracking-widest text-[11px]">{medicineInfo.usage}</p>
          </div>

          <div className="p-8 md:p-12 space-y-10">
            <section>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Administration & Timing</h3>
              <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-6 sm:p-8 rounded-[2.5rem] border border-indigo-100/60 dark:border-indigo-800/40">
                <p className="text-indigo-950 dark:text-indigo-200 leading-relaxed font-bold text-base sm:text-lg italic">"{medicineInfo.howToTake}"</p>
              </div>
            </section>

            <div className="grid md:grid-cols-2 gap-8">
              <section>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Observed Effects</h4>
                <ul className="space-y-3">
                  {medicineInfo.sideEffects.map((eff, i) => (
                    <li key={i} className="flex items-center gap-3.5 text-sm text-slate-700 dark:text-slate-200 font-bold">
                      <div className="w-2 h-2 rounded-full bg-[#5E5CE6] shrink-0" />
                      <span>{eff}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Precautions & Risks</h4>
                <ul className="space-y-3">
                  {medicineInfo.precautions.map((pre, i) => (
                    <li key={i} className="flex items-center gap-3.5 text-sm text-slate-700 dark:text-slate-200 font-bold">
                      <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      <span>{pre}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="bg-rose-50/70 dark:bg-rose-950/30 p-6 sm:p-8 rounded-[2.5rem] border border-rose-100/60 dark:border-rose-800/40">
              <h4 className="text-rose-700 dark:text-rose-400 font-black text-[11px] uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                <ShieldAlert size={18} />
                <span>Guardian Clinical Alert</span>
              </h4>
              <p className="text-rose-950 dark:text-rose-200 text-sm leading-relaxed font-bold">{medicineInfo.safetyWarnings}</p>
            </div>

            <button 
              onClick={reset}
              className="w-full py-5 bg-[#5E5CE6] text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              <span>Scan Another Medicine</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Medicine Scanner</h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold italic">Safety-first identification engine.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 sm:p-12 rounded-[3.5rem] shadow-sm border border-slate-200/80 dark:border-slate-700/80 flex flex-col items-center">
        <div className="w-14 h-14 bg-[#5E5CE6] rounded-[1.25rem] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-500/20 mb-8">
          G
        </div>

        <div className="w-full space-y-10">
          <section>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 text-center">Visual Recognition</h3>
            <label className="group relative block">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload}
                disabled={loading}
                className="hidden" 
              />
              <div className="border-2 border-dashed border-indigo-200/80 dark:border-indigo-800/60 rounded-[3rem] p-12 sm:p-14 flex flex-col items-center gap-4 group-hover:border-[#5E5CE6] group-hover:bg-indigo-50/30 dark:group-hover:bg-indigo-950/30 transition-all cursor-pointer bg-slate-50/60 dark:bg-slate-900/60">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 shadow-xl shadow-indigo-500/10 rounded-2xl flex items-center justify-center text-[#5E5CE6] group-hover:scale-110 transition-all duration-300">
                  <Camera size={32} />
                </div>
                <div className="text-center">
                  <p className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em] text-sm">Upload Photo / Label</p>
                  <p className="text-[11px] text-slate-400 font-bold mt-1">AI-Powered Composition Analysis</p>
                </div>
              </div>
            </label>
          </section>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80 dark:border-slate-700/80"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.4em]">
              <span className="bg-white dark:bg-slate-800 px-6 text-slate-400">Or Search by Name</span>
            </div>
          </div>

          <section>
            <form onSubmit={handleTextSearch}>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Enter medication name (e.g. Ibuprofen, Amoxicillin)..."
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  disabled={loading}
                  className="w-full pl-6 pr-32 py-4.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-[#5E5CE6] outline-none transition-all font-bold text-slate-800 dark:text-slate-100 text-sm"
                />
                <button 
                  type="submit"
                  disabled={loading || !inputName.trim()}
                  className="absolute right-2 top-2 bottom-2 px-6 bg-[#5E5CE6] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Search size={14} />
                  <span>Lookup</span>
                </button>
              </div>
            </form>
          </section>

          {error && (
            <div className="p-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-3">
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-10 h-10 border-4 border-indigo-100 dark:border-slate-700 border-t-[#5E5CE6] rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Cross-Referencing FDA Health Database...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicineScanner;
