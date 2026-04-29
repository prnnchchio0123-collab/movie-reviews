import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Valid director options from your Notion database
const VALID_DIRECTORS = [
  "Park Chan-wook","Orson Welles","Hirokazu Koreeda","Gerard Johnstone","Joel Crawford",
  "Alejandro Loayza Grisi","Don Hall","Qui Nguyen","Todd Field","Ti West","Michael Giacchino",
  "Kogonada","Nicholas Stoller","Mark Mylod","Matt Reeves","Christian Tafdrup","Romain Gavras",
  "Jordan Peele","Scott Derrickson","Luca Guadagnino","Parker Finn","Adam Nee","Aaron Nee",
  "Scott Mann","Baz Luhrmann","David Leitch","Rian Johnson","Tarik Saleh","Martin McDonagh",
  "Lee Chang-dong","Edward Berger","Dan Kwan","Daniel Scheinert","Steven Spielberg",
  "M. Night Shyamalan","Chris Miller","Phil Lord","Justin K. Thompson","Kemp Powers",
  "Joaquim Dos Santos","Jonathan M. Goldstein","John Francis Daley","Steven Caple Jr.",
  "Celine Song","Ari Aster","Andy Muschietti","Gene Stupnitsky","Michael Philippou",
  "Danny Philippou","James Gunn","Chad Stahelski","Jalmari Helander","Ben Affleck",
  "Lee Cronin","James Mangold","Jung Bum-shik","Ryan Coogler","Len Wiseman","Danny Boyle",
  "John Sturges","Will Gluck","Henry Dunham","Jeremy Saulnier","Alex Garland","David Zucker",
  "Francis Ford Coppola","James Hawes","Sidney Lumet","Roman Polanski","Alfred Hitchcock",
  "Akiva Schaffer","Joseph Kosinski","Kyle Newacheck","Zach Cregger","Patrick Brice",
  "Macon Blair","Michael Shanks","Paul Thomas Anderson","Dan Trachtenberg","Simon McQuoid",
  "Edgar Wright","Oz Perkins","Chris Stuckmann","Spike Lee","Nia Dacosta"
];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Auth check
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const {
    title, year, directors, genres, rating, tomatometer,
    runTime, watched, rewatch, posterUrl, date,
  } = req.body;

  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const ratingMap = { 5: '⭐⭐⭐⭐⭐', 4: '⭐⭐⭐⭐', 3: '⭐⭐⭐', 2: '⭐⭐', 1: '⭐' };

    // Only include directors that exist in Notion's multi-select options
    const validDirs = (directors || []).filter((d) => VALID_DIRECTORS.includes(d));

    const properties = {
      Title: { title: [{ text: { content: title } }] },
      'Year🗓️': { rich_text: [{ text: { content: year || '' } }] },
      'Run Time⏱️': { rich_text: [{ text: { content: runTime || '' } }] },
      'Watched👁️': { checkbox: watched || false },
      'Rewatch📺': { checkbox: rewatch || false },
      'Poster URL': posterUrl ? { url: posterUrl } : { url: null },
    };

    if (genres && genres.length > 0) {
      properties['Genre 🗃️'] = {
        multi_select: genres.map((g) => ({ name: g })),
      };
    }

    if (validDirs.length > 0) {
      properties['Director 🎬'] = {
        multi_select: validDirs.map((d) => ({ name: d })),
      };
    }

    if (rating && ratingMap[rating]) {
      properties['Rating ⭐️'] = { select: { name: ratingMap[rating] } };
    }

    if (tomatometer != null && tomatometer !== '') {
      properties['Tomatometer 🍅'] = { number: Number(tomatometer) };
    }

    if (date) {
      properties['Date'] = { date: { start: date } };
    }

    const page = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties,
    });

    return res.status(200).json({ success: true, id: page.id });
  } catch (err) {
    console.error('Notion create error:', err);
    return res.status(500).json({ error: err.message || 'Failed to add movie' });
  }
}
