# Dolap - AI Wardrobe & Virtual Try-On 👗✨

Mobile-first AI wardrobe and virtual try-on web application built with **React**, **TypeScript**, **Tailwind CSS v4**, **Gemini AI**, and **Supabase**.

---

## 🌟 Key Features

- **Gemini 2.5 Flash Recognition**: Snap or upload clothing photos to automatically detect categories, subcategories, colors, patterns, aesthetic styles, seasons, and occasions with strict JSON schemas.
- **Gemini 2.5 Flash Outfit Suggestions**: Personalized daily outfit curation matching your style aesthetics and occasions with an instant one-line stylist reasoning.
- **Gemini Flash Image Virtual Try-On**: Drapes selected garments onto your standing avatar with a vertical **Waist Level (0–100)** slider.
- **13-Step iOS Onboarding**:
  1. Language (English / Türkçe)
  2. Name
  3. Gender
  4. Height & Body Type (skippable)
  5. Full-Body Avatar Upload (Camera / Gallery / Curated Presets)
  6. Birthday Picker (13+ validation)
  7. Style Chips (3 to 6 styles out of 25 aesthetics)
  8. Starter Top & Bottom Selection
  9. Virtual Try-On Fitting Room with Waist Level fine-tuning
  10. Daily Look Notification Time Picker
  11. Confetti & Sparkles Celebration
  12. Mobile Phone Number (+90 default) & Email option
  13. 6-Box OTP Verification with auto-advance and 60s cooldown
- **Free Demo Mode**: Runs immediately without mandatory login or Google Sign-In walls.
- **Multi-language Support (i18n)**: Seamless English and Turkish localization with dynamic language switching.
- **Serverless & Secure**: All Gemini API calls run securely server-side under `/api/*` (Vercel Serverless Functions and Express dev server).

---

## 🚀 Deployment Guide

### 1. Setting Up Supabase
1. Go to [database.new](https://database.new) and create a free Supabase project.
2. In the Supabase Dashboard, open the **SQL Editor** tab from the left sidebar.
3. Open the file `supabase/schema.sql` from this repository, copy its entire contents, paste it into the SQL Editor, and click **Run**.
   - This creates the `profiles`, `clothing_items`, and `outfits` tables.
   - Enables Row Level Security (RLS) policies on all tables.
   - Creates private storage buckets: `avatars`, `clothes`, and `tryons`.
4. Go to **Project Settings > API** in Supabase and copy:
   - **Project URL**
   - **anon / public key**
   - **service_role key** (keep secret, server-only)

---

### 2. Pushing Code to GitHub
1. Initialize git in your local project directory:
   ```bash
   git init
   git add .
   git commit -m "feat: initial Dolap AI wardrobe app"
   ```
2. Create a new repository on [GitHub](https://github.com/new).
3. Push your repository:
   ```bash
   git remote add origin https://github.com/<your-username>/dolap.git
   git branch -M main
   git push -u origin main
   ```

---

### 3. Deploying to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
2. Select your GitHub repository (`dolap`) and click **Import**.
3. Under **Environment Variables**, add the following keys:
   - `GEMINI_API_KEY`: Your Google Gemini API Key
   - `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your-supabase-anon-key`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your-supabase-service-role-key`
4. Click **Deploy**. Vercel will build the frontend with Vite and host the serverless functions in `/api` automatically via `vercel.json`.

---

## 💻 Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment template:
   ```bash
   cp .env.example .env
   ```
3. Set your `GEMINI_API_KEY` in `.env`.
4. Run the development server (runs full-stack Express + Vite on port 3000):
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000).
