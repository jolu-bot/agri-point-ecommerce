import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// NOTE: next/og's ImageResponse renders via Satori which only understands inline styles.
// CSS classes are NOT supported — inline styles here are intentional and required.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'Solutions agricoles au Cameroun';
  const subtitle = searchParams.get('subtitle') || 'Produire plus · Gagner plus · Mieux vivre';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
          }}
        />

        {/* Top badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50px',
            padding: '8px 20px',
            marginBottom: '32px',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#34d399',
            }}
          />
          <span style={{ color: '#a7f3d0', fontSize: '18px', fontWeight: 600 }}>
            AGRIPOINT SERVICES
          </span>
        </div>

        {/* Brand mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px',
          }}
        >
          <span style={{ fontSize: '72px', fontWeight: 900, color: '#ef4444' }}>AP</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '42px', fontWeight: 900, color: '#34d399', lineHeight: 1 }}>
              AGRI
            </span>
            <span style={{ fontSize: '42px', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
              POINT
            </span>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '38px',
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.3,
            marginBottom: '16px',
            padding: '0 40px',
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '22px',
            color: '#6ee7b7',
            textAlign: 'center',
            fontWeight: 400,
          }}
        >
          {subtitle}
        </div>

        {/* Bottom domain */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '16px',
          }}
        >
          agri-ps.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
