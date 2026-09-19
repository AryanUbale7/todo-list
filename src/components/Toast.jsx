import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      bgColor: 'bg-emerald-600 text-white',
      borderColor: 'border-emerald-500'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-rose-600 text-white',
      borderColor: 'border-rose-500'
    },
    info: {
      icon: Info,
      bgColor: 'bg-slate-800 text-white',
      borderColor: 'border-slate-700'
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border ${config.bgColor} ${config.borderColor}`}>
        <Icon className="w-5 h-5 shrink-0" />
        <span className="text-xs sm:text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-full transition-colors ml-2"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
