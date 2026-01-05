
import React, { useState, useEffect, useMemo } from 'react';
import { AppTab, HealthEntry, User, Reminder } from './types';
import DailyCheckup from './components/DailyCheckup';
import MedicineScanner from './components/MedicineScanner';
import HealthDashboard from './components/HealthDashboard';
import SymptomHelper from './components/SymptomHelper';
import Reminders from './components/Reminders';
import Auth from './components/Auth';
import { supabase, db } from './services/supabase';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.CHECKUP);
  const [history, setHistory] = useState<HealthEntry[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Robust Logout to prevent blank page
  const handleLogout = async () => {
    try {
      if (supabase) await supabase.auth.signOut();
      localStorage.clear();
      setUser(null);
      setIsOfflineMode(false);
      // Clean reload to base URL
      window.location.replace(window.location.origin + window.location.pathname);
    } catch (e) {
      console.error("Logout error:", e);
      localStorage.clear();
      window.location.reload();
    }
  };

  // Cloud Sync
  useEffect(() => {
    if (user && !isOfflineMode) {
      const sync = async () => {
        setIsSyncing(true);
        try {
          const cloudEntries = await db.getEntries();
          setHistory(cloudEntries);
        } catch (e) {
          console.error("Cloud sync failed:", e);
        } finally {
          setIsSyncing(false);
        }
      };
      sync();
    }
  }, [user, isOfflineMode]);

  // Auth Session Recovery
  useEffect(() => {
    const checkSession = async () => {
      // Recovery timeout: If session check hangs, default to false
      const timeout = setTimeout(() => setIsAuthLoading(false), 3000);
      
      if (!supabase) {
        const localUser = localStorage.getItem('health_guardian_mock_user');
        if (localUser) setUser(JSON.parse(localUser));
        const offline = localStorage.getItem('health_guardian_offline_mode');
        if (offline === 'true') setIsOfflineMode(true);
        clearTimeout(timeout);
        setIsAuthLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          });
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        clearTimeout(timeout);
        setIsAuthLoading(false);
      }
    };
    checkSession();
  }, []);

  // Local Data Recovery
  useEffect(() => {
    const h = localStorage.getItem('health_guardian_history');
    if (h) try { setHistory(JSON.parse(h)); } catch(e) {}
    
    const r = localStorage.getItem('health_guardian_reminders');
    if (r) try { setReminders(JSON.parse(r)); } catch(e) {}
  }, []);

  const addToHistory = async (entry: HealthEntry) => {
    const newHistory = [entry, ...history].slice(0, 100);
    setHistory(newHistory);
    localStorage.setItem('health_guardian_history', JSON.stringify(newHistory));
    
    if (user && !isOfflineMode) {
      try { await db.saveEntry(entry); } catch (e) { console.warn("Save failed", e); }
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-[4px] border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-indigo-600 font-bold uppercase tracking-[0.2em] text-[10px]">Authorizing Vault...</p>
        </div>
      </div>
    );
  }

  if (!user && !isOfflineMode) {
    return <Auth onLogin={setUser} onGuestMode={() => setIsOfflineMode(true)} />;
  }

  const navItems = [
    { id: AppTab.CHECKUP, label: 'Journal', icon: '✍️' },
    { id: AppTab.DASHBOARD, label: 'Vitality', icon: '⚡' },
    { id: AppTab.SYMPTOMS, label: 'Helper', icon: '🌡️' },
    { id: AppTab.MEDICINE, label: 'Scanner', icon: '📷' },
    { id: AppTab.SCHEDULES, label: 'Alerts', icon: '🔔' },
  ];

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col selection:bg-indigo-100 pb-32 lg:pb-0">
      <header className="sticky top-0 z-[60] bg-white/70 backdrop-blur-3xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab(AppTab.CHECKUP)}>
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-700 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100">G</div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-extrabold tracking-tight leading-none">Guardian</h1>
              <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">
                {isOfflineMode ? 'Local Only' : 'Encrypted Cloud'}
                {isSyncing && ' • Syncing...'}
              </p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 bg-slate-200/50 p-1 rounded-2xl">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === item.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-900">{user?.name || 'Explorer'}</span>
              <button onClick={handleLogout} className="text-[10px] font-bold text-rose-500 hover:underline">Log out</button>
            </div>
            <div className="w-10 h-10 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-sm font-black text-indigo-600 shadow-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          {activeTab === AppTab.CHECKUP && <DailyCheckup onComplete={addToHistory} />}
          {activeTab === AppTab.DASHBOARD && <HealthDashboard history={history} />}
          {activeTab === AppTab.SYMPTOMS && <SymptomHelper />}
          {activeTab === AppTab.MEDICINE && <MedicineScanner />}
          {activeTab === AppTab.SCHEDULES && (
            <Reminders 
              reminders={reminders} 
              onAdd={(r) => { 
                const nr = [...reminders, r]; 
                setReminders(nr); 
                localStorage.setItem('health_guardian_reminders', JSON.stringify(nr)); 
              }} 
              onToggle={(id) => {
                const nr = reminders.map(rem => rem.id === id ? { ...rem, active: !rem.active } : rem);
                setReminders(nr);
                localStorage.setItem('health_guardian_reminders', JSON.stringify(nr));
              }} 
              onDelete={(id) => {
                const nr = reminders.filter(rem => rem.id !== id);
                setReminders(nr);
                localStorage.setItem('health_guardian_reminders', JSON.stringify(nr));
              }} 
            />
          )}
        </div>
      </main>

      <footer className="lg:hidden fixed bottom-6 left-6 right-6 z-[70]">
        <nav className="bg-white/80 backdrop-blur-3xl border border-white/40 shadow-2xl shadow-indigo-200/20 rounded-[2.5rem] p-2 flex justify-between items-center">
          {navItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`flex-1 flex flex-col items-center gap-1.5 py-4 rounded-[1.8rem] transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[9px] font-extrabold uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
        </nav>
      </footer>
    </div>
  );
};

export default App;
