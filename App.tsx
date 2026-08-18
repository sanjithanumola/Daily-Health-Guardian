import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppTab, HealthEntry, User, Reminder } from './types';
import { 
  Activity, 
  MessageSquare, 
  Thermometer, 
  Camera, 
  Bell, 
  BookOpen,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  X,
  CheckCircle,
  Clock,
  Pill,
  ClipboardCheck,
  Sparkles
} from 'lucide-react';
import DailyCheckup from './components/DailyCheckup';
import MedicineScanner from './components/MedicineScanner';
import HealthDashboard from './components/HealthDashboard';
import SymptomHelper from './components/SymptomHelper';
import Reminders, { formatDisplayTime } from './components/Reminders';
import AIGuardianChat from './components/AIGuardianChat';
import Auth from './components/Auth';
import { supabase, db } from './services/supabase';
import { soundService } from './services/soundService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.CHECKUP);
  const [history, setHistory] = useState<HealthEntry[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('health_guardian_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Active Live Alert Banner State
  const [activeAlert, setActiveAlert] = useState<Reminder | null>(null);
  const lastTriggeredRef = useRef<Record<string, string>>({}); // { [reminderId]: 'YYYY-MM-DD HH:mm' }

  // Sync theme with DOM
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('health_guardian_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('health_guardian_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Request browser notifications if supported
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  // Background Alert Monitoring Ticker (Every 5 seconds)
  useEffect(() => {
    const checkAlerts = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${hours}:${minutes}`;
      const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
      const todayDateStr = now.toISOString().split('T')[0];
      const triggerKey = `${todayDateStr} ${currentTimeStr}`;

      reminders.forEach((rem) => {
        if (!rem.active) return;
        if (rem.time !== currentTimeStr) return;

        // Check frequency
        if (rem.repeat === 'weekdays' && (dayOfWeek === 0 || dayOfWeek === 6)) return;
        if (rem.repeat === 'weekends' && dayOfWeek !== 0 && dayOfWeek !== 6) return;

        // Avoid firing multiple times in the same minute
        if (lastTriggeredRef.current[rem.id] === triggerKey) return;

        // Trigger Alert!
        lastTriggeredRef.current[rem.id] = triggerKey;
        triggerLiveAlert(rem);
      });
    };

    const intervalId = setInterval(checkAlerts, 5000);
    return () => clearInterval(intervalId);
  }, [reminders]);

  const triggerLiveAlert = (rem: Reminder) => {
    // 1. Play alert chime sound
    soundService.playAlertTone('chime');

    // 2. Set active in-app modal / alert banner
    setActiveAlert(rem);

    // 3. Fire OS Notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const timeObj = formatDisplayTime(rem.time);
        new Notification(`⏰ Health Guardian Alert: ${rem.label}`, {
          body: `Scheduled at ${timeObj.time} ${timeObj.period} - Click to open Guardian.`,
          icon: '/favicon.svg'
        });
      } catch (e) {
        console.warn("Notification error:", e);
      }
    }
  };

  const handleDismissAlert = () => {
    setActiveAlert(null);
  };

  const handleSnoozeAlert = () => {
    if (!activeAlert) return;
    // Snooze by 5 minutes: create temporary trigger in 5 minutes
    const now = new Date(Date.now() + 5 * 60 * 1000);
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const snoozedTime = `${hours}:${minutes}`;

    const snoozedReminder: Reminder = {
      ...activeAlert,
      id: `snooze_${Date.now()}`,
      time: snoozedTime,
      label: `[Snoozed] ${activeAlert.label}`,
      repeat: 'once',
      active: true
    };

    setReminders(prev => [...prev, snoozedReminder]);
    setActiveAlert(null);
    soundService.playAlertTone('pulse');
  };

  // Atomic State Logout: Prevents "IP Not Found" DNS errors by resetting React memory
  const handleLogout = useCallback(async () => {
    if (supabase) {
      try { await supabase.auth.signOut(); } catch (e) { console.warn(e); }
    }
    localStorage.removeItem('health_guardian_mock_user');
    localStorage.removeItem('health_guardian_offline_mode');
    setUser(null);
    setHistory([]);
    setReminders([]);
    setIsOfflineMode(false);
    setActiveTab(AppTab.CHECKUP);
  }, []);

  useEffect(() => {
    if (user && !isOfflineMode) {
      const syncData = async () => {
        setIsSyncing(true);
        try {
          const cloudEntries = await db.getEntries();
          if (cloudEntries) {
            setHistory(cloudEntries);
            localStorage.setItem('health_guardian_history', JSON.stringify(cloudEntries));
          }
          const cloudReminders = await db.getReminders();
          if (cloudReminders) {
            setReminders(cloudReminders);
            localStorage.setItem('health_guardian_reminders', JSON.stringify(cloudReminders));
          }
        } catch (e) { console.error(e); } finally { setIsSyncing(false); }
      };
      syncData();
    }
  }, [user, isOfflineMode]);

  useEffect(() => {
    const recoverSession = async () => {
      const safetyTimeout = setTimeout(() => setIsAuthLoading(false), 2000);
      try {
        if (supabase) {
          // Listen for auth changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
              setUser({
                email: session.user.email || '',
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
              });
              setIsOfflineMode(false);
            } else {
              const offline = localStorage.getItem('health_guardian_offline_mode');
              const localUser = localStorage.getItem('health_guardian_mock_user');
              if (offline === 'true' && localUser) {
                setUser(JSON.parse(localUser));
                setIsOfflineMode(true);
              } else {
                setUser(null);
              }
            }
            setIsAuthLoading(false);
            clearTimeout(safetyTimeout);
          });

          return () => subscription.unsubscribe();
        }
      } catch (err) { 
        console.error(err); 
        setIsAuthLoading(false);
        clearTimeout(safetyTimeout);
      }
    };
    recoverSession();
  }, []);

  useEffect(() => {
    const cachedHistory = localStorage.getItem('health_guardian_history');
    if (cachedHistory) try { setHistory(JSON.parse(cachedHistory)); } catch(e) {}
    const cachedReminders = localStorage.getItem('health_guardian_reminders');
    if (cachedReminders) try { setReminders(JSON.parse(cachedReminders)); } catch(e) {}
  }, []);

  const addToHistory = async (entry: HealthEntry) => {
    const newHistory = [entry, ...history].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem('health_guardian_history', JSON.stringify(newHistory));
    if (user && !isOfflineMode) {
      try { await db.saveEntry(entry); } catch (e) { console.warn(e); }
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-[#5E5CE6] rounded-2xl flex items-center justify-center text-white font-black text-2xl animate-bounce shadow-2xl shadow-indigo-500/30">
            G
          </div>
          <p className="text-[#5E5CE6] dark:text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">
            Bio-Metric Sync
          </p>
        </div>
      </div>
    );
  }

  if (!user && !isOfflineMode) {
    return (
      <Auth 
        onLogin={(u) => { setUser(u); localStorage.setItem('health_guardian_mock_user', JSON.stringify(u)); }} 
        onGuestMode={() => {
          setIsOfflineMode(true);
          localStorage.setItem('health_guardian_offline_mode', 'true');
          setUser({ email: 'guest@guardian.ai', name: 'Guest Explorer' });
        }} 
      />
    );
  }

  const navItems = [
    { id: AppTab.CHECKUP, label: 'Journal', icon: <BookOpen size={19} /> },
    { id: AppTab.DASHBOARD, label: 'Vitality', icon: <Activity size={19} /> },
    { id: AppTab.CONSULT, label: 'Consult', icon: <MessageSquare size={19} /> },
    { id: AppTab.SYMPTOMS, label: 'Helper', icon: <Thermometer size={19} /> },
    { id: AppTab.MEDICINE, label: 'Scanner', icon: <Camera size={19} /> },
    { id: AppTab.SCHEDULES, label: 'Alerts', icon: <Bell size={19} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-100 dark:selection:bg-indigo-900 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-[60] bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => setActiveTab(AppTab.CHECKUP)}>
            <div className="w-10 h-10 bg-[#5E5CE6] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-105">
              G
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black tracking-tight leading-none text-slate-900 dark:text-white">
                Health Guardian
              </h1>
              <p className="text-[9px] font-black text-[#5E5CE6] dark:text-indigo-400 uppercase tracking-widest mt-1">
                {isOfflineMode ? 'Bio-Guest Mode' : 'Secure Vault'}
                {isSyncing && ' • Syncing'}
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === item.id 
                    ? 'bg-white dark:bg-slate-700 text-[#5E5CE6] dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Actions & Profile */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-amber-300 hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[120px]">
                {user?.name}
              </span>
              <button onClick={handleLogout} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline mt-0.5">
                Logout
              </button>
            </div>

            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm font-black text-[#5E5CE6] dark:text-indigo-400 shadow-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 mb-24 lg:mb-0">
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          {activeTab === AppTab.CHECKUP && <DailyCheckup onComplete={addToHistory} />}
          {activeTab === AppTab.DASHBOARD && <HealthDashboard history={history} />}
          {activeTab === AppTab.CONSULT && <AIGuardianChat history={history} />}
          {activeTab === AppTab.SYMPTOMS && <SymptomHelper />}
          {activeTab === AppTab.MEDICINE && <MedicineScanner />}
          {activeTab === AppTab.SCHEDULES && (
            <Reminders 
              reminders={reminders} 
              onAdd={(r) => { 
                const nr = [...reminders, r]; 
                setReminders(nr); 
                localStorage.setItem('health_guardian_reminders', JSON.stringify(nr)); 
                if (user && !isOfflineMode) db.saveReminder(r).catch(console.error);
              }} 
              onToggle={(id) => {
                const nr = reminders.map(rem => rem.id === id ? { ...rem, active: !rem.active } : rem);
                setReminders(nr);
                localStorage.setItem('health_guardian_reminders', JSON.stringify(nr));
                const updated = nr.find(r => r.id === id);
                if (updated && user && !isOfflineMode) db.saveReminder(updated).catch(console.error);
              }} 
              onDelete={(id) => {
                const nr = reminders.filter(rem => rem.id !== id);
                setReminders(nr);
                localStorage.setItem('health_guardian_reminders', JSON.stringify(nr));
                if (user && !isOfflineMode) db.deleteReminder(id).catch(console.error);
              }}
              onTriggerTestAlert={(rem) => triggerLiveAlert(rem)}
            />
          )}
        </div>
      </main>

      {/* Live Alert Modal / Interactive Banner */}
      {activeAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-indigo-100 dark:border-slate-700 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-[#5E5CE6] to-emerald-400" />
            
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center text-[#5E5CE6] dark:text-indigo-400 shadow-inner">
                  {activeAlert.type === 'medicine' ? <Pill size={28} className="animate-bounce" /> : <Bell size={28} className="animate-bounce" />}
                </div>
                <div>
                  <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-[#5E5CE6] dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100/50 dark:border-indigo-800/40">
                    Live Health Alert
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1.5">
                    {activeAlert.label}
                  </h3>
                </div>
              </div>

              <button 
                onClick={handleDismissAlert}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm font-bold">
                <Clock size={16} className="text-[#5E5CE6]" />
                <span>Scheduled Time:</span>
              </div>
              <div className="flex items-baseline gap-1 text-[#5E5CE6] dark:text-indigo-400 font-black text-lg">
                <span>{formatDisplayTime(activeAlert.time).time}</span>
                <span className="text-xs">{formatDisplayTime(activeAlert.time).period}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDismissAlert}
                className="py-4 bg-[#5E5CE6] text-white font-black uppercase tracking-wider rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 text-xs flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} />
                <span>Done</span>
              </button>

              <button
                onClick={handleSnoozeAlert}
                className="py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black uppercase tracking-wider rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 text-xs flex items-center justify-center gap-2"
              >
                <Clock size={16} />
                <span>Snooze 5m</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      <footer className="lg:hidden fixed bottom-6 left-6 right-6 z-[70]">
        <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_30px_60px_rgba(0,0,0,0.15)] rounded-[2.5rem] p-2 flex justify-between items-center">
          {navItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`flex-1 flex flex-col items-center gap-1.5 py-3.5 rounded-[1.8rem] transition-all ${
                activeTab === item.id 
                  ? 'bg-[#5E5CE6] text-white shadow-xl shadow-indigo-600/30 scale-105' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <div className="text-lg">{item.icon}</div>
              <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
        </nav>
      </footer>
    </div>
  );
};

export default App;
