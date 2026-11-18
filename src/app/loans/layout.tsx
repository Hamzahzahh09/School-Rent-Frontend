import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Peminjaman Aktif', 'Pantau pengajuan dan peminjaman aktif Anda.', true);

export default function LoansLayout({ children }: { children: React.ReactNode }) {
  return children;
}
