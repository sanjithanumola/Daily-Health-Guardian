
import { createClient } from '@supabase/supabase-js';
import { HealthEntry, Reminder } from '../types';

const supabaseUrl = 'https://qvoahwloegeoxoegcrzo.supabase.co';
// WARNING: Replace this with your public 'anon' key from Supabase Dashboard
const SUPABASE_ANON_KEY: string = ''; 

export const supabase = (() => {
  try {
    if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.length < 10) return null;
    return createClient(supabaseUrl, SUPABASE_ANON_KEY);
  } catch (e) {
    console.error("Supabase Init Error:", e);
    return null;
  }
})();

export const db = {
  async getEntries(): Promise<HealthEntry[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('health_entries')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(d => ({
      ...d,
      foodQuality: d.food_quality // map snack_case to camelCase
    }));
  },

  async saveEntry(entry: HealthEntry) {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { error } = await supabase.from('health_entries').insert([{
      user_id: user.id,
      timestamp: entry.timestamp,
      sleep: entry.sleep,
      water: entry.water,
      stress: entry.stress,
      energy: entry.energy,
      discomfort: entry.discomfort,
      food_quality: entry.foodQuality
    }]);

    if (error) throw error;
  }
};
