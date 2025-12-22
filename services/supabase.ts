
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qvoahwloegeoxoegcrzo.supabase.co';
const supabaseAnonKey = 'sb_publishable_46uRlPnd6cL32qeyiW37ig_01yXahbU';

// Create the client with a safe check
export const supabase = (() => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase credentials missing. App will run in local-only mode.");
      return null;
    }
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error("Failed to initialize Supabase client:", e);
    return null;
  }
})();

// Helper to check if supabase is available and working
export const isSupabaseHealthy = async () => {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('health_entries').select('count', { count: 'exact', head: true }).limit(1);
    return !error || error.code !== 'PGRST116'; // If it's just a missing table error, it's technically "connected"
  } catch {
    return false;
  }
};
