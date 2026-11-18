import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Riwayat Peminjaman', 'Lihat riwayat peminjaman yang telah selesai.', true);

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
