import { Bot, ExternalLink } from 'lucide-react';

export function GidduPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">Giddu Voice Assistant</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-8">
          Giddu Voice Assistant is your dedicated, hands-free study partner. Designed to streamline your learning, it helps you manage tasks, set reminders, and answer your study-related queries instantly with just your voice.
        </p>
        <a 
          href="https://giddu-phi.vercel.app/?utm_source=chatgpt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          Open Giddu <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
