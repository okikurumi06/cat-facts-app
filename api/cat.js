import OpenAI from "openai";
import fetch from "node-fetch";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    // ?? �L�̉摜�擾
    const catRes = await fetch("https://api.thecatapi.com/v1/images/search");
    const catData = await catRes.json();
    const imageUrl = catData[0].url;

    // ?? �L���m�������i���{��j
    const factRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "���Ȃ��͔L�̐��Ƃł��B�Z���Ă��킢�����{��̔L���m����1�����Ă��������B" }
      ]
    });

    const fact = factRes.choices[0].message.content.trim();

    res.status(200).json({ image: imageUrl, fact });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "�G���[���������܂���" });
  }
}
