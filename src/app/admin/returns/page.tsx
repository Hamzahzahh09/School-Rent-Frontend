'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Package,
  FileText,
  AlertCircle,
  Loader2,
  Calendar,
} from 'lucide-react';
import { api, asArray, formatTanggal } from '@/lib/api';
import { RequireRole } from '@/lib/auth';
import { Empty, ErrorState, Loading } from '@/components/States';
import { StatusBadge } from '@/components/StatusBadge';
import type { Loan, ItemCondition } from '@/lib/types';

export default function AdminReturnsPage() {
  return (
    <RequireRole allow={['staff', 'admin']}>
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loanId, setLoanId] = useState('');
  const [condition, setCondition] = useState<ItemCondition>('GOOD');
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function muat() {
    setLoading(true);
    setError('');
    try {
      const [borrowed, overdue] = await Promise.all([
        api<unknown>('/api/loans?status=BORROWED&limit=50').catch(() => []),
        api<unknown>('/api/loans?status=OVERDUE&limit=50').catch(() => []),
      ]);
      setLoans([...asArray<Loan>(borrowed), ...asArray<Loan>(overdue)]);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Gagal memuat daftar peminjaman aktif.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muat();
  }, []);

  const selectedLoan = loans.find((l) => l.id === loanId);

  async function handleProcess(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    if (!loanId) return setMsg('Pilih peminjaman yang hendak diproses.');

    setSubmitting(true);
    const conditionMap: Record<string, string> = {
      GOOD: 'BAIK',
      FAIR: 'RUSAK_RINGAN',
      DAMAGED: 'RUSAK_BERAT',
      BAIK: 'BAIK',
      RUSAK_RINGAN: 'RUSAK_RINGAN',
      RUSAK_BERAT: 'RUSAK_BERAT',
      HILANG: 'HILANG',
    };

    try {
      await api('/api/returns', {
        method: 'POST',
        body: JSON.stringify({
          loan_id: loanId,
          item_condition: conditionMap[condition] || 'BAIK',
          notes: notes.trim() || undefined,
          // Fallback properties
          loanId,
          condition,
        }),
      });
      setLoanId('');
      setNotes('');
      setCondition('GOOD');
      setMsg(
        'Pengembalian berhasil diverifikasi! Stok barang telah dipulihkan dan denda dihitung otomatis oleh server.',
      );
      await muat();
    } catch (err) {
      setMsg(
        err instanceof Error
          ? err.message
          : 'Gagal memproses pengembalian barang.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Penerimaan &amp; Proses Pengembalian
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Verifikasi fisik barang yang dikembalikan siswa, nilai kondisi peralatan,
          dan pulihkan kuota ketersediaan stok inventaris.
        </p>
      </div>

      {msg && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50/90 p-3.5 text-xs text-blue-900"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
          <div className="leading-relaxed">{msg}</div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Formulir Pengembalian Fisik
        </h2>

        <form onSubmit={handleProcess} className="space-y-4">
          {/* Select Loan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Catatan Peminjaman Aktif <span className="text-rose-500">*</span>
            </label>
            <select
              value={loanId}
              onChange={(e) => setLoanId(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            >
              <option value="">— Pilih Siswa / Barang yang Dikembalikan —</option>
              {loans.map((l) => {
                const borrower =
                  l.borrower?.fullName || l.borrower?.email || l.id;
                const itemsStr =
                  (l.items ?? [])
                    .map((i) => `${i.item?.name ?? i.itemId} (${i.quantity}x)`)
                    .join(', ') || '-';
                return (
                  <option key={l.id} value={l.id}>
                    {borrower} — {itemsStr} [Tenggat: {formatTanggal(l.dueDate)} • {l.status}]
                  </option>
                );
              })}
            </select>
          </div>

          {/* Selected Loan Details Preview if selected */}
          {selectedLoan && (
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  {selectedLoan.borrower?.fullName || selectedLoan.borrower?.email}
                </span>
                <StatusBadge value={selectedLoan.status} />
              </div>
              <p className="text-slate-600">
                Peralatan:{' '}
                {(selectedLoan.items ?? [])
                  .map((i) => `${i.item?.name ?? i.itemId} (${i.quantity}x)`)
                  .join(', ')}
              </p>
              <p className="text-[11px] text-slate-400">
                Tgl Pinjam: {formatTanggal(selectedLoan.loanDate)} • Tenggat Jatuh
                Tempo: {formatTanggal(selectedLoan.dueDate)}
              </p>
            </div>
          )}

          {/* Condition Evaluation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kondisi Fisik Saat Dikembalikan <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: 'GOOD', label: 'Baik (Normal)', desc: 'Lengkap & berfungsi' },
                { val: 'FAIR', label: 'Cukup', desc: 'Ada goresan ringan' },
                { val: 'DAMAGED', label: 'Rusak', desc: 'Perlu perbaikan/ganti' },
              ].map((c) => (
                <label
                  key={c.val}
                  className={`flex flex-col rounded-xl border p-3 cursor-pointer select-none transition ${
                    condition === c.val
                      ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="condition"
                    value={c.val}
                    checked={condition === c.val}
                    onChange={() => setCondition(c.val as ItemCondition)}
                    className="sr-only"
                  />
                  <span className="text-xs font-bold text-slate-900">
                    {c.label}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    {c.desc}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Pemeriksaan Petugas
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="mis. Kabel HDMI lengkap, lensa bersih, unit berfungsi normal..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !loanId}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memproses Pengembalian...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4" />
                  <span>Selesaikan &amp; Pulihkan Stok</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Active Borrowed Loans Overview */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Antrean Peminjaman Aktif ({loans.length})
        </h2>

        {loading && <Loading text="Memuat daftar peminjaman aktif..." />}
        {error && !loading && <ErrorState message={error} onRetry={muat} />}

        {!loading && !error && loans.length === 0 && (
          <Empty
            title="Tidak Ada Peminjaman Aktif"
            text="Semua inventaris sekolah saat ini berada di ruang penyimpanan atau telah dikembalikan."
          />
        )}

        {!loading && !error && loans.length > 0 && (
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/90 bg-white shadow-xs">
            {loans.map((l) => (
              <div
                key={l.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-xs hover:bg-slate-50/60 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {l.borrower?.fullName || l.borrower?.email}
                    </span>
                    <StatusBadge value={l.status} />
                  </div>
                  <p className="mt-1 text-slate-600">
                    Barang:{' '}
                    {(l.items ?? [])
                      .map((i) => `${i.item?.name ?? i.itemId} (${i.quantity}x)`)
                      .join(', ')}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Jatuh tempo: {formatTanggal(l.dueDate)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLoanId(l.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 font-semibold text-blue-700 hover:bg-blue-100 transition"
                >
                  Pilih untuk Return
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
