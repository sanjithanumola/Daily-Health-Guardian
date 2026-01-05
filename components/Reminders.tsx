
import React, { useState } from 'react';
import { Reminder } from '../types';

interface Props {
  reminders: Reminder[];
  onAdd: (reminder: Reminder) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const Reminders: React.FC<Props> = ({ reminders, onAdd, onToggle, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    type: 'medicine',
    label: '',
    time: '08:00',
    repeat: 'daily'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminder.label || !newReminder.time) return;

    onAdd({
      id: Date.now().toString(),
      type: newReminder.type as any,
      label: newReminder.label,
      time: newReminder.time,
      repeat: newReminder.repeat as any,
      active: true
    });
    setIsAdding(false);
    setNewReminder({ type: 'medicine', label: '', time: '08:00', repeat: 'daily' });
  };

  const templates = [
    { label: 'Morning Vitamins', type: 'medicine', time: '08:00', repeat: 'daily' },
    { label: 'Daily Health Check', type: 'checkup', time: '20:00', repeat: 'daily' },
    { label: 'Weekly Stats Review', type: 'checkup', time: '10:00', repeat: 'once' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Schedules</h2>
          <p className="text-slate-500 font-bold italic mt-1">Consistency is the foundation of wellness.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-6 py-3 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
        >
          + Add Reminder
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-indigo-100 animate-in zoom-in duration-300">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Create New Schedule</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Type</label>
                <div className="flex gap-2">
                  {['medicine', 'checkup'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewReminder({...newReminder, type: t as any})}
                      className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${newReminder.type === t ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reminder Label</label>
                <input 
                  type="text"
                  placeholder="e.g. Vitamin C, Sleep Review"
                  value={newReminder.label}
                  onChange={e => setNewReminder({...newReminder, label: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alert Time</label>
                <input 
                  type="time"
                  value={newReminder.time}
                  onChange={e => setNewReminder({...newReminder, time: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-black text-indigo-600 text-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequency</label>
                <select 
                  value={newReminder.repeat}
                  onChange={e => setNewReminder({...newReminder, repeat: e.target.value as any})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-600 appearance-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekends">Weekends</option>
                  <option value="once">One Time</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button 
                type="submit"
                className="flex-1 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
              >
                Save Schedule
              </button>
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-8 py-4 bg-slate-100 text-slate-500 font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {reminders.length === 0 && !isAdding ? (
        <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">⏰</div>
          <h3 className="text-xl font-black text-slate-800 mb-2">No Active Schedules</h3>
          <p className="text-slate-400 font-medium mb-8">Set reminders to stay on top of your health habits.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {templates.map((tmp, i) => (
              <button 
                key={i}
                onClick={() => onAdd({ id: Date.now().toString() + i, active: true, ...tmp } as any)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all"
              >
                + {tmp.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {reminders.map(rem => (
            <div key={rem.id} className={`p-6 rounded-[2rem] border transition-all flex items-center justify-between group ${rem.active ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-transparent opacity-60'}`}>
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner ${rem.type === 'medicine' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                  {rem.type === 'medicine' ? '💊' : '📝'}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 leading-tight">{rem.label}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-indigo-600 font-black text-sm">{rem.time}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rem.repeat}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onToggle(rem.id)}
                  className={`w-12 h-6 rounded-full relative transition-all ${rem.active ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${rem.active ? 'right-1' : 'left-1'}`} />
                </button>
                <button 
                  onClick={() => onDelete(rem.id)}
                  className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-indigo-900/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6">
        <div className="text-3xl">🔔</div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-black text-slate-800 uppercase tracking-tight text-sm mb-1">Stay Informed</h4>
          <p className="text-slate-500 text-xs font-medium leading-relaxed">Your Guardian monitors your schedule in real-time. Make sure to keep this app open in a background tab to receive visual alerts for your scheduled health tasks.</p>
        </div>
      </div>
    </div>
  );
};

export default Reminders;
