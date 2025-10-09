// /api/catfact.js
export default async function handler(req, res) {
  const { imageUrl } = req.query;
  try {
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
            content: "あなたは猫の専門家として、猫に関する日本語の豆知識を1つだけ、親しみやすく短く（40文字以内）説明します。"
          },
          {
            role: "user",
            content: `猫の写真: ${imageUrl}`
          }
        ],
        max_tokens: 100,
      })
    });

    console.log("API Key loaded:", process.env.OPENAI_API_KEY ? "Yes" : "No");
    const data = await response.json();
    const fact = data.choices?.[0]?.message?.content?.trim() || "猫は毛づくろいで体温を整えています。";
    res.status(200).json({ fact });

  } catch (error) {
    console.error(error);
    res.status(500).json({ fact: "猫は寝るのが大好き！1日の約70%を寝て過ごすんです。" });
  }
}
