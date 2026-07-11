import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { Bell, Check } from 'lucide-react';

export function Notifications() {
  const { notifications, markNotificationRead } = useStore();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">Notifications</h1>
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center">
            <p className="text-zinc-500 dark:text-zinc-400">No notifications.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-start gap-4 transition-opacity ${notification.read ? 'opacity-60' : ''}`}
            >
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-600 dark:text-indigo-400">
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-zinc-900 dark:text-white">{notification.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">{notification.message}</p>
                <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-2">{format(new Date(notification.created_at), 'MMM d, h:mm a')}</p>
              </div>
              {!notification.read && (
                <button 
                  onClick={() => markNotificationRead(notification.id)}
                  className="p-2 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <Check className="w-5 h-5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
