import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

const VALID_GENRES = [
  'Action','Adventure','Animation','Comedy','Documentary','Fantasy','Drama',
  'Historical','Horror','Biography','Thriller','Sports','Rom-Com','Romance',
  'Science Fiction','Superhero','Mystery','War','Family','Crime',
];

const RATING_OPTIONS = [
  { value: 5, label: '⭐⭐⭐⭐⭐ Masterpiece' },
  { value: 4, label: '⭐⭐⭐⭐ Great' },
  { value: 3, label: '⭐⭐⭐ Good' },
  { value: 2, label: '⭐⭐ Mediocre' },
  { value: 1, label: '⭐ Poor' },
];

function Input({ label, ...props }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
        {label}
      </label>
      <input
        {...props}
        style={{
          width: '100%',
          background: 'var(--bg-deep)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '10px 14px',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.88rem',
          outline: 'none',
          transition: 'border-color 0.2s',
          ...props.style,
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--gold-dim)'; props.onFocus?.(e); }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; props.onBlur?.(e); }}
      />
    </div>
  );
}

export default function AddMoviePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const searchTimeout = useRef(null);

  const [form, setForm] = useState({
    title: '', year: '', directors: '', genres: [],
    rating: '', tomatometer: '', runTime: '',
    watched: true, rewatch: false,
    posterUrl: '', date: new Date().toISOString().split('T')[0],
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  // Debounced TMDB search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/tmdb-search?query=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch { setSearchResults([]); }
      setSearching(false);
    }, 400);
  }, [searchQuery]);

  const handleSelectMovie = async (movie) => {
    setSearchResults([]);
    setSearchQuery('');
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/tmdb-detail?id=${movie.tmdbId}`);
      const detail = await res.json();
      setSelectedMovie(detail);
      setForm((f) => ({
        ...f,
        title: detail.title || '',
        year: detail.year || '',
        directors: (detail.directors || []).join(', '),
        genres: detail.genres || [],
        runTime: detail.runtime || '',
        posterUrl: detail.posterUrl || '',
      }));
    } catch { setSelectedMovie(movie); }
    setLoadingDetails(false);
  };

  const toggleGenre = (g) => {
    setForm((f) => ({
      ...f,
      genres: f.genres.includes(g) ? f.genres.filter((x) => x !== g) : [...f.genres, g],
    }));
  };

  const handleSubmit = async () => {
    if (!form.title) { setError('Title is required'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/add-movie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          directors: form.directors ? form.directors.split(',').map((d) => d.trim()).filter(Boolean) : [],
          rating: form.rating ? Number(form.rating) : null,
          tomatometer: form.tomatometer !== '' ? Number(form.tomatometer) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setForm({ title: '', year: '', directors: '', genres: [], rating: '', tomatometer: '', runTime: '', watched: true, rewatch: false, posterUrl: '', date: new Date().toISOString().split('T')[0] });
        setSelectedMovie(null);
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  if (status === 'loading') return null;
  if (!session) return null;

  return (
    <>
      <Head><title>Add Movie — ReelLog</title></Head>
      <div style={{ minHeight: '100vh', background: 'var(--bg-void)' }}>

        {/* Header */}
        <header style={{
          borderBottom: '1px solid var(--border)',
          background: 'rgba(8,8,8,0.92)',
          backdropFilter: 'blur(16px)',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{
            maxWidth: '900px', margin: '0 auto', padding: '0 2rem',
            display: 'flex', alignItems: 'center', height: '64px', gap: '1.5rem',
          }}>
            <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 900 }}>
              <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Reel</span>Log
            </Link>
            <div style={{ flex: 1 }} />
            <img src={session.user?.image} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{session.user?.name}</span>
            <button onClick={() => signOut({ callbackUrl: '/' })} style={{
              background: 'transparent', border: '1px solid var(--border)', borderRadius: '5px',
              color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: '0.75rem',
              padding: '5px 12px', cursor: 'pointer',
            }}>
              Sign out
            </button>
          </div>
        </header>

        <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 2rem 4rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: '2rem', fontWeight: 900, marginBottom: '2rem',
          }}>
            Add a Movie
          </h1>

          {/* TMDB Search */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '1.5rem', marginBottom: '2rem',
          }}>
            <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Search Movie
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Type a movie title to search…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', background: 'var(--bg-deep)', border: '1px solid var(--border-light)',
                  borderRadius: '8px', padding: '12px 16px', color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)', fontSize: '1rem', outline: 'none',
                }}
              />
              {searching && (
                <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Searching…
                </div>
              )}
            </div>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div style={{
                marginTop: '8px', background: 'var(--bg-deep)', border: '1px solid var(--border)',
                borderRadius: '8px', overflow: 'hidden',
              }}>
                {searchResults.map((m) => (
                  <button
                    key={m.tmdbId}
                    onClick={() => handleSelectMovie(m)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 14px', background: 'transparent',
                      border: 'none', borderBottom: '1px solid var(--border)',
                      cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {m.posterUrl ? (
                      <img src={m.posterUrl} alt="" style={{ width: '36px', height: '54px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '36px', height: '54px', background: 'var(--border)', borderRadius: '3px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🎬</div>
                    )}
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{m.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{m.year || '—'}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {loadingDetails && (
              <p style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading details…</p>
            )}
          </div>

          {/* Form */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '1.25rem',
          }}>
            {/* Poster preview + fields */}
            <div style={{ display: 'grid', gridTemplateColumns: selectedMovie?.posterUrl ? '120px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
              {selectedMovie?.posterUrl && (
                <img src={form.posterUrl} alt="" style={{ width: '120px', borderRadius: '6px', border: '1px solid var(--border)' }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '1rem' }}>
                  <Input label="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Movie title" />
                  <Input label="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2024" />
                </div>
                <Input label="Director(s)" value={form.directors} onChange={(e) => setForm({ ...form, directors: e.target.value })} placeholder="Separate multiple with comma" />
                <Input label="Run Time" value={form.runTime} onChange={(e) => setForm({ ...form, runTime: e.target.value })} placeholder="2h 15m" />
                <Input label="Poster URL" value={form.posterUrl} onChange={(e) => setForm({ ...form, posterUrl: e.target.value })} placeholder="https://..." />
              </div>
            </div>

            {/* Genres */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Genres
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {VALID_GENRES.map((g) => (
                  <button
                    key={g}
                    onClick={() => toggleGenre(g)}
                    style={{
                      padding: '4px 14px', borderRadius: '20px', border: '1px solid',
                      borderColor: form.genres.includes(g) ? 'var(--gold)' : 'var(--border)',
                      background: form.genres.includes(g) ? 'var(--gold)' : 'transparent',
                      color: form.genres.includes(g) ? 'var(--bg-void)' : 'var(--text-secondary)',
                      fontSize: '0.75rem', fontFamily: 'var(--font-body)', fontWeight: 500,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating + Tomatometer + Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  My Rating
                </label>
                <select
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  style={{
                    width: '100%', background: 'var(--bg-deep)', border: '1px solid var(--border)',
                    borderRadius: '6px', padding: '10px 14px', color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)', fontSize: '0.88rem', outline: 'none', cursor: 'pointer',
                  }}
                >
                  <option value="">No rating</option>
                  {RATING_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Tomatometer %"
                type="number" min="0" max="100"
                value={form.tomatometer}
                onChange={(e) => setForm({ ...form, tomatometer: e.target.value })}
                placeholder="85"
              />
              <Input
                label="Date Watched"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            {/* Checkboxes */}
            <div style={{ display: 'flex', gap: '2rem' }}>
              {[['watched', 'Watched 👁️'], ['rewatch', 'Would Rewatch 📺']].map(([key, label]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--gold)', cursor: 'pointer' }}
                  />
                  {label}
                </label>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(192,57,43,0.15)', border: '1px solid rgba(192,57,43,0.3)',
                borderRadius: '6px', padding: '10px 14px', fontSize: '0.82rem', color: '#e74c3c',
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={saving || saved}
              style={{
                padding: '14px 28px', borderRadius: '8px', border: 'none',
                background: saved ? 'var(--green)' : 'var(--gold)',
                color: 'var(--bg-void)', fontFamily: 'var(--font-body)', fontWeight: 600,
                fontSize: '0.9rem', cursor: saving || saved ? 'default' : 'pointer',
                transition: 'all 0.2s', alignSelf: 'flex-start',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saved ? '✓ Saved to Notion!' : saving ? 'Saving…' : 'Save to Notion →'}
            </button>
          </div>
        </main>
      </div>
    </>
  );
}

export async function getServerSideProps(ctx) {
  const { getServerSession } = await import('next-auth/next');
  const { authOptions } = await import('./api/auth/[...nextauth]');
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) return { redirect: { destination: '/login', permanent: false } };
  return { props: {} };
}
