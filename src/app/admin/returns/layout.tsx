import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Proses Pengembalian', 'Catat kondisi barang dan selesaikan pengembalian.', true);

export default function AdminReturnsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
