import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastProvider } from '@/components/ToastProvider';

export const metadata: Metadata = {
  metadataBase: new URL('https://schoolrent.vercel.app'),
  title: {
    default: 'SchoolRent | Peminjaman Peralatan Sekolah',
    template: '%s | SchoolRent',
  },
  description:
    'Cari inventaris sekolah, ajukan peminjaman, pantau status, dan kelola pengembalian melalui SchoolRent.',
  keywords: [
    'schoolrent',
    'peminjaman barang sekolah',
    'inventaris sekolah',
    'peminjaman fasilitas',
  ],
  applicationName: 'SchoolRent',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'SchoolRent',
    title: 'SchoolRent | Peminjaman Peralatan Sekolah',
    description: 'Platform peminjaman dan pengelolaan inventaris sekolah.',
    url: '/',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'SchoolRent' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SchoolRent | Peminjaman Peralatan Sekolah',
    description: 'Platform peminjaman dan pengelolaan inventaris sekolah.',
    images: ['/opengraph-image'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('schoolrent_theme');var d=t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light'}catch(e){}})()`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        <ToastProvider>
          <AuthProvider>
            <Suspense fallback={<div className="h-16 border-b border-slate-200 bg-white" />}>
              <Navbar />
            </Suspense>
            <main className="flex-1 w-full">{children}</main>
            <Footer />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
