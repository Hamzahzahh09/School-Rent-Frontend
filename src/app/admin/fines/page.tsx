'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  DollarSign,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { api, asArray, formatRupiah } from '@/lib/api';
import { RequireRole } from '@/lib/auth';
import { Empty, ErrorState, Loading } from '@/components/States';
import { StatusBadge } from '@/components/StatusBadge';
import type { Fine } from '@/lib/types';

export default function AdminFinesPage() {
  return (
    <RequireRole allow={['staff', 'admin']}>
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [waiveModalId, setWaiveModalId] = useState<string | null>(null);
  const [waiveReason, setWaiveReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  async function muat() {
    setLoading(true);
    setError('');
    try {
      const res = await api<unknown>('/api/fines?limit=100');
      setFines(asArray<Fine>(res));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Gagal memuat catatan denda.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muat();
  }, []);

  async function handlePay(id: string) {
    setMsg('');
    setActionLoading(true);
    try {
      await api(`/api/fines/${id}/pay`, { method: 'PATCH' });
      setMsg('Denda berhasil ditandai LUNAS (PAID).');
      await muat();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Gagal memperbarui status bayar.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleWaive() {
    if (!waiveModalId || !waiveReason.trim()) return;
    setMsg('');
    setActionLoading(true);
    try {
      await api(`/api/fines/${waiveModalId}/waive`, {
        method: 'PATCH',
        body: JSON.stringify({
          reason: waiveReason.trim(),
          waivedReason: waiveReason.trim(),
        }),
      });
      setMsg('Denda berhasil diputihkan (WAIVED).');
      setWaiveModalId(null);
      setWaiveReason('');
      await muat();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Gagal memutihkan denda.');
    } finally {
      setActionLoading(false);
    }
  }

  const filteredFines = useMemo(() => {
    if (!searchQuery.trim()) return fines;
    const q = searchQuery.toLowerCase();
    return fines.filter((f) => {
      const email = (f.borrower?.email || '').toLowerCase();
      const loanId = f.loanId.toLowerCase();
      return email.includes(q) || loanId.includes(q);
    });
  }, [fines, searchQuery]);

  const totalUnpaid = fines
    .filter((f) => f.status === 'UNPAID')
    .reduce((sum, f) => sum + (f.amount || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Kelola Denda Keterlambatan
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Konfirmasi pembayaran denda atau berikan pemutihan administratif bagi siswa.
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

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Tunggakan Aktif
          </span>
          <p className="mt-2 text-2xl font-bold text-rose-600">
            {formatRupiah(totalUnpaid)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {fines.filter((f) => f.status === 'UNPAID').length} tagihan belum diselesaikan
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Telah Lunas (PAID)
          </span>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {fines.filter((f) => f.status === 'PAID').length} Tagihan
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Telah dibayar siswa</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Pemutihan (WAIVED)
          </span>
          <p className="mt-2 text-2xl font-bold text-slate-700">
            {fines.filter((f) => f.status === 'WAIVED').length} Tagihan
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Diberikan keringanan</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan email siswa atau ID peminjaman..."
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
      </div>

      {/* States */}
      {loading && <Loading text="Memuat catatan denda..." />}
      {error && !loading && <ErrorState message={error} onRetry={muat} />}

      {!loading && !error && filteredFines.length === 0 && (
        <Empty
          title="Tidak Ada Catatan Denda"
          text="Semua peminjaman dikembalikan tepat waktu atau belum ada denda tercatat."
        />
      )}

      {/* Fines List */}
      {!loading && !error && filteredFines.length > 0 && (
        <div className="space-y-3">
          {filteredFines.map((f) => {
            const borrowerEmail = f.borrower?.email || 'Siswa';
            return (
              <div
                key={f.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-slate-300 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {formatRupiah(f.amount)}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs text-rose-600 font-semibold">
                      {f.daysLate} hari terlambat
                    </span>
                    <StatusBadge value={f.status} />
                  </div>
                  <p className="text-xs text-slate-600">
                    Peminjam: <span className="font-medium text-slate-800">{borrowerEmail}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    ID Peminjaman: <code className="text-slate-600">{f.loanId}</code>
                  </p>
                </div>

                {f.status === 'UNPAID' && (
                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handlePay(f.id)}
                      className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition disabled:opacity-60"
                    >
                      Tandai Lunas
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => {
                        setWaiveModalId(f.id);
                        setWaiveReason('');
                      }}
                      className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
                    >
                      Pemutihan (Waive)
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Waive Modal */}
      {waiveModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pemutihan Denda Siswa
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Tuliskan alasan resmi pembebasan / pemutihan denda (mis. dispensasi lomba, kegiatan sekolah, dll).
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alasan Pemutihan <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={waiveReason}
                onChange={(e) => setWaiveReason(e.target.value)}
                placeholder="mis. Dispensasi kegiatan ekstrakurikuler atas izin guru pembimbing..."
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWaiveModalId(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={actionLoading || !waiveReason.trim()}
                onClick={handleWaive}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-60"
              >
                {actionLoading ? 'Memproses...' : 'Simpan Pemutihan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
