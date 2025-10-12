// /api/share.js
export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const img = searchParams.get("img");
  const fact = searchParams.get("fact") || "今日の猫豆知識 🐾";

  // ✅ OGP対応HTMLを返す（JSONではなくHTML）
  return new Response(
    `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>毎日にゃんこ 🐾</title>

  <!-- ✅ OGP設定 -->
  <meta property="og:title" content="毎日にゃんこ - 今日の猫と豆知識" />
  <meta property="og:description" content="${fact}" />
  <meta property="og:image" content="${img}" />
  <meta property="og:url" content="https://everydaycat.vercel.app/" />
  <meta property="og:type" content="article" />

  <!-- ✅ Twitterカード設定 -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="毎日にゃんこ - 今日の猫と豆知識" />
  <meta name="twitter:description" content="${fact}" />
  <meta name="twitter:image" content="${img}" />

  <!-- 自動リダイレクト（2秒後にトップページへ） -->
  <meta http-equiv="refresh" content="2;url=https://everydaycat.vercel.app/" />
</head>
<body>
  <p>🐾 カードを読み込み中...</p>
  <script>
    setTimeout(() => {
      window.location.href = "https://everydaycat.vercel.app/";
    }, 2000);
  </script>
</body>
</html>
    `,
    {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
}
