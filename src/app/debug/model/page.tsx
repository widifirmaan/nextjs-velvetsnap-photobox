'use client';

import { useModel } from '@/lib/ModelContext';

const btn = {
  padding: '8px 20px',
  borderRadius: 6,
  border: '1px solid #ccc',
  background: '#fff',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
} as const;

export default function DebugModelPage() {
  const model = useModel();

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'monospace', padding: 20 }}>
      <h1 style={{ marginBottom: 24 }}>🧪 Model Debug</h1>

      <section style={{ marginBottom: 24 }}>
        <h3>Status</h3>
        <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
{JSON.stringify({ status: model.status, progress: model.progress, error: model.errorMessage }, null, 2)}
        </pre>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3>localStorage</h3>
        <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
{JSON.stringify({
  imgly_model_ready: typeof window !== 'undefined' ? localStorage.getItem('imgly_model_ready') : null,
  imgly_model_retry: typeof window !== 'undefined' ? localStorage.getItem('imgly_model_retry') : null,
}, null, 2)}
        </pre>
      </section>

      <section style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          style={btn}
          onClick={() => {
            model.retry();
          }}
        >
          🔄 Retry Download
        </button>
        <button
          style={btn}
          onClick={async () => {
            if (typeof indexedDB.databases === 'function') {
              const dbs = await indexedDB.databases();
              for (const db of dbs) {
                if (db.name?.includes('imgly') || db.name?.includes('onnx')) {
                  indexedDB.deleteDatabase(db.name);
                }
              }
            }
            if ('caches' in window) {
              const keys = await caches.keys();
              for (const key of keys) {
                if (key.includes('imgly') || key.includes('onnx')) {
                  await caches.delete(key);
                }
              }
            }
            localStorage.removeItem('imgly_model_ready');
            localStorage.removeItem('imgly_model_retry');
            window.location.reload();
          }}
        >
          🗑️ Clear Cache & Reload
        </button>
        <button
          style={btn}
          onClick={() => {
            localStorage.setItem('imgly_model_ready', 'true');
            window.location.reload();
          }}
        >
          ✅ Force Ready
        </button>
        <button
          style={btn}
          onClick={() => {
            model.preload();
          }}
        >
          ⬇️ Manual Preload
        </button>
      </section>
    </div>
  );
}
