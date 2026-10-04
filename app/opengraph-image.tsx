import { ImageResponse } from 'next/og';
import { site } from '@/data/content';

// Generated Open Graph image (1200×630). Replace with a static /public/og.png if you like.
export const runtime = 'edge';
export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0a0a0a',
          color: '#f5f5f0',
          padding: 72,
        }}
      >
        <div style={{ display: 'flex', fontSize: 28, letterSpacing: 6, color: '#FF6A00' }}>PORTFOLIO</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 150, fontWeight: 800, lineHeight: 0.9, letterSpacing: -6 }}>{site.firstName.toUpperCase()}</div>
          <div style={{ fontSize: 150, fontWeight: 800, lineHeight: 0.9, letterSpacing: -6 }}>{site.lastName.toUpperCase()}</div>
        </div>
        <div style={{ display: 'flex', fontSize: 36, color: '#f5f5f0', opacity: 0.7 }}>
          {site.role} · I build websites that sell
        </div>
      </div>
    ),
    size,
  );
}
