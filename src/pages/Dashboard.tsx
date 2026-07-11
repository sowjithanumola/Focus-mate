import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { CheckCircle2, Circle, Flame, Target, Clock, BookOpen, CheckSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { tasks, sessions, streak, dailyGoalMinutes, subjects, timetable, updateTask, user } = useStore();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const currentHour = today.getHours();
  const greeting = currentHour < 12 ? 'Good Morning!' : currentHour < 18 ? 'Good Afternoon!' : 'Good Evening!';
  
  const todayTasks = tasks.filter(t => {
    if (!t.due_date) return false;
    return t.due_date.startsWith(todayStr);
  });

  const todaySessions = sessions.filter(s => s.created_at.startsWith(todayStr));
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.duration_minutes, 0);
  const progressPercent = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100));

  const dayOfWeek = today.getDay();
  const todayClasses = timetable
    .filter(t => t.day_of_week === dayOfWeek)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{greeting} {user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Here's your study overview for {today.toDateString()}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Current Streak</p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">{streak} Days</h3>
            </div>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Keep it up! Study every day to maintain your streak.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm md:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Daily Goal</p>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">{todayMinutes} / {dailyGoalMinutes} min</h3>
              </div>
            </div>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{progressPercent}%</span>
          </div>
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-indigo-500 rounded-full"
            />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-500" />
              Today's Tasks
            </h2>
            <Link to="/tasks" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">View all</Link>
          </div>
          
          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                <p className="text-zinc-500 dark:text-zinc-400">No tasks due today. Enjoy your free time!</p>
              </div>
            ) : (
              todayTasks.map(task => (
                <div key={task.id} className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                  <button onClick={() => updateTask(task.id, { is_completed: !task.is_completed })}>
                    {task.is_completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-zinc-300 dark:text-zinc-600 hover:text-indigo-500 transition-colors" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className={cn("font-medium transition-all", task.is_completed ? "text-zinc-400 line-through" : "text-zinc-900 dark:text-white")}>
                      {task.title}
                    </p>
                    {task.subject_id && (
                      <span className="text-xs font-medium px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 mt-1 inline-block">
                        {subjects.find(s => s.id === task.subject_id)?.name || 'Unknown'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Today's Schedule
            </h2>
            <Link to="/timetable" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Edit</Link>
          </div>

          <div className="space-y-3">
            {todayClasses.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                <p className="text-zinc-500 dark:text-zinc-400">No classes scheduled for today.</p>
              </div>
            ) : (
              todayClasses.map(cls => {
                const subject = subjects.find(s => s.id === cls.subject_id);
                return (
                  <div key={cls.id} className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: subject?.color || '#cbd5e1' }} />
                    <div className="w-24 text-sm font-medium text-zinc-500 dark:text-zinc-400 border-r border-zinc-200 dark:border-zinc-800">
                      {cls.start_time} - {cls.end_time}
                    </div>
                    <div className="flex-1 pl-2">
                      <p className="font-bold text-zinc-900 dark:text-white">{subject?.name || 'Unknown Subject'}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
