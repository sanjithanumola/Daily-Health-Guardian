
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

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
        });
      }
      setIsAuthLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
        });
      } else {
        setUser(null);
        setHistory([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('health_entries')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error fetching history:', error);
      // Fallback to local storage if table doesn't exist yet or error occurs
      const savedHistory = localStorage.getItem('health_guardian_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } else if (data) {
      // Map database snake_case or standard fields to the interface
      const mapped = data.map((d: any) => ({
        id: d.id,
        timestamp: d.timestamp,
        sleep: d.sleep,
        water: d.water,
        stress: d.stress,
        energy: d.energy,
        discomfort: d.discomfort,
        foodQuality: d.food_quality || d.foodQuality
      }));
      setHistory(mapped);
    }
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const addToHistory = async (entry: HealthEntry) => {
    // Optimistic UI update
    const newHistory = [entry, ...history].slice(0, 30);
    setHistory(newHistory);
    localStorage.setItem('health_guardian_history', JSON.stringify(newHistory));

    // Persist to Supabase
    if (user) {
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
        
        if (error) console.error('Error saving entry to Supabase:', error);
      }
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-indigo-200 rounded-2xl"></div>
          <div className="h-4 w-24 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
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
            <div className="xs:block">
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Health Guardian</h1>
              <p className="text-xs text-slate-500 font-medium">Hello, {user.name || user.email.split('@')[0]}</p>
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
            <button 
              onClick={handleLogout}
              className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

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
