import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import path from "path";

export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  try {
    process.stdout.write("🎨 /api/generate-card called\n");

    // 🐱 猫画像を取得
    const catRes = await fetch("https://api.thecatapi.com/v1/images/search");
    const catData = await catRes.json();
    const imageUrl = catData[0]?.url;
    if (!imageUrl) throw new Error("猫画像の取得に失敗しました。");

    process.stdout.write(`🐾 取得画像URL: ${imageUrl}\n`);

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
    process.stdout.write(`🧠 OpenAIレスポンス: ${JSON.stringify(aiData)}\n`);

    const fact =
      aiData?.choices?.[0]?.message?.content?.trim() ||
      "猫は高いところが大好き！";

    process.stdout.write(`📜 生成された豆知識: ${fact}\n`);

    // 🖋️ フォント登録
    try {
      const fontPath = path.join(process.cwd(), "fonts", "NotoSansJP-Regular.ttf");
      GlobalFonts.registerFromPath(fontPath, "Noto Sans JP");
      process.stdout.write("🖋️ フォント登録成功: NotoSansJP-Regular.ttf\n");
    } catch (e) {
      process.stdout.write(`⚠️ フォント登録失敗: ${e.message}\n`);
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

    // 🧠 豆知識テキスト（🐾を除去し日本語だけで描画）
    ctx.font = "22px 'Noto Sans JP'";
    ctx.fillStyle = "white";
    wrapText(ctx, fact.replace(/🐾/g, ""), 20, 555, 560, 26);

    // 🐾 ロゴを右下に配置（絵文字部分はUnicode対応フォントで）
    ctx.font = "16px 'Noto Sans JP'";
    ctx.fillStyle = "#ffcccc";

    // ✅ テキストの横幅を計測して右寄せ
    const logoText = "🐾 毎日にゃんこ everyday cat";
    const textWidth = ctx.measureText(logoText).width;
    ctx.fillText(logoText, 600 - textWidth - 20, 590);

    res.setHeader("Content-Type", "image/png");
    res.send(canvas.toBuffer("image/png"));
  } catch (err) {
    process.stdout.write(`🐾 Error in /api/generate-card: ${err.message}\n`);
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
      if (y > 590) break;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
