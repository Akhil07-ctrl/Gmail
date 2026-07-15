import { useAuth } from '../../context/AuthContext';
import { Mail, Shield, Zap } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
        fontFamily: 'var(--font-sans)',
        padding: '1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background orbs */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,115,232,.25) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', left: '-10%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(52,168,83,.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <div
        className="fade-in"
        style={{
          background: 'rgba(255,255,255,.05)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,.12)',
          borderRadius: '24px',
          padding: '3rem 2.5rem',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 32px 64px rgba(0,0,0,.4)',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.75rem', marginBottom: '2rem',
        }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #4285f4, #1a73e8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(26,115,232,.4)',
          }}>
            <Mail size={26} color="#fff" strokeWidth={2} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
              Gmail Clone
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,.5)', marginTop: '1px' }}>
              Powered by Gmail API
            </div>
          </div>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
          Welcome back
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,.6)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          Sign in with your Google account to access your Gmail inbox — securely and instantly.
        </p>

        {/* Sign-in button */}
        <button
          id="google-signin-btn"
          onClick={login}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '0.875rem 1.5rem',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,.2)',
            background: 'rgba(255,255,255,.95)',
            color: '#3c4043',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 200ms ease',
            boxShadow: '0 4px 12px rgba(0,0,0,.3)',
            fontFamily: 'var(--font-sans)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,.35)';
            e.currentTarget.style.background = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.3)';
            e.currentTarget.style.background = 'rgba(255,255,255,.95)';
          }}
        >
          {/* Google G logo */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Trust indicators */}
        <div style={{
          display: 'flex', gap: '1.5rem', justifyContent: 'center',
          marginTop: '2rem', padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,.08)',
        }}>
          {[
            { icon: Shield, label: 'OAuth 2.0 Secure' },
            { icon: Zap, label: 'Real-time Sync' },
            { icon: Mail, label: 'Gmail API' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
            }}>
              <Icon size={16} color="rgba(255,255,255,.5)" />
              <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,.4)', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
