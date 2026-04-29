import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

export async function getMovies() {
  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
    filter: {
      property: 'Watched👁️',
      checkbox: {
        equals: true,
      },
    },
  });

  return response.results.map(transformMovie);
}

export async function getAllMovies() {
  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
  });

  return response.results.map(transformMovie);
}

export async function getMovieBySlug(id) {
  const page = await notion.pages.retrieve({ page_id: id });
  return transformMovie(page);
}

function transformMovie(page) {
  const props = page.properties;

  const ratingMap = {
    '⭐⭐⭐⭐⭐': 5,
    '⭐⭐⭐⭐': 4,
    '⭐⭐⭐': 3,
    '⭐⭐': 2,
    '⭐': 1,
  };

  const ratingStr = props['Rating ⭐️']?.select?.name || null;

  return {
    id: page.id,
    title: props['Title']?.title?.[0]?.plain_text || 'Untitled',
    year: props['Year🗓️']?.rich_text?.[0]?.plain_text || null,
    directors: props['Director 🎬']?.multi_select?.map((d) => d.name) || [],
    genres: props['Genre 🗃️']?.multi_select?.map((g) => g.name) || [],
    ratingStr: ratingStr,
    rating: ratingStr ? ratingMap[ratingStr] || null : null,
    tomatometer: props['Tomatometer 🍅']?.number || null,
    runTime: props['Run Time⏱️']?.rich_text?.[0]?.plain_text || null,
    watched: props['Watched👁️']?.checkbox || false,
    rewatch: props['Rewatch📺']?.checkbox || false,
    posterUrl: props['Poster URL']?.url || null,
    date: props['Date']?.date?.start || null,
    notionUrl: page.url,
  };
}
