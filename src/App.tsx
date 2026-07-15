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
import { Notes } from './pages/Notes';
import { Analytics } from './pages/Analytics';
import { Notifications } from './pages/Notifications';
import { ZozoPage } from './pages/Zozo';
import { GidduPage } from './pages/Giddu';
import { MentorAIPage } from './pages/MentorAI';
import { isSupabaseConfigured, supabase } from './lib/supabase';

function NotificationChecker() {
  const { tasks, checkDueTasks } = useStore();

  useEffect(() => {
    checkDueTasks(); // Check once on mount
    const checkTasks = () => {
      // Existing browser notification logic
      const now = new Date();
      tasks.forEach(task => {
        if (!task.due_date || task.is_completed) return;
        
        const dueDate = new Date(task.due_date);
        const timeDiff = dueDate.getTime() - now.getTime();
        
        // Remind 15 minutes before
        if (timeDiff > 0 && timeDiff < 15 * 60 * 1000) {
          if (Notification.permission === 'granted') {
            new Notification(`Task Due Soon: ${task.title}`, {
              body: `Due at ${dueDate.toLocaleTimeString()}`,
            });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
          }
        }
      });
      // Existing internal notification logic
      checkDueTasks();
    };

    const interval = setInterval(checkTasks, 60000);
    return () => clearInterval(interval);
  }, [tasks, checkDueTasks]);

  return null;
}

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
      <NotificationChecker />
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
          <Route path="notes" element={<Notes />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="zozo" element={<ZozoPage />} />
          <Route path="giddu" element={<GidduPage />} />
          <Route path="ai" element={<MentorAIPage />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
