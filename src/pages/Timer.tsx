import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Play, Pause, RotateCcw, Coffee, Brain, Music, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const POMODORO = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

export function Timer() {
  const { addStudySession, subjects } = useStore();
  
  const [timeLeft, setTimeLeft] = useState(POMODORO);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [notes, setNotes] = useState('');
  
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handleComplete();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    setIsActive(false);
    
    // Play notification sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play();

    if (mode === 'pomodoro') {
      addStudySession({
        subject_id: selectedSubject || undefined,
        duration_minutes: 25,
        notes: notes || undefined
      });
      
      if (Notification.permission === 'granted') {
        new Notification('Focus Session Complete!', {
          body: 'Great job! Time for a break.',
        });
      }
      
      setMode('shortBreak');
      setTimeLeft(SHORT_BREAK);
    } else {
      setMode('pomodoro');
      setTimeLeft(POMODORO);
    }
  };

  const toggleTimer = () => {
    if (!isActive && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'pomodoro') setTimeLeft(POMODORO);
    else if (mode === 'shortBreak') setTimeLeft(SHORT_BREAK);
    else setTimeLeft(LONG_BREAK);
  };

  const changeMode = (newMode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    setIsActive(false);
    setMode(newMode);
    if (newMode === 'pomodoro') setTimeLeft(POMODORO);
    else if (newMode === 'shortBreak') setTimeLeft(SHORT_BREAK);
    else setTimeLeft(LONG_BREAK);
  };

  const toggleMusic = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3');
      audioRef.current.loop = true;
    }

    if (isPlayingMusic) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlayingMusic(!isPlayingMusic);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'pomodoro' 
    ? ((POMODORO - timeLeft) / POMODORO) * 100
    : mode === 'shortBreak'
      ? ((SHORT_BREAK - timeLeft) / SHORT_BREAK) * 100
      : ((LONG_BREAK - timeLeft) / LONG_BREAK) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
            
            {/* Background Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 opacity-10 pointer-events-none">
              <circle
                cx="50%"
                cy="50%"
                r="40%"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className={cn(
                  mode === 'pomodoro' ? "text-indigo-500" : "text-emerald-500"
                )}
                strokeDasharray="251.2%"
                strokeDashoffset={`${251.2 - (251.2 * progress) / 100}%`}
                strokeLinecap="round"
              />
            </svg>

            <div className="flex gap-4 mb-12 relative z-10 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-2xl">
              <button
                onClick={() => changeMode('pomodoro')}
                className={cn(
                  "px-6 py-2 rounded-xl font-medium transition-all flex items-center gap-2",
                  mode === 'pomodoro' 
                    ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                <Brain className="w-4 h-4" /> Focus
              </button>
              <button
                onClick={() => changeMode('shortBreak')}
                className={cn(
                  "px-6 py-2 rounded-xl font-medium transition-all flex items-center gap-2",
                  mode === 'shortBreak' 
                    ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                <Coffee className="w-4 h-4" /> Short Break
              </button>
              <button
                onClick={() => changeMode('longBreak')}
                className={cn(
                  "px-6 py-2 rounded-xl font-medium transition-all flex items-center gap-2",
                  mode === 'longBreak' 
                    ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                <Coffee className="w-4 h-4" /> Long Break
              </button>
            </div>

            <motion.div 
              key={timeLeft}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-8xl md:text-9xl font-bold text-zinc-900 dark:text-white font-mono tracking-tighter mb-12 relative z-10"
            >
              {formatTime(timeLeft)}
            </motion.div>

            <div className="flex items-center gap-6 relative z-10">
              <button
                onClick={toggleTimer}
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95",
                  mode === 'pomodoro' ? "bg-indigo-600 hover:bg-indigo-700" : "bg-emerald-600 hover:bg-emerald-700"
                )}
              >
                {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-2" />}
              </button>
              
              <button
                onClick={resetTimer}
                className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 text-indigo-500" />
              Focus Music
            </h3>
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
              <div>
                <p className="font-medium text-zinc-900 dark:text-white">Lo-Fi Study Beats</p>
                <p className="text-sm text-zinc-500">Continuous mix</p>
              </div>
              <button
                onClick={toggleMusic}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                  isPlayingMusic 
                    ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" 
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                )}
              >
                {isPlayingMusic ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Session Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                >
                  <option value="">Select a subject...</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Session Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What are you focusing on?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
