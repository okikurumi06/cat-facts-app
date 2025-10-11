// test-upload.js
import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const fileBuffer = fs.readFileSync("./test.png"); // 任意の画像

const { data, error } = await supabase.storage
  .from("cat-cards") // バケット名
  .upload("test/test.png", fileBuffer, {
    contentType: "image/png",
    upsert: true,
  });

if (error) {
  console.error("アップロード失敗:", error);
} else {
  console.log("アップロード成功:", data);
}