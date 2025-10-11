// /api/og.js
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge', // Edge Functionとして動作（@vercel/og専用）
};

// OGP生成用ハンドラ
export default async function handler(req) {
  const { searchParams } = new URL(req.url);

  // クエリパラメータで豆知識と画像を指定できる
  const fact =
    searchParams.get('fact') ||
    '今日も猫と一緒にのんびりしましょう🐾';
  const imgUrl =
    searchParams.get('img') ||
    'https://cdn2.thecatapi.com/images/2do.jpg';

  try {
    // OGP画像生成
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
            background: '#fffaf8',
            fontFamily: "'Noto Sans JP', sans-serif",
            position: 'relative',
          }}
        >
          {/* 背景画像 */}
          <img
            src={imgUrl}
            width="1000"
            height="500"
            style={{
              borderRadius: 20,
              objectFit: 'cover',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
          />

          {/* テキストエリア */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              background: 'rgba(0,0,0,0.55)',
              borderRadius: 12,
              padding: '12px 24px',
              color: 'white',
              fontSize: 36,
              textAlign: 'center',
              maxWidth: '1000px',
              lineHeight: 1.4,
            }}
          >
            {fact}
          </div>

          {/* タイトルロゴ */}
          <div
            style={{
              position: 'absolute',
              top: 40,
              fontSize: 48,
              color: '#ff8888',
              textShadow: '1px 1px 2px #fff',
            }}
          >
            🐾 毎日にゃんこ everyday cat 🐾
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        emoji: 'fluent', // 🐾絵文字の品質を高くする
      }
    );
  } catch (err) {
    console.error('🐾 OGP生成エラー:', err);
    return new Response('OGP生成に失敗しました。', { status: 500 });
  }
}
