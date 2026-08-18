
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
    const local = localStorage.getItem('guardian_entries');
    const localEntries: HealthEntry[] = local ? JSON.parse(local) : [];

    if (!supabase) return localEntries;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return localEntries;

      const { data, error } = await supabase
        .from('health_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });
      
      if (error) {
        return localEntries;
      }

      const fetched = (data || []).map(d => ({
        id: d.id,
        timestamp: new Date(d.timestamp).getTime(),
        sleep: d.sleep,
        water: d.water,
        stress: d.stress,
        energy: d.energy,
        discomfort: d.discomfort,
        foodQuality: d.food_quality
      }));

      return fetched.length > 0 ? fetched : localEntries;
    } catch {
      return localEntries;
    }
  },

  async saveEntry(entry: HealthEntry) {
    const local = localStorage.getItem('guardian_entries');
    const list: HealthEntry[] = local ? JSON.parse(local) : [];
    localStorage.setItem('guardian_entries', JSON.stringify([entry, ...list.filter(e => e.id !== entry.id)]));

    if (!supabase) return null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      await supabase.from('health_entries').insert([{
        user_id: user.id,
        timestamp: new Date(entry.timestamp).toISOString(),
        sleep: entry.sleep,
        water: entry.water,
        stress: entry.stress,
        energy: entry.energy,
        discomfort: entry.discomfort,
        food_quality: entry.foodQuality
      }]);
    } catch {
      // Handled via local fallback
    }
  },

  async getReminders(): Promise<Reminder[]> {
    const local = localStorage.getItem('guardian_reminders');
    const localReminders: Reminder[] = local ? JSON.parse(local) : [];

    if (!supabase) return localReminders;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return localReminders;

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        return localReminders;
      }

      const fetched = (data || []).map(d => ({
        id: d.id,
        type: d.type,
        label: d.label,
        time: d.time,
        repeat: d.repeat,
        active: d.active,
        lastNotified: d.last_notified
      }));

      return fetched.length > 0 ? fetched : localReminders;
    } catch {
      return localReminders;
    }
  },

  async saveReminder(reminder: Reminder) {
    const local = localStorage.getItem('guardian_reminders');
    const list: Reminder[] = local ? JSON.parse(local) : [];
    const updated = [reminder, ...list.filter(r => r.id !== reminder.id)];
    localStorage.setItem('guardian_reminders', JSON.stringify(updated));

    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('reminders').upsert([{
        id: reminder.id,
        user_id: user.id,
        type: reminder.type,
        label: reminder.label,
        time: reminder.time,
        repeat: reminder.repeat,
        active: reminder.active,
        last_notified: reminder.lastNotified
      }]);
    } catch {
      // Handled via local fallback
    }
  },

  async deleteReminder(id: string) {
    const local = localStorage.getItem('guardian_reminders');
    const list: Reminder[] = local ? JSON.parse(local) : [];
    localStorage.setItem('guardian_reminders', JSON.stringify(list.filter(r => r.id !== id)));

    if (!supabase) return;
    try {
      await supabase.from('reminders').delete().eq('id', id);
    } catch {
      // Handled via local fallback
    }
  }
};
