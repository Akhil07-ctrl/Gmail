import { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTheme } from './hooks/useTheme';
import LoginPage from './components/auth/LoginPage';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import EmailList from './components/email/EmailList';
import EmailViewer from './components/email/EmailViewer';

function InboxApp() {
  const { user, loading } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();

  const [activeLabel, setActiveLabel] = useState('INBOX');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setSelectedMessage(null);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleLabelChange = useCallback((label) => {
    setActiveLabel(label);
    setSelectedMessage(null);
    setSearchQuery('');
  }, []);

  const handleSearch = useCallback((q) => {
    setSearchQuery(q);
    if (q) setSelectedMessage(null);
  }, []);

  const handleCompose = useCallback(() => {
    // TODO: open compose modal
    alert('Compose feature coming soon!');
  }, []);

  // Auth loading state
  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--surface-0)',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #4285f4, #1a73e8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'spin 1.5s linear infinite',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 4l16 8-16 8V4z" fill="white" />
            </svg>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Loading…</div>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  // Calculate unread count from current messages (approximation via label filter)
  // Actual count is fetched in the email list; we use the label display here
  const unreadCount = 0; // TODO: wire up from useEmails

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-0)',
      color: 'var(--text-primary)',
      overflow: 'hidden',
    }}>
      {/* Top bar */}
      <Topbar
        onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        theme={theme}
        onToggleTheme={toggleTheme}
        searchValue={searchQuery}
      />

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <Sidebar
          activeLabel={activeLabel}
          onLabelChange={handleLabelChange}
          unreadCount={unreadCount}
          collapsed={sidebarCollapsed}
          onCompose={handleCompose}
        />

        {/* Main content */}
        <main style={{
          flex: 1, display: 'flex', overflow: 'hidden',
          background: 'var(--surface-0)',
        }}>
          {/* Email list — always visible unless mobile and viewer open */}
          <div style={{
            width: selectedMessage ? '380px' : '100%',
            minWidth: selectedMessage ? '320px' : 'auto',
            display: 'flex', flexDirection: 'column',
            borderRight: selectedMessage ? '1px solid var(--border-light)' : 'none',
            overflow: 'hidden',
            flexShrink: 0,
            transition: 'width var(--transition-normal)',
          }}>
            {/* Label header */}
            <div style={{
              padding: '0.875rem 1.25rem',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h2 style={{
                fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0,
              }}>
                {searchQuery
                  ? `Search: "${searchQuery}"`
                  : labelDisplayName(activeLabel)
                }
              </h2>
            </div>

            <EmailList
              key={`${activeLabel}-${refreshKey}`}
              label={activeLabel}
              searchQuery={searchQuery}
              selectedId={selectedMessage?.id}
              onSelect={setSelectedMessage}
            />
          </div>

          {/* Email viewer */}
          {selectedMessage && (
            <EmailViewer
              messageId={selectedMessage.id}
              onBack={() => setSelectedMessage(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function labelDisplayName(label) {
  const map = {
    INBOX: 'Inbox', STARRED: 'Starred', SENT: 'Sent',
    DRAFT: 'Drafts', TRASH: 'Trash', SPAM: 'Spam',
  };
  return map[label] || label;
}

export default function App() {
  return (
    <AuthProvider>
      <InboxApp />
    </AuthProvider>
  );
}
