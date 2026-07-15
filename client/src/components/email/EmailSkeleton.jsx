export default function EmailSkeleton({ count = 8 }) {
  return (
    <div style={{ padding: '0' }}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.875rem 1.25rem',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          {/* Avatar */}
          <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }} />

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Sender */}
              <div className="skeleton" style={{ width: `${100 + (i % 4) * 30}px`, height: '13px' }} />
              {/* Time */}
              <div className="skeleton" style={{ width: '50px', height: '11px' }} />
            </div>
            {/* Subject */}
            <div className="skeleton" style={{ width: `${200 + (i % 3) * 60}px`, height: '12px' }} />
            {/* Snippet */}
            <div className="skeleton" style={{ width: `${60 + (i % 5) * 30}%`, height: '11px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
