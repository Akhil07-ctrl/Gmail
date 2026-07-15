import { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Star, Archive, Trash2, MoreVertical, Reply, Forward, Printer } from 'lucide-react';
import { useEmail } from '../../hooks/useEmails';

function HeaderField({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.83rem', marginBottom: '0.2rem' }}>
      <span style={{ color: 'var(--text-tertiary)', minWidth: '36px', flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--text-secondary)', wordBreak: 'break-word' }}>{value}</span>
    </div>
  );
}

function formatFullDate(internalDate, dateStr) {
  try {
    const d = internalDate ? new Date(parseInt(internalDate)) : new Date(dateStr);
    return d.toLocaleString([], {
      weekday: 'short', year: 'numeric', month: 'short',
      day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return dateStr || ''; }
}

export default function EmailViewer({ messageId, onBack }) {
  const { email, loading, error } = useEmail(messageId);
  const iframeRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState(400);

  // Resize iframe to fit content
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const onLoad = () => {
      try {
        const h = iframe.contentDocument?.body?.scrollHeight;
        if (h) setIframeHeight(h + 32);
      } catch {}
    };
    iframe.addEventListener('load', onLoad);
    return () => iframe.removeEventListener('load', onLoad);
  }, [email]);

  if (!messageId) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-tertiary)', gap: '1rem', padding: '2rem',
        background: 'var(--surface-1)',
      }}>
        <div style={{
          width: '96px', height: '96px', borderRadius: '50%',
          background: 'var(--surface-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem',
        }}>
          ✉️
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Select an email to read
        </div>
        <div style={{ fontSize: '0.83rem', color: 'var(--text-tertiary)' }}>
          Nothing is selected
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ flex: 1, padding: '2rem', background: 'var(--surface-0)' }}>
        {/* Subject skeleton */}
        <div className="skeleton" style={{ width: '60%', height: '24px', marginBottom: '1.5rem' }} />
        {/* Header fields */}
        {[0,1,2,3].map((i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div className="skeleton" style={{ width: '36px', height: '12px' }} />
            <div className="skeleton" style={{ width: `${120 + i * 40}px`, height: '12px' }} />
          </div>
        ))}
        {/* Body */}
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[100, 90, 75, 85, 60, 80, 40].map((w, i) => (
            <div key={i} className="skeleton" style={{ width: `${w}%`, height: '14px' }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
        color: 'var(--text-secondary)', padding: '2rem',
      }}>
        <div style={{ fontSize: '2rem' }}>⚠️</div>
        <div style={{ fontWeight: 600 }}>Failed to load email</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{error}</div>
      </div>
    );
  }

  const hasHtml = email?.body?.html?.trim();
  const hasText = email?.body?.text?.trim();

  // Sanitize HTML in srcdoc for iframe
  const htmlContent = hasHtml
    ? `<!DOCTYPE html><html><head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width"/>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                 font-size: 14px; line-height: 1.6; color: #202124; padding: 8px; margin: 0; }
          a { color: #1a73e8; }
          img { max-width: 100%; height: auto; }
          pre, code { background: #f1f3f4; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
        </style>
      </head><body>${email.body.html}</body></html>`
    : null;

  return (
    <div
      className="slide-in-right"
      style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: 'var(--surface-0)', overflowY: 'auto',
      }}
    >
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.25rem',
        padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-light)',
        position: 'sticky', top: 0, background: 'var(--surface-0)', zIndex: 10,
      }}>
        <button
          id="email-back-btn"
          onClick={onBack}
          title="Back to inbox"
          style={actionBtnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <ArrowLeft size={18} color="var(--text-secondary)" />
        </button>

        {[
          { icon: Archive, id: 'archive-btn', title: 'Archive' },
          { icon: Trash2, id: 'delete-btn', title: 'Delete' },
          { icon: Printer, id: 'print-btn', title: 'Print' },
          { icon: MoreVertical, id: 'more-btn', title: 'More' },
        ].map(({ icon: Icon, id, title }) => (
          <button
            key={id}
            id={id}
            title={title}
            style={actionBtnStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Icon size={18} color="var(--text-secondary)" />
          </button>
        ))}
      </div>

      {/* Email content */}
      <div style={{ padding: '1.5rem 2rem', flex: 1 }}>
        {/* Subject */}
        <h1 style={{
          fontSize: '1.375rem', fontWeight: 600, color: 'var(--text-primary)',
          marginBottom: '1.25rem', lineHeight: 1.3, letterSpacing: '-0.2px',
        }}>
          {email?.subject || '(no subject)'}
        </h1>

        {/* Header fields */}
        <div style={{
          padding: '1rem', borderRadius: '8px',
          background: 'var(--surface-1)', marginBottom: '1.5rem',
          border: '1px solid var(--border-light)',
        }}>
          <HeaderField label="From" value={email?.from} />
          <HeaderField label="To" value={email?.to} />
          <HeaderField label="Date" value={formatFullDate(email?.internalDate, email?.date)} />
          {email?.labelIds?.filter(l => !['INBOX','UNREAD','IMPORTANT'].includes(l)).length > 0 && (
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {email.labelIds
                .filter(l => !['INBOX','UNREAD','IMPORTANT','CATEGORY_PERSONAL'].includes(l))
                .map(l => (
                  <span key={l} style={{
                    padding: '2px 8px', borderRadius: '12px',
                    background: 'var(--blue-50)', color: 'var(--blue-600)',
                    fontSize: '0.7rem', fontWeight: 600,
                  }}>{l}</span>
                ))
              }
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{
          borderRadius: '8px', overflow: 'hidden',
          border: '1px solid var(--border-light)',
        }}>
          {hasHtml ? (
            <iframe
              ref={iframeRef}
              srcDoc={htmlContent}
              title="Email body"
              sandbox="allow-same-origin allow-popups"
              style={{
                width: '100%', height: `${iframeHeight}px`,
                border: 'none', display: 'block',
              }}
            />
          ) : hasText ? (
            <pre style={{
              padding: '1.5rem', margin: 0, whiteSpace: 'pre-wrap',
              wordBreak: 'break-word', fontFamily: 'var(--font-sans)',
              fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-primary)',
              background: 'var(--surface-0)',
            }}>
              {email.body.text}
            </pre>
          ) : (
            <div style={{
              padding: '2rem', textAlign: 'center',
              color: 'var(--text-tertiary)', fontSize: '0.85rem',
            }}>
              (No body content)
            </div>
          )}
        </div>

        {/* Reply / Forward row */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', paddingBottom: '2rem' }}>
          {[
            { icon: Reply, label: 'Reply', id: 'reply-btn' },
            { icon: Forward, label: 'Forward', id: 'forward-btn' },
          ].map(({ icon: Icon, label, id }) => (
            <button
              key={id}
              id={id}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1.25rem', border: '1px solid var(--border-medium)',
                borderRadius: '20px', background: 'transparent',
                color: 'var(--text-secondary)', cursor: 'pointer',
                fontSize: '0.85rem', fontFamily: 'var(--font-sans)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const actionBtnStyle = {
  width: '36px', height: '36px', borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: 'none', background: 'transparent', cursor: 'pointer',
  transition: 'background var(--transition-fast)',
};
