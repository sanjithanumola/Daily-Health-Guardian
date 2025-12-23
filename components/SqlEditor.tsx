
import React, { useState, useEffect } from 'react';
import { HealthEntry } from '../types';

interface Props {
  history: HealthEntry[];
}

const SqlEditor: React.FC<Props> = ({ history }) => {
  const [query, setQuery] = useState('SELECT * FROM health_history WHERE sleep < 7 ORDER BY timestamp DESC');
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const queryTemplates = [
    { label: 'Insomnia Analysis', query: 'SELECT * FROM health_history WHERE sleep < 6 ORDER BY sleep ASC' },
    { label: 'High Stress Days', query: 'SELECT * FROM health_history WHERE stress > 7 ORDER BY timestamp DESC' },
    { label: 'Low Energy Events', query: 'SELECT * FROM health_history WHERE energy < 4 ORDER BY energy ASC' },
    { label: 'Hydration Check', query: 'SELECT * FROM health_history WHERE water < 5 LIMIT 10' },
  ];

  const runQuery = () => {
    setError(null);
    try {
      const q = query.trim();
      const upperQ = q.toUpperCase();
      let data = [...history];

      // Pseudo-SQL parser
      // 1. Filter (WHERE)
      if (upperQ.includes('WHERE')) {
        const whereClause = q.split(/WHERE/i)[1].split(/ORDER BY/i)[0].split(/LIMIT/i)[0].trim();
        const parts = whereClause.split(/\s+/);
        if (parts.length >= 3) {
          const field = parts[0].toLowerCase() as keyof HealthEntry;
          const operator = parts[1];
          const value = parseFloat(parts[2]);

          data = data.filter(item => {
            const itemVal = item[field];
            if (typeof itemVal !== 'number') return true;
            if (operator === '<') return itemVal < value;
            if (operator === '>') return itemVal > value;
            if (operator === '=') return itemVal === value;
            if (operator === '<=') return itemVal <= value;
            if (operator === '>=') return itemVal >= value;
            return true;
          });
        }
      }

      // 2. Sort (ORDER BY)
      if (upperQ.includes('ORDER BY')) {
        const orderClause = q.split(/ORDER BY/i)[1].split(/LIMIT/i)[0].trim();
        const parts = orderClause.split(/\s+/);
        const field = parts[0].toLowerCase() as keyof HealthEntry;
        const direction = parts[1]?.toUpperCase() === 'DESC' ? -1 : 1;
        
        data.sort((a, b) => {
          const valA = a[field] ?? 0;
          const valB = b[field] ?? 0;
          if (valA < valB) return -1 * direction;
          if (valA > valB) return 1 * direction;
          return 0;
        });
      }

      // 3. Limit
      if (upperQ.includes('LIMIT')) {
        const limitPart = q.split(/LIMIT/i)[1].trim();
        const limit = parseInt(limitPart);
        if (!isNaN(limit)) {
          data = data.slice(0, limit);
        }
      }

      setResults(data);
    } catch (err) {
      setError("SQL Engine Error: Check your syntax. Currently supports basic WHERE, ORDER BY, and LIMIT.");
    }
  };

  const exportCsv = () => {
    if (results.length === 0) return;
    const headers = Object.keys(results[0]).join(',');
    const rows = results.map(r => Object.values(r).join(',')).join('\n');
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `health_query_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    runQuery();
  }, [history]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Data Lab</h2>
          <p className="text-slate-500 font-bold italic mt-1">Unlock hidden health patterns with custom SQL queries.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {queryTemplates.map((tmp, idx) => (
            <button 
              key={idx}
              onClick={() => setQuery(tmp.query)}
              className="whitespace-nowrap px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
            >
              {tmp.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800 flex flex-col h-[400px]">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/50 border-b border-slate-800 shrink-0">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Console v1.0</span>
            </div>
            <textarea 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full bg-transparent text-emerald-400 font-mono p-6 outline-none resize-none text-xs leading-relaxed"
            />
            <div className="p-4 bg-slate-800/30 border-t border-slate-800 flex gap-2">
              <button 
                onClick={runQuery}
                className="flex-1 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition-all active:scale-[0.98] shadow-lg shadow-indigo-900/20"
              >
                Execute
              </button>
              <button 
                onClick={exportCsv}
                disabled={results.length === 0}
                className="px-4 py-3 bg-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-600 transition-all disabled:opacity-30"
                title="Export to CSV"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">Syntax Tips</h4>
            <ul className="space-y-2 text-[11px] text-indigo-900/70 font-bold">
              <li className="flex items-center gap-2">
                <span className="text-indigo-400">●</span> Use <code className="bg-white px-1 rounded">sleep</code>, <code className="bg-white px-1 rounded">stress</code>, <code className="bg-white px-1 rounded">water</code>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-400">●</span> Compare with <code className="bg-white px-1 rounded">&lt;</code>, <code className="bg-white px-1 rounded">&gt;</code>, <code className="bg-white px-1 rounded">=</code>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-400">●</span> Sort using <code className="bg-white px-1 rounded">ORDER BY field DESC</code>
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          {error ? (
            <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500 mb-4 text-2xl">⚠️</div>
              <h3 className="text-rose-900 font-black uppercase tracking-widest text-xs mb-2">Query Execution Failed</h3>
              <p className="text-rose-700 font-medium text-sm">{error}</p>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full min-h-[500px]">
              <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Query Results ({results.length})</h3>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                </div>
              </div>
              <div className="overflow-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest sticky top-0 backdrop-blur-md">
                      <th className="px-8 py-4">Observed On</th>
                      <th className="px-4 py-4">Sleep</th>
                      <th className="px-4 py-4">Hydration</th>
                      <th className="px-4 py-4">Stress Index</th>
                      <th className="px-4 py-4">Energy</th>
                      <th className="px-8 py-4">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {results.length > 0 ? results.map((row) => (
                      <tr key={row.id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-8 py-5 text-slate-500 font-mono text-[11px]">
                          {new Date(row.timestamp).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-5 font-black text-slate-800 text-base">{row.sleep}<span className="text-[10px] text-slate-300 ml-1">h</span></td>
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-400" />
                            <span className="font-bold text-slate-700">{row.water}u</span>
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <div className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter ${row.stress > 7 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                            {row.stress}/10 {row.stress > 7 ? 'High' : 'Normal'}
                          </div>
                        </td>
                        <td className="px-4 py-5 font-black text-emerald-600">{row.energy}/10</td>
                        <td className="px-8 py-5 text-slate-400 italic text-[11px] truncate max-w-[150px]">
                          {row.discomfort || "No symptoms"}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="px-8 py-32 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </div>
                            <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No matching datasets</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SqlEditor;
