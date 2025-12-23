
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qvoahwloegeoxoegcrzo.supabase.co';
// Updated with the key provided by the user
const supabaseAnonKey = 'sb_secret_BASAkEaAPHGNEAXmKZI_nA_tgBppK34';

export const supabase = (() => {
  try {
    if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey.startsWith('sb_placeholder')) {
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
