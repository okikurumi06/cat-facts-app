// /api/generate-card.js
export const config = {
  runtime: "nodejs",
};
import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";

export default async function handler(req, res) {
  try {
    console.log("🐾 Step 1: Start /api/generate-card");

    // 🐾 1️⃣ 猫画像を取得
    const catRes = await fetch("https://api.thecatapi.com/v1/images/search");
    console.log("🐾 Step 2: Fetched cat API:", catRes.status);

    const catData = await catRes.json();
    const imageUrl = catData[0]?.url;
    console.log("🐾 Step 3: Cat image URL:", imageUrl);

    if (!imageUrl) throw new Error("猫画像の取得に失敗しました。");

    // 🐾 2️⃣ AIで豆知識生成
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
    
    console.log("🐾 Step 4: OpenAI response status:", aiRes.status);
    const aiData = await aiRes.json();
    if (aiData.error) console.error("OpenAI error:", aiData.error);

    const fact =
      aiData.choices?.[0]?.message?.content?.trim() ||
      "猫は高いところが大好き！";
    console.log("🐾 Step 5: Fact:", fact);

    // 🐾 3️⃣ 画像を合成
    try {
      const fontPath = path.resolve("./fonts/NotoSansJP-Regular.ttf");
      registerFont(fontPath, { family: "Noto Sans JP" });
      console.log("🐾 Step 6: Font registered successfully");
    } catch (e) {
      console.warn("フォント登録スキップ:", e.message);
    }

    // 画像をfetchしてbuffer化（CORS回避）
    const catImgRes = await fetch(imageUrl);
    console.log("🐾 Step 7: Cat image fetch status:", catImgRes.status);

    const buffer = Buffer.from(await catImgRes.arrayBuffer());
    const img = await loadImage(buffer);
    console.log("🐾 Step 8: Image loaded into canvas");

    const canvas = createCanvas(600, 600);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0, 600, 600);

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 520, 600, 80);

    ctx.font = "22px 'Noto Sans JP'";
    ctx.fillStyle = "white";
    wrapText(ctx, fact, 20, 555, 560, 26);

    ctx.font = "16px 'Noto Sans JP'";
    ctx.fillStyle = "#ffcccc";
    ctx.fillText("🐾 毎日にゃんこ everyday cat", 20, 590);

    res.setHeader("Content-Type", "image/png");
    res.send(canvas.toBuffer("image/png"));

    console.log("🐾 Step 9: Response sent successfully");    
  } catch (err) {
    console.error("🐾 Error in /api/generate-card:", err);
    res.status(500).json({ error: "猫カード生成に失敗しました。" });
  }
}

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
      if (y > 590) break; // はみ出し防止
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
