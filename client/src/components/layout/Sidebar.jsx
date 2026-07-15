import { useState, useEffect } from 'react';
import {
  Inbox, Star, Send, FileText, Trash2, Tag,
  ChevronDown, ChevronRight, Plus, Mail,
} from 'lucide-react';
import { getLabels } from '../../services/api';

const NAV_ITEMS = [
  { id: 'INBOX',   label: 'Inbox',   icon: Inbox,    gmailLabel: 'INBOX' },
  { id: 'STARRED', label: 'Starred', icon: Star,     gmailLabel: 'STARRED' },
  { id: 'SENT',    label: 'Sent',    icon: Send,     gmailLabel: 'SENT' },
  { id: 'DRAFT',   label: 'Drafts',  icon: FileText, gmailLabel: 'DRAFT' },
  { id: 'TRASH',   label: 'Trash',   icon: Trash2,   gmailLabel: 'TRASH' },
];

// Color palette for user-defined labels
const LABEL_COLORS = [
  '#1a73e8', '#34a853', '#ea4335', '#fbbc04',
  '#9c27b0', '#00bcd4', '#ff5722', '#795548',
];

function labelColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return LABEL_COLORS[Math.abs(hash) % LABEL_COLORS.length];
}

export default function Sidebar({ activeLabel, onLabelChange, unreadCount, collapsed, onCompose }) {
  const [userLabels, setUserLabels] = useState([]);
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    getLabels()
      .then(({ labels }) => {
        const filtered = (labels || []).filter(
          (l) => l.type === 'user' && !l.name.startsWith('CATEGORY_')
        );
        setUserLabels(filtered.slice(0, 12));
      })
      .catch(() => {});
  }, []);

  return (
    <aside
      style={{
        width: collapsed ? '72px' : 'var(--sidebar-width)',
        minWidth: collapsed ? '72px' : 'var(--sidebar-width)',
        background: 'var(--sidebar-bg)',
        display: 'flex',
        flexDirection: 'column',
        padding: collapsed ? '1rem 0' : '1rem 0',
        transition: 'width var(--transition-normal)',
        overflow: 'hidden',
        borderRight: '1px solid var(--border-light)',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: collapsed ? '0 1rem 1.25rem' : '0 1.25rem 1.25rem',
        marginBottom: '0.25rem',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
          background: 'linear-gradient(135deg, #4285f4, #1a73e8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(26,115,232,.35)',
        }}>
          <Mail size={18} color="#fff" />
        </div>
        {!collapsed && (
          <span style={{
            fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)',
            letterSpacing: '-0.3px', whiteSpace: 'nowrap',
          }}>
            Gmail Clone
          </span>
        )}
      </div>

      {/* Compose button */}
      <div style={{ padding: collapsed ? '0 0.75rem' : '0 1rem', marginBottom: '0.5rem' }}>
        <button
          id="compose-btn"
          onClick={onCompose}
          title="Compose"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '0.75rem',
            padding: collapsed ? '0.75rem' : '0.75rem 1.25rem',
            borderRadius: '20px',
            border: 'none',
            background: 'var(--surface-0)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)',
            transition: 'all var(--transition-fast)',
            fontFamily: 'var(--font-sans)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
        >
          <Plus size={20} />
          {!collapsed && 'Compose'}
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_ITEMS.map(({ id, label, icon: Icon, gmailLabel }) => {
          const isActive = activeLabel === gmailLabel;
          return (
            <button
              key={id}
              id={`nav-${id.toLowerCase()}`}
              onClick={() => onLabelChange(gmailLabel)}
              title={label}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: collapsed ? '0.625rem 1.25rem' : '0.625rem 1.25rem 0.625rem 1.5rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                border: 'none',
                borderRadius: '0 20px 20px 0',
                marginRight: '1rem',
                width: collapsed ? '100%' : 'calc(100% - 1rem)',
                background: isActive ? 'var(--selected-bg)' : 'transparent',
                color: isActive ? 'var(--blue-600)' : 'var(--text-secondary)',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                fontFamily: 'var(--font-sans)',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'var(--hover-bg)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {!collapsed && (
                <>
                  <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
                  {gmailLabel === 'INBOX' && unreadCount > 0 && (
                    <span style={{
                      background: 'var(--blue-500)', color: '#fff',
                      borderRadius: '10px', padding: '1px 7px',
                      fontSize: '0.72rem', fontWeight: 700,
                      minWidth: '22px', textAlign: 'center',
                    }}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </>
              )}
              {/* Collapsed unread dot */}
              {collapsed && gmailLabel === 'INBOX' && unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '8px', right: '8px',
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: 'var(--blue-500)',
                }} />
              )}
            </button>
          );
        })}

        {/* User-defined labels */}
        {!collapsed && userLabels.length > 0 && (
          <div style={{ margin: '0.5rem 0' }}>
            <button
              onClick={() => setShowLabels((s) => !s)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: '0.5rem', padding: '0.5rem 1.5rem', border: 'none',
                background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)',
                fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.08em', fontFamily: 'var(--font-sans)',
                transition: 'color var(--transition-fast)',
              }}
            >
              {showLabels ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              Labels
            </button>

            {showLabels && userLabels.map((label) => (
              <button
                key={label.id}
                onClick={() => onLabelChange(label.id)}
                style={{
                  width: 'calc(100% - 1rem)', display: 'flex', alignItems: 'center',
                  gap: '0.75rem', padding: '0.5rem 1.25rem 0.5rem 1.5rem',
                  border: 'none', borderRadius: '0 20px 20px 0',
                  background: activeLabel === label.id ? 'var(--selected-bg)' : 'transparent',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                  fontSize: '0.825rem', fontFamily: 'var(--font-sans)',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (activeLabel !== label.id) e.currentTarget.style.background = 'var(--hover-bg)';
                }}
                onMouseLeave={(e) => {
                  if (activeLabel !== label.id) e.currentTarget.style.background = 'transparent';
                }}
              >
                <Tag size={14} style={{ color: labelColor(label.name), flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {label.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
}
