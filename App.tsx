
import React, { useState, useEffect, useCallback } from 'react';
import { AppTab, HealthEntry, User, Reminder } from './types';
import { 
  Activity, 
  MessageSquare, 
  Thermometer, 
  Camera, 
  Bell, 
  BookOpen
} from 'lucide-react';
import DailyCheckup from './components/DailyCheckup';
import MedicineScanner from './components/MedicineScanner';
import HealthDashboard from './components/HealthDashboard';
import SymptomHelper from './components/SymptomHelper';
import Reminders from './components/Reminders';
import AIGuardianChat from './components/AIGuardianChat';
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

  // Atomic State Logout: Prevents "IP Not Found" DNS errors by resetting React memory
  // instead of relying on browser-level redirects/reloads which can break sandbox sandboxes.
  const handleLogout = useCallback(async () => {
    if (supabase) {
      try { await supabase.auth.signOut(); } catch (e) { console.warn(e); }
    }
    localStorage.clear();
    setUser(null);
    setHistory([]);
    setReminders([]);
    setIsOfflineMode(false);
    setActiveTab(AppTab.CHECKUP);
    console.log("Secure Logout Complete.");
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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-8">
          <div className="w-16 h-16 bg-[#5E5CE6] rounded-2xl flex items-center justify-center text-white font-black text-2xl animate-bounce shadow-2xl shadow-indigo-100">G</div>
          <p className="text-[#5E5CE6] font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Bio-Metric Sync</p>
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
    { id: AppTab.CHECKUP, label: 'Journal', icon: <BookOpen size={20} /> },
    { id: AppTab.DASHBOARD, label: 'Vitality', icon: <Activity size={20} /> },
    { id: AppTab.CONSULT, label: 'Consult', icon: <MessageSquare size={20} /> },
    { id: AppTab.SYMPTOMS, label: 'Helper', icon: <Thermometer size={20} /> },
    { id: AppTab.MEDICINE, label: 'Scanner', icon: <Camera size={20} /> },
    { id: AppTab.SCHEDULES, label: 'Alerts', icon: <Bell size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-indigo-100">
      <header className="sticky top-0 z-[60] bg-white/70 backdrop-blur-3xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setActiveTab(AppTab.CHECKUP)}>
            <div className="w-10 h-10 bg-[#5E5CE6] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100/50 transition-transform group-hover:scale-105">G</div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black tracking-tight leading-none text-slate-900">Guardian</h1>
              <p className="text-[9px] font-black text-[#5E5CE6] uppercase tracking-widest mt-1">
                {isOfflineMode ? 'Bio-Guest' : 'Secure Vault'}
                {isSyncing && ' • Syncing'}
              </p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-200/40 p-1.5 rounded-2xl border border-slate-200/10">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === item.id ? 'bg-white text-[#5E5CE6] shadow-sm border border-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-black text-slate-900 truncate max-w-[120px]">{user?.name}</span>
              <button onClick={handleLogout} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline mt-0.5">Logout</button>
            </div>
            <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-sm font-black text-[#5E5CE6] shadow-sm ring-2 ring-indigo-50/50">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 mb-20 lg:mb-0">
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
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
            />
          )}
        </div>
      </main>

      {/* Premium Mobile Navigation */}
      <footer className="lg:hidden fixed bottom-6 left-6 right-6 z-[70]">
        <nav className="bg-white/80 backdrop-blur-3xl border border-white/60 shadow-[0_30px_60px_rgba(0,0,0,0.12)] rounded-[2.5rem] p-2 flex justify-between items-center">
          {navItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`flex-1 flex flex-col items-center gap-1.5 py-4 rounded-[1.8rem] transition-all ${activeTab === item.id ? 'bg-[#5E5CE6] text-white shadow-xl shadow-indigo-600/30 scale-105' : 'text-slate-400'}`}
            >
              <div className="text-xl mb-0.5">{item.icon}</div>
              <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
        </nav>
      </footer>
    </div>
  );
};

export default App;
