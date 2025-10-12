// /api/share/[id].js
import { createClient } from "@supabase/supabase-js";

// ✅ Node.js ランタイムを使用（EdgeはNG）
export const config = {
  runtime: "nodejs",
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  try {
    const id = req.query.id || req.url.split("/").pop();

    // 🔍 Supabaseから該当レコード取得
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

    // ✅ HTMLレスポンスを返す
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(`
<!DOCTYPE html>
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

  <!-- ✅ 自動リダイレクト -->
  <meta http-equiv="refresh" content="3;url=https://everydaycat.vercel.app/" />
</head>
<body>
  <div style="text-align:center; padding:2em;">
    <p>🐾 カードを読み込み中...</p>
    <p><a href="https://everydaycat.vercel.app/">トップページへ戻る</a></p>
  </div>
</body>
</html>
    `);
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
