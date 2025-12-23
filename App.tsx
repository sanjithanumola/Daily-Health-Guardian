
import React, { useState, useEffect } from 'react';
import { AppTab, HealthEntry, User } from './types';
import DailyCheckup from './components/DailyCheckup';
import MedicineScanner from './components/MedicineScanner';
import HealthDashboard from './components/HealthDashboard';
import SymptomHelper from './components/SymptomHelper';
import SqlEditor from './components/SqlEditor';
import Auth from './components/Auth';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.CHECKUP);
  const [history, setHistory] = useState<HealthEntry[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (isAuthLoading) {
        setIsAuthLoading(false);
        setIsOfflineMode(true);
        loadLocalHistory();
      }
    }, 3500);

    const checkSession = async () => {
      if (!supabase) {
        setIsAuthLoading(false);
        setIsOfflineMode(true);
        loadLocalHistory();
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          setUser({
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          });
        } else {
          loadLocalHistory();
        }
      } catch (err) {
        setIsOfflineMode(true);
        loadLocalHistory();
      } finally {
        setIsAuthLoading(false);
        clearTimeout(safetyTimeout);
      }
    };

    checkSession();

    let subscription: any = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          });
          setIsOfflineMode(false);
        } else {
          setUser(null);
          loadLocalHistory();
        }
      });
      subscription = data.subscription;
    }

    return () => {
      clearTimeout(safetyTimeout);
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const loadLocalHistory = () => {
    const savedHistory = localStorage.getItem('health_guardian_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Corrupt local storage data", e);
      }
    }
  };

  useEffect(() => {
    if (user && !isOfflineMode) {
      fetchHistory();
    }
  }, [user, isOfflineMode]);

  const fetchHistory = async () => {
    if (!supabase || isOfflineMode) return;
    try {
      const { data, error } = await supabase
        .from('health_entries')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        loadLocalHistory();
      } else if (data) {
        const mapped = data.map((d: any) => ({
          id: d.id,
          timestamp: Number(d.timestamp),
          sleep: d.sleep,
          water: d.water,
          stress: d.stress,
          energy: d.energy,
          discomfort: d.discomfort || '',
          foodQuality: d.food_quality || d.foodQuality || 'balanced'
        }));
        setHistory(mapped);
        localStorage.setItem('health_guardian_history', JSON.stringify(mapped));
      }
    } catch (e) {
      loadLocalHistory();
    }
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setIsOfflineMode(false);
  };

  const handleLogout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    setUser(null);
    setHistory([]);
    localStorage.removeItem('health_guardian_history');
  };

  const addToHistory = async (entry: HealthEntry) => {
    const newHistory = [entry, ...history].slice(0, 100);
    setHistory(newHistory);
    localStorage.setItem('health_guardian_history', JSON.stringify(newHistory));

    if (user && supabase && !isOfflineMode) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('health_entries').insert([{
          user_id: session.user.id,
          timestamp: entry.timestamp,
          sleep: entry.sleep,
          water: entry.water,
          stress: entry.stress,
          energy: entry.energy,
          discomfort: entry.discomfort,
          food_quality: entry.foodQuality
        }]);
      }
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center animate-bounce shadow-xl shadow-indigo-100">
            <span className="text-white text-3xl font-bold">G</span>
          </div>
          <p className="text-sm text-slate-400 font-black uppercase tracking-widest animate-pulse">Initializing Wellness...</p>
        </div>
      </div>
    );
  }

  if (!user && !isOfflineMode) {
    return <Auth onLogin={handleLogin} onGuestMode={() => setIsOfflineMode(true)} />;
  }

  const navItems = [
    { id: AppTab.CHECKUP, label: 'Check', icon: '📝' },
    { id: AppTab.SYMPTOMS, label: 'Symptoms', icon: '🌡️' },
    { id: AppTab.MEDICINE, label: 'Scan', icon: '💊' },
    { id: AppTab.DASHBOARD, label: 'Trends', icon: '📊' },
    { id: AppTab.SQL, label: 'Data Lab', icon: '💻' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black">G</div>
            <div>
              <h1 className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight">Health Guardian</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {isOfflineMode ? "Guest Mode" : user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`text-[10px] font-black uppercase tracking-widest transition-all px-4 py-2 rounded-xl ${activeTab === item.id ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="h-4 w-px bg-slate-200 hidden lg:block"></div>
            <button 
              onClick={isOfflineMode ? () => setIsOfflineMode(false) : handleLogout}
              className="text-[10px] font-black text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest"
            >
              {isOfflineMode ? "Sign In" : "Log Out"}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 pb-32">
        {activeTab === AppTab.CHECKUP && <DailyCheckup onComplete={addToHistory} />}
        {activeTab === AppTab.SYMPTOMS && <SymptomHelper />}
        {activeTab === AppTab.MEDICINE && <MedicineScanner />}
        {activeTab === AppTab.DASHBOARD && <HealthDashboard history={history} />}
        {activeTab === AppTab.SQL && <SqlEditor history={history} />}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-2 lg:hidden z-50">
        <div className="flex justify-around items-center">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${activeTab === item.id ? 'text-indigo-600 bg-indigo-50 shadow-sm' : 'text-slate-400'}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default App;
