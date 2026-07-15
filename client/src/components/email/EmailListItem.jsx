import { useState, useCallback } from 'react';
import { Star, StarOff } from 'lucide-react';
import { toggleStar as apiToggleStar } from '../../services/api';

// ── Avatar with colorized initials ──────────────────────────────────────────
const AVATAR_COLORS = [
  '#1a73e8', '#34a853', '#ea4335', '#fbbc04',
  '#9c27b0', '#00bcd4', '#ff5722', '#607d8b',
  '#e91e63', '#795548',
];

function getInitials(from) {
  // Extract name from "Name <email>" format
  const name = from.replace(/<[^>]+>/, '').trim() || from;
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

function avatarColor(from) {
  let hash = 0;
  for (let i = 0; i < from.length; i++) hash = from.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatSender(from) {
  // Extract just the name part from "Name <email@domain.com>"
  const match = from.match(/^(.+?)\s*</);
  if (match) return match[1].trim().replace(/"/g, '');
  // Otherwise use the part before @
  return from.split('@')[0] || from;
}

function formatDate(internalDate, dateStr) {
  try {
    const date = internalDate ? new Date(parseInt(internalDate)) : new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' });
    }
  } catch {
    return '';
  }
}

export default function EmailListItem({
  message, isSelected, onClick, onStarToggle,
}) {
  const [starred, setStarred] = useState(message.isStarred);
  const [starLoading, setStarLoading] = useState(false);

  const handleStar = useCallback(async (e) => {
    e.stopPropagation();
    if (starLoading) return;
    const next = !starred;
    setStarred(next);
    setStarLoading(true);
    try {
      await apiToggleStar(message.id, next);
      onStarToggle?.(message.id, next);
    } catch {
      setStarred(!next); // revert
    } finally {
      setStarLoading(false);
    }
  }, [starred, starLoading, message.id, onStarToggle]);

  const isUnread = message.isUnread;

  return (
    <div
      id={`email-item-${message.id}`}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.6rem 1.25rem 0.6rem 0.875rem',
        cursor: 'pointer',
        background: isSelected
          ? 'var(--selected-bg)'
          : isUnread
          ? 'var(--surface-0)'
          : 'var(--surface-1)',
        borderBottom: '1px solid var(--border-light)',
        transition: 'background var(--transition-fast)',
        borderLeft: isSelected ? '3px solid var(--blue-500)' : '3px solid transparent',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.background = 'var(--hover-bg)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = isUnread ? 'var(--surface-0)' : 'var(--surface-1)';
        }
      }}
    >
      {/* Unread dot */}
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
        background: isUnread ? 'var(--unread-dot)' : 'transparent',
        transition: 'background var(--transition-fast)',
      }} />

      {/* Avatar */}
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
        background: avatarColor(message.from),
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.85rem', fontWeight: 700,
        userSelect: 'none',
      }}>
        {getInitials(message.from)}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.2rem',
        }}>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: isUnread ? 700 : 500,
            color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            flex: 1,
          }}>
            {formatSender(message.from)}
          </span>
          <span style={{
            fontSize: '0.73rem',
            color: isUnread ? 'var(--blue-500)' : 'var(--text-tertiary)',
            fontWeight: isUnread ? 600 : 400,
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {formatDate(message.internalDate, message.date)}
          </span>
        </div>

        <div style={{
          fontSize: '0.825rem',
          fontWeight: isUnread ? 600 : 400,
          color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginBottom: '0.15rem',
        }}>
          {message.subject}
        </div>

        <div style={{
          fontSize: '0.775rem',
          color: 'var(--text-secondary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {message.snippet}
        </div>
      </div>

      {/* Star */}
      <button
        id={`star-${message.id}`}
        onClick={handleStar}
        title={starred ? 'Remove star' : 'Add star'}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '0.25rem', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, opacity: starLoading ? 0.5 : 1,
          transition: 'opacity var(--transition-fast)',
        }}
      >
        {starred
          ? <Star size={16} fill="var(--star-active)" color="var(--star-active)" />
          : <Star size={16} color="var(--text-tertiary)" />
        }
      </button>
    </div>
  );
}
