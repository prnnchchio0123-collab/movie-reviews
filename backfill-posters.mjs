/**
 * backfill-posters.mjs
 * 
 * One-time script to fetch poster URLs from TMDB and save them back to Notion
 * for all movies that are missing a poster.
 * 
 * HOW TO RUN:
 *   1. Create a .env file in the same folder with:
 *        NOTION_API_KEY=your_notion_secret
 *        NOTION_DATABASE_ID=your_database_id
 *        TMDB_API_KEY=your_tmdb_api_key
 * 
 *   2. Install dependencies (if not already):
 *        npm install @notionhq/client dotenv
 * 
 *   3. Run:
 *        node backfill-posters.mjs
 */

import { Client } from '@notionhq/client';
import 'dotenv/config';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;
const TMDB_KEY = process.env.TMDB_API_KEY;

if (!process.env.NOTION_API_KEY || !DATABASE_ID || !TMDB_KEY) {
  console.error('❌ Missing env vars. Make sure NOTION_API_KEY, NOTION_DATABASE_ID, and TMDB_API_KEY are set.');
  process.exit(1);
}

// --- Fetch all pages from Notion (handles pagination) ---
async function getAllNotionPages() {
  const pages = [];
  let cursor = undefined;

  do {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      start_cursor: cursor,
      page_size: 100,
    });
    pages.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return pages;
}

// --- Search TMDB for a movie by title + optional year ---
async function searchTMDB(title, year) {
  const params = new URLSearchParams({
    api_key: TMDB_KEY,
    query: title,
    language: 'en-US',
    page: '1',
    include_adult: 'false',
    ...(year ? { year } : {}),
  });

  const res = await fetch(`https://api.themoviedb.org/3/search/movie?${params}`);
  if (!res.ok) throw new Error(`TMDB search failed: ${res.status}`);
  const data = await res.json();
  return data.results || [];
}

// --- Update a Notion page's Poster URL property ---
async function updatePosterUrl(pageId, posterUrl) {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      'Poster URL': { url: posterUrl },
    },
  });
}

// --- Sleep helper to avoid rate limits ---
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- Main ---
async function main() {
  console.log('🎬 Fetching all movies from Notion...');
  const pages = await getAllNotionPages();
  console.log(`📋 Found ${pages.length} movies total.\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const page of pages) {
    const props = page.properties;
    const title = props['Title']?.title?.[0]?.plain_text || null;
    const year = props['Year🗓️']?.rich_text?.[0]?.plain_text || null;
    const existingPoster = props['Poster URL']?.url || null;

    if (!title) {
      console.log(`⚠️  Skipping untitled page ${page.id}`);
      skipped++;
      continue;
    }

    // Skip if poster already exists
    if (existingPoster) {
      console.log(`✅ Already has poster: ${title}`);
      skipped++;
      continue;
    }

    console.log(`🔍 Searching TMDB for: ${title}${year ? ` (${year})` : ''}`);

    try {
      let results = await searchTMDB(title, year);

      // If no results with year, try without year
      if (results.length === 0 && year) {
        results = await searchTMDB(title, null);
      }

      if (results.length === 0 || !results[0].poster_path) {
        console.log(`   ❌ No poster found for: ${title}`);
        failed++;
      } else {
        const posterUrl = `https://image.tmdb.org/t/p/w500${results[0].poster_path}`;
        await updatePosterUrl(page.id, posterUrl);
        console.log(`   ✅ Updated: ${title} → ${posterUrl}`);
        updated++;
      }
    } catch (err) {
      console.error(`   ❌ Error for "${title}":`, err.message);
      failed++;
    }

    // Avoid hitting rate limits (TMDB: 40 req/10s, Notion: 3 req/s)
    await sleep(300);
  }

  console.log('\n--- Done ---');
  console.log(`✅ Updated:  ${updated}`);
  console.log(`⏭️  Skipped:  ${skipped}`);
  console.log(`❌ Failed:   ${failed}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
