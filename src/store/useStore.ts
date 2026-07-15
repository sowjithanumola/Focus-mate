import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  subject_id?: string;
  is_completed: boolean;
  due_date?: string;
  created_at: string;
};

export type Subject = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
};

export type TimetableEntry = {
  id: string;
  user_id: string;
  subject_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string; // HH:mm
  end_time: string; // HH:mm
};

export type StudySession = {
  id: string;
  user_id: string;
  subject_id?: string;
  duration_minutes: number;
  notes?: string;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

type State = {
  user: any | null;
  tasks: Task[];
  subjects: Subject[];
  timetable: TimetableEntry[];
  sessions: StudySession[];
  notifications: Notification[];
  isLoading: boolean;
  streak: number;
  dailyGoalMinutes: number;
  
  fetchData: () => Promise<void>;
  addTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  addSubject: (subject: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  
  addTimetableEntry: (entry: Partial<TimetableEntry>) => Promise<void>;
  updateTimetableEntry: (id: string, updates: Partial<TimetableEntry>) => Promise<void>;
  deleteTimetableEntry: (id: string) => Promise<void>;
  
  addStudySession: (session: Partial<StudySession>) => Promise<void>;
  addNotification: (notification: Partial<Notification>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  checkDueTasks: () => Promise<void>;
};

const saveLocalData = (state: Partial<State>) => {
  if (!isSupabaseConfigured) {
    const current = localStorage.getItem('focusmate_data');
    const parsed = current ? JSON.parse(current) : {};
    localStorage.setItem('focusmate_data', JSON.stringify({ ...parsed, ...state }));
  }
};

const calculateStreak = (sessions: StudySession[]) => {
  if (!sessions || sessions.length === 0) return 0;
  
  const uniqueDates = Array.from(new Set(sessions.map(s => new Date(s.created_at).toISOString().split('T')[0])))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (!uniqueDates.includes(today) && !uniqueDates.includes(yesterday)) return 0;
  
  let currentStreak = 0;
  let checkDate = uniqueDates.includes(today) ? new Date(today) : new Date(yesterday);
  
  for (let i = 0; i < uniqueDates.length; i++) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (uniqueDates.includes(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return currentStreak;
};

export const useStore = create<State>((set, get) => ({
  user: null,
  tasks: [],
  subjects: [],
  timetable: [],
  sessions: [],
  notifications: [],
  isLoading: false,
  streak: 0,
  dailyGoalMinutes: 120, // 2 hours default

  fetchData: async () => {
    if (!isSupabaseConfigured || !supabase) {
      // Load from local storage for demo mode
      const localData = localStorage.getItem('focusmate_data');
      if (localData) {
        const parsed = JSON.parse(localData);
        const streak = calculateStreak(parsed.sessions || []);
        set({ ...parsed, streak, isLoading: false });
      } else {
        set({ isLoading: false });
      }
      return;
    }
    
    set({ isLoading: true });
    
    const { data: { session } } = await supabase.auth.getSession();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('fetchData -> session:', session);
    console.log('fetchData -> user:', user, 'error:', userError);

    if (!user) {
      set({ user: null, isLoading: false });
      return;
    }

    const fetchTable = async (table: string, orderColumn: string, ascending: boolean = true) => {
      if (!supabase) return [];
      const { data, error } = await supabase.from(table).select('*').order(orderColumn, { ascending });
      if (error) {
        console.error(`Error fetching ${table}:`, error);
        return [];
      }
      return data;
    };

    const [
      tasks,
      subjects,
      timetable,
      sessions
    ] = await Promise.all([
      fetchTable('tasks', 'created_at', false),
      fetchTable('subjects', 'name', true),
      fetchTable('timetable', 'start_time', true),
      fetchTable('study_sessions', 'created_at', false)
    ]);
    
    let notifications = [];
    try {
      if (supabase) {
        const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        notifications = data || [];
      }
    } catch (e) {
      console.warn('Notifications table might not exist');
    }

    const currentStreak = calculateStreak(sessions || []);

    set({
      user,
      tasks: tasks || [],
      subjects: subjects || [],
      timetable: timetable || [],
      sessions: sessions || [],
      notifications: notifications || [],
      streak: currentStreak,
      isLoading: false
    });
  },

  addTask: async (task) => {
    if (!supabase) {
      const newTask = { ...task, id: Date.now().toString(), created_at: new Date().toISOString() } as Task;
      set(state => {
        const newState = { tasks: [newTask, ...state.tasks] };
        saveLocalData(newState);
        return newState;
      });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...task, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
    }

    if (!error && data) {
      set(state => ({ tasks: [data, ...state.tasks] }));
    }
  },

  updateTask: async (id, updates) => {
    if (!supabase) {
      set(state => {
        const newState = {
          tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
        };
        saveLocalData(newState);
        return newState;
      });
      return;
    }
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id);

    if (!error) {
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
      }));
    }
  },

  deleteTask: async (id) => {
    if (!supabase) {
      set(state => {
        const newState = {
          tasks: state.tasks.filter(t => t.id !== id)
        };
        saveLocalData(newState);
        return newState;
      });
      return;
    }
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (!error) {
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== id)
      }));
    }
  },

  addSubject: async (subject) => {
    if (!supabase) {
      const newSubject = { ...subject, id: Date.now().toString(), created_at: new Date().toISOString() } as Subject;
      set(state => {
        const newState = { subjects: [...state.subjects, newSubject].sort((a, b) => a.name.localeCompare(b.name)) };
        saveLocalData(newState);
        return newState;
      });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('subjects')
      .insert([{ ...subject, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error adding subject:', error);
    }

    if (!error && data) {
      set(state => ({ subjects: [...state.subjects, data].sort((a, b) => a.name.localeCompare(b.name)) }));
    }
  },

  deleteSubject: async (id) => {
    if (!supabase) {
      set(state => {
        const newState = {
          subjects: state.subjects.filter(s => s.id !== id),
          timetable: state.timetable.filter(t => t.subject_id !== id),
          tasks: state.tasks.map(t => t.subject_id === id ? { ...t, subject_id: undefined } : t)
        };
        saveLocalData(newState);
        return newState;
      });
      return;
    }
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    if (!error) {
      set(state => ({
        subjects: state.subjects.filter(s => s.id !== id),
        timetable: state.timetable.filter(t => t.subject_id !== id),
        tasks: state.tasks.map(t => t.subject_id === id ? { ...t, subject_id: undefined } : t)
      }));
    }
  },

  addTimetableEntry: async (entry) => {
    if (!supabase) {
      const newEntry = { ...entry, id: Date.now().toString() } as TimetableEntry;
      set(state => {
        const newState = { timetable: [...state.timetable, newEntry] };
        saveLocalData(newState);
        return newState;
      });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('timetable')
      .insert([{ ...entry, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error adding timetable entry:', error);
    }

    if (!error && data) {
      set(state => ({ timetable: [...state.timetable, data] }));
    }
  },

  updateTimetableEntry: async (id, updates) => {
    if (!supabase) {
      set(state => {
        const newState = {
          timetable: state.timetable.map(t => t.id === id ? { ...t, ...updates } : t)
        };
        saveLocalData(newState);
        return newState;
      });
      return;
    }
    const { error } = await supabase
      .from('timetable')
      .update(updates)
      .eq('id', id);

    if (!error) {
      set(state => ({
        timetable: state.timetable.map(t => t.id === id ? { ...t, ...updates } : t)
      }));
    }
  },

  deleteTimetableEntry: async (id) => {
    if (!supabase) {
      set(state => {
        const newState = {
          timetable: state.timetable.filter(t => t.id !== id)
        };
        saveLocalData(newState);
        return newState;
      });
      return;
    }
    const { error } = await supabase
      .from('timetable')
      .delete()
      .eq('id', id);

    if (!error) {
      set(state => ({
        timetable: state.timetable.filter(t => t.id !== id)
      }));
    }
  },

  addStudySession: async (session) => {
    if (!supabase) {
      const newSession = { ...session, id: Date.now().toString(), created_at: new Date().toISOString() } as StudySession;
      set(state => {
        const newState = { sessions: [newSession, ...state.sessions] };
        saveLocalData(newState);
        return newState;
      });
      get().fetchData(); // Refresh streak
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('study_sessions')
      .insert([{ ...session, user_id: user.id }])
      .select()
      .single();

    if (!error && data) {
      set(state => ({ sessions: [data, ...state.sessions] }));
      get().fetchData(); // Refresh streak
    }
  },

  addNotification: async (notification) => {
    if (!supabase) {
      const newNotification = { ...notification, id: Date.now().toString(), read: false, created_at: new Date().toISOString() } as Notification;
      set(state => {
        const newState = { notifications: [newNotification, ...state.notifications] };
        saveLocalData(newState);
        return newState;
      });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .insert([{ ...notification, user_id: user.id, read: false }])
      .select()
      .single();

    if (!error && data) {
      set(state => ({ notifications: [data, ...state.notifications] }));
    }
  },

  markNotificationRead: async (id) => {
    if (!supabase) {
      set(state => {
        const newState = {
          notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
        };
        saveLocalData(newState);
        return newState;
      });
      return;
    }
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (!error) {
      set(state => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      }));
    }
  },

  checkDueTasks: async () => {
    const { tasks, notifications, addNotification } = get();
    const today = new Date().toISOString().split('T')[0];

    for (const task of tasks) {
      if (task.due_date && task.due_date.startsWith(today) && !task.is_completed) {
        const exists = notifications.some(n =>
          n.title === 'Task Due' &&
          n.message.includes(task.title) &&
          n.created_at.startsWith(today)
        );
        if (!exists) {
          await addNotification({
            title: 'Task Due',
            message: `Task "${task.title}" is due today!`,
          });
        }
      }
    }
  }
}));
