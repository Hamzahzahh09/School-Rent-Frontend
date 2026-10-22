'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Box,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ShieldCheck,
  PlusCircle,
  FileText,
} from 'lucide-react';
import { api } from '@/lib/api';
import { RequireRole } from '@/lib/auth';
import { Empty, ErrorState, Loading } from '@/components/States';
import { StatusBadge } from '@/components/StatusBadge';
import type { Item } from '@/lib/types';

export default function ItemDetailPage() {
  return (
    <RequireRole allow={['student', 'staff', 'admin']}>
      <Suspense fallback={<Loading text="Memuat detail peralatan..." />}>
        <DetailInner />
      </Suspense>
    </RequireRole>
  );
}

function DetailInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api<Item>(`/api/items/${id}`);
        if (active) setItem(res);
      } catch (e) {
        if (active)
          setError(
            e instanceof Error ? e.message : 'Gagal memuat detail barang.',
          );
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <Loading text="Mengambil informasi inventaris..." />;
  if (error)
    return <ErrorState message={error} onRetry={() => location.reload()} />;
  if (!item)
    return (
      <Empty
        title="Barang Tidak Ditemukan"
        text="Data peralatan tidak tercatat dalam database atau telah dihapus."
        action={{
          label: 'Kembali ke Katalog',
          href: '/items',
        }}
      />
    );

  const isAvailable = item.availableStock > 0 && item.status === 'AVAILABLE';

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
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
          href="/items"
          className="text-xs text-slate-500 hover:text-slate-800 transition"
        >
          Katalog
        </Link>
        <span className="text-xs text-slate-400">/</span>
        <span className="text-xs font-medium text-slate-700 truncate max-w-[200px]">
          {item.name}
        </span>
      </div>

      {/* Main Detail Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
        {/* Left Column: Visual Icon / Showcase */}
        <div className="md:col-span-5 flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50/70 p-8 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white border border-slate-200 text-blue-600 shadow-sm mb-4">
            <Box className="h-12 w-12" />
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {item.category?.name || 'Inventaris Umum'}
          </span>
          <h2 className="mt-1 text-base font-bold text-slate-900">{item.name}</h2>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            <StatusBadge value={item.status} />
            <StatusBadge value={item.condition} />
          </div>
        </div>

        {/* Right Column: Specs & Actions */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {item.name}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {item.description || 'Tidak ada deskripsi detail untuk peralatan ini.'}
              </p>
            </div>

            {/* Availability details box */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Ketersediaan Stok</span>
                <span className="font-bold text-slate-900">
                  {item.availableStock} dari {item.totalStock} Unit Siap
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isAvailable ? 'bg-blue-600' : 'bg-slate-400'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (item.availableStock / Math.max(1, item.totalStock)) * 100,
                      ),
                    )}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Stok diverifikasi real-time dengan status peminjaman siswa lain.
              </p>
            </div>

            {/* Borrowing Instructions */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-1.5">
              <h3 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-blue-600" />
                Ketentuan Peminjaman
              </h3>
              <ul className="text-[11px] text-blue-800 space-y-1 list-disc pl-4 leading-relaxed">
                <li>Pengajuan wajib disetujui petugas sebelum pengambilan fisik.</li>
                <li>Peralatan harus dikembalikan sesuai tanggal jatuh tempo yang diajukan.</li>
                <li>Laporkan segera kepada petugas apabila terdapat kendala teknis.</li>
              </ul>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-slate-100">
            {isAvailable ? (
              <Link
                href={`/loans/create?itemId=${item.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition active:scale-[0.98]"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Ajukan Peminjaman Barang Ini</span>
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-xs font-semibold text-slate-400 cursor-not-allowed"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Barang Sedang Tidak Tersedia</span>
              </button>
            )}

            <Link
              href="/items"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Lihat Peralatan Lain
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
