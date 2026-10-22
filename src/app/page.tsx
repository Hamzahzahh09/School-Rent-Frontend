'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Search,
  CheckCircle2,
  RotateCcw,
  Clock,
  Sparkles,
  ShieldCheck,
  Box,
  Laptop,
  Camera,
  Film,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { api, asArray } from '@/lib/api';
import type { Item } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { Loading } from '@/components/States';

export default function HomePage() {
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api<unknown>(
          '/api/items?only_available=true&onlyAvailable=true&limit=6',
          {
            auth: false,
          },
        );
        if (active) {
          const list = asArray<Item>(res);
          setFeaturedItems(list);
        }
      } catch {
        if (active) setFetchError(true);
      } finally {
        if (active) setLoadingItems(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-col">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white py-12 md:py-20 lg:py-24">
        {/* Subtle background grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#0f172a 1px, transparent 1px), radial-gradient(#0f172a 1px, #ffffff 1px)',
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Column: Headline and CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700">
                <span className="flex h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                SCHOOL EQUIPMENT BORROWING PLATFORM
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-5xl xl:text-6xl leading-[1.15]">
                Everything Your School Needs,{' '}
                <span className="text-blue-600">Within Reach.</span>
              </h1>

              <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-slate-600">
                SchoolRent memudahkan siswa menjelajahi dan meminjam fasilitas,
                peralatan lab, multimedia, serta sarana belajar sekolah secara
                terstruktur. Petugas dan admin dapat memvalidasi pengajuan, melacak
                tenggat, dan memantau ketersediaan stok secara transparan.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href="/items"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  Explore Equipment
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#cara-kerja"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-[0.98]"
                >
                  How It Works
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Stok Riil &amp; Terverifikasi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Proses Pengajuan Cepat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  <span>Pengawasan Petugas Resmi</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Visual Showcase */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                {/* Background decorative glow */}
                <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-xl opacity-70" />

                <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  {/* Visual Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <Box className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Inventaris Populer
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Siap dipinjam hari ini
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                      Live Database
                    </span>
                  </div>

                  {/* Representative item cards mock */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 transition hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 text-blue-600 shadow-2xs">
                          <Laptop className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">
                            Laptop Lab Multimedia
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Intel Core i7 • 16GB RAM • Desain Grafis
                          </p>
                        </div>
                      </div>
                      <StatusBadge value="AVAILABLE" showDot={true} />
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 transition hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 text-indigo-600 shadow-2xs">
                          <Film className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">
                            Proyektor Epson EB-E01
                          </p>
                          <p className="text-[10px] text-slate-500">
                            3300 Lumens • HDMI • Presentasi Kelas
                          </p>
                        </div>
                      </div>
                      <StatusBadge value="AVAILABLE" showDot={true} />
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 transition hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 text-amber-600 shadow-2xs">
                          <Camera className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">
                            Kamera DSLR Canon EOS
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Lensa Kit 18-55mm • Dokumentasi Acara
                          </p>
                        </div>
                      </div>
                      <StatusBadge value="BORROWED" showDot={true} />
                    </div>
                  </div>

                  {/* Micro action */}
                  <div className="pt-2">
                    <Link
                      href="/items"
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-600 hover:border-blue-400 hover:text-blue-600 transition"
                    >
                      <span>Lihat Seluruh Barang Sekolah</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM HIGHLIGHTS */}
      <section id="keunggulan" className="border-b border-slate-200/80 bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Keunggulan Sistem
            </h2>
            <p className="mt-1.5 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Dirancang untuk Produktivitas Ekosistem Sekolah
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-3.5">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Easy Equipment Discovery
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                Pencarian instan dan filter kategori, kondisi fisik, serta status
                ketersediaan secara akurat tanpa harus mengecek fisik gudang.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 mb-3.5">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Simple Borrowing Requests
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                Pengajuan digital dengan menentukan tanggal peminjaman, jatuh
                tempo, dan keperluan kegiatan dalam hitungan detik.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 mb-3.5">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Transparent Request Tracking
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                Pantau langsung status persetujuan dari petugas, konfirmasi
                penyerahan barang, dan pembatalan mandiri sebelum diverifikasi.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 mb-3.5">
                <RotateCcw className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Organized Returns &amp; Fines
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                Pencatatan pengembalian yang tertib, evaluasi kondisi barang kembali,
                serta kalkulasi denda otomatis bila melewati jatuh tempo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED EQUIPMENT */}
      <section className="border-b border-slate-200/80 bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                Katalog Unggulan
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Available for Borrowing
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Peralatan sekolah yang saat ini siap digunakan untuk menunjang
                kegiatan pembelajaran Anda.
              </p>
            </div>

            <Link
              href="/items"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
            >
              <span>Browse All Equipment</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loadingItems ? (
            <Loading text="Memuat peralatan yang tersedia..." />
          ) : featuredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredItems.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-blue-300 hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                        <Box className="h-5 w-5" />
                      </div>
                      <StatusBadge value={item.status} />
                    </div>

                    <div>
                      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                        {item.category?.name || 'Inventaris Umum'}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                        {item.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                        {item.description || 'Tidak ada deskripsi tambahan.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Tersedia: </span>
                      <span className="font-semibold text-slate-800">
                        {item.availableStock} / {item.totalStock} unit
                      </span>
                    </div>
                    <Link
                      href={`/items/${item.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700"
                    >
                      <span>Lihat Detail</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
              <Box className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">
                {fetchError
                  ? 'Gagal menghubungi server backend (school-rent.vercel.app).'
                  : 'Belum ada barang yang tercatat sebagai tersedia.'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Jelajahi halaman katalog lengkap untuk melihat seluruh status barang.
              </p>
              <Link
                href="/items"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
              >
                Buka Katalog Lengkap
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="cara-kerja" className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Alur Peminjaman
            </h2>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
              Proses Praktis dalam Tiga Langkah
            </p>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Sistem SchoolRent memudahkan seluruh proses peminjaman dari hulu ke
              hilir secara transparan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Temukan Barang yang Dibutuhkan
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Gunakan pencarian kata kunci dan filter kategori untuk menemukan
                peralatan serta memastikan jumlah stok yang tersedia.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Ajukan Permintaan Peminjaman
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Lengkapi formulir pengajuan dengan tanggal pinjam, estimasi jatuh
                tempo, dan keperluan kegiatan untuk diverifikasi petugas.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Ambil &amp; Kembalikan Tepat Waktu
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Setelah disetujui, ambil barang ke ruang petugas dan pastikan
                mengembalikannya sebelum tanggal jatuh tempo demi kelancaran bersama.
              </p>
            </div>
          </div>

          {/* CTA Box */}
          <div className="mt-12 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center text-white shadow-sm">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Siap Memulai Peminjaman?
            </h3>
            <p className="mt-2 max-w-xl mx-auto text-xs sm:text-sm text-blue-100 leading-relaxed">
              Daftarkan akun siswa Anda sekarang atau masuk untuk mengecek ketersediaan
              peralatan sekolah hari ini.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-blue-700 shadow-xs hover:bg-blue-50 transition"
              >
                Daftar Siswa Baru
              </Link>
              <Link
                href="/items"
                className="rounded-xl border border-white/40 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition"
              >
                Eksplorasi Katalog
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
