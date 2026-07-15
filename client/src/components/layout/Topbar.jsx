import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search, RefreshCw, Sun, Moon, Menu, LogOut,
  ChevronDown, Settings, User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function Avatar({ user, size = 32 }) {
  const [imgError, setImgError] = useState(false);
  const initials = (user?.name || user?.email || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (user?.picture && !imgError) {
    return (
      <img
        src={user.picture}
        alt={user.name}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover', cursor: 'pointer',
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #4285f4, #1a73e8)',
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export default function Topbar({
  onToggleSidebar, onSearch, onRefresh, refreshing,
  theme, onToggleTheme, searchValue,
}) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleRefresh = useCallback(() => {
    onRefresh();
  }, [onRefresh]);

  return (
    <header style={{
      height: '64px', display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0 1rem', background: 'var(--surface-0)',
      borderBottom: '1px solid var(--border-light)',
      position: 'sticky', top: 0, zIndex: 100,
      flexShrink: 0,
    }}>
      {/* Hamburger */}
      <button
        id="sidebar-toggle"
        onClick={onToggleSidebar}
        title="Toggle sidebar"
        style={iconBtnStyle}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <Menu size={20} color="var(--text-secondary)" />
      </button>

      {/* Search bar */}
      <div style={{
        flex: 1, maxWidth: '720px', position: 'relative',
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          position: 'absolute', left: '1rem', color: 'var(--text-tertiary)',
          pointerEvents: 'none', display: 'flex',
        }}>
          <Search size={18} />
        </div>
        <input
          id="email-search"
          type="text"
          placeholder="Search mail"
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            width: '100%',
            padding: '0.625rem 1rem 0.625rem 2.75rem',
            borderRadius: '24px',
            border: 'none',
            background: searchFocused ? 'var(--surface-0)' : 'var(--surface-1)',
            boxShadow: searchFocused ? 'var(--shadow-md)' : 'none',
            outline: 'none',
            fontSize: '0.9rem',
            color: 'var(--text-primary)',
            transition: 'all var(--transition-fast)',
            fontFamily: 'var(--font-sans)',
          }}
        />
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}>
        {/* Refresh */}
        <button
          id="refresh-btn"
          onClick={handleRefresh}
          title="Refresh"
          style={iconBtnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <RefreshCw
            size={18}
            color="var(--text-secondary)"
            style={{
              animation: refreshing ? 'spin 600ms linear infinite' : 'none',
              transition: 'transform 200ms',
            }}
          />
        </button>

        {/* Theme toggle */}
        <button
          id="theme-toggle"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={iconBtnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {theme === 'dark'
            ? <Sun size={18} color="var(--text-secondary)" />
            : <Moon size={18} color="var(--text-secondary)" />
          }
        </button>

        {/* Profile */}
        <div ref={dropdownRef} style={{ position: 'relative', marginLeft: '0.25rem' }}>
          <button
            id="profile-btn"
            onClick={() => setProfileOpen((o) => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.25rem', border: 'none', background: 'transparent',
              cursor: 'pointer', borderRadius: '50px',
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Avatar user={user} size={34} />
            <ChevronDown
              size={14}
              color="var(--text-secondary)"
              style={{ transition: 'transform 150ms', transform: profileOpen ? 'rotate(180deg)' : 'none' }}
            />
          </button>

          {profileOpen && (
            <div
              className="fade-in"
              style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                background: 'var(--surface-0)',
                border: '1px solid var(--border-light)',
                borderRadius: '12px', boxShadow: 'var(--shadow-lg)',
                minWidth: '240px', overflow: 'hidden', zIndex: 200,
              }}
            >
              {/* User info */}
              <div style={{
                padding: '1.25rem', borderBottom: '1px solid var(--border-light)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
              }}>
                <Avatar user={user} size={56} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {user?.email}
                  </div>
                </div>
              </div>

              {/* Menu items */}
              {[
                { icon: User, label: 'Manage Google Account', id: 'manage-account' },
                { icon: Settings, label: 'Settings', id: 'settings-menu' },
              ].map(({ icon: Icon, label, id }) => (
                <button
                  key={id}
                  id={id}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1.25rem', border: 'none', background: 'transparent',
                    cursor: 'pointer', color: 'var(--text-secondary)',
                    fontSize: '0.85rem', fontFamily: 'var(--font-sans)',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}

              <div style={{ borderTop: '1px solid var(--border-light)' }}>
                <button
                  id="logout-btn"
                  onClick={logout}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1.25rem', border: 'none', background: 'transparent',
                    cursor: 'pointer', color: '#ea4335',
                    fontSize: '0.85rem', fontFamily: 'var(--font-sans)',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(234,67,53,.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const iconBtnStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '40px', height: '40px', borderRadius: '50%',
  border: 'none', background: 'transparent', cursor: 'pointer',
  transition: 'background var(--transition-fast)',
};
