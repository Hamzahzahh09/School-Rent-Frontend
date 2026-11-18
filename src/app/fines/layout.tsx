import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Denda Saya', 'Lihat rincian dan status denda peminjaman.', true);

export default function FinesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
