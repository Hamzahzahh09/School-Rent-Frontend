'use client';

import Link from 'next/link';
import { Package, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function Footer() {
  const { user } = useAuth();

  return (
    <footer className="border-t border-slate-200/80 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                <Package className="h-4 w-4" />
              </span>
              <span className="text-base font-bold tracking-tight text-slate-900">
                School<span className="text-blue-600">Rent</span>
              </span>
            </Link>
            <p className="max-w-md text-xs leading-relaxed text-slate-500">
              Platform pengelolaan dan peminjaman peralatan sekolah untuk siswa,
              petugas inventaris, dan administrator.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Sistem peminjaman terintegrasi dan aman</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Navigasi
            </h2>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li><Link href="/items" className="hover:text-blue-600 transition">Katalog Barang</Link></li>
              {user?.role === 'student' && (
                <>
                  <li><Link href="/loans" className="hover:text-blue-600 transition">Peminjaman Aktif</Link></li>
                  <li><Link href="/history" className="hover:text-blue-600 transition">Riwayat Peminjaman</Link></li>
                  <li><Link href="/fines" className="hover:text-blue-600 transition">Informasi Denda</Link></li>
                </>
              )}
              {user?.role === 'staff' && (
                <li><Link href="/admin/loans" className="hover:text-blue-600 transition">Portal Petugas</Link></li>
              )}
              {user?.role === 'admin' && (
                <li><Link href="/admin" className="hover:text-blue-600 transition">Panel Administrator</Link></li>
              )}
            </ul>
          </div>

          <div className="space-y-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Akun
            </h2>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {!user ? (
                <>
                  <li><Link href="/login" className="hover:text-blue-600 transition">Masuk</Link></li>
                  <li><Link href="/register" className="hover:text-blue-600 transition">Daftar Siswa</Link></li>
                </>
              ) : (
                <>
                  <li><Link href="/profile" className="hover:text-blue-600 transition">Profil Saya</Link></li>
                  <li><Link href="/notifications" className="hover:text-blue-600 transition">Notifikasi</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row">
          <p>© 2026 SchoolRent. Hak cipta dilindungi.</p>
          <p>Pinjam dengan bijak. Belajar lebih baik.</p>
        </div>
      </div>
    </footer>
  );
}
