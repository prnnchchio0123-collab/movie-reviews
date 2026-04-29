export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'TMDB ID required' });

  const TMDB_KEY = process.env.TMDB_API_KEY;

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}&language=en-US&append_to_response=credits`
    );
    const m = await response.json();

    // Map TMDB genres to your Notion genre options
    const genreMap = {
      'Action': 'Action',
      'Adventure': 'Adventure',
      'Animation': 'Animation',
      'Comedy': 'Comedy',
      'Documentary': 'Documentary',
      'Fantasy': 'Fantasy',
      'Drama': 'Drama',
      'History': 'Historical',
      'Horror': 'Horror',
      'Biography': 'Biography',
      'Thriller': 'Thriller',
      'Science Fiction': 'Science Fiction',
      'Mystery': 'Mystery',
      'War': 'War',
      'Family': 'Family',
      'Crime': 'Crime',
      'Romance': 'Romance',
      'Music': 'Drama',
      'Western': 'Action',
    };

    const genres = (m.genres || [])
      .map((g) => genreMap[g.name] || null)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i); // dedupe

    // Runtime formatting
    const runtime = m.runtime
      ? `${Math.floor(m.runtime / 60)}h ${m.runtime % 60}m`
      : null;

    // Director from credits
    const directors = (m.credits?.crew || [])
      .filter((c) => c.job === 'Director')
      .map((c) => c.name);

    return res.status(200).json({
      tmdbId: m.id,
      title: m.title,
      year: m.release_date ? m.release_date.split('-')[0] : null,
      posterUrl: m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : null,
      overview: m.overview,
      runtime,
      genres,
      directors,
      tomatometer: null, // TMDB doesn't have RT score
    });
  } catch (err) {
    console.error('TMDB detail error:', err);
    return res.status(500).json({ error: 'Failed to fetch movie details' });
  }
}
