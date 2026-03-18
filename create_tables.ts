import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ljercnystruokwflwzge.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZXJjbnlzdHJ1b2t3Zmx3emdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MzYwMjQsImV4cCI6MjA4OTMxMjAyNH0.m-_ERvavZKO2l4MMw94u9qZMSUPJhLLX7AejYMMBXGI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: `
    CREATE TABLE IF NOT EXISTS subjects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
      is_completed BOOLEAN DEFAULT FALSE,
      due_date DATE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS timetable (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
      day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
      start_time TIME NOT NULL,
      end_time TIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS study_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
      duration_minutes INTEGER NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Enable RLS
    ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
    ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
    ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if any
    DROP POLICY IF EXISTS "Users can manage their own subjects" ON subjects;
    DROP POLICY IF EXISTS "Users can manage their own tasks" ON tasks;
    DROP POLICY IF EXISTS "Users can manage their own timetable" ON timetable;
    DROP POLICY IF EXISTS "Users can manage their own study sessions" ON study_sessions;

    -- Create policies
    CREATE POLICY "Users can manage their own subjects" ON subjects FOR ALL USING (auth.uid() = user_id);
    CREATE POLICY "Users can manage their own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);
    CREATE POLICY "Users can manage their own timetable" ON timetable FOR ALL USING (auth.uid() = user_id);
    CREATE POLICY "Users can manage their own study sessions" ON study_sessions FOR ALL USING (auth.uid() = user_id);
  ` });
  console.log('RPC Error:', error);
}

check();
