# 🎬 ReelLog — Movie Review Webapp

A cinematic, dark-themed movie review webapp powered by your **Notion database**, built with **Next.js**, and deployable to **Vercel**.

---

## Features

- 🎬 Beautiful film grid with poster images
- ⭐ Star ratings + Tomatometer display
- 🔍 Search by title, director, or genre
- 🗂️ Filter by genre
- 📊 Stats page (rating distribution, top genres, directors)
- 🔄 Auto-updates from Notion (ISR every hour)
- 📱 Responsive design

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Notion Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **New integration**
3. Give it a name (e.g. "ReelLog")
4. Copy the **Internal Integration Secret**

### 3. Connect Integration to your Database

1. Open your **Movies** database in Notion
2. Click the `...` menu → **Add connections**
3. Search for your integration and connect it

### 4. Configure environment variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Then fill in:

```env
NOTION_API_KEY=your_integration_secret_here
NOTION_DATABASE_ID=02891ee4d0764ee3ae597c06760f2bd2
```

> **Note:** The `NOTION_DATABASE_ID` is already pre-filled with your database ID.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel via GitHub

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/movie-reviews.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. In **Environment Variables**, add:
   - `NOTION_API_KEY` → your integration secret
   - `NOTION_DATABASE_ID` → `02891ee4d0764ee3ae597c06760f2bd2`
4. Click **Deploy** 🚀

### 3. Auto-updates

The site uses **Incremental Static Regeneration (ISR)** — pages rebuild every hour automatically. No manual redeployment needed when you add movies to Notion!

---

## Notion Database Fields Used

| Field | Type | Description |
|-------|------|-------------|
| Title | Title | Movie name |
| Year🗓️ | Text | Release year |
| Director 🎬 | Multi-select | Director(s) |
| Genre 🗃️ | Multi-select | Genres |
| Rating ⭐️ | Select | ⭐ to ⭐⭐⭐⭐⭐ |
| Tomatometer 🍅 | Number | 0–100 |
| Run Time⏱️ | Text | e.g. "2h 15m" |
| Watched👁️ | Checkbox | Have you seen it? |
| Rewatch📺 | Checkbox | Would you rewatch? |
| Poster URL | URL | Image URL for poster |
| Date | Date | Date watched |

---

## Project Structure

```
movie-reviews/
├── pages/
│   ├── index.js          # Main movie grid
│   ├── stats.js          # Stats dashboard
│   ├── movie/[id].js     # Individual movie page
│   └── _app.js
├── components/
│   ├── Header.js
│   └── MovieCard.js
├── lib/
│   └── notion.js         # Notion API client
├── styles/
│   └── globals.css       # Global styles & theme
└── next.config.js
```
