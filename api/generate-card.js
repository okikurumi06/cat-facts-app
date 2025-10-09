// /api/generate-card.js
import { createCanvas, loadImage } from "canvas";

export default async function handler(req, res) {
  try {
    // ランダム猫画像を取得
    const catRes = await fetch("https://api.thecatapi.com/v1/images/search");
    const catData = await catRes.json();
    const imageUrl = catData[0].url;

    // AIで豆知識を生成（OpenAI API使用）
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "あなたは猫の専門家です。猫に関する日本語の豆知識を40文字以内で、親しみやすく教えてください。",
          },
        ],
        max_tokens: 100,
      }),
    });

    const aiData = await aiRes.json();
    const fact = aiData.choices?.[0]?.message?.content?.trim() || "猫は高いところが大好き！";

    // 画像を合成
    const img = await loadImage(imageUrl);
    const canvas = createCanvas(600, 600);
    const ctx = canvas.getContext("2d");

    // 猫画像を描画
    ctx.drawImage(img, 0, 0, 600, 600);

    // 下のテキスト背景
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 540, 600, 60);

    // テキストを描画
    ctx.font = "22px 'Noto Sans JP'";
    ctx.fillStyle = "white";
    ctx.fillText(fact, 20, 578);

    // PNGを返す
    res.setHeader("Content-Type", "image/png");
    res.send(canvas.toBuffer("image/png"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "猫カード生成に失敗しました。" });
  }
}
