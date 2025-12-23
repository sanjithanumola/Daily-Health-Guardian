
import React, { useState, useEffect } from 'react';
import { HealthEntry } from '../types';

interface Props {
  history: HealthEntry[];
}

const SqlEditor: React.FC<Props> = ({ history }) => {
  const [query, setQuery] = useState('SELECT * FROM health_history WHERE sleep < 7 ORDER BY timestamp DESC');
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const runQuery = () => {
    setError(null);
    try {
      const q = query.toUpperCase();
      let data = [...history];

      // Extremely simple pseudo-SQL parser for demonstration
      // 1. Filter (WHERE)
      if (q.includes('WHERE')) {
        const whereClause = query.split(/WHERE/i)[1].split(/ORDER BY/i)[0].trim();
        // Support simple conditions like 'sleep < 7' or 'stress > 5'
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
      if (q.includes('ORDER BY')) {
        const orderClause = query.split(/ORDER BY/i)[1].split(/LIMIT/i)[0].trim();
        const parts = orderClause.split(/\s+/);
        const field = parts[0].toLowerCase() as keyof HealthEntry;
        const direction = parts[1] === 'DESC' ? -1 : 1;
        
        data.sort((a, b) => {
          const valA = a[field];
          const valB = b[field];
          if (valA < valB) return -1 * direction;
          if (valA > valB) return 1 * direction;
          return 0;
        });
      }

      // 3. Limit
      if (q.includes('LIMIT')) {
        const limit = parseInt(query.split(/LIMIT/i)[1].trim());
        if (!isNaN(limit)) {
          data = data.slice(0, limit);
        }
      }

      setResults(data);
    } catch (err) {
      setError("SQL Syntax Error: Simple parser supports 'WHERE field < value', 'ORDER BY field DESC', and 'LIMIT count'.");
    }
  };

  useEffect(() => {
    runQuery();
  }, [history]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-900 mb-2">Data Lab</h2>
        <p className="text-slate-500 font-bold italic">Query your health patterns using SQL syntax.</p>
      </div>

      <div className="bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-800">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/50 border-b border-slate-800">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">query_editor.sql</span>
          <button 
            onClick={runQuery}
            className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Run Query
          </button>
        </div>
        <textarea 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          spellCheck={false}
          className="w-full h-40 bg-transparent text-indigo-300 font-mono p-8 outline-none resize-none text-sm leading-relaxed"
        />
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold">
          {error}
        </div>
      )}

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-8 py-4 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Results: {results.length} rows</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-4">Timestamp</th>
                <th className="px-4 py-4">Sleep</th>
                <th className="px-4 py-4">Water</th>
                <th className="px-4 py-4">Stress</th>
                <th className="px-4 py-4">Energy</th>
                <th className="px-4 py-4">Discomfort</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {results.length > 0 ? results.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-4 text-slate-500 font-mono text-xs">{new Date(row.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-4 font-bold text-slate-700">{row.sleep}h</td>
                  <td className="px-4 py-4 text-slate-700">{row.water}u</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${row.stress > 7 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                      {row.stress}/10
                    </span>
                  </td>
                  <td className="px-4 py-4 font-bold text-emerald-600">{row.energy}/10</td>
                  <td className="px-4 py-4 text-slate-400 italic">{row.discomfort || "None"}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold">No results found for this query.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SqlEditor;
