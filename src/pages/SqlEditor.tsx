import { useState } from 'react';
import { Play, Database, AlertCircle, CheckCircle2, Terminal } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';

export function SqlEditor() {
  const [query, setQuery] = useState('SELECT * FROM tasks LIMIT 10;');
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const handleRunQuery = async () => {
    if (!query.trim() || !supabase) return;

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('exec_sql', { sql_query: query });

      if (rpcError) {
        // If the function doesn't exist, show the setup instructions
        if (rpcError.message.includes('Could not find the function') || rpcError.code === 'PGRST202') {
          setShowSetup(true);
          setError('The exec_sql function is not set up in your Supabase project yet. Please follow the setup instructions below.');
        } else {
          setError(rpcError.message);
        }
      } else if (data && typeof data === 'object' && !Array.isArray(data) && data.error) {
        setError(data.error);
      } else {
        setResults(Array.isArray(data) ? data : [data]);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const setupSql = `-- Run this in your Supabase SQL Editor to enable the in-app SQL editor
create or replace function exec_sql(sql_query text)
returns jsonb
language plpgsql
security definer
as $$
declare
  result jsonb;
begin
  -- Try to execute and fetch results (for SELECT, RETURNING, etc.)
  begin
    execute 'select json_agg(t) from (' || sql_query || ') t' into result;
    return coalesce(result, '[]'::jsonb);
  exception when others then
    -- If it fails, it might be a statement that doesn't return rows (INSERT/UPDATE/DELETE without RETURNING)
    execute sql_query;
    return '{"status": "success", "message": "Query executed successfully"}'::jsonb;
  end;
exception when others then
  return jsonb_build_object('error', sqlerrm);
end;
$$;`;

  return (
    <div className="max-w-6xl mx-auto space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <header className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
            <Database className="w-8 h-8 text-indigo-500" />
            SQL Editor
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Execute raw SQL queries directly against your Supabase database.</p>
        </div>
        <button
          onClick={() => setShowSetup(!showSetup)}
          className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors"
        >
          {showSetup ? 'Hide Setup' : 'Setup Instructions'}
        </button>
      </header>

      {showSetup && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-3xl p-6 shrink-0"
        >
          <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            One-Time Setup Required
          </h3>
          <p className="text-indigo-800 dark:text-indigo-200 mb-4 text-sm">
            To execute raw SQL from the browser, you need to create a secure RPC function in your Supabase project. 
            Copy the SQL below and run it in your <a href="https://supabase.com/dashboard/project/_/sql" target="_blank" rel="noreferrer" className="underline font-bold">Supabase SQL Editor</a>.
          </p>
          <div className="relative">
            <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-xl text-sm overflow-x-auto font-mono">
              {setupSql}
            </pre>
            <button 
              onClick={() => navigator.clipboard.writeText(setupSql)}
              className="absolute top-3 right-3 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors"
            >
              Copy SQL
            </button>
          </div>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-3 font-medium flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Warning: This grants the ability to run arbitrary SQL from the client. Use only for personal/development projects.
          </p>
        </motion.div>
      )}

      <div className="flex-1 flex flex-col gap-6 min-h-0">
        {/* Editor Section */}
        <div className="flex flex-col bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden shrink-0">
          <div className="bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300 font-mono">Query</span>
            <button
              onClick={handleRunQuery}
              disabled={isLoading || !query.trim()}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Run Query
            </button>
          </div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-40 p-4 bg-transparent text-zinc-900 dark:text-zinc-100 font-mono text-sm resize-none focus:outline-none"
            placeholder="SELECT * FROM users;"
            spellCheck={false}
          />
        </div>

        {/* Results Section */}
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300 font-mono">Results</span>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            {error ? (
              <div className="flex items-start gap-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-4 rounded-xl">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <pre className="text-sm font-mono whitespace-pre-wrap">{error}</pre>
              </div>
            ) : results ? (
              results.length === 0 ? (
                <div className="text-zinc-500 dark:text-zinc-400 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Query executed successfully. No rows returned.
                </div>
              ) : results[0]?.status === 'success' ? (
                <div className="text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" /> {results[0].message}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-800/50">
                      <tr>
                        {Object.keys(results[0]).map((key) => (
                          <th key={key} className="px-4 py-3 font-medium whitespace-nowrap">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {results.map((row, i) => (
                        <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                          {Object.values(row).map((val: any, j) => (
                            <td key={j} className="px-4 py-3 whitespace-nowrap text-zinc-700 dark:text-zinc-300 font-mono text-xs">
                              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-sm">
                Run a query to see results here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
