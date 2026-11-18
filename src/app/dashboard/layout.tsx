import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Dasbor', 'Ringkasan aktivitas peminjaman SchoolRent.', true);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
