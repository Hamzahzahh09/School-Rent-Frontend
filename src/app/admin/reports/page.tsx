'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  Calendar,
  Package,
  Clock,
  RotateCcw,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { api, formatRupiah, formatTanggal } from '@/lib/api';
import { RequireRole } from '@/lib/auth';
import { Empty, ErrorState, Loading } from '@/components/States';

export default function AdminReportsPage() {
  return (
    <RequireRole allow={['staff', 'admin']}>
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const [periode, setPeriode] = useState('bulan');
  const [stats, setStats] = useState<Record<string, number | string> | null>(null);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function muat() {
    setLoading(true);
    setError('');
    try {
      const [s, r] = await Promise.all([
        api<unknown>('/api/reports/statistics')
          .catch(() => api<unknown>('/api/reports/stats'))
          .catch(() => null),
        api<unknown>('/api/reports/loans')
          .catch(() => api<unknown>(`/api/reports?periode=${periode}`))
          .catch(() => []),
      ]);
      setStats((s as Record<string, number | string>) ?? null);
      const arr = Array.isArray(r) ? r : (r as { data?: unknown })?.data;
      setRows(Array.isArray(arr) ? (arr as Record<string, unknown>[]) : []);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Gagal memuat rekapitulasi laporan.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periode]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header and Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Laporan &amp; Analisis Inventaris
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Statistik sirkulasi peralatan, frekuensi peminjaman, dan rekapitulasi data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Periode Rekap:</span>
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-700 font-semibold focus:border-blue-500 focus:outline-none"
          >
            <option value="hari">Hari Ini (Harian)</option>
            <option value="minggu">7 Hari Terakhir (Mingguan)</option>
            <option value="bulan">Bulan Ini (Bulanan)</option>
            <option value="tahun">Tahun Berjalan (Tahunan)</option>
          </select>
        </div>
      </div>

      {/* States */}
      {loading && <Loading text="Menganalisis data laporan..." />}
      {error && !loading && <ErrorState message={error} onRetry={muat} />}

      {/* Overview Stat Cards */}
      {!loading && !error && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(stats).map(([k, v]) => (
            <div
              key={k}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-1"
            >
              <span className="text-xs font-semibold text-slate-400 capitalize">
                {k.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <p className="text-2xl font-bold text-slate-900">{String(v ?? 0)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Period Report Table */}
      {!loading && !error && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Data Rincian Laporan ({periode})
              </h2>
              <p className="text-[11px] text-slate-500">
                Total tercatat: {rows.length} entri data pada periode ini
              </p>
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Belum ada riwayat aktivitas yang tercatat untuk periode ini.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200/90 bg-white">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    {Object.keys(rows[0] || {})
                      .slice(0, 6)
                      .map((col) => (
                        <th key={col} className="px-4 py-3 font-semibold capitalize">
                          {col.replace(/([A-Z])/g, ' $1').trim()}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.slice(0, 50).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition">
                      {Object.keys(rows[0] || {})
                        .slice(0, 6)
                        .map((col) => {
                          const val = row[col];
                          const str =
                            val !== null && typeof val === 'object'
                              ? JSON.stringify(val)
                              : String(val ?? '-');
                          return (
                            <td
                              key={col}
                              className="px-4 py-3 text-slate-700 truncate max-w-xs"
                            >
                              {str}
                            </td>
                          );
                        })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
