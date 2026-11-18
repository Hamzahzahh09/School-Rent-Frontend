import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Ajukan Peminjaman', 'Ajukan peminjaman peralatan sekolah.', true);

export default function CreateLoanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
