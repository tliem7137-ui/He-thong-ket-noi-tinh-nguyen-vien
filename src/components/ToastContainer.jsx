import React from 'react';
import { useApp } from '../context/useApp';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#0d530e] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#d49b11] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#437b62] shrink-0" />
  };

  const borders = {
    success: 'border-[#0d530e]/25 bg-[#f5f9f7] text-[#1f2d20]',
    error: 'border-rose-200 bg-rose-50 text-rose-900',
    warning: 'border-[#eaae1a]/45 bg-[#fef9eb] text-[#6d4c05]',
    info: 'border-[#437b62]/30 bg-white text-[#1f2d20]'
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-[0_12px_28px_rgba(13,83,14,0.14)] backdrop-blur-sm transition-all duration-300 animate-slide-in ${
            borders[toast.type] || borders.info
          }`}
        >
          {icons[toast.type] || icons.info}
          <div className="text-xs sm:text-sm font-medium leading-relaxed flex-1">{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-[#5a6b5c] hover:text-[#0d530e] transition-colors p-0.5 rounded-full cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
