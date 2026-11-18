import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Detail Peminjaman', 'Lihat status dan rincian peminjaman.', true);

export default function LoanDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
