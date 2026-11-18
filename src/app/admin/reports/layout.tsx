import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Laporan Inventaris', 'Lihat ringkasan peminjaman, pengembalian, dan keterlambatan.', true);

export default function AdminReportsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
