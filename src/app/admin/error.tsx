'use client';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, textAlign: 'center' }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Admin Error</h1>
      <p style={{ color: '#888', marginBottom: 24, maxWidth: 400 }}>{error.message || 'An unexpected error occurred'}</p>
      <button onClick={reset} style={{ padding: '12px 24px', background: '#262626', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
        Try again
      </button>
    </div>
  );
}
