'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Search,
  CheckCircle2,
  XCircle,
  Package,
  Calendar,
  Clock,
  ArrowRight,
  AlertCircle,
  Loader2,
  ChevronRight,
  HandHelping,
} from 'lucide-react';
import { api, asArray, formatTanggal } from '@/lib/api';
import { RequireRole } from '@/lib/auth';
import { Empty, ErrorState, Loading } from '@/components/States';
import { StatusBadge } from '@/components/StatusBadge';
import type { Loan } from '@/lib/types';

export default function AdminLoansPage() {
  return (
    <RequireRole allow={['staff', 'admin']}>
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filter, setFilter] = useState('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  // Rejection modal state
  const [rejectModalLoanId, setRejectModalLoanId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  async function muat() {
    setLoading(true);
    setError('');
    try {
      const q = filter ? `?status=${filter}&limit=100` : '?limit=100';
      const res = await api<unknown>(`/api/loans${q}`);
      setLoans(asArray<Loan>(res));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Gagal memuat daftar permohonan.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleAksi(
    id: string,
    actionPath: 'approve' | 'reject' | 'handover' | 'borrow',
    body?: Record<string, unknown>,
  ) {
    setMsg('');
    setActionLoading(true);

    const actualPath = actionPath === 'borrow' ? 'handover' : actionPath;
    let payload = body;
    if (actionPath === 'reject' && body) {
      payload = {
        ...body,
        rejection_reason:
          body.rejection_reason || body.rejectReason || 'Permohonan ditolak oleh petugas.',
        rejectionReason:
          body.rejection_reason || body.rejectReason || 'Permohonan ditolak oleh petugas.',
      };
    }

    try {
      await api(`/api/loans/${id}/${actualPath}`, {
        method: 'PATCH',
        body: payload ? JSON.stringify(payload) : undefined,
      });
      setMsg(
        actualPath === 'approve'
          ? 'Permohonan berhasil disetujui (APPROVED).'
          : actualPath === 'handover'
          ? 'Status diperbarui: Barang telah diserahkan (BORROWED).'
          : 'Permohonan berhasil ditolak (REJECTED).',
      );
      setRejectModalLoanId(null);
      setRejectReason('');
      await muat();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Aksi verifikasi gagal.');
    } finally {
      setActionLoading(false);
    }
  }

  const filteredLoans = useMemo(() => {
    if (!searchQuery.trim()) return loans;
    const q = searchQuery.toLowerCase();
    return loans.filter((l) => {
      const email = (l.borrower?.email || '').toLowerCase();
      const borrowerName = (l.borrower?.fullName || l.borrower?.name || '').toLowerCase();
      const itemsStr = (l.items ?? [])
        .map((i) => i.item?.name ?? i.itemId)
        .join(' ')
        .toLowerCase();
      const purpose = (l.purpose || '').toLowerCase();
      return (
        email.includes(q) ||
        borrowerName.includes(q) ||
        itemsStr.includes(q) ||
        purpose.includes(q)
      );
    });
  }, [loans, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Verifikasi &amp; Persetujuan Peminjaman
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Tinjau permohonan pinjam inventaris, berikan persetujuan, dan serahkan fisik barang kepada siswa.
          </p>
        </div>
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

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { val: 'PENDING', label: 'Menunggu (Pending)' },
              { val: 'APPROVED', label: 'Disetujui' },
              { val: 'BORROWED', label: 'Sedang Dipinjam' },
              { val: 'OVERDUE', label: 'Terlambat' },
              { val: 'RETURNED', label: 'Dikembalikan' },
              { val: 'REJECTED', label: 'Ditolak' },
              { val: '', label: 'Semua Status' },
            ].map((s) => (
              <button
                key={s.val}
                type="button"
                onClick={() => setFilter(s.val)}
                className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  filter === s.val
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative pt-2 border-t border-slate-100">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama siswa, email, nama barang, atau keperluan..."
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
      </div>

      {/* States */}
      {loading && <Loading text="Memuat daftar pengajuan..." />}
      {error && !loading && <ErrorState message={error} onRetry={muat} />}

      {!loading && !error && filteredLoans.length === 0 && (
        <Empty
          title="Tidak Ada Pengajuan"
          text={
            filter
              ? `Tidak ada peminjaman dengan status "${filter}".`
              : 'Belum ada data pengajuan dalam sistem.'
          }
        />
      )}

      {/* List Table / Cards */}
      {!loading && !error && filteredLoans.length > 0 && (
        <div className="space-y-3">
          {filteredLoans.map((loan) => {
            const borrowerName =
              loan.borrower?.fullName || loan.borrower?.name || 'Siswa';
            const borrowerEmail = loan.borrower?.email || 'email@sekolah.id';
            const itemsSummary =
              (loan.items ?? [])
                .map((r) => `${r.item?.name ?? r.itemId} (${r.quantity} unit)`)
                .join(', ') || loan.id;

            return (
              <div
                key={loan.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-slate-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {borrowerName}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({borrowerEmail})
                      </span>
                      <StatusBadge value={loan.status} />
                    </div>

                    <div className="text-xs text-slate-700">
                      <span className="font-semibold text-slate-900">
                        Peralatan:{' '}
                      </span>
                      <span>{itemsSummary}</span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Keperluan: {loan.purpose}
                    </p>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>Mulai: {formatTanggal(loan.loanDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>Jatuh Tempo: {formatTanggal(loan.dueDate)}</span>
                      </div>
                      {loan.returnedAt && (
                        <div className="flex items-center gap-1 text-emerald-600 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Kembali: {formatTanggal(loan.returnedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-wrap sm:flex-col items-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <Link
                      href={`/loans/${loan.id}`}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Detail
                    </Link>

                    {loan.status === 'PENDING' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleAksi(loan.id, 'approve')}
                          className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition disabled:opacity-60"
                        >
                          Setujui
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => {
                            setRejectModalLoanId(loan.id);
                            setRejectReason('');
                          }}
                          className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-60"
                        >
                          Tolak
                        </button>
                      </div>
                    )}

                    {loan.status === 'APPROVED' && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleAksi(loan.id, 'borrow')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-60"
                      >
                        <HandHelping className="h-3.5 w-3.5" />
                        <span>Serahkan Barang</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalLoanId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Tolak Pengajuan Peminjaman
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Tuliskan alasan penolakan secara resmi agar siswa memahami kendala peminjaman.
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alasan Penolakan <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="mis. Peralatan sedang dalam perawatan berkala atau stok bentrok dengan agenda sekolah..."
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalLoanId(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={actionLoading || !rejectReason.trim()}
                onClick={() =>
                  handleAksi(rejectModalLoanId, 'reject', { rejectReason: rejectReason.trim() })
                }
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition disabled:opacity-60"
              >
                {actionLoading ? 'Menolak...' : 'Konfirmasi Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
