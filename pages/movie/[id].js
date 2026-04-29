import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getAllMovies, getMovieBySlug } from '../../lib/notion';
import Header from '../../components/Header';

const GENRE_COLORS = {
  Action: '#e67e22', Adventure: '#f1c40f', Animation: '#2ecc71',
  Comedy: '#3498db', Documentary: '#9b59b6', Fantasy: '#e91e8c',
  Drama: '#e74c3c', Historical: '#e67e22', Horror: '#e74c3c',
  Biography: '#2ecc71', Thriller: '#3498db', Sports: '#9b59b6',
  'Rom-Com': '#e91e8c', Romance: '#e91e8c', 'Science Fiction': '#e67e22',
  Superhero: '#f1c40f', Mystery: '#8e44ad', War: '#7f8c8d',
  Family: '#27ae60', Crime: '#c0392b',
};

function StarRating({ rating }) {
  if (!rating) return null;
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ fontSize: '1.4rem', color: i <= rating ? 'var(--gold)' : 'var(--border-light)' }}>★</span>
      ))}
    </div>
  );
}

export default function MoviePage({ movie }) {
  const [imgError, setImgError] = useState(false);

  if (!movie) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-muted)' }}>
      Movie not found
    </div>
  );

  const hasPoster = movie.posterUrl && !imgError;
  const tomatoColor = movie.tomatometer >= 75 ? 'var(--green)' : movie.tomatometer >= 60 ? 'var(--gold)' : 'var(--tomato)';

  return (
    <>
      <Head>
        <title>{movie.title} — ReelLog</title>
        <meta name="description" content={`My review of ${movie.title}${movie.year ? ` (${movie.year})` : ''}`} />
      </Head>

      <div style={{ minHeight: '100vh', background: 'var(--bg-void)' }}>
        <Header />

        {/* Back button */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 2rem 0' }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            transition: 'color 0.2s',
          }}>
            ← Back
          </Link>
        </div>

        {/* Main content */}
        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: hasPoster ? '280px 1fr' : '1fr',
            gap: '3rem',
            alignItems: 'start',
          }}>
            {/* Poster */}
            {hasPoster && (
              <div style={{
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
                border: '1px solid var(--border)',
                flexShrink: 0,
              }}>
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  onError={() => setImgError(true)}
                  style={{ width: '100%', display: 'block' }}
                />
              </div>
            )}

            {/* Details */}
            <div>
              {/* Genres */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem' }}>
                {movie.genres.map((g) => (
                  <span key={g} style={{
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    padding: '3px 12px',
                    borderRadius: '4px',
                    background: `${GENRE_COLORS[g] || '#fff'}18`,
                    border: `1px solid ${GENRE_COLORS[g] || '#fff'}40`,
                    color: GENRE_COLORS[g] || 'var(--text-secondary)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}>
                    {g}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: '0.5rem',
                letterSpacing: '-0.02em',
              }}>
                {movie.title}
              </h1>

              {/* Year + runtime */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                marginBottom: '1.5rem',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
              }}>
                {movie.year && <span>{movie.year}</span>}
                {movie.year && movie.runTime && <span style={{ color: 'var(--border-light)' }}>·</span>}
                {movie.runTime && <span>{movie.runTime}</span>}
              </div>

              {/* Directors */}
              {movie.directors.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{
                    fontSize: '0.68rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    marginBottom: '4px',
                  }}>
                    {movie.directors.length > 1 ? 'Directors' : 'Director'}
                  </div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 400 }}>
                    {movie.directors.join(', ')}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div style={{ height: '1px', background: 'var(--border)', marginBottom: '2rem' }} />

              {/* Ratings */}
              <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                {movie.rating && (
                  <div>
                    <div style={{
                      fontSize: '0.68rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      marginBottom: '8px',
                    }}>
                      My Rating
                    </div>
                    <StarRating rating={movie.rating} />
                  </div>
                )}

                {movie.tomatometer != null && (
                  <div>
                    <div style={{
                      fontSize: '0.68rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      marginBottom: '8px',
                    }}>
                      Tomatometer
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '2rem',
                      fontWeight: 900,
                      color: tomatoColor,
                      lineHeight: 1,
                    }}>
                      {movie.tomatometer}%
                    </div>
                    {/* Bar */}
                    <div style={{ width: '120px', height: '4px', background: 'var(--border)', borderRadius: '2px', marginTop: '8px' }}>
                      <div style={{
                        width: `${movie.tomatometer}%`,
                        height: '100%',
                        background: tomatoColor,
                        borderRadius: '2px',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '2rem', flexWrap: 'wrap' }}>
                {movie.watched && (
                  <span style={{
                    padding: '5px 14px',
                    borderRadius: '4px',
                    background: 'rgba(39,174,96,0.15)',
                    border: '1px solid rgba(39,174,96,0.3)',
                    color: 'var(--green)',
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                  }}>
                    ✓ Watched
                  </span>
                )}
                {movie.rewatch && (
                  <span style={{
                    padding: '5px 14px',
                    borderRadius: '4px',
                    background: 'rgba(201,168,76,0.15)',
                    border: '1px solid rgba(201,168,76,0.3)',
                    color: 'var(--gold)',
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                  }}>
                    ↺ Would Rewatch
                  </span>
                )}
              </div>

              {/* Date watched */}
              {movie.date && (
                <p style={{
                  marginTop: '1.5rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  Watched {new Date(movie.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}

              {/* Notion link */}
              <a
                href={movie.notionUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '2rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: '2px',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
              >
                Open in Notion ↗
              </a>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  try {
    const movies = await getAllMovies();
    const paths = movies.map((m) => ({ params: { id: m.id } }));
    return { paths, fallback: 'blocking' };
  } catch {
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  try {
    const movie = await getMovieBySlug(params.id);
    if (!movie) return { notFound: true };
    return {
      props: { movie },
      revalidate: 3600,
    };
  } catch {
    return { notFound: true };
  }
}
