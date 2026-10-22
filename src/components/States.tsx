'use client';

import React from 'react';
import { Loader2, AlertCircle, Inbox, RefreshCw } from 'lucide-react';

export function Loading({
  text = 'Memuat data...',
  compact = false,
}: {
  text?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 py-4 text-xs text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <span>{text}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
      <p className="mt-3 text-sm font-medium text-slate-700">{text}</p>
      <p className="mt-1 text-xs text-slate-400">Harap tunggu beberapa saat</p>
    </div>
  );
}

export function Empty({
  title = 'Tidak Ada Data',
  text,
  action,
}: {
  title?: string;
  text: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/70 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <Inbox className="h-6 w-6" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
        {text}
      </p>
      {action && (
        <div className="mt-4">
          {action.href ? (
            <a
              href={action.href}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700"
            >
              {action.label}
            </a>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Terjadi Kesalahan',
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-5 text-rose-900 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-rose-100 p-1.5 text-rose-600">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-rose-900">{title}</h4>
          <p className="mt-0.5 text-xs text-rose-700 leading-relaxed">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white shadow-xs transition hover:bg-rose-700"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Coba Lagi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
