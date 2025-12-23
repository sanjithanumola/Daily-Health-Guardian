
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
        setError(err.message || "Failed to scan image. Please try typing the name instead.");
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
      setError(err.message || "Failed to fetch medicine info. Please check the name and try again.");
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
      <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom duration-500 pb-10">
        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100">
          <div className="bg-indigo-600 px-8 py-10 text-white relative">
            <h2 className="text-3xl font-black mb-2 leading-tight">{medicineInfo.name}</h2>
            <p className="text-indigo-100 font-medium opacity-90">{medicineInfo.usage}</p>
          </div>

          <div className="p-8 md:p-10 space-y-8">
            <section>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Administration Guidelines</h3>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <p className="text-slate-700 leading-relaxed font-bold">{medicineInfo.howToTake}</p>
              </div>
            </section>

            <div className="grid md:grid-cols-2 gap-8">
              <section>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Common Side Effects</h4>
                <ul className="space-y-3">
                  {medicineInfo.sideEffects.map((eff, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-200" />
                      {eff}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Safety Precautions</h4>
                <ul className="space-y-3">
                  {medicineInfo.precautions.map((pre, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                      {pre}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
              <h4 className="text-rose-700 font-black text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                <span>🛡️</span> Critical Safety Information
              </h4>
              <p className="text-rose-900 text-sm leading-relaxed font-semibold">{medicineInfo.safetyWarnings}</p>
            </div>

            <button 
              onClick={reset}
              className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-[0.15em] rounded-2xl hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
              Start New Scan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-slate-900 mb-2">Medicine Scan</h2>
        <p className="text-slate-500 font-bold italic">Safety first: Understand your medication.</p>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="space-y-10">
          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Option 1: Scan Package</h3>
            <label className="group relative block">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload}
                disabled={loading}
                className="hidden" 
              />
              <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 flex flex-col items-center gap-4 group-hover:border-indigo-400 transition-all cursor-pointer bg-slate-50/50">
                <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-black text-slate-700 uppercase tracking-wide">Upload Label Image</p>
                  <p className="text-xs text-slate-400 font-bold mt-1">Camera or Photo Library</p>
                </div>
              </div>
            </label>
          </section>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs font-black uppercase">
              <span className="bg-white px-4 text-slate-300 tracking-[0.3em]">OR</span>
            </div>
          </div>

          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Option 2: Manual Search</h3>
            <form onSubmit={handleTextSearch}>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="e.g., Ibuprofen 200mg"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  disabled={loading}
                  className="w-full pl-6 pr-36 py-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700"
                />
                <button 
                  type="submit"
                  disabled={loading || !inputName.trim()}
                  className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  Analyze
                </button>
              </div>
            </form>
          </section>

          {error && (
            <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3">
              <span className="text-xl">⚠️</span> {error}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] animate-pulse">Cross-referencing database...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicineScanner;
