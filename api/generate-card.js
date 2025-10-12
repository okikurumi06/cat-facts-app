// /api/generate-card.js
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import path from "path";
import { createClient } from "@supabase/supabase-js";

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  try {
    console.log("🎨 /api/generate-card called");

    // ✅ Supabase初期化
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 👤 userIdをクエリから取得（index.htmlで付与）
    const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = url.searchParams.get("user") || "anonymous";

    const today = new Date().toISOString().split("T")[0]; // "2025-10-12"
    const prefix = `generated/${userId}/${today}-`;

    // ✅ 1️⃣ 今日の画像がすでに存在するか確認
    const { data: list, error: listError } = await supabase.storage
      .from("cat-cards")
      .list(`generated/${userId}`, { search: today });

    if (listError) throw listError;

    if (list && list.length > 0) {
      const existingFile = list.sort((a, b) => b.created_at - a.created_at)[0];
      const existingUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/cat-cards/generated/${userId}/${existingFile.name}`;
      console.log(`📦 ${userId} の今日の画像を再利用:`, existingUrl);
      return res.status(200).json({
        imageUrl: existingUrl,
        fact: "（あなたの今日の猫カードはすでに生成されています🐾）",
      });
    }

    // 🐱 猫画像取得
    const catRes = await fetch("https://api.thecatapi.com/v1/images/search");
    const catData = await catRes.json();
    const imageUrl = catData[0]?.url;
    if (!imageUrl) throw new Error("猫画像の取得に失敗しました。");
    console.log("🐾 取得画像URL:", imageUrl);

    // 🧠 OpenAIで豆知識生成
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
              "あなたは猫の専門家です。猫に関する日本語の豆知識を50文字以内で親しみやすく1つ教えてください。",
          },
          {
            role: "user",
            content: `この猫の写真を見て猫に関する豆知識を教えてください: ${imageUrl}`,
          },
        ],
      }),
    });
    const aiData = await aiRes.json();
    const fact =
      aiData?.choices?.[0]?.message?.content?.trim() ||
      "猫は高いところが大好き！";
    console.log("📜 生成された豆知識:", fact);

    // 🖋 フォント登録
    const fontJP = path.join(process.cwd(), "fonts", "NotoSansJP-Regular.ttf");
    const fontEmoji = path.join(process.cwd(), "fonts", "NotoColorEmoji.ttf");
    GlobalFonts.registerFromPath(fontJP, "Noto Sans JP");
    GlobalFonts.registerFromPath(fontEmoji, "Noto Color Emoji");

    // 🖼 猫画像を描画
    const imgRes = await fetch(imageUrl);
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const img = await loadImage(buffer);
    const canvas = createCanvas(600, 600);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0, 600, 600);
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 520, 600, 80);
    ctx.font = "22px 'Noto Sans JP'";
    ctx.fillStyle = "white";
    wrapText(ctx, fact, 20, 555, 560, 26);

    // 🐾 ロゴ（右下）
    ctx.font = "16px 'Noto Color Emoji', 'Noto Sans JP'";
    ctx.fillStyle = "#ffcccc";
    const logoText = "🐾毎日にゃんこeverydaycat";
    const textWidth = ctx.measureText(logoText).width;
    ctx.fillText(logoText, 600 - textWidth - 20, 590);

    // ✅ Supabaseにアップロード（userId別フォルダ）
    const fileName = `${prefix}${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("cat-cards")
      .upload(fileName, canvas.toBuffer("image/png"), {
        contentType: "image/png",
      });
    if (uploadError) throw uploadError;

    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/cat-cards/${fileName}`;
    console.log("🌐 公開URL:", publicUrl);

    res.status(200).json({ imageUrl: publicUrl, fact });
  } catch (err) {
    console.error("🐾 Error in /api/generate-card:", err);
    res.status(500).json({ error: "猫カード生成に失敗しました。" });
  }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split("");
  let line = "";
  for (const char of chars) {
    const testLine = line + char;
    if (ctx.measureText(testLine).width > maxWidth) {
      ctx.fillText(line, x, y);
      line = char;
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
