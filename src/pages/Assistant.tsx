import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
};

export function Assistant() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('focusmate_assistant_chat');
    return saved ? JSON.parse(saved) : [
      { 
        id: '1', 
        role: 'model', 
        text: "Hi! I'm your FocusMate study assistant, created by sowjith anumola. I can help you understand complex topics, plan your study schedule, or just keep you motivated. What are we working on today?" 
      }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem('focusmate_assistant_chat', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    // Initialize the chat session
    if (!chatRef.current && process.env.GEMINI_API_KEY) {
      chatRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: "You are FocusMate, a helpful, encouraging personal study assistant created by sowjith anumola. You help students understand concepts, manage their time, and stay productive. Keep your answers concise, structured, and formatted with markdown. Be friendly and motivating. If anyone asks who made you or created you, you must say you were created by sowjith anumola.",
        }
      });
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      if (!chatRef.current) {
        throw new Error("Chat not initialized. Please check your Gemini API key.");
      }

      const response = await chatRef.current.sendMessage({ message: userMessage });
      
      setMessages(prev => [
        ...prev, 
        { id: Date.now().toString(), role: 'model', text: response.text || "I'm sorry, I couldn't process that." }
      ]);
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev, 
        { id: Date.now().toString(), role: 'model', text: `**Error:** ${error.message || 'Failed to get a response.'}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-indigo-500" />
          Study Assistant
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Your AI-powered personal tutor and productivity coach.</p>
      </header>

      <div className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                msg.role === 'user' 
                  ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" 
                  : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              )}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              
              <div className={cn(
                "px-5 py-4 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user'
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-none"
              )}>
                {msg.role === 'user' ? (
                  <p>{msg.text}</p>
                ) : (
                  <div className="markdown-body prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 dark:prose-pre:bg-black">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 max-w-[85%] mr-auto"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 rounded-tl-none flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
                <span className="text-sm text-zinc-500">Thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your studies..."
              className="w-full pl-6 pr-14 py-4 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none shadow-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
          <div className="text-center mt-3">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              AI Assistant can make mistakes. Consider verifying important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
