// /api/og-card.js
import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";

export default async function handler(req, res) {
  try {
    const { searchParams } = new URL(req.url);
    const fact = searchParams.get("fact") || "今日も猫と一緒にのんびりしましょう🐾";
    const imgUrl = searchParams.get("img") || "https://cdn2.thecatapi.com/images/2do.jpg";

    // 🐾 背景画像を取得
    const imgRes = await fetch(imgUrl);
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const img = await loadImage(buffer);

    // 🖼️ OGPサイズのキャンバスを作成（1200×630）
    const canvas = createCanvas(1200, 630);
    const ctx = canvas.getContext("2d");

    // 背景画像を全体に描画
    ctx.drawImage(img, 0, 0, 1200, 630);

    // テキストエリア（下部半透明黒）
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 500, 1200, 130);

    // 📝 フォント設定（日本語対応）
    try {
      registerFont(path.resolve("./fonts/NotoSansJP-Regular.ttf"), { family: "Noto Sans JP" });
    } catch (e) {
      console.warn("フォント登録スキップ:", e.message);
    }

    // テキスト描画
    ctx.font = "bold 40px 'Noto Sans JP'";
    ctx.fillStyle = "white";
    wrapText(ctx, fact, 50, 580, 1100, 50);

    // タイトルロゴ
    ctx.font = "28px 'Noto Sans JP'";
    ctx.fillStyle = "#ffcccc";
    ctx.fillText("🐾 毎日にゃんこ everyday cat", 50, 620);

    // 出力
    res.setHeader("Content-Type", "image/png");
    res.send(canvas.toBuffer("image/png"));
  } catch (err) {
    console.error("🐾 Error generating OGP card:", err);
    res.status(500).json({ error: "OGPカード生成に失敗しました。" });
  }
}

// 長文を折り返す
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split("");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n];
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
