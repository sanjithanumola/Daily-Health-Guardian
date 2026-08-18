import React, { useMemo, useState, useEffect } from 'react';
import { HealthEntry } from '../types';
import { getWeeklySummary } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, Brain, Moon, Droplets, HeartPulse, Salad, Sparkles } from 'lucide-react';

interface Props {
  history: HealthEntry[];
}

const HealthDashboard: React.FC<Props> = ({ history }) => {
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  useEffect(() => {
    if (history.length >= 3) {
      getWeeklySummary(history).then(setAiSummary).catch(console.error);
    }
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="max-w-md mx-auto py-32 text-center animate-in fade-in duration-1000">
        <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-sm border border-slate-200/80 dark:border-slate-700">
          <Activity size={36} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Awaiting Bio-Data</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          Log your daily checkup habits in the Journal to initialize the intelligence analysis engine.
        </p>
      </div>
    );
  }

  const chartData = useMemo(() => 
    [...history].reverse().map(h => ({
      ...h,
      date: new Date(h.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
    }))
  , [history]);

  const latest = history[0];
  
  // High-End Logic for Vitality Score
  const healthScore = useMemo(() => {
    const sleepWeight = Math.min(latest.sleep / 8, 1) * 30;
    const waterWeight = Math.min(latest.water / 8, 1) * 20;
    const stressWeight = (1 - (latest.stress / 10)) * 25;
    const energyWeight = (latest.energy / 10) * 25;
    return Math.round(sleepWeight + waterWeight + stressWeight + energyWeight);
  }, [latest]);

  const scoreColor = healthScore > 80 ? 'text-emerald-500' : healthScore > 50 ? 'text-[#5E5CE6]' : 'text-rose-500';

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-700">
      {/* AI Summary Banner */}
      {aiSummary && (
        <div className="bg-[#5E5CE6] text-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-indigo-500/20 flex items-center gap-6 animate-in slide-in-from-top-4 duration-1000">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shrink-0">
            <Brain size={28} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">
              AI Biometric Synthesis
            </div>
            <p className="text-sm sm:text-base font-bold italic tracking-tight">
              "{aiSummary}"
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vitality Hub Card */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-[3.5rem] p-10 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/40 dark:from-indigo-950/20 to-transparent pointer-events-none" />
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 relative z-10">
            Vitality Index
          </h3>
          
          <div className="relative w-52 h-52 flex items-center justify-center mb-8">
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle cx="104" cy="104" r="92" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="14" />
              <circle 
                cx="104" cy="104" r="92" fill="none" 
                stroke="currentColor" 
                strokeWidth="14" 
                strokeDasharray={2 * Math.PI * 92}
                strokeDashoffset={2 * Math.PI * 92 * (1 - healthScore / 100)}
                className={`${scoreColor} transition-all duration-[1.5s] ease-out`}
                strokeLinecap="round"
              />
            </svg>
            
            <div className="flex flex-col items-center justify-center relative z-10">
              <span className={`text-6xl font-black tracking-tighter ${scoreColor} mb-1`}>{healthScore}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score / 100</span>
            </div>
          </div>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed px-4 relative z-10">
            Current biometric state is <strong className={scoreColor}>{healthScore > 75 ? 'Optimal' : healthScore > 50 ? 'Stable' : 'Vulnerable'}</strong>. 
            {healthScore < 60 && " Consider extra sleep & hydration."}
          </p>
        </div>

        {/* Energy Landscape Area Chart */}
        <div className="lg:col-span-2 bg-[#5E5CE6] rounded-[3.5rem] p-10 text-white shadow-2xl shadow-indigo-500/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-125" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-200 mb-2">Energy Dynamics</h3>
                <div className="text-5xl font-black tracking-tight">{latest.energy}<span className="text-xl opacity-50 ml-1">/10</span></div>
              </div>
              <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-[10px] font-black uppercase tracking-[0.2em]">Bio-Feedback Active</div>
            </div>
            
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fff" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="energy" stroke="#fff" strokeWidth={4} fill="url(#energyFill)" strokeLinecap="round" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Micro-Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Sleep Recovery', value: `${latest.sleep} hrs`, icon: '🌙', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50/70 dark:bg-indigo-950/40' },
          { label: 'Hydration', value: `${latest.water} units`, icon: '💧', color: 'text-sky-500 dark:text-sky-400', bg: 'bg-sky-50/70 dark:bg-sky-950/40' },
          { label: 'Stress Index', value: `${latest.stress}/10`, icon: '🧠', color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-50/70 dark:bg-rose-950/40' },
          { label: 'Nutrition Mode', value: latest.foodQuality, icon: '🥗', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/70 dark:bg-emerald-950/40' }
        ].map((m, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-700/80 shadow-sm group hover:scale-[1.02] transition-all">
            <div className={`w-12 h-12 ${m.bg} ${m.color} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:rotate-12 transition-transform`}>{m.icon}</div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{m.label}</h4>
            <div className={`text-2xl font-black ${m.color} capitalize tracking-tight`}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Historical Correlation Chart */}
      <div className="bg-white dark:bg-slate-800 p-8 sm:p-12 rounded-[3.5rem] shadow-sm border border-slate-200/80 dark:border-slate-700/80">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Correlation Dynamics</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-1">Cross-referencing Sleep Recovery vs. Cognitive Stress levels.</p>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-[#5E5CE6] shadow-sm" />
              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Sleep</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Stress</span>
            </div>
          </div>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" opacity={0.3} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94A3B8', fontWeight: 700}} dy={15} />
              <YAxis hide domain={[0, 12]} />
              <Tooltip 
                cursor={{ stroke: '#5E5CE6', strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={{ borderRadius: '24px', backgroundColor: '#1E293B', border: '1px solid #334155', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', padding: '16px' }}
                itemStyle={{ fontSize: '13px', fontWeight: 800, textTransform: 'capitalize' }}
              />
              <Line 
                type="monotone" dataKey="sleep" stroke="#5E5CE6" strokeWidth={5} 
                dot={{ r: 5, fill: '#5E5CE6', strokeWidth: 3, stroke: '#fff' }} 
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
              <Line 
                type="monotone" dataKey="stress" stroke="#F43F5E" strokeWidth={5} 
                dot={{ r: 5, fill: '#F43F5E', strokeWidth: 3, stroke: '#fff' }} 
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;
