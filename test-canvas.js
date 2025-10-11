// test-canvas.js
import { createCanvas } from "canvas";
import fs from "fs";

try {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "skyblue";
  ctx.fillRect(0, 0, 200, 200);

  ctx.fillStyle = "black";
  ctx.font = "20px sans-serif";
  ctx.fillText("にゃーん", 50, 100);

  const out = fs.createWriteStream("./test-output.png");
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on("finish", () => console.log("✅ test-output.png を生成しました！"));
} catch (err) {
  console.error("❌ canvas エラー:", err);
}
