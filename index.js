// index.js
import express from "express";
import fetch from "node-fetch";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

// generate-card を明示的に読み込む！
import generateCardHandler from "./api/generate-card.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ CORS許可
app.use(cors());

// ✅ 静的ファイル配信
app.use(express.static(path.join(__dirname, "public")));

// ✅ APIルート登録
app.get("/api/generate-card", (req, res) => generateCardHandler(req, res));

app.get("/cat", async (req, res) => {
  try {
    const catRes = await fetch("https://api.thecatapi.com/v1/images/search", {
      headers: { "x-api-key": process.env.CAT_API_KEY },
    });
    const catData = await catRes.json();
    const catImageUrl = catData[0]?.url;
    console.log("🐱 Cat Image URL:", catImageUrl);

    const prompt = "猫に関する面白い豆知識を日本語で1つ教えてください。40文字以内で。";
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    const fact = completion.choices[0].message.content;

    res.json({ image: catImageUrl, fact });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "エラーが発生しました" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
