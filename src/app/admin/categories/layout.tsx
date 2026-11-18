import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Kelola Kategori', 'Kelola kategori inventaris sekolah.', true);

export default function AdminCategoriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
