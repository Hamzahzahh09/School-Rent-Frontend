import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Kelola Inventaris', 'Tambah, edit, dan perbarui stok inventaris sekolah.', true);

export default function AdminItemsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
