// api/catfact.js
export default async function handler(req, res) {
  const { imageUrl } = req.query;

  try {
    // OpenAIへのリクエスト
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "あなたは猫の専門家です。猫に関する日本語の豆知識を40文字以内で、親しみやすく1つ教えてください。"
          },
          {
            role: "user",
            content: imageUrl
              ? `この猫の写真を見て猫に関する豆知識を1つ教えて: ${imageUrl}`
              : "猫に関する豆知識を1つ教えて"
          }
        ],
        max_tokens: 100,
      }),
    });

    const data = await response.json();

    // AI応答を抽出
    const fact =
      data.choices?.[0]?.message?.content?.trim() ||
      "猫は1日の約3分の2を寝て過ごします。";

    // 結果を返す
    res.status(200).json({ fact });

  } catch (error) {
    console.error("🐾 Error fetching AI cat fact:", error);
    res.status(500).json({
      fact: "猫は寝るのが大好き！1日の約70%を寝て過ごします。"
    });
  }
}
