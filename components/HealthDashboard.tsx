
import React from 'react';
import { HealthEntry } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Props {
  history: HealthEntry[];
}

const HealthDashboard: React.FC<Props> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800">No History Yet</h3>
        <p className="text-slate-500">Complete your first Daily Checkup to start seeing trends.</p>
      </div>
    );
  }

  const chartData = [...history].reverse().map(h => ({
    ...h,
    date: new Date(h.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
  }));

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Health Dashboard</h2>
          <p className="text-slate-500">Visualizing your progress over the last {history.length} checkups.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Sleep History</h3>
            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">Hours</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Area type="monotone" dataKey="sleep" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSleep)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Energy vs Stress</h3>
            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">Scale 1-10</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Line type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} />
                <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={3} dot={{r: 4, fill: '#ef4444'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-4 justify-center">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <div className="w-3 h-3 rounded-full bg-emerald-500" /> Energy
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <div className="w-3 h-3 rounded-full bg-rose-500" /> Stress
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-6">Recent Checkups</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="pb-4">Date</th>
                <th className="pb-4">Sleep</th>
                <th className="pb-4">Energy</th>
                <th className="pb-4">Stress</th>
                <th className="pb-4">Discomfort</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={h.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-4 text-sm text-slate-600 font-medium">
                    {new Date(h.timestamp).toLocaleDateString()}
                  </td>
                  <td className="py-4 text-sm text-slate-600">{h.sleep}h</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${h.energy > 7 ? 'bg-green-50 text-green-700' : h.energy > 4 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                      {h.energy}/10
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${h.stress < 4 ? 'bg-green-50 text-green-700' : h.stress < 7 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                      {h.stress}/10
                    </span>
                  </td>
                  <td className="py-4 text-sm text-slate-400 truncate max-w-[150px]">
                    {h.discomfort || "None"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;
