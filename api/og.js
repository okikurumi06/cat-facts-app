//api/og.js
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const fact = searchParams.get('fact') || '今日も猫と一緒にのんびりしましょう🐾';
  const imgUrl = searchParams.get('img') || 'https://placekitten.com/800/400';

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'white',
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={imgUrl}
          width="800"
          height="400"
          style={{ borderRadius: 20, objectFit: 'cover' }}
        />
        <p
          style={{
            marginTop: 30,
            fontSize: 36,
            color: '#333',
            width: '1000px',
            textAlign: 'center',
            lineHeight: 1.3,
          }}
        >
          {fact}
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
