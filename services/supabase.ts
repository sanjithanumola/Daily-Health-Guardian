
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qvoahwloegeoxoegcrzo.supabase.co';
// This key was identified as a "secret" key in the browser environment, 
// which Supabase explicitly forbids for security reasons.
const supabaseKeyFromUser = 'sb_secret_BASAkEaAPHGNEAXmKZI_nA_tgBppK34';

export const supabase = (() => {
  try {
    // SECURITY CHECK: Supabase "Secret" keys (starting with 'sb_secret' or service_role)
    // MUST NOT be used in the browser. Only 'anon' keys (starting with 'ey...') are allowed.
    const isSecretKey = supabaseKeyFromUser.startsWith('sb_secret') || supabaseKeyFromUser.includes('service_role');
    
    if (!supabaseUrl || !supabaseKeyFromUser || supabaseKeyFromUser.startsWith('sb_placeholder') || isSecretKey) {
      if (isSecretKey) {
        console.error("CRITICAL SECURITY WARNING: A Supabase 'secret' key was detected. For security, this key cannot be used in a browser environment. Falling back to Local Storage mode.");
      } else {
        console.warn("Supabase credentials missing or invalid. App will use Local Storage.");
      }
      return null;
    }
    
    return createClient(supabaseUrl, supabaseKeyFromUser);
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
