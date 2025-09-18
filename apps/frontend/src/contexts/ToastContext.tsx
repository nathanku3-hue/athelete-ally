"use client";
import React, { createContext, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

type Toast = {
  id: string;
  message: string;
  variant?: 'success' | 'error' | 'info';
};

type ToastContextValue = {
  show: (message: string, variant?: Toast['variant']) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function show(message: string, variant: Toast['variant'] = 'info') {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }

  const value = useMemo(() => ({ show }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={[
                'px-4 py-2 rounded shadow text-white',
                t.variant === 'success' ? 'bg-green-600' : t.variant === 'error' ? 'bg-red-600' : 'bg-blue-600'
              ].join(' ')}
            >
              {t.message}
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
