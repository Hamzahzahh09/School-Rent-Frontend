'use client';

import Link from 'next/link';
import {
  Users,
  UserCheck,
  Box,
  Layers,
  ClipboardList,
  RotateCcw,
  AlertTriangle,
  BarChart3,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { RequireRole } from '@/lib/auth';

const adminModules = [
  {
    href: '/admin/loans',
    judul: 'Verifikasi Pengajuan',
    desc: 'Tinjau permohonan pinjam baru, setujui (APPROVE), atau tolak (REJECT) dengan alasan resmi.',
    icon: ClipboardList,
    color: 'text-amber-600 bg-amber-50',
    tag: 'Operasional',
  },
  {
    href: '/admin/returns',
    judul: 'Proses Pengembalian',
    desc: 'Catat barang kembali, periksa kondisi fisik (Good/Fair/Damaged), dan perbarui stok otomatis.',
    icon: RotateCcw,
    color: 'text-blue-600 bg-blue-50',
    tag: 'Operasional',
  },
  {
    href: '/admin/items',
    judul: 'Manajemen Inventaris',
    desc: 'Tambah peralatan baru, perbarui kuota stok, kelola status ketersediaan, dan arsip barang.',
    icon: Box,
    color: 'text-indigo-600 bg-indigo-50',
    tag: 'Inventaris',
  },
  {
    href: '/admin/categories',
    judul: 'Kelola Kategori',
    desc: 'Pengelompokan jenis barang inventaris seperti Multimedia, Lab Komputer, Elektronik, dll.',
    icon: Layers,
    color: 'text-emerald-600 bg-emerald-50',
    tag: 'Inventaris',
  },
  {
    href: '/admin/fines',
    judul: 'Pengelolaan Denda',
    desc: 'Daftar tunggakan denda keterlambatan pengembalian, konfirmasi bayar, atau pemutihan (waive).',
    icon: AlertTriangle,
    color: 'text-rose-600 bg-rose-50',
    tag: 'Keuangan',
  },
  {
    href: '/admin/reports',
    judul: 'Laporan & Statistik',
    desc: 'Pantau analitik peminjaman, frekuensi pemakaian barang terpopuler, dan rekapitulasi periode.',
    icon: BarChart3,
    color: 'text-purple-600 bg-purple-50',
    tag: 'Analitik',
  },
  {
    href: '/admin/users',
    judul: 'Manajemen Pengguna',
    desc: 'Kelola data seluruh akun siswa & staf, aktif/nonaktifkan akun, serta penyesuaian hak akses role.',
    icon: Users,
    color: 'text-slate-800 bg-slate-100',
    tag: 'Akses Admin',
  },
  {
    href: '/admin/staff',
    judul: 'Kelola Akun Staf',
    desc: 'Pendaftaran dan pembuatan akun petugas inventaris baru yang berwenang memproses barang.',
    icon: UserCheck,
    color: 'text-cyan-700 bg-cyan-50',
    tag: 'Akses Admin',
  },
];

export default function AdminHubPage() {
  return (
    <RequireRole allow={['staff', 'admin']}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Portal Manajemen Internal</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Pusat Kendali Petugas &amp; Administrator
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Akses cepat ke seluruh modul operasional peminjaman, inventarisasi, dan pelaporan sistem.
            </p>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {adminModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.href}
                href={module.href}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${module.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                      {module.tag}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                      {module.judul}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      {module.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                  <span>Buka Modul</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </RequireRole>
  );
}
