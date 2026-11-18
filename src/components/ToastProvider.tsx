'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
type ToastInput = { type: ToastType; message: string };
type ToastItem = ToastInput & { id: number };

const EVENT_NAME = 'schoolrent:toast';

function emit(type: ToastType, message: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<ToastInput>(EVENT_NAME, { detail: { type, message } }));
}

export const toast = {
  success: (message: string) => emit('success', message),
  error: (message: string) => emit('error', message),
  info: (message: string) => emit('info', message),
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    function receive(event: Event) {
      const detail = (event as CustomEvent<ToastInput>).detail;
      const id = Date.now() + Math.random();
      setItems((current) => [...current.slice(-3), { ...detail, id }]);
      window.setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== id));
      }, 4500);
    }
    window.addEventListener(EVENT_NAME, receive);
    return () => window.removeEventListener(EVENT_NAME, receive);
  }, []);

  return (
    <>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 top-20 z-[100] flex flex-col items-end gap-2 sm:left-auto sm:w-96"
        aria-live="polite"
        aria-atomic="false"
      >
        {items.map((item) => {
          const Icon = item.type === 'success' ? CheckCircle2 : item.type === 'error' ? AlertCircle : Info;
          const colors = item.type === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
            : item.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-900'
              : 'border-blue-200 bg-blue-50 text-blue-900';
          return (
            <div
              key={item.id}
              role={item.type === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl border p-4 shadow-lg ${colors}`}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="flex-1 text-sm font-medium leading-relaxed">{item.message}</p>
              <button
                type="button"
                onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}
                className="rounded p-0.5 opacity-70 hover:opacity-100"
                aria-label="Tutup pemberitahuan"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
