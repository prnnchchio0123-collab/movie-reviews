import Head from 'next/head';
import Header from '../components/Header';
import { getAllMovies } from '../lib/notion';

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '1.5rem',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: '2.8rem',
        fontWeight: 900,
        color: accent || 'var(--text-primary)',
        lineHeight: 1,
        marginBottom: '6px',
      }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

function GenreBar({ genre, count, max, color }) {
  const pct = Math.round((count / max) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ width: '110px', fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>
        {genre}
      </div>
      <div style={{ flex: 1, height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: color || 'var(--gold)',
          borderRadius: '4px',
          transition: 'width 0.5s ease',
        }} />
      </div>
      <div style={{ width: '28px', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
        {count}
      </div>
    </div>
  );
}

const GENRE_COLORS = {
  Drama: '#e74c3c', Horror: '#c0392b', Comedy: '#3498db', Action: '#e67e22',
  Thriller: '#2980b9', Animation: '#2ecc71', 'Science Fiction': '#e67e22',
  Fantasy: '#e91e8c', Romance: '#e91e8c', Mystery: '#8e44ad',
  Adventure: '#f1c40f', War: '#7f8c8d', Biography: '#27ae60', Crime: '#c0392b',
  Historical: '#d35400', Sports: '#9b59b6', Documentary: '#9b59b6',
  Superhero: '#f1c40f', Family: '#27ae60', 'Rom-Com': '#e91e8c',
};

export default function Stats({ movies }) {
  const watched = movies.filter((m) => m.watched);
  const rated = movies.filter((m) => m.rating);

  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    r,
    count: rated.filter((m) => m.rating === r).length,
  }));

  const genreCounts = {};
  movies.forEach((m) => m.genres.forEach((g) => { genreCounts[g] = (genreCounts[g] || 0) + 1; }));
  const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const maxGenre = sortedGenres[0]?.[1] || 1;

  const directorCounts = {};
  movies.forEach((m) => m.directors.forEach((d) => { directorCounts[d] = (directorCounts[d] || 0) + 1; }));
  const topDirectors = Object.entries(directorCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const avgTomato = movies.filter((m) => m.tomatometer != null)
    .reduce((acc, m, _, arr) => acc + m.tomatometer / arr.length, 0);

  const rewatch = movies.filter((m) => m.rewatch).length;
  const maxRatingCount = Math.max(...ratingDist.map((r) => r.count), 1);

  // Movies by year
  const byYear = {};
  movies.forEach((m) => { if (m.year) byYear[m.year] = (byYear[m.year] || 0) + 1; });
  const yearEntries = Object.entries(byYear).sort((a, b) => a[0].localeCompare(b[0]));
  const maxYear = Math.max(...yearEntries.map(([, v]) => v), 1);

  return (
    <>
      <Head>
        <title>Stats — ReelLog</title>
      </Head>
      <div style={{ minHeight: '100vh', background: 'var(--bg-void)' }}>
        <Header />

        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem 4rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: '2.2rem',
            fontWeight: 900,
            marginBottom: '2rem',
          }}>
            My Film Stats
          </h1>

          {/* Top stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '3rem',
          }}>
            <StatCard label="Total Films" value={movies.length} />
            <StatCard label="Watched" value={watched.length} accent="var(--green)" />
            <StatCard label="Would Rewatch" value={rewatch} accent="var(--gold)" />
            <StatCard
              label="Avg Tomatometer"
              value={avgTomato > 0 ? `${Math.round(avgTomato)}%` : '—'}
              accent="var(--tomato)"
            />
            <StatCard
              label="Avg My Rating"
              value={rated.length > 0 ? `${(rated.reduce((a, m) => a + m.rating, 0) / rated.length).toFixed(1)}★` : '—'}
              accent="var(--gold)"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>

            {/* Rating distribution */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '1.5rem',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                fontWeight: 700,
                marginBottom: '1.5rem',
                color: 'var(--text-primary)',
              }}>
                Rating Distribution
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {ratingDist.map(({ r, count }) => (
                  <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gold)', width: '70px', flexShrink: 0 }}>
                      {'★'.repeat(r)}
                    </div>
                    <div style={{ flex: 1, height: '10px', background: 'var(--border)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${(count / maxRatingCount) * 100}%`,
                        height: '100%',
                        background: 'var(--gold)',
                        borderRadius: '5px',
                      }} />
                    </div>
                    <div style={{ width: '24px', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top genres */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '1.5rem',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                fontWeight: 700,
                marginBottom: '1.5rem',
              }}>
                Top Genres
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sortedGenres.map(([g, count]) => (
                  <GenreBar key={g} genre={g} count={count} max={maxGenre} color={GENRE_COLORS[g]} />
                ))}
              </div>
            </div>

            {/* Top directors */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '1.5rem',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                fontWeight: 700,
                marginBottom: '1.5rem',
              }}>
                Most Watched Directors
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {topDirectors.map(([director, count], i) => (
                  <div key={director} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    paddingBottom: '12px',
                    borderBottom: i < topDirectors.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      width: '20px',
                    }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ flex: 1, fontSize: '0.88rem' }}>{director}</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                      color: 'var(--gold)',
                    }}>
                      {count} film{count > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Movies by film release year */}
            {yearEntries.length > 0 && (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '1.5rem',
              }}>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  marginBottom: '1.5rem',
                }}>
                  By Release Year
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {yearEntries.map(([year, count]) => (
                    <div key={year} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'right', flexShrink: 0 }}>
                        {year}
                      </div>
                      <div style={{ flex: 1, height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${(count / maxYear) * 100}%`,
                          height: '100%',
                          background: 'var(--text-muted)',
                          borderRadius: '4px',
                        }} />
                      </div>
                      <div style={{ width: '24px', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    const movies = await getAllMovies();
    return { props: { movies }, revalidate: 3600 };
  } catch {
    return { props: { movies: [] }, revalidate: 60 };
  }
}
