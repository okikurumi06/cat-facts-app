// /api/share.js
export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const fact = searchParams.get("fact") || "今日の猫と豆知識 🐾";
  const img = searchParams.get("img");

  if (!img) {
    return new Response("画像が指定されていません。", { status: 400 });
  }

  const html = `
  <!DOCTYPE html>
  <html lang="ja">
    <head>
      <meta charset="utf-8" />
      <title>毎日にゃんこ - 今日の猫と豆知識 🐾</title>
      <meta name="description" content="${fact}">
      <meta property="og:title" content="🐾 毎日にゃんこ - 今日の猫と豆知識" />
      <meta property="og:description" content="${fact}" />
      <meta property="og:image" content="${img}" />
      <meta property="og:url" content="https://everydaycat.vercel.app/api/share?img=${encodeURIComponent(img)}" />
      <meta property="og:type" content="article" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="🐾 毎日にゃんこ - 今日の猫と豆知識" />
      <meta name="twitter:description" content="${fact}" />
      <meta name="twitter:image" content="${img}" />
    </head>
    <body style="text-align:center; font-family:sans-serif; background:#fffaf8; padding:2rem;">
      <h1>🐾 毎日にゃんこ - 今日の猫と豆知識</h1>
      <img src="${img}" alt="猫の画像" style="max-width:90%; border-radius:12px;">
      <p style="margin-top:1rem;">${fact}</p>
      <p><a href="https://everydaycat.vercel.app/">トップへ戻る</a></p>
    </body>
  </html>
  `;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
