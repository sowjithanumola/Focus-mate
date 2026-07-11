import { Sun, Moon, Menu, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { notifications } = useStore();
  const unreadCount = notifications.filter(n => !n.read).length;
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
      </div>

      <div className="flex items-center gap-3">
        <Link to="/notifications" className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Link>
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
