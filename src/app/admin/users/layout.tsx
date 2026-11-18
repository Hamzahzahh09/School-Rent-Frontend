import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Kelola Pengguna', 'Kelola akun dan peran pengguna SchoolRent.', true);

export default function AdminUsersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
