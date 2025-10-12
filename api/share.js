export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const img = searchParams.get("img");
  const fact = searchParams.get("fact") || "今日の猫豆知識 🐾";

  // 🚨 img パラメータがない場合は404を返す
  if (!img) {
    return new Response("画像URLが指定されていません。", { status: 404 });
  }

  // ✅ OGP対応HTMLを返す（Twitter/Xで画像が確実に展開される構成）
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
  <meta property="og:description" content="${escapeHtml(fact)}" />
  <meta property="og:image" content="${img}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="600" />
  <meta property="og:image:height" content="600" />
  <meta property="og:url" content="https://everydaycat.vercel.app/api/share?img=${encodeURIComponent(
    img
  )}" />
  <meta property="og:type" content="article" />

  <!-- ✅ Twitterカード設定 -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@everydaycat_app" />
  <meta name="twitter:title" content="毎日にゃんこ - 今日の猫と豆知識" />
  <meta name="twitter:description" content="${escapeHtml(fact)}" />
  <meta name="twitter:image" content="${img}" />

  <!-- 🕒 自動リダイレクト（2秒後にトップページへ） -->
  <meta http-equiv="refresh" content="2;url=https://everydaycat.vercel.app/" />
</head>
<body style="font-family: sans-serif; text-align: center; padding-top: 2rem;">
  <p>🐾 カードを読み込み中...</p>
  <p><img src="${img}" alt="猫カード" style="max-width:90%; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.2);" /></p>
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

// ✅ HTMLエスケープ（安全性＆X側のタグ破壊防止）
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
