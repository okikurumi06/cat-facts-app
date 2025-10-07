import OpenAI from "openai";
import fetch from "node-fetch";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    // ?? 猫の画像取得
    const catRes = await fetch("https://api.thecatapi.com/v1/images/search");
    const catData = await catRes.json();
    const imageUrl = catData[0].url;

    // ?? 猫豆知識生成（日本語）
    const factRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "あなたは猫の専門家です。短くてかわいい日本語の猫豆知識を1つ教えてください。" }
      ]
    });

    const fact = factRes.choices[0].message.content.trim();

    res.status(200).json({ image: imageUrl, fact });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "エラーが発生しました" });
  }
}
