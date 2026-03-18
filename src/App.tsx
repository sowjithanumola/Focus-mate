import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Layout } from './components/Layout';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Timer } from './pages/Timer';
import { Tasks } from './pages/Tasks';
import { Subjects } from './pages/Subjects';
import { Timetable } from './pages/Timetable';
import { Analytics } from './pages/Analytics';
import { Assistant } from './pages/Assistant';
import { isSupabaseConfigured, supabase } from './lib/supabase';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user && isSupabaseConfigured) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { fetchData } = useStore();

  useEffect(() => {
    fetchData();

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
        fetchData();
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [fetchData]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Auth />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="timer" element={<Timer />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="assistant" element={<Assistant />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
