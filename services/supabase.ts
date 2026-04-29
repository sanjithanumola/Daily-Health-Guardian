
import { createClient } from '@supabase/supabase-js';
import { HealthEntry, Reminder } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (() => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) return null;
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error("Supabase Init Error:", e);
    return null;
  }
})();

export const db = {
  async getEntries(): Promise<HealthEntry[]> {
    if (!supabase) return [];
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('health_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error("Error fetching entries:", error);
      return [];
    }

    return (data || []).map(d => ({
      id: d.id,
      timestamp: new Date(d.timestamp).getTime(),
      sleep: d.sleep,
      water: d.water,
      stress: d.stress,
      energy: d.energy,
      discomfort: d.discomfort,
      foodQuality: d.food_quality
    }));
  },

  async saveEntry(entry: HealthEntry) {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { error } = await supabase.from('health_entries').insert([{
      user_id: user.id,
      timestamp: new Date(entry.timestamp).toISOString(),
      sleep: entry.sleep,
      water: entry.water,
      stress: entry.stress,
      energy: entry.energy,
      discomfort: entry.discomfort,
      food_quality: entry.foodQuality
    }]);

    if (error) {
      console.error("Error saving entry:", error);
      throw error;
    }
  },

  async getReminders(): Promise<Reminder[]> {
    if (!supabase) return [];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) {
      console.error("Error fetching reminders:", error);
      return [];
    }

    return (data || []).map(d => ({
      id: d.id,
      type: d.type,
      label: d.label,
      time: d.time,
      repeat: d.repeat,
      active: d.active,
      lastNotified: d.last_notified
    }));
  },

  async saveReminder(reminder: Reminder) {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('reminders').upsert([{
      id: reminder.id,
      user_id: user.id,
      type: reminder.type,
      label: reminder.label,
      time: reminder.time,
      repeat: reminder.repeat,
      active: reminder.active,
      last_notified: reminder.lastNotified
    }]);

    if (error) {
      console.error("Error saving reminder:", error);
      throw error;
    }
  },

  async deleteReminder(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (error) {
      console.error("Error deleting reminder:", error);
      throw error;
    }
  }
};
