import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';
import { Shield, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!supabase) {
      setError('Supabase connection not established. Check your configuration.');
      setLoading(false);
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
          options: { 
            data: { name },
            emailRedirectTo: window.location.origin
          },
        });
        if (authError) throw authError;
        if (data.user) {
          if (data.session) {
            onLogin({ email: data.user.email || '', name });
          } else {
            setError('Verification email sent! Please check your inbox or use Guest Mode.');
          }
        }
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes('Failed to fetch') || errMsg.includes('fetch') || errMsg.includes('NetworkError')) {
        setError('Supabase connection failed (server unreachable or project paused). You can continue in Guest Mode.');
      } else {
        setError(errMsg || 'Authentication failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FBFBFD] dark:bg-slate-950 transition-colors">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 dark:bg-indigo-950/40 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-50 dark:bg-emerald-950/20 rounded-full blur-[120px] opacity-60"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-700 to-[#5E5CE6] rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 mx-auto mb-6">
            <span className="text-white text-4xl font-black">G</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-1">
            Health Guardian
          </h1>
          <p className="text-slate-400 dark:text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">
            Your Daily Habital Intelligence
          </p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-3xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 overflow-hidden">
          {/* Auth Tab Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-8 border border-slate-200/60 dark:border-slate-700/60">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                isLogin 
                  ? 'bg-white dark:bg-slate-700 text-[#5E5CE6] dark:text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                !isLogin 
                  ? 'bg-white dark:bg-slate-700 text-[#5E5CE6] dark:text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Display Name</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-4.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-[#5E5CE6] outline-none transition-all font-bold text-slate-800 dark:text-slate-100 text-base shadow-inner"
                  placeholder="John Doe"
                />
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Identity</label>
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-[#5E5CE6] outline-none transition-all font-bold text-slate-800 dark:text-slate-100 text-base shadow-inner"
                placeholder="name@email.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Access Key</label>
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-[#5E5CE6] outline-none transition-all font-bold text-slate-800 dark:text-slate-100 text-base shadow-inner"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-[11px] font-bold text-rose-600 dark:text-rose-400 text-center flex items-center justify-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" disabled={loading}
              className="w-full py-4.5 bg-[#5E5CE6] text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                isLogin ? 'Sign In' : 'Create Vault'
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
            <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.4em]">
              <span className="bg-white dark:bg-slate-900 px-4 text-slate-400">Offline & Privacy</span>
            </div>
          </div>

          <button 
            onClick={onGuestMode}
            className="w-full py-3.5 border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Enter Guest Mode</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400 font-bold">
            {isLogin ? "Need a vault?" : "Returning guardian?"}{' '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-[#5E5CE6] dark:text-indigo-400 font-black hover:underline ml-1">
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
