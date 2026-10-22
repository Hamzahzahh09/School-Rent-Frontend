'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  XCircle,
  Package,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { api, formatRupiah, formatTanggal } from '@/lib/api';
import { RequireRole } from '@/lib/auth';
import { Empty, ErrorState, Loading } from '@/components/States';
import { StatusBadge } from '@/components/StatusBadge';
import type { Loan } from '@/lib/types';

export default function LoanDetailPage() {
  return (
    <RequireRole allow={['student', 'staff', 'admin']}>
      <Suspense fallback={<Loading text="Memuat detail peminjaman..." />}>
        <DetailInner />
      </Suspense>
    </RequireRole>
  );
}

function DetailInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  async function muat() {
    setLoading(true);
    setError('');
    try {
      const res = await api<Loan>(`/api/loans/${id}`);
      setLoan(res);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Gagal memuat rincian peminjaman.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleCancel() {
    setActionError('');
    setCancelling(true);
    try {
      await api(`/api/loans/${id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({
          cancellation_reason: 'Dibatalkan oleh pemohon',
        }),
      });
      setShowCancelModal(false);
      await muat();
    } catch (e) {
      setActionError(
        e instanceof Error
          ? e.message
          : 'Gagal membatalkan permohonan peminjaman.',
      );
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <Loading text="Mengambil rincian peminjaman..." />;
  if (error)
    return <ErrorState message={error} onRetry={() => location.reload()} />;
  if (!loan)
    return (
      <Empty
        title="Peminjaman Tidak Ditemukan"
        text="Data peminjaman ini tidak tercatat dalam database."
        action={{
          label: 'Kembali ke Daftar',
          href: '/loans',
        }}
      />
    );

  const isPending = loan.status === 'PENDING';
  const isOverdue = loan.status === 'OVERDUE';
  const isReturned = loan.status === 'RETURNED';

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Navigation Back */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali</span>
        </button>
        <span className="text-xs text-slate-400">/</span>
        <Link
          href="/loans"
          className="text-xs text-slate-500 hover:text-slate-800 transition"
        >
          Peminjaman
        </Link>
        <span className="text-xs text-slate-400">/</span>
        <span className="text-xs font-medium text-slate-700 truncate max-w-[200px]">
          ID: {loan.id.substring(0, 8)}...
        </span>
      </div>

      {actionError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <div>{actionError}</div>
        </div>
      )}

      {/* Main Detail Container */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Rincian Pengajuan Peminjaman
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              ID Peminjaman: <code className="text-blue-600">{loan.id}</code>
            </h1>
          </div>
          <StatusBadge value={loan.status} />
        </div>

        {/* Rejection notice if rejected */}
        {loan.rejectReason && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-rose-700">
              <XCircle className="h-4 w-4" />
              Alasan Penolakan Petugas:
            </p>
            <p className="text-rose-800 leading-relaxed pl-5">
              {loan.rejectReason}
            </p>
          </div>
        )}

        {/* Fine warning if fine exists */}
        {loan.fine && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-bold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                Denda Keterlambatan: {formatRupiah(loan.fine.amount)}
              </p>
              <StatusBadge value={loan.fine.status} />
            </div>
            <p className="text-rose-700 pl-5">
              Terlambat {loan.fine.daysLate} hari dari jadwal jatuh tempo.
            </p>
          </div>
        )}

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 text-xs">
          <div>
            <p className="text-slate-400">Tanggal Pinjam</p>
            <p className="mt-1 font-bold text-slate-800">
              {formatTanggal(loan.loanDate)}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Batas Jatuh Tempo</p>
            <p
              className={`mt-1 font-bold ${
                isOverdue ? 'text-rose-600' : 'text-slate-800'
              }`}
            >
              {formatTanggal(loan.dueDate)}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Waktu Pengembalian</p>
            <p className="mt-1 font-bold text-slate-800">
              {loan.returnedAt ? formatTanggal(loan.returnedAt) : 'Belum kembali'}
            </p>
          </div>
        </div>

        {/* Purpose & Notes */}
        <div className="space-y-3 text-xs border-b border-slate-100 pb-5">
          <div>
            <span className="font-semibold text-slate-700">Keperluan:</span>
            <p className="mt-0.5 text-slate-900 font-medium">{loan.purpose}</p>
          </div>
          {loan.notes && (
            <div>
              <span className="font-semibold text-slate-700">Catatan Pemohon:</span>
              <p className="mt-0.5 text-slate-600">{loan.notes}</p>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Daftar Barang yang Dipinjam
          </h2>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/90 bg-white">
            {(loan.items ?? []).map((row, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3.5 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      {row.item?.name ?? `ID Barang: ${row.itemId}`}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {row.item?.category?.name || 'Inventaris Sekolah'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-900">
                    {row.quantity} Unit
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cancellation Action if PENDING */}
        {isPending && (
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Permohonan ini masih dalam antrean verifikasi dan dapat dibatalkan sewaktu-waktu.
            </p>
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="w-full sm:w-auto rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
            >
              Batalkan Pengajuan
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Cancellation */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Konfirmasi Pembatalan
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin membatalkan pengajuan peminjaman ini?
                Tindakan ini tidak dapat diurungkan.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancel}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition disabled:opacity-60"
              >
                {cancelling ? 'Membatalkan...' : 'Ya, Batalkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
