import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Daftar Siswa', 'Buat akun siswa SchoolRent.', true);

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
