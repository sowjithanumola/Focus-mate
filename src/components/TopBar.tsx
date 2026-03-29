import { Search, Sun, Moon, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('focusmate_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('focusmate_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('focusmate_theme', 'light');
    }
  }, [isDark]);

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search tasks, subjects..." 
            className="w-full pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-800 border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-sm transition-all outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
