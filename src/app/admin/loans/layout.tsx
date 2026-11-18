import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Verifikasi Peminjaman', 'Setujui, tolak, dan serahkan barang kepada siswa.', true);

export default function AdminLoansLayout({ children }: { children: React.ReactNode }) {
  return children;
}
