import { useState, useMemo } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import MovieCard from '../components/MovieCard';
import { getMovies } from '../lib/notion';

export default function Home({ movies }) {
  const [search, setSearch] = useState('');
  const [activeGenre, setActiveGenre] = useState(null);
  const [sortBy, setSortBy] = useState('date');

  // Collect all genres
  const allGenres = useMemo(() => {
    const set = new Set();
    movies.forEach((m) => m.genres.forEach((g) => set.add(g)));
    return Array.from(set).sort();
  }, [movies]);

  const filtered = useMemo(() => {
    let result = [...movies];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.directors.some((d) => d.toLowerCase().includes(q)) ||
          m.genres.some((g) => g.toLowerCase().includes(q))
      );
    }

    if (activeGenre) {
      result = result.filter((m) => m.genres.includes(activeGenre));
    }

    result.sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'tomatometer') return (b.tomatometer || 0) - (a.tomatometer || 0);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      // date (default)
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date) - new Date(a.date);
    });

    return result;
  }, [movies, search, activeGenre, sortBy]);

  const watchedCount = movies.filter((m) => m.watched).length;
  const rewatchCount = movies.filter((m) => m.rewatch).length;
  const avgRating = movies.filter((m) => m.rating).reduce((acc, m, _, arr) => {
    return acc + m.rating / arr.length;
  }, 0);

  return (
    <>
      <Head>
        <title>ReelLog — My Movie Reviews</title>
        <meta name="description" content="A personal movie review log" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ minHeight: '100vh', background: 'var(--bg-void)' }}>
        <Header
          onSearch={setSearch}
          onGenreFilter={setActiveGenre}
          genres={allGenres}
          activeGenre={activeGenre}
        />

        {/* Hero stats bar */}
        <div style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-deep)',
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '1.5rem 2rem',
            display: 'flex',
            gap: '3rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: '2.2rem',
                fontWeight: 900,
                color: 'var(--text-primary)',
                lineHeight: 1,
              }}>
                {watchedCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>
                Films Watched
              </div>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'var(--border)' }} />
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: '2.2rem',
                fontWeight: 900,
                color: 'var(--gold)',
                lineHeight: 1,
              }}>
                {avgRating > 0 ? avgRating.toFixed(1) : '—'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>
                Avg Rating
              </div>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'var(--border)' }} />
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: '2.2rem',
                fontWeight: 900,
                color: 'var(--text-primary)',
                lineHeight: 1,
              }}>
                {rewatchCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>
                Rewatches
              </div>
            </div>
            <div style={{ flex: 1 }} />
            {/* Sort control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Sort</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '5px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8rem',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="date">Latest First</option>
                <option value="rating">My Rating</option>
                <option value="tomatometer">Tomatometer</option>
                <option value="title">A–Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 2rem 0' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
            {search || activeGenre
              ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`
              : `${filtered.length} films`}
          </p>
        </div>

        {/* Movie grid */}
        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 2rem 4rem' }}>
          {filtered.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '6rem 0',
              color: 'var(--text-muted)',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '3rem', marginBottom: '1rem' }}>
                🎬
              </div>
              <p style={{ fontSize: '0.9rem', letterSpacing: '0.05em' }}>No films found</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '1.25rem',
            }}>
              {filtered.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    const movies = await getAllMoviesSSG();
    return {
      props: { movies },
      revalidate: 3600, // Revalidate every hour (ISR)
    };
  } catch (error) {
    console.error('Error fetching movies:', error);
    return {
      props: { movies: [] },
      revalidate: 60,
    };
  }
}

async function getAllMoviesSSG() {
  const { getAllMovies } = await import('../lib/notion');
  return getAllMovies();
}
