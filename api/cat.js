import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    // The Cat APIから画像を取得
    const imageRes = await fetch("https://api.thecatapi.com/v1/images/search");
    const imageData = await imageRes.json();
    const catImage = imageData[0]?.url;

    // OpenAIで日本語の猫豆知識を生成
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = "猫に関する面白い豆知識を日本語で1つ教えてください。";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const fact = completion.choices[0].message.content.trim();

    res.status(200).json({ image: catImage, fact });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "エラーが発生しました" });
  }
}
