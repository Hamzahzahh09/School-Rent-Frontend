import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Panel Administrator', 'Kelola operasional SchoolRent.', true);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
