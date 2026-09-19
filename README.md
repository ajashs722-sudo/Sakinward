# 🌿 Sakinward — Islamic Mindfulness & Spiritual Companion

[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://sakinward.pages.dev)
[![React 19](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![DeepSeek](https://img.shields.io/badge/DeepSeek_R1-4A154B?style=for-the-badge&logo=openai&logoColor=white)](https://deepseek.com)

**Sakinward** is a premium, beautifully crafted Islamic mindfulness, Quranic contemplation, and spiritual lifestyle application. It features a full-stack architecture powered by **Sakin AI** (supporting Gemini 2.5/3.6 and DeepSeek-R1 models), a live **Telegram Bot (`@Sakinward_bot`)**, dynamic prayer times, soundscapes, and comprehensive daily trackers.

🌐 **Live Web Application:** [https://sakinward.pages.dev](https://sakinward.pages.dev)

---

## 🌟 Key Features

* **🤖 Sakin AI Assistant:** Intelligent Islamic Q&A and spiritual advice powered by Google GenAI (`@google/genai`) and DeepSeek-R1 reasoning models.
* **⚡ Cloudflare Workers & KV Sessions:** Globally distributed edge proxy ([worker.ts](file:///data/data/com.termux/files/home/sajda-app/worker.ts)) with persistent session history stored in Cloudflare KV (`SAKIN_SESSIONS`).
* **📲 Telegram Bot (`@Sakinward_bot`):** Dual support for long-polling background server and Cloudflare Worker webhooks (`/api/telegram/webhook`).
* **🕋 Dynamic Prayer Engine & Qibla Finder:** Accurate prayer schedules, Hijri calendar synchronization, and interactive Leaflet maps.
* **🎵 Soundscape Synthesizer:** Fluid audio soundscapes for guided breathing, Quranic recitation, and meditation.
* **🔒 Encrypted Client Memory:** Secure local persistent state keeping user data completely private.

---

## 🏗️ Technical Stack

| Layer | Technology |
|---|---|
| **Frontend UI** | React 19, TypeScript, Tailwind CSS v4, Motion, GSAP |
| **Edge Server Runtime** | Cloudflare Workers (`worker.ts`) / Node.js Express (`server.ts`) |
| **Session & Storage** | Cloudflare KV (`SAKIN_SESSIONS`) |
| **AI Models** | Google Gemini 2.5/3.6 (`@google/genai`), DeepSeek-R1 |
| **Maps & Media** | Leaflet, HLS.js, Canvas Confetti |

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the root directory (or configure via Cloudflare Wrangler secrets):

```env
# Telegram Bot Token from @BotFather
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# AI API Keys
GEMINI_API_KEY=your_gemini_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Application Domain
APP_URL=https://sakinward.pages.dev
```

---

## 🚀 Installation & Local Setup

### 1. Kutubxonalarni o'rnatish (Install Dependencies)
```bash
npm install
```

### 2. Dasturiy Rejimda Ishga Tushirish (Development Mode)
```bash
npm run dev
```

### 3. Production Deploy (Cloudflare Workers / Pages)
```bash
# Production uchun build
npm run build

# Cloudflare deployment
npx wrangler deploy
```

---

## 🇺🇿 O'zbekcha Yo'riqnoma

**Sakinward** — islomiy ma'rifat, qalb xotirjamligi, namoz vaqtlari va sunnat amallarini tartibga soluvchi mukammal raqamli platforma. Unda **Sakin AI** sun'iy intellekti hamda **Telegram Bot** integratsiyasi mavjud.

### ⚙️ Asosiy Imkoniyatlar:
1. **Sakin AI Bot:** Gemini hamda DeepSeek modellari asosida ishlovchi aqlli islomiy yordamchi.
2. **Cloudflare KV Seanslari:** Chat tarixini `SAKIN_SESSIONS` chekka (edge) ma'lumotlar omborida saqlaydi.
3. **Telegram Bot Integratsiyasi:** Telegram tarmog'idagi foydalanuvchilarga darhol javob beruvchi bot aloqasi.
4. **Namoz Vaqtlari va Qibla:** Aniq geografik koordinatalar asosida hisoblanuvchi namoz jadvali va xarita.

---

Designed with ❤️ for spiritual tranquility.
