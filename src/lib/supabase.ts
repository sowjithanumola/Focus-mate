import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise fallback to the provided project credentials
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ljercnystruokwflwzge.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZXJjbnlzdHJ1b2t3Zmx3emdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MzYwMjQsImV4cCI6MjA4OTMxMjAyNH0.m-_ERvavZKO2l4MMw94u9qZMSUPJhLLX7AejYMMBXGI';

// Ensure URL has https:// prefix
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl}`;
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
