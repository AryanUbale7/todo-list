import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, X, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function PomodoroTimer({ isOpen, onClose, tasks = [], onLogTime }) {
  const [mode, setMode] = useState('focus'); // 'focus' (25 min) or 'break' (5 min)
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playFinishSound();
      if (mode === 'focus' && selectedTaskId && onLogTime) {
        onLogTime(selectedTaskId, 25 * 60);
      }
      alert(mode === 'focus' ? '🎉 Focus session complete! Time for a 5-minute break.' : '⚡ Break finished! Ready to focus again?');
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, selectedTaskId, onLogTime]);

  const playFinishSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio Context error:', e);
    }
  };

  const setTimerMode = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progress = mode === 'focus'
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 w-80 animate-fade-in" role="dialog" aria-label="Pomodoro Focus Timer">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <Timer className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-white">Focus Timer</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          aria-label="Close timer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 text-xs font-semibold">
        <button
          onClick={() => setTimerMode('focus')}
          className={`py-1.5 rounded-lg transition-all ${
            mode === 'focus' ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500'
          }`}
        >
          Focus (25m)
        </button>
        <button
          onClick={() => setTimerMode('break')}
          className={`py-1.5 rounded-lg transition-all ${
            mode === 'break' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'
          }`}
        >
          Break (5m)
        </button>
      </div>

      {/* Timer Display */}
      <div className="text-center my-3">
        <div className="text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
          {formattedTime}
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              mode === 'focus' ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Task Binding Selector */}
      {tasks.length > 0 && mode === 'focus' && (
        <div className="mb-4">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Link to Task:
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
          >
            <option value="">-- No specific task --</option>
            {tasks.filter(t => t.status !== 'completed').map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white flex items-center justify-center gap-1.5 shadow-md transition-all ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600'
              : mode === 'focus'
              ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/25'
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25'
          }`}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
        </button>

        <button
          onClick={() => {
            setIsRunning(false);
            setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
          }}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          title="Reset timer"
          aria-label="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
