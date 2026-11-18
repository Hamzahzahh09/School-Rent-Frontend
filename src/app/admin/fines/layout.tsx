import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Kelola Denda', 'Kelola pembayaran dan pemutihan denda.', true);

export default function AdminFinesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
