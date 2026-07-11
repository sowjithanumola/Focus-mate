import { Bot, ExternalLink } from 'lucide-react';

export function ZozoPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">Zozo</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-8">
          Zozo is a vibrant student community designed for seamless communication, collaboration, and knowledge sharing. Connect with your peers, engage in meaningful discussions, and build a stronger study network together.
        </p>
        <a 
          href="https://zozo-two-theta.vercel.app/?utm_source=chatgpt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          Open Zozo <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
