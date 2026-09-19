import React, { useState, useRef, useEffect } from 'react';
import {
  CheckSquare,
  Search,
  Plus,
  Moon,
  Sun,
  Keyboard,
  Download,
  Upload,
  MoreVertical,
  X,
  Mic,
  MicOff,
  Sparkles,
  Timer,
  History,
  LayoutList,
  Kanban,
  Calendar,
  BarChart3,
  Trash2
} from 'lucide-react';

export default function Header({
  darkMode,
  setDarkMode,
  searchQuery,
  setSearchQuery,
  activeView,
  setActiveView,
  onOpenNewTask,
  onOpenShortcuts,
  onOpenTimer,
  onOpenActivity,
  onExportData,
  onImportData,
  onQuickNlpTask
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Speech to Text Web API
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome/Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        onQuickNlpTask(transcript);
      }
    };

    recognition.start();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result);
          onImportData(parsed);
        } catch (err) {
          alert('Invalid JSON file format.');
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const views = [
    { id: 'list', label: 'List', icon: LayoutList },
    { id: 'kanban', label: 'Kanban', icon: Kanban },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <CheckSquare className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-brand-700 to-purple-600 dark:from-white dark:via-brand-300 dark:to-purple-300 bg-clip-text text-transparent">
                TaskPulse
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 rounded border border-brand-200 dark:border-brand-800">
                v2.0
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl" aria-label="Views">
          {views.map((v) => {
            const Icon = v.icon;
            const isActive = activeView === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setActiveView(v.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{v.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Search Bar with NLP Support & Voice Input */}
        <div className="flex-1 max-w-sm relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              id="global-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or type task + Enter... (/)"
              className="w-full pl-9 pr-14 py-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 focus:bg-white dark:focus:bg-slate-900 border border-transparent focus:border-brand-500 rounded-xl text-xs sm:text-sm placeholder-slate-400 dark:placeholder-slate-500 transition-all outline-none"
            />

            {/* Voice Input Button */}
            <button
              onClick={handleVoiceInput}
              className={`absolute right-7 p-1 rounded-lg transition-colors ${
                isListening ? 'text-red-500 bg-red-100 dark:bg-red-950 animate-pulse' : 'text-slate-400 hover:text-brand-600'
              }`}
              title={isListening ? 'Listening...' : 'Voice create task (Speech-to-Text)'}
              aria-label="Voice input"
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>

            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 p-1 text-slate-400 hover:text-slate-600"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block absolute right-2 px-1 py-0.5 text-[9px] font-mono text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          
          {/* New Task Button */}
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm shadow-brand-500/25 active:scale-95 transition-all"
            aria-label="Create new task"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">New Task</span>
          </button>

          {/* Pomodoro Focus Timer Trigger */}
          <button
            onClick={onOpenTimer}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            title="Pomodoro Focus Timer"
            aria-label="Focus timer"
          >
            <Timer className="w-4 h-4 text-rose-500" />
          </button>

          {/* Activity Logs Trigger */}
          <button
            onClick={onOpenActivity}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            title="Activity Audit Log"
            aria-label="Activity history"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            title="Toggle theme (D)"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* More Options */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              title="More options"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 z-40 animate-fade-in text-xs font-semibold">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onExportData('json');
                  }}
                  className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Download className="w-4 h-4 text-brand-500" />
                  <span>Export JSON Backup</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onExportData('csv');
                  }}
                  className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Download className="w-4 h-4 text-purple-500" />
                  <span>Export CSV Spreadsheet</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800"
                >
                  <Upload className="w-4 h-4 text-emerald-500" />
                  <span>Import Backup</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenShortcuts();
                  }}
                  className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Keyboard className="w-4 h-4 text-slate-500" />
                  <span>Keyboard Shortcuts (?)</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
