import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Timer, CheckSquare, Calendar, BarChart2, BookOpen, Settings, LogOut, Bot } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Timer, label: 'Focus Timer', path: '/timer' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: BookOpen, label: 'Subjects', path: '/subjects' },
  { icon: Calendar, label: 'Timetable', path: '/timetable' },
  { icon: BarChart2, label: 'Analytics', path: '/analytics' },
  { icon: Bot, label: 'Study Assistant', path: '/assistant' },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="w-64 h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-3">
          <img src="/favicon.svg" alt="FocusMate Logo" className="w-8 h-8 drop-shadow-sm" />
          FocusMate
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                isActive 
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
        <button
          onClick={() => { handleLogout(); handleLinkClick(); }}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5 text-zinc-400 group-hover:text-red-600" />
          Log out
        </button>
        <div className="text-xs text-center text-zinc-500 dark:text-zinc-400 px-2">
          Made by Sowjith Anumola<br />
          Reach him at <a href="mailto:sowjith.anumola@gmail.com" className="text-indigo-500 hover:underline">sowjith.anumola@gmail.com</a>
        </div>
      </div>
    </div>
  );
}
