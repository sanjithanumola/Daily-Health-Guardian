import React, { useState } from 'react';
import { Reminder } from '../types';
import { soundService } from '../services/soundService';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Plus, 
  Trash2, 
  Play, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Pill, 
  ClipboardCheck,
  Sparkles
} from 'lucide-react';

interface Props {
  reminders: Reminder[];
  onAdd: (reminder: Reminder) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onTriggerTestAlert?: (reminder: Reminder) => void;
}

// Convert HH:mm 24h format to 12h object
export const parseTimeTo12H = (time24: string) => {
  if (!time24 || !time24.includes(':')) {
    return { hour12: '08', minute: '00', period: 'AM' };
  }
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr.padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const hour12 = h.toString().padStart(2, '0');
  return { hour12, minute: m, period };
};

// Convert 12h components back to HH:mm 24h
export const format12HTo24H = (hour12: string, minute: string, period: string) => {
  let h = parseInt(hour12, 10);
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
};

// Format HH:mm for clean display with AM/PM
export const formatDisplayTime = (time24: string) => {
  const { hour12, minute, period } = parseTimeTo12H(time24);
  return {
    time: `${hour12}:${minute}`,
    period
  };
};

const Reminders: React.FC<Props> = ({ 
  reminders, 
  onAdd, 
  onToggle, 
  onDelete,
  onTriggerTestAlert
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [soundMuted, setSoundMuted] = useState(soundService.isSoundMuted());
  const [selectedTone, setSelectedTone] = useState<'chime' | 'gentle' | 'bell' | 'pulse'>('chime');
  
  // 12-Hour Form States
  const [formType, setFormType] = useState<'medicine' | 'checkup'>('medicine');
  const [formLabel, setFormLabel] = useState('');
  const [formHour, setFormHour] = useState('08');
  const [formMinute, setFormMinute] = useState('00');
  const [formPeriod, setFormPeriod] = useState<'AM' | 'PM'>('AM');
  const [formRepeat, setFormRepeat] = useState<'daily' | 'weekdays' | 'weekends' | 'once'>('daily');

  const handleToggleSound = () => {
    const nextState = !soundMuted;
    setSoundMuted(nextState);
    soundService.setSoundMuted(nextState);
    if (!nextState) {
      soundService.playAlertTone(selectedTone);
    }
  };

  const handlePlayTonePreview = (tone: 'chime' | 'gentle' | 'bell' | 'pulse') => {
    setSelectedTone(tone);
    soundService.playAlertTone(tone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLabel.trim()) return;

    const time24 = format12HTo24H(formHour, formMinute, formPeriod);

    onAdd({
      id: Date.now().toString(),
      type: formType,
      label: formLabel.trim(),
      time: time24,
      repeat: formRepeat,
      active: true
    });

    // Play confirmation chime
    soundService.playAlertTone('gentle');

    setIsAdding(false);
    setFormLabel('');
    setFormHour('08');
    setFormMinute('00');
    setFormPeriod('AM');
    setFormRepeat('daily');
  };

  const templates = [
    { label: 'Morning Vitamins & Water', type: 'medicine' as const, time: '08:00', repeat: 'daily' as const },
    { label: 'Afternoon Hydration & Walk', type: 'checkup' as const, time: '14:00', repeat: 'weekdays' as const },
    { label: 'Night Health Reflection', type: 'checkup' as const, time: '21:30', repeat: 'daily' as const },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-[#5E5CE6] dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100/50 dark:border-indigo-800/40">
              Active Audio Monitoring
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
            Alerts & Schedules
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">
            Real-time audio chimes and visual notifications for medications & routines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSound}
            title={soundMuted ? "Unmute Alert Sounds" : "Mute Alert Sounds"}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${
              !soundMuted 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40 shadow-sm' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            {!soundMuted ? <Volume2 size={16} className="text-emerald-600 dark:text-emerald-400 animate-pulse" /> : <VolumeX size={16} />}
            <span>{!soundMuted ? 'Sound ON' : 'Muted'}</span>
          </button>

          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#5E5CE6] text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Plus size={16} />
            <span>New Alert</span>
          </button>
        </div>
      </div>

      {/* Audio Tone & Alert Test Center */}
      <div className="bg-white dark:bg-slate-800/90 rounded-[2.5rem] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#5E5CE6] dark:text-indigo-400" />
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Alert Tone System
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Choose your alert chime tone and test the live notification system.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['chime', 'gentle', 'bell', 'pulse'] as const).map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => handlePlayTonePreview(tone)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border ${
                  selectedTone === tone
                    ? 'bg-[#5E5CE6] text-white border-[#5E5CE6] shadow-md shadow-indigo-500/20'
                    : 'bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
              >
                <Play size={12} className="fill-current" />
                <span className="capitalize">{tone}</span>
              </button>
            ))}

            {onTriggerTestAlert && reminders.length > 0 && (
              <button
                onClick={() => onTriggerTestAlert(reminders[0])}
                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-[#5E5CE6] dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all flex items-center gap-1.5"
              >
                <Bell size={13} />
                <span>Test Alert Now</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Creation Modal / Form */}
      {isAdding && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-indigo-100 dark:border-slate-700 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Create Scheduled Alert
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Set a 12-Hour AM/PM time with your desired recurrence.
              </p>
            </div>
            <button
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-black"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Category Type */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Alert Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType('medicine')}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider border transition-all ${
                      formType === 'medicine'
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-600 dark:text-rose-400 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    <Pill size={16} />
                    <span>Medicine</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('checkup')}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider border transition-all ${
                      formType === 'checkup'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    <ClipboardCheck size={16} />
                    <span>Habit / Log</span>
                  </button>
                </div>
              </div>

              {/* Label */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Reminder Title
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Morning Vitamin D, Drink Water, Sleep Log..."
                  value={formLabel}
                  onChange={e => setFormLabel(e.target.value)}
                  className="w-full px-6 py-4.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-[#5E5CE6] font-bold text-slate-800 dark:text-slate-100 text-base shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              {/* 12-Hour AM / PM Time Selector */}
              <div className="space-y-2 md:col-span-2 bg-slate-50/80 dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock size={14} className="text-[#5E5CE6]" />
                    <span>Select Time (12-Hour AM / PM)</span>
                  </label>
                  <span className="text-xs font-black text-[#5E5CE6] bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-200/60 dark:border-indigo-800/40">
                    Preview: {formHour}:{formMinute} {formPeriod}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Hour */}
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase mb-1">Hour</span>
                    <select
                      value={formHour}
                      onChange={(e) => setFormHour(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-slate-800 dark:text-slate-100 text-lg outline-none focus:ring-2 focus:ring-[#5E5CE6]"
                    >
                      {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Minute */}
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase mb-1">Minute</span>
                    <select
                      value={formMinute}
                      onChange={(e) => setFormMinute(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-slate-800 dark:text-slate-100 text-lg outline-none focus:ring-2 focus:ring-[#5E5CE6]"
                    >
                      {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* AM / PM Toggle */}
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase mb-1">Period (AM / PM)</span>
                    <div className="grid grid-cols-2 gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setFormPeriod('AM')}
                        className={`py-2 text-xs font-black uppercase rounded-lg transition-all ${
                          formPeriod === 'AM'
                            ? 'bg-[#5E5CE6] text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormPeriod('PM')}
                        className={`py-2 text-xs font-black uppercase rounded-lg transition-all ${
                          formPeriod === 'PM'
                            ? 'bg-[#5E5CE6] text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                      >
                        PM
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#5E5CE6]" />
                  <span>Repeat Schedule</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'daily', label: 'Daily' },
                    { id: 'weekdays', label: 'Weekdays' },
                    { id: 'weekends', label: 'Weekends' },
                    { id: 'once', label: 'One Time' },
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFormRepeat(f.id as any)}
                      className={`py-3 px-3 rounded-2xl text-xs font-black uppercase tracking-wider border transition-all ${
                        formRepeat === f.id
                          ? 'bg-[#5E5CE6] text-white border-[#5E5CE6] shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="submit"
                className="flex-1 py-4 bg-[#5E5CE6] text-white font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} />
                <span>Save Alert Schedule</span>
              </button>
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-6 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Schedules List */}
      {reminders.length === 0 && !isAdding ? (
        <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-12 sm:p-16 text-center border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/60 text-[#5E5CE6] dark:text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">
            <Bell size={36} />
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">
            No Active Schedules
          </h3>
          <p className="text-slate-400 dark:text-slate-400 text-sm font-medium mb-8 max-w-md mx-auto">
            Set custom reminders with AM/PM timing to receive real-time audio alerts and habit prompts.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {templates.map((tmp, i) => (
              <button 
                key={i}
                onClick={() => {
                  onAdd({ id: Date.now().toString() + i, active: true, ...tmp });
                  soundService.playAlertTone('gentle');
                }}
                className="px-5 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-2xl hover:border-[#5E5CE6] hover:text-[#5E5CE6] dark:hover:text-indigo-400 transition-all flex items-center gap-2"
              >
                <span>+</span>
                <span>{tmp.label}</span>
                <span className="text-[10px] text-slate-400">({parseTimeTo12H(tmp.time).hour12}:{parseTimeTo12H(tmp.time).minute} {parseTimeTo12H(tmp.time).period})</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {reminders.map(rem => {
            const timeObj = formatDisplayTime(rem.time);
            return (
              <div 
                key={rem.id} 
                className={`p-6 rounded-[2.2rem] border transition-all flex items-center justify-between group ${
                  rem.active 
                    ? 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700/80 shadow-sm' 
                    : 'bg-slate-50 dark:bg-slate-900/40 border-transparent opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-inner ${
                    rem.type === 'medicine' 
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400' 
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400'
                  }`}>
                    {rem.type === 'medicine' ? <Pill size={24} /> : <ClipboardCheck size={24} />}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-slate-100 leading-snug">
                      {rem.label}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <div className="flex items-baseline gap-1 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-lg border border-indigo-100/60 dark:border-indigo-800/40">
                        <span className="text-[#5E5CE6] dark:text-indigo-400 font-black text-sm">{timeObj.time}</span>
                        <span className="text-[10px] font-black text-[#5E5CE6] dark:text-indigo-400">{timeObj.period}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {rem.repeat}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      onToggle(rem.id);
                      soundService.playAlertTone('pulse');
                    }}
                    title={rem.active ? "Pause Alert" : "Activate Alert"}
                    className={`w-12 h-7 rounded-full relative transition-all p-0.5 ${
                      rem.active ? 'bg-[#5E5CE6]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-all ${
                      rem.active ? 'ml-auto' : 'mr-auto'
                    }`} />
                  </button>

                  <button 
                    onClick={() => onDelete(rem.id)}
                    title="Delete Reminder"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Real-time Background Alert Info Footer */}
      <div className="bg-indigo-900/5 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-800/30 p-6 sm:p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6">
        <div className="w-12 h-12 bg-[#5E5CE6] text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md">
          <Bell size={24} className="animate-bounce" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight text-sm mb-1">
            Real-Time Audio & Visual Guardian
          </h4>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed">
            Your Health Guardian monitors active schedules in real-time every minute. Keep the tab open to receive audible synthesized chimes and interactive alert banners right on schedule.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reminders;
