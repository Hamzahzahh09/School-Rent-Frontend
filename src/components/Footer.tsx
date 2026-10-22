'use client';

import Link from 'next/link';
import { Package, ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
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
              Platform modern pengelolaan dan peminjaman peralatan serta fasilitas
              sekolah. Didesain untuk memudahkan siswa, petugas inventaris, dan
              administrator sekolah bekerja lebih tertata.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Sistem Peminjaman Terintegrasi &amp; Aman</span>
            </div>
          </div>

          {/* Navigasi Siswa */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Layanan Siswa
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <Link href="/items" className="hover:text-blue-600 transition">
                  Katalog Barang
                </Link>
              </li>
              <li>
                <Link href="/loans" className="hover:text-blue-600 transition">
                  Peminjaman Aktif
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-blue-600 transition">
                  Riwayat Peminjaman
                </Link>
              </li>
              <li>
                <Link href="/fines" className="hover:text-blue-600 transition">
                  Informasi Denda
                </Link>
              </li>
            </ul>
          </div>

          {/* Operasional & Akun */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Akun &amp; Portal
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <Link href="/login" className="hover:text-blue-600 transition">
                  Masuk Akun
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-blue-600 transition">
                  Daftar Siswa Baru
                </Link>
              </li>
              <li>
                <Link href="/admin/loans" className="hover:text-blue-600 transition">
                  Portal Petugas
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-blue-600 transition">
                  Panel Administrator
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© 2026 SchoolRent. Hak cipta dilindungi.</p>
          <p className="flex items-center gap-1">
            Borrow smarter. Learn better.
          </p>
        </div>
      </div>
    </footer>
  );
}
