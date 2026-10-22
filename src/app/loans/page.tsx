'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Package,
  PlusCircle,
  Calendar,
  Clock,
  ChevronRight,
  Filter,
  Search,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { api, asArray, formatTanggal, formatRupiah } from '@/lib/api';
import { RequireRole } from '@/lib/auth';
import { Empty, ErrorState, Loading } from '@/components/States';
import { StatusBadge } from '@/components/StatusBadge';
import type { Loan, LoanStatus } from '@/lib/types';

function getLoanTitle(l: Loan): string {
  const rows = l.items ?? [];
  if (rows.length === 0) return 'Peralatan Sekolah';
  const first = rows[0].item?.name ?? rows[0].itemId;
  return rows.length > 1 ? `${first} (+${rows.length - 1} barang lainnya)` : first;
}

const statusTabs: { key: string; label: string }[] = [
  { key: 'ALL', label: 'Semua Status' },
  { key: 'PENDING', label: 'Menunggu' },
  { key: 'APPROVED', label: 'Disetujui' },
  { key: 'BORROWED', label: 'Dipinjam' },
  { key: 'OVERDUE', label: 'Terlambat' },
  { key: 'RETURNED', label: 'Selesai' },
  { key: 'REJECTED', label: 'Ditolak' },
  { key: 'CANCELLED', label: 'Dibatalkan' },
];

export default function LoansPage() {
  return (
    <RequireRole allow={['student', 'staff', 'admin']}>
      <LoansInner />
    </RequireRole>
  );
}

function LoansInner() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function muat() {
    setLoading(true);
    setError('');
    try {
      const res = await api<unknown>('/api/loans');
      setLoans(asArray<Loan>(res));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Gagal memuat daftar peminjaman Anda.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muat();
  }, []);

  const filteredLoans = useMemo(() => {
    let result = [...loans];

    if (activeTab !== 'ALL') {
      result = result.filter((l) => l.status === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((l) => {
        const title = getLoanTitle(l).toLowerCase();
        const purpose = (l.purpose || '').toLowerCase();
        return title.includes(q) || purpose.includes(q);
      });
    }

    return result;
  }, [loans, activeTab, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Peminjaman Saya
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Kelola dan pantau seluruh permohonan pinjam inventaris dan tenggat pengembalian Anda.
          </p>
        </div>
        <Link
          href="/loans/create"
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Ajukan Pinjam Baru</span>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
        {/* Horizontal Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {statusTabs.map((tab) => {
            const active = activeTab === tab.key;
            const count =
              tab.key === 'ALL'
                ? loans.length
                : loans.filter((l) => l.status === tab.key).length;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    active ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative pt-1 border-t border-slate-100">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama barang atau keperluan..."
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
      </div>

      {/* States */}
      {loading && <Loading text="Memuat riwayat peminjaman..." />}
      {error && !loading && <ErrorState message={error} onRetry={muat} />}

      {!loading && !error && filteredLoans.length === 0 && (
        <Empty
          title="Tidak Ada Peminjaman"
          text={
            activeTab === 'ALL'
              ? 'Anda belum memiliki permohonan peminjaman inventaris.'
              : `Tidak ada peminjaman dengan status "${activeTab}".`
          }
          action={{
            label: 'Ajukan Peminjaman Sekarang',
            href: '/loans/create',
          }}
        />
      )}

      {/* Cards List */}
      {!loading && !error && filteredLoans.length > 0 && (
        <div className="space-y-3">
          {filteredLoans.map((loan) => {
            const title = getLoanTitle(loan);
            const isPending = loan.status === 'PENDING';
            const isOverdue = loan.status === 'OVERDUE';

            return (
              <div
                key={loan.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-blue-300 hover:shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition">
                      {title}
                    </span>
                    <StatusBadge value={loan.status} />
                    {loan.fine && loan.fine.amount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                        <AlertTriangle className="h-3 w-3" />
                        Denda: {formatRupiah(loan.fine.amount)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Keperluan: {loan.purpose}
                  </p>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>Pinjam: {formatTanggal(loan.loanDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock
                        className={`h-3.5 w-3.5 ${
                          isOverdue ? 'text-rose-500' : 'text-slate-400'
                        }`}
                      />
                      <span className={isOverdue ? 'font-bold text-rose-600' : ''}>
                        Jatuh Tempo: {formatTanggal(loan.dueDate)}
                      </span>
                    </div>
                    {loan.returnedAt && (
                      <div className="flex items-center gap-1 text-emerald-600 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Kembali: {formatTanggal(loan.returnedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <Link
                    href={`/loans/${loan.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <span>Detail</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
