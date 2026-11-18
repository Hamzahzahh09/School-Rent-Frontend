import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Notifikasi', 'Lihat pemberitahuan akun SchoolRent.', true);

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
