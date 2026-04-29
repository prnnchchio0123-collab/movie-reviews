import { useState } from 'react';
import Link from 'next/link';

const GENRE_COLORS = {
  Action: '#e67e22',
  Adventure: '#f1c40f',
  Animation: '#2ecc71',
  Comedy: '#3498db',
  Documentary: '#9b59b6',
  Fantasy: '#e91e8c',
  Drama: '#e74c3c',
  Historical: '#e67e22',
  Horror: '#e74c3c',
  Biography: '#2ecc71',
  Thriller: '#3498db',
  Sports: '#9b59b6',
  'Rom-Com': '#e91e8c',
  Romance: '#e91e8c',
  'Science Fiction': '#e67e22',
  Superhero: '#f1c40f',
  Mystery: '#8e44ad',
  War: '#7f8c8d',
  Family: '#27ae60',
  Crime: '#c0392b',
};

function StarRating({ rating }) {
  if (!rating) return null;
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{
          fontSize: '0.7rem',
          color: i <= rating ? 'var(--gold)' : 'var(--border-light)',
        }}>★</span>
      ))}
    </div>
  );
}

function Tomatometer({ score }) {
  if (score == null) return null;
  const color = score >= 75 ? 'var(--green)' : score >= 60 ? 'var(--gold)' : 'var(--tomato)';
  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '0.7rem',
      color,
      display: 'flex',
      alignItems: 'center',
      gap: '3px',
    }}>
      🍅 {score}%
    </span>
  );
}

export default function MovieCard({ movie }) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const hasPoster = movie.posterUrl && !imgError;
  const primaryGenre = movie.genres?.[0];
  const accentColor = GENRE_COLORS[primaryGenre] || 'var(--gold)';

  return (
    <Link
      href={`/movie/${movie.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        background: 'var(--bg-card)',
        border: '1px solid',
        borderColor: hovered ? 'var(--border-light)' : 'var(--border)',
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? `0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}22` : 'none',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Poster */}
      <div style={{
        position: 'relative',
        paddingTop: '150%',
        background: 'var(--bg-deep)',
        overflow: 'hidden',
      }}>
        {hasPoster ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            onError={() => setImgError(true)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: '2.5rem',
              color: 'var(--border-light)',
            }}>🎬</div>
            <span style={{
              fontSize: '0.65rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>No Poster</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60%',
          background: 'linear-gradient(to top, rgba(8,8,8,0.95) 0%, transparent 100%)',
          opacity: hasPoster ? 1 : 0,
        }} />

        {/* Rewatch badge */}
        {movie.rewatch && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'var(--gold)',
            color: 'var(--bg-void)',
            fontSize: '0.6rem',
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: '3px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Rewatch
          </div>
        )}

        {/* Year on poster */}
        {movie.year && hasPoster && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'rgba(240,237,232,0.6)',
          }}>
            {movie.year}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 14px 16px' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.95rem',
          fontWeight: 700,
          lineHeight: 1.3,
          marginBottom: '4px',
          color: 'var(--text-primary)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {movie.title}
        </h3>

        {movie.directors.length > 0 && (
          <p style={{
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
            marginBottom: '10px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {movie.directors.join(', ')}
          </p>
        )}

        {/* Genres */}
        {movie.genres.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            marginBottom: '10px',
          }}>
            {movie.genres.slice(0, 2).map((g) => (
              <span key={g} style={{
                fontSize: '0.62rem',
                fontWeight: 500,
                padding: '2px 8px',
                borderRadius: '3px',
                background: `${GENRE_COLORS[g] || 'var(--border)'}18`,
                border: `1px solid ${GENRE_COLORS[g] || 'var(--border)'}40`,
                color: GENRE_COLORS[g] || 'var(--text-secondary)',
                letterSpacing: '0.04em',
              }}>
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Rating row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '10px',
          borderTop: '1px solid var(--border)',
        }}>
          <StarRating rating={movie.rating} />
          <Tomatometer score={movie.tomatometer} />
        </div>
      </div>
    </Link>
  );
}
