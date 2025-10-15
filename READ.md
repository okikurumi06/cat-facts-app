# 🐾 毎日にゃんこ everyday cat

AIが毎日かわいい猫の画像と豆知識を生成してくれるサービスです。  
生成された画像は自動的に Supabase に保存され、X（Twitter）でシェアできます。

🌐 **公開サイト:** [https://everydaycat.vercel.app](https://everydaycat.vercel.app)

---

## ✨ 機能概要

- 🐱 **AI豆知識生成**：OpenAI API（`gpt-4o-mini`）を使って猫の豆知識を日本語で生成  
- 🖼️ **猫画像取得**：The Cat API から毎日ランダムな猫画像を取得  
- 🎨 **画像合成**：`@napi-rs/canvas` を使用して豆知識＋ロゴ入りのカード画像を生成  
- ☁️ **Supabase連携**：生成画像を Supabase Storage に保存し、メタデータをDBに記録  
- 🐾 **1日1回制限**：ユーザーごとに1日1枚だけ生成（日本時間午前0時にリセット）  
- 📤 **SNSシェア機能**：生成画像をOGP付きでX（旧Twitter）にシェア可能  

---

## 🧩 技術構成

| 要素 | 使用技術 |
|------|-----------|
| フロントエンド | HTML / JavaScript |
| バックエンド | Vercel Serverless Functions (`/api` ディレクトリ) |
| 画像描画 | [@napi-rs/canvas](https://www.npmjs.com/package/@napi-rs/canvas) |
| データベース / ストレージ | [Supabase](https://supabase.com) |
| AI API | [OpenAI GPT-4o-mini](https://platform.openai.com/) |
| デプロイ | [Vercel](https://vercel.com) |

---

## 🗂️ API構成

| エンドポイント | 説明 |
|----------------|------|
| `/api/generate-card` | 猫画像＋豆知識カードを生成してSupabaseに保存 |
| `/api/share/[id]` | OGP対応の共有ページを返却（Xカード表示対応） |

---

## ⚙️ 環境変数

Vercel または `.env` に以下を設定してください：

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
