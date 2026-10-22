'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  Search,
  Calendar,
  FileSpreadsheet,
  ChevronRight,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { api, asArray, formatRupiah, formatTanggal } from '@/lib/api';
import { RequireRole } from '@/lib/auth';
import { Empty, ErrorState, Loading } from '@/components/States';
import { StatusBadge } from '@/components/StatusBadge';
import type { Loan } from '@/lib/types';

export default function HistoryPage() {
  return (
    <RequireRole allow={['student', 'staff', 'admin']}>
      <HistoryInner />
    </RequireRole>
  );
}

function HistoryInner() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api<unknown>('/api/loans');
        if (active) setLoans(asArray<Loan>(res));
      } catch (e) {
        if (active)
          setError(
            e instanceof Error ? e.message : 'Gagal memuat riwayat peminjaman.',
          );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return loans;
    const q = searchQuery.toLowerCase();
    return loans.filter((l) => {
      const itemsStr = (l.items ?? [])
        .map((i) => i.item?.name ?? i.itemId)
        .join(' ')
        .toLowerCase();
      const purpose = (l.purpose || '').toLowerCase();
      return itemsStr.includes(q) || purpose.includes(q);
    });
  }, [loans, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Riwayat Peminjaman Lengkap
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Catatan historis seluruh permohonan peminjaman inventaris yang pernah diajukan.
        </p>
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari dalam riwayat (nama barang atau keperluan)..."
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
      </div>

      {/* States */}
      {loading && <Loading text="Mengambil data riwayat peminjaman..." />}
      {error && !loading && (
        <ErrorState message={error} onRetry={() => location.reload()} />
      )}

      {!loading && !error && filtered.length === 0 && (
        <Empty
          title="Riwayat Kosong"
          text="Belum ada catatan riwayat peminjaman inventaris sekolah."
          action={{
            label: 'Mulai Pinjam Barang',
            href: '/items',
          }}
        />
      )}

      {/* Table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Peralatan Dipinjam</th>
                <th className="px-4 py-3 font-semibold">Tgl Pinjam</th>
                <th className="px-4 py-3 font-semibold">Jatuh Tempo</th>
                <th className="px-4 py-3 font-semibold">Pengembalian</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Denda</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((l) => {
                const itemsText =
                  (l.items ?? [])
                    .map((r) => `${r.item?.name ?? r.itemId} (${r.quantity}x)`)
                    .join(', ') || '-';

                return (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3.5 max-w-xs">
                      <Link
                        href={`/loans/${l.id}`}
                        className="font-bold text-slate-900 hover:text-blue-600 transition block truncate"
                      >
                        {itemsText}
                      </Link>
                      <p className="text-[11px] text-slate-400 truncate">
                        {l.purpose}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      {formatTanggal(l.loanDate)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      {formatTanggal(l.dueDate)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      {l.returnedAt ? formatTanggal(l.returnedAt) : '-'}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge value={l.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      {l.fine && l.fine.amount > 0 ? (
                        <span className="font-semibold text-rose-600">
                          {formatRupiah(l.fine.amount)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/loans/${l.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <span>Detail</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
