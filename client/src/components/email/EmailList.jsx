import { useCallback, useRef, useEffect } from 'react';
import { Inbox } from 'lucide-react';
import { useEmails } from '../../hooks/useEmails';
import EmailListItem from './EmailListItem';
import EmailSkeleton from './EmailSkeleton';

export default function EmailList({ label, searchQuery, selectedId, onSelect }) {
  const {
    messages, loading, loadingMore, error, hasMore,
    refresh, loadMore, markAsRead, toggleStar,
  } = useEmails(label, searchQuery);

  const loadMoreRef = useRef(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore && !loadingMore) loadMore(); },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  const handleSelect = useCallback((msg) => {
    onSelect(msg);
    if (msg.isUnread) markAsRead(msg.id);
  }, [onSelect, markAsRead]);

  if (loading) return <EmailSkeleton count={10} />;

  if (error) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '4rem', gap: '1rem', color: 'var(--text-secondary)',
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'rgba(234,67,53,.1)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
        }}>⚠️</div>
        <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Failed to load emails</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
          {error}
        </div>
        <button
          onClick={refresh}
          style={{
            padding: '0.5rem 1.25rem', border: 'none', borderRadius: '20px',
            background: 'var(--blue-500)', color: '#fff',
            cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font-sans)',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '4rem', gap: '1rem', color: 'var(--text-secondary)',
      }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'var(--surface-2)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Inbox size={36} color="var(--text-tertiary)" />
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {searchQuery ? 'No results found' : 'No emails here'}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', textAlign: 'center', maxWidth: '280px' }}>
          {searchQuery
            ? `No messages match "${searchQuery}"`
            : "When you receive emails, they\u2019ll appear here."
          }
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ flex: 1, overflowY: 'auto' }}>
      {messages.map((msg) => (
        <EmailListItem
          key={msg.id}
          message={msg}
          isSelected={selectedId === msg.id}
          onClick={() => handleSelect(msg)}
          onStarToggle={toggleStar}
        />
      ))}

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={loadMoreRef} style={{ padding: '1rem', textAlign: 'center' }}>
          {loadingMore ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
              <EmailSkeleton count={3} />
            </div>
          ) : (
            <button
              onClick={loadMore}
              style={{
                padding: '0.5rem 1.5rem', border: '1px solid var(--border-medium)',
                borderRadius: '20px', background: 'transparent',
                color: 'var(--text-secondary)', cursor: 'pointer',
                fontSize: '0.85rem', fontFamily: 'var(--font-sans)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
