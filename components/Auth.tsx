
import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';

interface Props {
  onLogin: (user: User) => void;
  onGuestMode: () => void;
}

const Auth: React.FC<Props> = ({ onLogin, onGuestMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSql, setShowSql] = useState(false);

  // Mock Credentials for Demo Mode
  const DEMO_EMAIL = 'admin@guardian.ai';
  const DEMO_PASS = 'password123';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // DEMO MODE if no supabase config
    if (!supabase) {
      setTimeout(() => {
        if (isLogin) {
          if (email === DEMO_EMAIL && password === DEMO_PASS) {
            onLogin({ email: DEMO_EMAIL, name: 'Guardian Admin' });
          } else {
            setError('Account not found. Use Demo: admin@guardian.ai / password123');
          }
        } else {
          onLogin({ email, name: name || 'Explorer' });
        }
        setLoading(false);
      }, 1000);
      return;
    }
    
    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        if (data.user) {
          onLogin({
            email: data.user.email || '',
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
          });
        }
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (authError) throw authError;
        if (data.user) {
          onLogin({ email: data.user.email || '', name });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FBFBFD]">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-[120px] opacity-60"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-700 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-100 mx-auto mb-8 animate-bounce-slow">
            <span className="text-white text-4xl font-black">G</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Health Guardian</h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Your Daily Habital Intelligence</p>
        </div>

        <div className="bg-white/80 backdrop-blur-3xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-white/60 p-10 overflow-hidden">
          {!supabase && isLogin && (
            <div className="mb-8 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex flex-col items-center gap-4">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">Demo Mode Active</span>
              <div className="text-center">
                <p className="text-[11px] font-bold text-slate-500 mb-1">Testing Credentials:</p>
                <code className="text-[10px] font-black text-indigo-700 bg-white/50 px-2 py-1 rounded select-all">admin@guardian.ai / password123</code>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Display Name</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700"
                  placeholder="John Doe"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Identity</label>
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700"
                placeholder="name@email.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Access Key</label>
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-[10px] font-bold text-rose-500 text-center px-4 animate-pulse">{error}</p>}

            <button 
              type="submit" disabled={loading}
              className="w-full py-5 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (isLogin ? 'Sign In' : 'Create Vault')}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.4em]"><span className="bg-white px-6 text-slate-300">Privacy Mode</span></div>
          </div>

          <button 
            onClick={onGuestMode}
            className="w-full py-4 border border-emerald-100 bg-emerald-50/30 text-emerald-700 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-50 transition-all active:scale-[0.98]"
          >
            Enter Guest Mode
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 font-bold">
            {isLogin ? "Need a vault?" : "Returning guardian?"}{' '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 font-black hover:underline ml-1">
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
      
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(0); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Auth;
