import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cjvsllxvtsuvzgshgykv.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_ET6YSWfPs2jzH8p5YfLeiw_z-Zcq9jf';
export const supabase = createClient(supabaseUrl, supabaseKey);
export const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'meow2026';
