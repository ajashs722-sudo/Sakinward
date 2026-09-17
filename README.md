# 🌿 Sakinward — Islamic Mindfulness & Spiritual Companion

**Sakinward** is a premium, beautifully crafted Islamic mindfulness, Quranic contemplation, and spiritual lifestyle application. It features a full-stack architecture powered by **Sakin AI** (supporting Gemini and DeepSeek models), a live **Telegram Bot (`@Sakinward_bot`)**, dynamic prayer times, soundscapes, and comprehensive daily trackers.

---

## 🚀 Fast Deployment

Deploy Sakinward instantly to your cloud hosting of choice.

### ⚡ Option A: Static Frontend to Cloudflare Pages
If you only need the static frontend client with local features:

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/)

*Note: For server-side AI proxy and long-polling Telegram bot features, please configure Option B (Full-Stack Node.js Server).*

### 🐳 Option B: Full-Stack to Google Cloud Run / Docker
To run both the rich interactive frontend and the live continuous Telegram Bot:

[![Deploy to Cloud Run](https://deploy.google.com/buttons/deploy.svg)](https://deploy.google.com/?git_repo=https://github.com/GoogleCloudPlatform/run-on-gcp)

---

## 🇺🇿 O'zbekcha Yo'riqnoma

Sakinward — islomiy ma'rifat, qalb xotirjamligi va sunnat amallarini tartibga soluvchi mukammal raqamli platforma. Unda **Sakin AI** sun'iy intellekti hamda **Telegram Bot** integratsiyasi mavjud.

### ⚙️ Loyihani sozlash va ishga tushirish

1. **Kutubxonalarni o'rnatish:**
   ```bash
   npm install
   ```

2. **Muhit o'zgaruvchilari (`.env`):**
   Loyiha ildizida `.env` faylini yarating va quyidagi kalitlarni kiriting:
   ```env
   # Telegram Bot tokenini @BotFather orqali oling
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

   # Gemini AI xizmati kaliti
   GEMINI_API_KEY=your_gemini_api_key_here

   # (Ixtiyoriy) DeepSeek AI kaliti
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   ```

3. **Dasturni dasturlash rejimida ishga tushirish:**
   ```bash
   npm run dev
   ```

4. **Ishlab chiqarish (Production) uchun yig'ish:**
   ```bash
   npm run build
   npm run start
   ```

---

## 🇬🇧 English Guide

### ⚙️ Installation & Local Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables (`.env`):**
   Create a `.env` file in the root directory:
   ```env
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   GEMINI_API_KEY=your_gemini_api_key_here
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

4. **Build & Start Full-Stack Server:**
   ```bash
   npm run build
   npm run start
   ```

---

## 🕌 Key Features & Architecture

* **Sakin AI Client & Bot:** Integrated client-side chat in the web application using high-fidelity typography (`Marcellus`, `Amiri`, `Scheherazade New`).
* **Continuous Telegram Polling:** Long-polling backend processor in `server.ts` that handles immediate responses using Telegram's message-deletion placeholder mechanics.
* **Prayer Engine & Custom Audio Synth:** Fluid soundscape synthesizer for guided breathing exercises, and custom Hijri calendar syncing.
* **Encrypted Client Memory:** Secure local persistent states keeping user preferences completely private.

---

*Designed with ❤️ for spiritual tranquility.*
