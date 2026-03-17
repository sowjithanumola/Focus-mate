import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Trash2, BookOpen, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
  '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'
];

export function Subjects() {
  const { subjects, addSubject, deleteSubject } = useStore();
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    addSubject({
      name: newSubjectName,
      color: selectedColor,
    });

    setNewSubjectName('');
    setSelectedColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Subjects</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Organize your courses and study topics.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <form onSubmit={handleAddSubject} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 sticky top-24">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Subject Name</label>
              <input
                type="text"
                required
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="e.g. Advanced Calculus"
                className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" /> Color Theme
              </label>
              <div className="grid grid-cols-5 gap-3">
                {COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${selectedColor === color ? 'scale-110 ring-2 ring-offset-2 ring-zinc-900 dark:ring-white dark:ring-offset-zinc-900' : 'hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!newSubjectName.trim()}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Subject
            </button>
          </form>
        </div>

        <div className="md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {subjects.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl"
                >
                  <BookOpen className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-500 dark:text-zinc-400">No subjects yet. Create your first one to get started.</p>
                </motion.div>
              ) : (
                subjects.map(subject => (
                  <motion.div
                    key={subject.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: subject.color }} />
                    <div className="flex items-start justify-between mt-2">
                      <div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{subject.name}</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          Created {new Date(subject.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteSubject(subject.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
