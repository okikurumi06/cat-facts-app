// /api/share/[id].js
import { createClient } from "@supabase/supabase-js";

// ✅ Node.js ランタイムを使用
export const config = {
  runtime: "nodejs",
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  try {
    // ✅ 修正①: new URL() に headers.host を使い、絶対URLとして解析
    const fullUrl = new URL(req.url, `https://${req.headers.host}`);
    const id = fullUrl.pathname.split("/").pop();
    console.log("📩 share id:", id);

    // 🔍 Supabase から該当レコード取得
    const { data, error } = await supabase
      .from("cat_facts")
      .select("fact,image_url")
      .eq("short_id", id)
      .single();

    if (error || !data) {
      console.error("❌ Supabase lookup error:", error);
      res.status(404).send("Not found");
      return;
    }

    const { fact, image_url } = data;

    // ✅ 修正②: 実際の猫画像と豆知識をページ内に表示
    // ✅ 修正③: ローディング中テキストを削除して見栄え改善
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>毎日にゃんこ 🐾</title>

  <!-- ✅ OGPタグ -->
  <meta property="og:title" content="毎日にゃんこ - 今日の猫と豆知識" />
  <meta property="og:description" content="${escapeHtml(fact)}" />
  <meta property="og:image" content="${image_url}" />
  <meta property="og:url" content="https://everydaycat.vercel.app/api/share/${id}" />
  <meta property="og:type" content="article" />

  <!-- ✅ Twitterカード設定 -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="毎日にゃんこ - 今日の猫と豆知識" />
  <meta name="twitter:description" content="${escapeHtml(fact)}" />
  <meta name="twitter:image" content="${image_url}" />

  <!-- ✅ ページスタイル -->
  <style>
    body {
      background: #fffaf8;
      color: #333;
      text-align: center;
      font-family: "Noto Sans JP", sans-serif;
      margin: 0;
      padding: 2rem;
    }
    h2 {
      color: #ff8888;
      font-size: 1.6rem;
    }
    img {
      max-width: 90%;
      border-radius: 12px;
      margin: 1rem auto;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    p {
      margin-top: 1rem;
      font-size: 1.1rem;
    }
    .note {
      color: #666;
      font-size: 0.85rem;
      margin-top: 2rem;
    }
  </style>

  <!-- ✅ 数秒後トップへ戻る -->
  <meta http-equiv="refresh" content="8;url=https://everydaycat.vercel.app/" />
</head>
<body>
  <h2>🐾 毎日にゃんこ - 今日の猫と豆知識 🐾</h2>
  <img src="${image_url}" alt="猫の画像" />
  <p>${escapeHtml(fact)}</p>
  <p class="note">※ このページは数秒後にトップへ戻ります。</p>
  <p><a href="https://everydaycat.vercel.app/">→ トップページへ戻る</a></p>
</body>
</html>`);
  } catch (err) {
    console.error("🐾 /api/share runtime error:", err);
    res.status(500).send("Internal Server Error");
  }
}

// 🧩 HTMLエスケープ（XSS防止）
function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
