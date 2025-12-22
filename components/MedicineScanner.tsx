
import React, { useState } from 'react';
import { MedicineInfo } from '../types';
import { scanMedicine } from '../services/geminiService';

const MedicineScanner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [medicineInfo, setMedicineInfo] = useState<MedicineInfo | null>(null);
  const [inputName, setInputName] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setImagePreview(reader.result as string);
      setLoading(true);
      try {
        const result = await scanMedicine(undefined, base64);
        setMedicineInfo(result);
      } catch (err) {
        console.error(err);
        alert("Failed to scan image. Please try typing the name instead.");
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
    try {
      const result = await scanMedicine(inputName);
      setMedicineInfo(result);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch medicine info. Please check the name.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMedicineInfo(null);
    setImagePreview(null);
    setInputName('');
  };

  if (medicineInfo) {
    return (
      <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom duration-500">
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
          <div className="bg-indigo-600 px-8 py-10 text-white relative">
            <div className="absolute top-4 right-4 bg-white/10 p-2 rounded-full backdrop-blur-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.477 2.387a2 2 0 00.547 1.022l1.022 1.022c.78.78 2.047.78 2.828 0l1.022-1.022z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2">{medicineInfo.name}</h2>
            <p className="text-indigo-100 opacity-90">{medicineInfo.usage}</p>
          </div>

          <div className="p-8 space-y-8">
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">How to take</h3>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-slate-700 leading-relaxed font-medium">{medicineInfo.howToTake}</p>
              </div>
            </section>

            <div className="grid md:grid-cols-2 gap-8">
              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Side Effects</h3>
                <ul className="space-y-3">
                  {medicineInfo.sideEffects.map((eff, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      {eff}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Precautions</h3>
                <ul className="space-y-3">
                  {medicineInfo.precautions.map((pre, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                      {pre}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="bg-red-50 p-6 rounded-2xl border border-red-100">
              <h3 className="text-red-700 font-bold mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Crucial Safety Info
              </h3>
              <p className="text-red-800 text-sm leading-relaxed">{medicineInfo.safetyWarnings}</p>
            </section>

            <button 
              onClick={reset}
              className="w-full py-4 px-6 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
            >
              Scan Another Medicine
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Medicine Scan</h2>
        <p className="text-slate-500">Scan a package or type a name to learn about safe usage.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="space-y-10">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Scan Package Image</h3>
            <label className="group relative block">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload}
                disabled={loading}
                className="hidden" 
              />
              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center gap-4 group-hover:border-indigo-400 transition-all cursor-pointer bg-slate-50/50">
                <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-700">Click to upload or take photo</p>
                  <p className="text-sm text-slate-400">Supports JPG, PNG</p>
                </div>
              </div>
            </label>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">or search manually</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <form onSubmit={handleTextSearch}>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Enter medicine name (e.g. Paracetamol 500mg)"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                disabled={loading}
                className="w-full pl-6 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              <button 
                type="submit"
                disabled={loading || !inputName.trim()}
                className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                Search
              </button>
            </div>
          </form>

          {loading && (
            <div className="flex flex-col items-center gap-4 py-8 animate-pulse">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Analyzing Medicine Data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicineScanner;
