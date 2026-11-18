import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Profil Saya', 'Kelola profil akun SchoolRent.', true);

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
