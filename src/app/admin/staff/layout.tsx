import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Kelola Petugas', 'Kelola akun petugas inventaris.', true);

export default function AdminStaffLayout({ children }: { children: React.ReactNode }) {
  return children;
}
