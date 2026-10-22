'use client';

import { useEffect, useState } from 'react';
import {
  Bell,
  CheckCheck,
  Clock,
  Inbox,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { api, asArray, formatTanggal } from '@/lib/api';
import { RequireRole } from '@/lib/auth';
import { Empty, ErrorState, Loading } from '@/components/States';
import type { NotificationRow } from '@/lib/types';

export default function NotificationsPage() {
  return (
    <RequireRole allow={['student', 'staff', 'admin']}>
      <NotifInner />
    </RequireRole>
  );
}

function NotifInner() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [marking, setMarking] = useState(false);

  async function muat() {
    setLoading(true);
    setError('');
    try {
      const res = await api<unknown>('/api/notifications');
      setItems(asArray<NotificationRow>(res));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Gagal memuat daftar notifikasi.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muat();
  }, []);

  async function tandaiSemua() {
    setMarking(true);
    try {
      await api('/api/notifications/read-all', { method: 'PATCH' });
      await muat();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Gagal menandai seluruh notifikasi.',
      );
    } finally {
      setMarking(false);
    }
  }

  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pemberitahuan &amp; Notifikasi
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Informasi status persetujuan, tenggat jatuh tempo, dan aktivitas peminjaman.
          </p>
        </div>

        {items.length > 0 && unreadCount > 0 && (
          <button
            onClick={tandaiSemua}
            disabled={marking}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition disabled:opacity-60"
          >
            <CheckCheck className="h-4 w-4 text-blue-600" />
            <span>{marking ? 'Memproses...' : 'Tandai Semua Dibaca'}</span>
          </button>
        )}
      </div>

      {/* States */}
      {loading && <Loading text="Memuat notifikasi terbaru..." />}
      {error && !loading && <ErrorState message={error} onRetry={muat} />}

      {!loading && !error && items.length === 0 && (
        <Empty
          title="Tidak Ada Notifikasi"
          text="Semua pemberitahuan sudah terbaca atau belum ada notifikasi baru untuk Anda."
        />
      )}

      {/* Notifications List */}
      {!loading && !error && items.length > 0 && (
        <div className="space-y-2.5">
          {items.map((n) => (
            <div
              key={n.id}
              className={`rounded-2xl border p-4 sm:p-5 text-xs transition ${
                n.isRead
                  ? 'border-slate-200/90 bg-white shadow-2xs'
                  : 'border-blue-200 bg-blue-50/50 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                    )}
                    <h3
                      className={`font-bold ${
                        n.isRead ? 'text-slate-900' : 'text-blue-950 font-extrabold'
                      }`}
                    >
                      {n.title}
                    </h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed pl-4">
                    {n.message}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-slate-400">
                  {formatTanggal(n.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
