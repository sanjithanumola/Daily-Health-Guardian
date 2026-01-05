
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
        <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm border border-slate-100">
          <span className="text-4xl grayscale opacity-30">📉</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Awaiting Data</h2>
        <p className="text-slate-500 font-medium">Log your first checkup to start the analysis engine.</p>
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
  const healthScore = Math.round((latest.energy + (10 - latest.stress)) * 5);
  const scoreColor = healthScore > 75 ? 'text-emerald-500' : healthScore > 40 ? 'text-indigo-600' : 'text-rose-500';

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* Header Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Vitality Score Card */}
        <div className="lg:col-span-1 bg-white rounded-[3rem] p-10 border border-slate-200/60 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-white pointer-events-none" />
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 relative z-10">Vitality Index</h3>
          
          <div className="relative w-48 h-48 flex items-center justify-center mb-8">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="88" fill="none" stroke="#f1f5f9" strokeWidth="12" />
              <circle 
                cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="12" 
                strokeDasharray={2 * Math.PI * 88}
                strokeDashoffset={2 * Math.PI * 88 * (1 - healthScore / 100)}
                className={`${scoreColor} transition-all duration-1000 ease-out`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-black ${scoreColor}`}>{healthScore}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Optimal</span>
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium relative z-10 leading-relaxed px-4">
            Your body's current recovery state is <strong className={scoreColor}>{healthScore > 70 ? 'Strong' : 'Steady'}</strong>.
          </p>
        </div>

        {/* Energy Trend Card */}
        <div className="lg:col-span-2 bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div>
            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Energy Dynamics</h3>
                <div className="text-4xl font-bold">{latest.energy}/10 <span className="text-xs opacity-60">Peak</span></div>
              </div>
              <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">Live Tracking</div>
            </div>
            
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <Area type="monotone" dataKey="energy" stroke="#fff" strokeWidth={3} fill="rgba(255,255,255,0.15)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Sleep', value: `${latest.sleep}h`, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: '🌙' },
          { label: 'Hydration', value: `${latest.water}u`, color: 'text-sky-500', bg: 'bg-sky-50', icon: '💧' },
          { label: 'Stress', value: `${latest.stress}/10`, color: 'text-rose-500', bg: 'bg-rose-50', icon: '🧠' },
          { label: 'Nutrients', value: latest.foodQuality, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '🥗' }
        ].map((m, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm hover:translate-y-[-4px] transition-all">
            <div className={`w-12 h-12 ${m.bg} ${m.color} rounded-2xl flex items-center justify-center text-xl mb-6`}>{m.icon}</div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</h4>
            <div className={`text-2xl font-black ${m.color} capitalize`}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Analytics Chart Section */}
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200/60">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Habit Correlation</h3>
            <p className="text-xs text-slate-500 font-medium">Tracking stress vs sleep quality over time.</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-600" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sleep</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stress</span></div>
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} />
              <YAxis hide domain={[0, 12]} />
              <Tooltip 
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', padding: '16px' }}
                itemStyle={{ fontSize: '12px', fontWeight: 800 }}
              />
              <Line type="monotone" dataKey="sleep" stroke="#4f46e5" strokeWidth={4} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} />
              <Line type="monotone" dataKey="stress" stroke="#f43f5e" strokeWidth={4} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;
