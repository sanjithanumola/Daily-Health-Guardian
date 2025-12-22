
import React, { useState, useEffect } from 'react';
import { AppTab, HealthEntry, User } from './types';
import DailyCheckup from './components/DailyCheckup';
import MedicineScanner from './components/MedicineScanner';
import HealthDashboard from './components/HealthDashboard';
import SymptomHelper from './components/SymptomHelper';
import Auth from './components/Auth';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.CHECKUP);
  const [history, setHistory] = useState<HealthEntry[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    // Safety timeout: If Supabase takes > 3 seconds, proceed as Guest
    const safetyTimeout = setTimeout(() => {
      if (isAuthLoading) {
        console.warn("Auth check timed out. Entering offline/guest mode.");
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
        console.error("Auth session check failed:", err);
        setIsOfflineMode(true);
        loadLocalHistory();
      } finally {
        setIsAuthLoading(false);
        clearTimeout(safetyTimeout);
      }
    };

    checkSession();

    // Listen for auth changes
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
        .limit(30);

      if (error) {
        console.warn('Supabase fetch error, falling back to local storage:', error);
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
      console.error("Failed to fetch history:", e);
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
      } catch (e) {
        console.error("Logout error:", e);
      }
    }
    setUser(null);
    setHistory([]);
    localStorage.removeItem('health_guardian_history');
  };

  const addToHistory = async (entry: HealthEntry) => {
    const newHistory = [entry, ...history].slice(0, 30);
    setHistory(newHistory);
    localStorage.setItem('health_guardian_history', JSON.stringify(newHistory));

    if (user && supabase && !isOfflineMode) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { error } = await supabase.from('health_entries').insert([{
          user_id: session.user.id,
          timestamp: entry.timestamp,
          sleep: entry.sleep,
          water: entry.water,
          stress: entry.stress,
          energy: entry.energy,
          discomfort: entry.discomfort,
          food_quality: entry.foodQuality
        }]);
        
        if (error) {
          console.error('Error saving entry to Supabase:', error);
        }
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
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800">Health Guardian</h2>
            <p className="text-sm text-slate-400 font-medium animate-pulse">Initializing wellness systems...</p>
          </div>
        </div>
      </div>
    );
  }

  // If Supabase is broken or user is not logged in, show Auth or proceed if Guest allowed
  if (!user && !isOfflineMode) {
    return <Auth onLogin={handleLogin} onGuestMode={() => setIsOfflineMode(true)} />;
  }

  const navItems = [
    { id: AppTab.CHECKUP, label: 'Daily Check', icon: '📝' },
    { id: AppTab.SYMPTOMS, label: 'Symptom Help', icon: '🌡️' },
    { id: AppTab.MEDICINE, label: 'Meds Scan', icon: '💊' },
    { id: AppTab.DASHBOARD, label: 'Trends', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Health Guardian</h1>
              <p className="text-xs text-slate-500 font-medium">
                {isOfflineMode ? "Running in Guest Mode" : `Hello, ${user?.name || user?.email.split('@')[0]}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-4">
              {navItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`text-sm font-semibold transition-all px-3 py-2 rounded-lg ${activeTab === item.id ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
            {isOfflineMode ? (
               <button 
               onClick={() => setIsOfflineMode(false)}
               className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest"
             >
               Sign In
             </button>
            ) : (
              <button 
                onClick={handleLogout}
                className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      {isOfflineMode && (
        <div className="bg-amber-50 border-b border-amber-100 py-2 text-center">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">
            ⚠️ Running locally. Your data is saved on this device only. Sign in to sync across devices.
          </p>
        </div>
      )}

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 pb-32">
        {activeTab === AppTab.CHECKUP && <DailyCheckup onComplete={addToHistory} />}
        {activeTab === AppTab.SYMPTOMS && <SymptomHelper />}
        {activeTab === AppTab.MEDICINE && <MedicineScanner />}
        {activeTab === AppTab.DASHBOARD && <HealthDashboard history={history} />}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-2 md:hidden z-50">
        <div className="flex justify-around items-center">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === item.id ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </footer>

      <section className="bg-slate-100 py-6 border-t border-slate-200 mt-auto hidden md:block">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Disclaimer: This AI provides general health information only. It is not a doctor. 
            For serious symptoms or emergencies, consult a medical professional immediately.
          </p>
        </div>
      </section>
    </div>
  );
};

export default App;
