'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { api, asArray, formatRupiah, formatTanggal } from '@/lib/api';
import { RequireRole } from '@/lib/auth';
import { Empty, ErrorState, Loading } from '@/components/States';
import { StatusBadge } from '@/components/StatusBadge';
import type { Fine } from '@/lib/types';

export default function FinesPage() {
  return (
    <RequireRole allow={['student', 'staff', 'admin']}>
      <FinesInner />
    </RequireRole>
  );
}

function FinesInner() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function muat() {
    setLoading(true);
    setError('');
    try {
      const res = await api<unknown>('/api/fines');
      setFines(asArray<Fine>(res));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat catatan denda.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muat();
  }, []);

  const totalUnpaid = fines
    .filter((f) => f.status === 'UNPAID')
    .reduce((sum, f) => sum + (f.amount || 0), 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Informasi Denda Keterlambatan
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Pantau kewajiban denda administratif keterlambatan pengembalian inventaris sekolah.
        </p>
      </div>

      {/* Summary KPI Banner */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 rounded-2xl border border-rose-200 bg-rose-50/60 p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                Total Tagihan Belum Dibayar
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-rose-950">
                {formatRupiah(totalUnpaid)}
              </p>
              <p className="text-xs text-rose-700">
                Hubungi petugas di ruang inventaris untuk penyelesaian administrasi.
              </p>
            </div>
            <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <AlertTriangle className="h-7 w-7" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Status Catatan
              </span>
              <p className="mt-2 text-xl font-bold text-slate-900">
                {fines.filter((f) => f.status === 'UNPAID').length} Tertunggak
              </p>
              <p className="text-xs text-slate-500">
                {fines.filter((f) => f.status === 'PAID').length} Telah Lunas
              </p>
            </div>
          </div>
        </div>
      )}

      {/* States */}
      {loading && <Loading text="Memeriksa catatan denda..." />}
      {error && !loading && <ErrorState message={error} onRetry={muat} />}

      {!loading && !error && fines.length === 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-8 text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-950">
              Tidak Ada Catatan Denda
            </h3>
            <p className="text-xs text-emerald-800 max-w-md mx-auto mt-1">
              Hebat! Anda tidak memiliki catatan denda keterlambatan atau tunggakan
              administrasi inventaris sekolah.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/items"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
            >
              <span>Jelajahi Katalog Peralatan</span>
            </Link>
          </div>
        </div>
      )}

      {/* Fines List */}
      {!loading && !error && fines.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Rincian Tagihan Denda
          </h2>
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/90 bg-white shadow-xs">
            {fines.map((fine) => (
              <div
                key={fine.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 text-xs hover:bg-slate-50/60 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {formatRupiah(fine.amount)}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-medium">
                      {fine.daysLate} hari terlambat
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    ID Peminjaman:{' '}
                    <code className="text-slate-700">{fine.loanId}</code>
                    {fine.loan && ` (Tenggat: ${formatTanggal(fine.loan.dueDate)})`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge value={fine.status} />
                  <Link
                    href={`/loans/${fine.loanId}`}
                    className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <span>Rincian Loan</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
