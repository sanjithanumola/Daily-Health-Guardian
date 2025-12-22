
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qvoahwloegeoxoegcrzo.supabase.co';
// Using a placeholder or valid anon key. If this is invalid, the app will fallback to LocalStorage as per App.tsx logic.
const supabaseAnonKey = 'sb_publishable_46uRlPnd6cL32qeyiW37ig_01yXahbU';

export const supabase = (() => {
  try {
    if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey.startsWith('sb_')) {
      console.warn("Supabase credentials appear to be placeholders. App will use Local Storage.");
      return null;
    }
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error("Supabase Init Error:", e);
    return null;
  }
})();

export const isSupabaseHealthy = async () => {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('health_entries').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
};
