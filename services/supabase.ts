
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qvoahwloegeoxoegcrzo.supabase.co';
const supabaseAnonKey = 'sb_publishable_46uRlPnd6cL32qeyiW37ig_01yXahbU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
