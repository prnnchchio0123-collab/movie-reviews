import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function Header({ onSearch, onGenreFilter, genres = [], activeGenre }) {
  const [searchValue, setSearchValue] = useState('');
  const router = useRouter();
  const { data: session } = useSession();

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    if (onSearch) onSearch(val);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid var(--border)',
      background: 'rgba(8,8,8,0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        height: '64px',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: '1.4rem',
            fontWeight: 700,
            color: 'var(--gold)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>
            Rewatch
          </span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            fontWeight: 400,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>
            Review
          </span>
        </Link>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: '360px' }}>
          <div style={{ position: 'relative' }}>
            <svg style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              width: '14px', height: '14px', color: 'var(--text-muted)',
            }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search films…"
              value={searchValue}
              onChange={handleSearch}
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '8px 12px 8px 36px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                fontWeight: 300,
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--gold-dim)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/" style={{
            fontSize: '0.82rem',
            fontWeight: 400,
            color: router.pathname === '/' ? 'var(--text-primary)' : 'var(--text-secondary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            transition: 'color 0.2s',
          }}>
            Reviews
          </Link>
          <Link href="/stats" style={{
            fontSize: '0.82rem',
            fontWeight: 400,
            color: router.pathname === '/stats' ? 'var(--text-primary)' : 'var(--text-secondary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            transition: 'color 0.2s',
          }}>
            Stats
          </Link>
          {session ? (
            <Link href="/add" style={{
              padding: '6px 16px',
              borderRadius: '6px',
              background: 'var(--gold)',
              color: 'var(--bg-void)',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}>
              + Add
            </Link>
          ) : (
            <Link href="/login" style={{
              fontSize: '0.82rem',
              fontWeight: 400,
              color: 'var(--text-secondary)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              Login
            </Link>
          )}
        </nav>
      </div>

      {/* Genre filter bar */}
      {genres.length > 0 && (
        <div style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-deep)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 2rem',
            display: 'flex',
            gap: '0.25rem',
            alignItems: 'center',
            height: '44px',
          }}>
            {['All', ...genres].map((g) => (
              <button
                key={g}
                onClick={() => onGenreFilter && onGenreFilter(g === 'All' ? null : g)}
                style={{
                  padding: '4px 14px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: (activeGenre === g || (!activeGenre && g === 'All')) ? 'var(--gold)' : 'var(--border)',
                  background: (activeGenre === g || (!activeGenre && g === 'All')) ? 'var(--gold)' : 'transparent',
                  color: (activeGenre === g || (!activeGenre && g === 'All')) ? 'var(--bg-void)' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                  letterSpacing: '0.04em',
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
