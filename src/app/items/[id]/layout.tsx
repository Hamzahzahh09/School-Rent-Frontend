import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Detail Barang', 'Lihat kondisi, stok, dan informasi peminjaman barang sekolah.');

export default function ItemDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
