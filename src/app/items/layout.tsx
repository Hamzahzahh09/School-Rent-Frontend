import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Katalog Barang', 'Cari dan saring peralatan sekolah yang tersedia untuk dipinjam.');

export default function ItemsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
