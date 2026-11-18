import type { Metadata } from 'next';

const SITE_NAME = 'SchoolRent';
const OG_IMAGE = { url: '/opengraph-image', width: 1200, height: 630, alt: SITE_NAME };

/**
 * Metadata per halaman. Judul memakai `absolute` agar format "Judul | SchoolRent"
 * tetap konsisten di route bertingkat, dan Open Graph ditulis lengkap karena
 * Next.js mengganti (bukan menggabungkan) objek openGraph milik induk.
 */
export function pageMetadata(
  title: string,
  description: string,
  noindex = false,
): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  return {
    title: { absolute: fullTitle },
    description,
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
