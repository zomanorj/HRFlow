import React, { createContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 4000ms
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toastIcons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
    error: <XCircle className="h-5 w-5 text-rose-600 shrink-0" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />,
    info: <Info className="h-5 w-5 text-indigo-600 shrink-0" />,
  };

  const toastClasses = {
    success: 'bg-emerald-50/90 border border-emerald-100 text-emerald-900 shadow-emerald-100/50',
    error: 'bg-rose-50/90 border border-rose-100 text-rose-900 shadow-rose-100/50',
    warning: 'bg-amber-50/90 border border-amber-100 text-amber-900 shadow-amber-100/50',
    info: 'bg-indigo-50/90 border border-indigo-100 text-indigo-900 shadow-indigo-100/50',
  };

  return (
    <ToastContext.Provider value={{ showToast: addToast, toast: addToast }}>
      {children}
      
      {/* Container for toasts (fixed top-right) */}
      <div className="fixed top-6 right-6 z-100 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl backdrop-blur-md animate-fade-in transition-all duration-300 ${toastClasses[t.type] || toastClasses.success}`}
          >
            {toastIcons[t.type] || toastIcons.success}
            <div className="flex-1 text-sm font-bold leading-snug">
              {t.message}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 transition p-0.5 rounded-lg hover:bg-slate-100/50 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
