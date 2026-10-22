'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Search,
  PlusCircle,
  RotateCcw,
  BarChart3,
  ArrowUpRight,
  ChevronRight,
  ShieldAlert,
  Inbox,
} from 'lucide-react';
import { api, asArray, formatTanggal, formatRupiah } from '@/lib/api';
import { RequireRole, useAuth } from '@/lib/auth';
import { Empty, ErrorState, Loading } from '@/components/States';
import { StatusBadge } from '@/components/StatusBadge';
import type { Loan } from '@/lib/types';

interface Stats {
  totalItems?: number;
  availableItems?: number;
  activeLoans?: number;
  pendingLoans?: number;
  overdueLoans?: number;
  totalFines?: number;
  totalUsers?: number;
  totalLoans?: number;
  [key: string]: number | undefined;
}

export default function DashboardPage() {
  return (
    <RequireRole allow={['student', 'staff', 'admin']}>
      <DashboardInner />
    </RequireRole>
  );
}

function DashboardInner() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentLoans, setRecentLoans] = useState<Loan[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [statsRes, loansRes] = await Promise.all([
          api<Record<string, unknown>>('/api/dashboard/stats')
            .catch(() => api<Record<string, unknown>>('/api/reports/statistics'))
            .catch(() => api<Record<string, unknown>>('/api/reports/dashboard'))
            .catch(() => null),
          api<unknown>('/api/loans?limit=5').catch(() => []),
        ]);
        if (active) {
          if (statsRes) {
            const raw = statsRes;
            setStats({
              totalItems: Number(raw.total_items ?? raw.totalItems ?? 0),
              availableItems: Number(raw.available_items ?? raw.availableItems ?? 0),
              activeLoans: Number(raw.active_loans ?? raw.activeLoans ?? 0),
              pendingLoans: Number(raw.pending_loans ?? raw.pendingLoans ?? 0),
              overdueLoans: Number(raw.overdue_loans ?? raw.overdueLoans ?? 0),
              totalFines: Number(raw.total_fines ?? raw.totalFines ?? 0),
              totalUsers: Number(raw.total_users ?? raw.totalUsers ?? 0),
              totalLoans: Number(raw.total_loans ?? raw.totalLoans ?? 0),
              ...raw,
            });
          }
          setRecentLoans(asArray<Loan>(loansRes).slice(0, 5));
        }
      } catch (e) {
        if (active)
          setError(
            e instanceof Error ? e.message : 'Gagal memuat informasi dashboard.',
          );
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const role = user?.role ?? 'student';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Personalized Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Halo, {user?.fullName || user?.email.split('@')[0]} 👋
            </h1>
            <StatusBadge value={role} showDot={false} />
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {role === 'student' &&
              'Kelola peminjaman inventaris sekolah dan pantau status barang Anda.'}
            {role === 'staff' &&
              'Pantau permintaan peminjaman baru dan proses pengembalian inventaris.'}
            {role === 'admin' &&
              'Pusat kendali ekosistem peminjaman, peralatan, pengguna, dan analitik.'}
          </p>
        </div>

        {/* Quick Action in Header */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/items"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-[0.98]"
          >
            <Search className="h-3.5 w-3.5" />
            Cari Peralatan
          </Link>
          {role === 'student' && (
            <Link
              href="/loans/create"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-[0.98]"
            >
              <PlusCircle className="h-3.5 w-3.5 text-blue-600" />
              Ajukan Pinjam
            </Link>
          )}
          {(role === 'staff' || role === 'admin') && (
            <Link
              href="/admin/loans"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-[0.98]"
            >
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              Proses Pengajuan
            </Link>
          )}
        </div>
      </div>

      {loading && <Loading text="Memuat ringkasan dashboard..." />}
      {error && !loading && (
        <ErrorState message={error} onRetry={() => location.reload()} />
      )}

      {/* KPI STAT CARDS */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium text-slate-500">
                Peminjaman Aktif
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Package className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              {stats?.activeLoans ?? 0}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">Sedang dalam penggunaan</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium text-slate-500">
                Menunggu Persetujuan
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              {stats?.pendingLoans ?? 0}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">Perlu verifikasi petugas</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium text-slate-500">
                Terlambat Kembali
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-rose-600">
              {stats?.overdueLoans ?? 0}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">Melewati batas tenggat</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium text-slate-500">
                {role === 'admin' ? 'Total Pengguna' : 'Peralatan Tersedia'}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                {role === 'admin' ? (
                  <Users className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              {role === 'admin'
                ? stats?.totalUsers ?? 0
                : stats?.availableItems ?? stats?.totalItems ?? 0}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              {role === 'admin' ? 'Akun terdaftar' : 'Siap dipinjam'}
            </p>
          </div>
        </div>
      )}

      {/* RECENT ACTIVITY & QUICK NAVIGATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Borrowings */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Aktivitas Peminjaman Terkini
              </h2>
              <p className="text-[11px] text-slate-500">
                {role === 'student'
                  ? 'Catatan pengajuan dan peminjaman terbaru Anda'
                  : 'Pengajuan terbaru di seluruh sistem'}
              </p>
            </div>
            <Link
              href={role === 'student' ? '/loans' : '/admin/loans'}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentLoans.length === 0 ? (
            <div className="py-8 text-center">
              <Inbox className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-600">
                Belum ada aktivitas peminjaman.
              </p>
              {role === 'student' && (
                <Link
                  href="/loans/create"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Mulai Ajukan Sekarang
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentLoans.map((loan) => {
                const itemName =
                  (loan.items && loan.items[0]?.item?.name) ||
                  (loan.items && loan.items[0]?.itemId) ||
                  'Peralatan Sekolah';
                const count = loan.items?.length || 1;
                const displayTitle =
                  count > 1 ? `${itemName} (+${count - 1} barang)` : itemName;

                return (
                  <Link
                    key={loan.id}
                    href={`/loans/${loan.id}`}
                    className="flex items-center justify-between gap-3 py-3 transition hover:bg-slate-50/80 -mx-2 px-2 rounded-xl"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-900">
                        {displayTitle}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Pinjam: {formatTanggal(loan.loanDate)} • Tenggat:{' '}
                        {formatTanggal(loan.dueDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge value={loan.status} />
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Role-based Shortcuts & Guidelines */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Akses Cepat
            </h2>
            <div className="space-y-2">
              <Link
                href="/items"
                className="flex items-center justify-between rounded-xl border border-slate-200/80 p-3 text-xs font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Search className="h-4 w-4" />
                  </div>
                  <span>Katalog Inventaris</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              {role === 'student' && (
                <>
                  <Link
                    href="/loans"
                    className="flex items-center justify-between rounded-xl border border-slate-200/80 p-3 text-xs font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <Package className="h-4 w-4" />
                      </div>
                      <span>Peminjaman Saya</span>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                  </Link>

                  <Link
                    href="/fines"
                    className="flex items-center justify-between rounded-xl border border-slate-200/80 p-3 text-xs font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <span>Informasi Denda</span>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                  </Link>
                </>
              )}

              {(role === 'staff' || role === 'admin') && (
                <>
                  <Link
                    href="/admin/returns"
                    className="flex items-center justify-between rounded-xl border border-slate-200/80 p-3 text-xs font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <RotateCcw className="h-4 w-4" />
                      </div>
                      <span>Proses Pengembalian</span>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                  </Link>

                  <Link
                    href="/admin/reports"
                    className="flex items-center justify-between rounded-xl border border-slate-200/80 p-3 text-xs font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                        <BarChart3 className="h-4 w-4" />
                      </div>
                      <span>Laporan &amp; Analitik</span>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                  </Link>
                </>
              )}

              {role === 'admin' && (
                <Link
                  href="/admin/users"
                  className="flex items-center justify-between rounded-xl border border-slate-200/80 p-3 text-xs font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <Users className="h-4 w-4" />
                    </div>
                    <span>Kelola Pengguna</span>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                </Link>
              )}
            </div>
          </div>

          {/* Policy reminder box */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-900 space-y-1.5">
            <p className="font-semibold flex items-center gap-1.5 text-blue-900">
              <ShieldAlert className="h-4 w-4 text-blue-600" />
              Tata Tertib Peminjaman
            </p>
            <p className="text-[11px] leading-relaxed text-blue-800">
              Pastikan peralatan yang dipinjam dirawat dengan baik. Keterlambatan
              pengembalian akan dikenakan sanksi denda otomatis per hari sesuai
              kebijakan inventaris sekolah.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
