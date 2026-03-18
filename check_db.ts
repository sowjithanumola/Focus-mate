import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ljercnystruokwflwzge.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZXJjbnlzdHJ1b2t3Zmx3emdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MzYwMjQsImV4cCI6MjA4OTMxMjAyNH0.m-_ERvavZKO2l4MMw94u9qZMSUPJhLLX7AejYMMBXGI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('subjects').select('*').limit(1);
  console.log('Subjects Error:', error);
  
  const { data: tData, error: tError } = await supabase.from('tasks').select('*').limit(1);
  console.log('Tasks Error:', tError);
}

check();
