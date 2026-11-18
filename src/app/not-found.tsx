import Link from 'next/link';
import { Home, SearchX } from 'lucide-react';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata(
  'Halaman Tidak Ditemukan',
  'Halaman yang Anda cari tidak tersedia di SchoolRent.',
  true,
);

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
        <SearchX className="h-8 w-8" aria-hidden="true" />
      </div>
      <p className="mt-6 text-sm font-bold uppercase tracking-widest text-blue-600">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Halaman Tidak Ditemukan</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">
        Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700"
      >
        <Home className="h-4 w-4" aria-hidden="true" />
        Kembali ke Beranda
      </Link>
    </div>
  );
}
