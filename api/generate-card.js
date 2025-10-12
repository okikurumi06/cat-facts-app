// /api/generate-card.js
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import crypto from "crypto";

// 🔧 Supabase設定
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  try {
    console.log("🎨 /api/generate-card called");

    // 📅 ユーザー識別（簡易）＋日付
    const today = new Date().toISOString().split("T")[0];
    const userId = req.headers["x-forwarded-for"] || "anon";

    // ✅ 既存データ（1日1枚ルール）
    const { data: existing } = await supabase
      .from("cat_facts")
      .select("fact,image_url,short_id")
      .eq("user_id", userId)
      .eq("date", today)
      .limit(1);

    if (existing?.length) {
      const { fact, image_url, short_id } = existing[0];
      const shareUrl = `https://everydaycat.vercel.app/api/share/${short_id}`;
      console.log("📦 既存データ再利用:", image_url);
      return res.json({ imageUrl: image_url, fact, shareUrl });
    }

    // 🐱 猫画像取得
    const catRes = await fetch("https://api.thecatapi.com/v1/images/search");
    const catData = await catRes.json();
    const imageUrl = catData[0]?.url;
    if (!imageUrl) throw new Error("猫画像の取得に失敗しました。");
    console.log("🐾 取得画像URL:", imageUrl);

    // 🧠 豆知識生成
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
              "あなたは猫の専門家です。猫に関する日本語の豆知識を50文字以内で、親しみやすく1つ教えてください。",
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
    const fact =
      aiData?.choices?.[0]?.message?.content?.trim() ||
      "猫は高いところが大好き！";
    console.log("📜 生成された豆知識:", fact);

    // 🖋️ フォント登録
    try {
      const fontJP = path.join(process.cwd(), "fonts", "NotoSansJP-Regular.ttf");
      const fontEmoji = path.join(process.cwd(), "fonts", "NotoColorEmoji.ttf");
      GlobalFonts.registerFromPath(fontJP, "Noto Sans JP");
      GlobalFonts.registerFromPath(fontEmoji, "Noto Color Emoji");
      console.log("🖋️ フォント登録成功");
    } catch (e) {
      console.warn("⚠️ フォント登録失敗:", e.message);
    }

    // 🖼️ 画像合成
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
    ctx.font = "16px 'Noto Color Emoji', 'Noto Sans JP'";
    ctx.fillStyle = "#ffcccc";
    const logoText = "🐾毎日にゃんこeverydaycat";
    const textWidth = ctx.measureText(logoText).width;
    ctx.fillText(logoText, 600 - textWidth - 20, 590);

    // 📤 Supabaseへアップロード
    const fileName = `generated/user-${userId}/${today}-${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("cat-cards")
      .upload(fileName, canvas.toBuffer("image/png"), {
        contentType: "image/png",
      });
    if (uploadError) throw uploadError;

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/cat-cards/${fileName}`;
    console.log("🌐 公開URL:", publicUrl);

    // 🆔 短縮ID生成（6桁ランダム）
    const shortId = crypto.randomBytes(3).toString("hex");

    // 💾 Supabase保存
    const { error: upsertError } = await supabase.from("cat_facts").upsert({
      user_id: userId,
      date: today,
      fact,
      image_url: publicUrl,
      short_id: shortId,
    });

    if (upsertError) {
      console.error("❌ Supabase upsert error:", upsertError);
    } else {
      console.log("📝 Supabase upsert success!");
    }

    // ✅ OGP対応シェアURL
    const shareUrl = `https://everydaycat.vercel.app/api/share/${shortId}`;
    res.json({ imageUrl: publicUrl, fact, shareUrl });
  } catch (err) {
    console.error("🐾 Error in /api/generate-card:", err);
    res.status(500).json({ error: "猫カード生成に失敗しました。" });
  }
}

// 🪄 テキスト改行
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
