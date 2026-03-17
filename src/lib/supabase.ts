import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise fallback to the provided project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ljercnystruokwflwzge.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ouMM22RTI5t7a66hm0VIMQ_8kl7qNwA';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
