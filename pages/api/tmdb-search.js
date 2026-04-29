export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { query, year } = req.query;
  if (!query) return res.status(400).json({ error: 'Query required' });

  const TMDB_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_KEY) return res.status(500).json({ error: 'TMDB API key not configured' });

  try {
    const params = new URLSearchParams({
      api_key: TMDB_KEY,
      query,
      language: 'en-US',
      page: '1',
      include_adult: 'false',
      ...(year ? { year } : {}),
    });

    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?${params}`
    );
    const data = await response.json();

    const results = (data.results || []).slice(0, 6).map((m) => ({
      tmdbId: m.id,
      title: m.title,
      year: m.release_date ? m.release_date.split('-')[0] : null,
      posterUrl: m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : null,
      overview: m.overview,
      genres: [], // fetched in detail call
    }));

    return res.status(200).json({ results });
  } catch (err) {
    console.error('TMDB search error:', err);
    return res.status(500).json({ error: 'Failed to search TMDB' });
  }
}
