import { ImageResponse } from 'next/og';

export const alt = 'SchoolRent, platform peminjaman peralatan sekolah';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 55%, #eef2ff 100%)',
          color: '#0f172a',
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', fontSize: 76, fontWeight: 800 }}>
            School<span style={{ color: '#2563eb' }}>Rent</span>
          </div>
          <div style={{ color: '#475569', display: 'flex', fontSize: 30, marginTop: 18 }}>
            Peminjaman peralatan sekolah yang tertata
          </div>
        </div>
      </div>
    ),
    size,
  );
}
