import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'SchoolRent — Sistem Peminjaman Barang & Fasilitas Sekolah',
  description:
    'Platform modern peminjaman peralatan dan fasilitas sekolah. Cari inventaris, ajukan peminjaman, pantau status, dan kelola pengembalian dengan mudah.',
  keywords: [
    'schoolrent',
    'peminjaman barang sekolah',
    'inventaris sekolah',
    'peminjaman fasilitas',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full scroll-smooth">
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        <AuthProvider>
          <Suspense fallback={<div className="h-16 border-b border-slate-200 bg-white" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
