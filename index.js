// index.js
import express from "express";
import fetch from "node-fetch";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

// 🐾 generate-card を明示的に読み込む
import generateCardHandler from "./api/generate-card.js";

dotenv.config();
console.log("🚀 Vercel Express app initialized");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ Vercel 環境ではポート番号を自動設定（ローカルでは3000）
const PORT = process.env.PORT || 3000;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ CORSを許可
app.use(cors());

// ✅ 静的ファイルを配信（Vercel上でも /public がルートになる）
app.use(express.static(path.join(__dirname, "public")));

// ✅ APIルート登録
app.get("/api/generate-card", async (req, res) => {
  console.log("🎨 /api/generate-card called");
  return generateCardHandler(req, res);
});

// ✅ デフォルトページ
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ テスト用API（豆知識＋猫画像）
app.get("/cat", async (req, res) => {
  try {
    const catRes = await fetch("https://api.thecatapi.com/v1/images/search", {
      headers: { "x-api-key": process.env.CAT_API_KEY },
    });
    const catData = await catRes.json();
    const catImageUrl = catData[0]?.url;
    console.log("🐱 Cat Image URL:", catImageUrl);

    const prompt =
      "猫に関する面白い豆知識を日本語で1つ教えてください。40文字以内で。";
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    const fact = completion.choices[0].message.content;

    res.json({ image: catImageUrl, fact });
  } catch (err) {
    console.error("🐾 /cat error:", err);
    res.status(500).json({ error: "エラーが発生しました" });
  }
});

// ✅ Express起動（Vercelでは自動実行）
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

// 🟢 Vercel 対応：エクスポート
export default app;
