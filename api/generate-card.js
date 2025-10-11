import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import path from "path";

export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  try {
    // 🐱 猫画像を取得
    const catRes = await fetch("https://api.thecatapi.com/v1/images/search");
    const catData = await catRes.json();
    const imageUrl = catData[0]?.url;
    if (!imageUrl) throw new Error("猫画像の取得に失敗しました。");

    console.log("🐾 取得画像URL:", imageUrl);

    // 🧠 AIで豆知識生成
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "あなたは猫の専門家です。猫に関する日本語の豆知識を40文字以内で、親しみやすく1つ教えてください。",
          },
          {
            role: "user",
            content: `この猫の写真を見て猫に関する豆知識を教えてください: ${imageUrl}`,
          },
        ],
        max_tokens: 100,
      }),
    });

    const aiData = await aiRes.json();
    console.log("🧠 OpenAIレスポンス:", aiData);

    const fact =
      aiData?.choices?.[0]?.message?.content?.trim() ||
      "猫は高いところが大好き！";

    console.log("📜 生成された豆知識:", fact);

    // 🖋️ フォント登録
    try {
      const fontPath = path.resolve("./fonts/NotoSansJP-Regular.ttf");
      GlobalFonts.registerFromPath(fontPath, "Noto Sans JP");
    } catch (e) {
      console.warn("⚠️ フォント登録スキップ:", e.message);
    }

    // 🖼️ 猫画像を描画
    const imgRes = await fetch(imageUrl);
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const img = await loadImage(buffer);

    const canvas = createCanvas(600, 600);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0, 600, 600);

    // 下部の黒帯
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 520, 600, 80);

    // テキスト
    ctx.font = "22px 'Noto Sans JP'";
    ctx.fillStyle = "white";
    wrapText(ctx, fact, 20, 555, 560, 26);

    // ロゴ
    ctx.font = "16px 'Noto Sans JP'";
    ctx.fillStyle = "#ffcccc";
    ctx.fillText("🐾 毎日にゃんこ everyday cat", 20, 590);

    res.setHeader("Content-Type", "image/png");
    res.send(canvas.toBuffer("image/png"));
  } catch (err) {
    console.error("🐾 Error in /api/generate-card:", err);
    res.status(500).json({ error: "猫カード生成に失敗しました。" });
  }
}

// テキスト改行処理
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split("");
  let line = "";
  for (let n = 0; n < chars.length; n++) {
    const testLine = line + chars[n];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = chars[n];
      y += lineHeight;
      if (y > 590) break;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
