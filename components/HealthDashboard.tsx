
import React, { useMemo } from 'react';
import { HealthEntry } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Props {
  history: HealthEntry[];
}

const HealthDashboard: React.FC<Props> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="max-w-md mx-auto py-32 text-center animate-in fade-in duration-1000">
        <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-sm border border-slate-100">
          <span className="text-5xl grayscale opacity-30">📉</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Awaiting Bio-Data</h2>
        <p className="text-slate-500 font-medium leading-relaxed">Log your daily checkup habits to initialize the intelligence analysis engine.</p>
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

  const scoreColor = healthScore > 80 ? 'text-emerald-500' : healthScore > 50 ? 'text-indigo-600' : 'text-rose-500';
  const glowClass = healthScore > 80 ? 'vitality-glow text-emerald-500' : healthScore > 50 ? 'vitality-glow text-indigo-500' : 'vitality-glow text-rose-500';

  return (
    <div className="space-y-8 pb-10">
      {/* Premium Header Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Vitality Hub Card */}
        <div className="lg:col-span-1 bg-white rounded-[3.5rem] p-10 border border-slate-200/60 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/30 to-white/0 pointer-events-none" />
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-12 relative z-10">Vitality Index</h3>
          
          <div className="relative w-52 h-52 flex items-center justify-center mb-10">
            {/* Background Ring */}
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle cx="104" cy="104" r="92" fill="none" stroke="#F1F5F9" strokeWidth="14" />
              {/* Dynamic Progress Ring */}
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
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Optimized</span>
            </div>
          </div>
          
          <p className="text-slate-500 text-sm font-medium leading-relaxed px-4 relative z-10">
            Your body's current regenerative state is <strong className={scoreColor}>{healthScore > 75 ? 'Optimal' : healthScore > 50 ? 'Stable' : 'Vulnerable'}</strong>. 
            {healthScore < 60 && " Prioritize rest."}
          </p>
        </div>

        {/* Energy Landscape Area Chart */}
        <div className="lg:col-span-2 bg-indigo-700 rounded-[3.5rem] p-10 text-white shadow-2xl shadow-indigo-200/40 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-125" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] opacity-60 mb-2">Energy Dynamics</h3>
                <div className="text-5xl font-black tracking-tight">{latest.energy}<span className="text-xl opacity-40 ml-1">/10</span></div>
              </div>
              <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-[10px] font-black uppercase tracking-[0.2em]">Bio-Feedback Active</div>
            </div>
            
            <div className="h-44 w-full">
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
          { label: 'Sleep Phase', value: `${latest.sleep}h`, icon: '🌙', color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
          { label: 'Hydration', value: `${latest.water}u`, icon: '💧', color: 'text-sky-500', bg: 'bg-sky-50/50' },
          { label: 'Stress Load', value: `${latest.stress}/10`, icon: '🧠', color: 'text-rose-500', bg: 'bg-rose-50/50' },
          { label: 'Nutrition', value: latest.foodQuality, icon: '🥗', color: 'text-emerald-600', bg: 'bg-emerald-50/50' }
        ].map((m, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200/50 shadow-sm group hover:scale-[1.02] transition-all">
            <div className={`w-12 h-12 ${m.bg} ${m.color} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:rotate-12 transition-transform`}>{m.icon}</div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{m.label}</h4>
            <div className={`text-2xl font-black ${m.color} capitalize tracking-tight`}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Historical Correlation Chart */}
      <div className="bg-white p-10 md:p-12 rounded-[3.5rem] shadow-sm border border-slate-200/60">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-16">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Correlation Analysis</h3>
            <p className="text-[13px] text-slate-500 font-medium mt-1">Cross-referencing Sleep Recovery vs. Cognitive Stress.</p>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-sm" />
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sleep</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Stress</span>
            </div>
          </div>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94A3B8', fontWeight: 700}} dy={15} />
              <YAxis hide domain={[0, 12]} />
              <Tooltip 
                cursor={{ stroke: '#F1F5F9', strokeWidth: 2 }}
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '16px' }}
                itemStyle={{ fontSize: '13px', fontWeight: 800, textTransform: 'capitalize' }}
              />
              <Line 
                type="monotone" dataKey="sleep" stroke="#4F46E5" strokeWidth={5} 
                dot={{ r: 5, fill: '#4F46E5', strokeWidth: 3, stroke: '#fff' }} 
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
