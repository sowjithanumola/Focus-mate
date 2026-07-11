import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, CheckCircle2, Circle, Trash2, Calendar as CalendarIcon, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function Tasks() {
  const { tasks, subjects, addTask, updateTask, deleteTask } = useStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle,
      subject_id: selectedSubject || undefined,
      due_date: dueDate || undefined,
      is_completed: false,
    });

    setNewTaskTitle('');
    setSelectedSubject('');
    setDueDate('');
  };

  const filteredTasks = tasks;

  const pendingTasks = filteredTasks.filter(t => !t.is_completed);
  const completedTasks = filteredTasks.filter(t => t.is_completed);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Tasks</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your study assignments and to-dos.</p>
      </header>

      <form onSubmit={handleAddTask} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center shrink-0">
            <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 bg-transparent border-none text-lg focus:ring-0 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-4 pl-14">
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <Tag className="w-4 h-4 text-zinc-400" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-transparent text-sm border-none focus:ring-0 outline-none text-zinc-700 dark:text-zinc-300"
            >
              <option value="">No Subject</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <CalendarIcon className="w-4 h-4 text-zinc-400" />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-transparent text-sm border-none focus:ring-0 outline-none text-zinc-700 dark:text-zinc-300"
            />
          </div>

          <button
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="ml-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
          >
            Add Task
          </button>
        </div>
      </form>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            Pending Tasks
            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs py-0.5 px-2 rounded-full">
              {pendingTasks.length}
            </span>
          </h2>
          <div className="space-y-3">
            <AnimatePresence>
              {pendingTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl"
                >
                  <p className="text-zinc-500 dark:text-zinc-400">All caught up! Time to relax or study ahead.</p>
                </motion.div>
              ) : (
                pendingTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    subject={subjects.find(s => s.id === task.subject_id)}
                    onToggle={() => updateTask(task.id, { is_completed: true })}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {completedTasks.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              Completed
              <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs py-0.5 px-2 rounded-full">
                {completedTasks.length}
              </span>
            </h2>
            <div className="space-y-3 opacity-60">
              <AnimatePresence>
                {completedTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    subject={subjects.find(s => s.id === task.subject_id)}
                    onToggle={() => updateTask(task.id, { is_completed: false })}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskItem({ task, subject, onToggle, onDelete }: any) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md"
    >
      <button onClick={onToggle} className="shrink-0">
        {task.is_completed ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        ) : (
          <Circle className="w-6 h-6 text-zinc-300 dark:text-zinc-600 hover:text-indigo-500 transition-colors" />
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium truncate transition-all", 
          task.is_completed ? "text-zinc-400 line-through" : "text-zinc-900 dark:text-white"
        )}>
          {task.title}
        </p>
        <div className="flex items-center gap-3 mt-1">
          {subject && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-md text-white" style={{ backgroundColor: subject.color }}>
              {subject.name}
            </span>
          )}
          {task.due_date && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              {format(new Date(task.due_date), 'MMM d, yyyy')}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all shrink-0"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
