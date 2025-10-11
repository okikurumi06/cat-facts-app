import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import generateCardHandler from "./api/generate-card.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// ✅ テスト用ルート
app.get("/api/test", (req, res) => {
  console.log("✅ /api/test called");
  res.send("✅ Express route works on Vercel!");
});

// ✅ カード生成ルート
app.get("/api/generate-card", generateCardHandler);

// ✅ デフォルト（index.htmlを返す）
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
