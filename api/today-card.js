// /api/today-card.js
import handler from "./generate-card.js";

let cache = { date: null, buffer: null };

export default async function todayCard(req, res) {
  const today = new Date().toISOString().split("T")[0];

  // 同日キャッシュを返す
  if (cache.date === today && cache.buffer) {
    res.setHeader("Content-Type", "image/png");
    return res.send(cache.buffer);
  }

  const chunks = [];
  const mockRes = {
    setHeader: () => {},
    send: (buf) => chunks.push(buf),
  };
  await handler({}, mockRes);
  const buf = Buffer.concat(chunks);

  cache = { date: today, buffer: buf };

  res.setHeader("Content-Type", "image/png");
  res.send(buf);
}