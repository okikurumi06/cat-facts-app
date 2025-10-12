// /api/share/[id].js
import { createClient } from "@supabase/supabase-js";

export const config = {
  runtime: "edge",
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req) {
  const { pathname } = new URL(req.url);
  const id = pathname.split("/").pop();

  const { data, error } = await supabase
    .from("cat_facts")
    .select("fact,image_url")
    .eq("short_id", id)
    .single();

  if (error || !data)
    return new Response("Not found", { status: 404 });

  const { fact, image_url } = data;

  return new Response(
    `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>毎日にゃんこ 🐾</title>

  <meta property="og:title" content="毎日にゃんこ - 今日の猫と豆知識" />
  <meta property="og:description" content="${fact}" />
  <meta property="og:image" content="${image_url}" />
  <meta property="og:url" content="https://everydaycat.vercel.app/api/share/${id}" />
  <meta property="og:type" content="article" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="毎日にゃんこ - 今日の猫と豆知識" />
  <meta name="twitter:description" content="${fact}" />
  <meta name="twitter:image" content="${image_url}" />

  <meta http-equiv="refresh" content="3;url=https://everydaycat.vercel.app/" />
</head>
<body>
  <p>🐾 読み込み中...</p>
</body>
</html>
`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
