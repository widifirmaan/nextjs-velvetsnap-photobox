'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useModel } from '@/lib/ModelContext';
import styles from './AssetSearch.module.css';

interface AssetSearchProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function AssetSearch({ onSelect, onClose }: AssetSearchProps) {
  const model = useModel();
  const [search, setSearch] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [imageResults, setImageResults] = useState<{ url: string; thumbnail: string; title: string }[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [imageError, setImageError] = useState('');
  const [activeUrl, setActiveUrl] = useState<{ url: string; mode: 'choice' | 'processing' } | null>(null);
  const [page, setPage] = useState(1);
  const [totalHits, setTotalHits] = useState(0);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);

  const log = useCallback(async (level: string, message: string, data?: any) => {
    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, message, data }),
      });
    } catch {}
  }, []);

  const handleRemoveBg = async (imageUrl: string) => {
    if (model.status !== 'ready') {
      setImageError('AI model is not ready yet. Please wait...');
      setActiveUrl(null);
      return;
    }
    const id = ++requestId.current;
    setActiveUrl({ url: imageUrl, mode: 'processing' });
    log('info', 'removeBackground started', { imageUrl, modelStatus: model.status });
    const startedAt = Date.now();
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      log('info', 'library imported', { elapsed: Date.now() - startedAt });
      const blob = await removeBackground(imageUrl, {
        model: 'isnet_quint8',
        output: { format: 'image/png' },
      });
      if (id !== requestId.current) { log('warn', 'removeBackground cancelled after resolve'); return; }
      log('info', 'removeBackground completed', { elapsed: Date.now() - startedAt, blobSize: blob.size });
      const url = URL.createObjectURL(blob);
      onSelect(url);
      onClose();
    } catch (err: any) {
      if (id !== requestId.current) { log('warn', 'removeBackground cancelled after error'); return; }
      const msg = err?.message || 'Remove background failed';
      log('error', 'removeBackground failed', { message: msg, elapsed: Date.now() - startedAt });
      setImageError(msg);
      setActiveUrl(null);
      const isCorrupt = /download|corrupt|onnx|wasm|network|fetch|abort/i.test(msg);
      if (isCorrupt && model.status === 'ready') {
        model.retry();
      }
    }
  };

  const handleImageClick = (imageUrl: string) => {
    if (activeUrl?.url === imageUrl) {
      if (activeUrl.mode === 'processing') {
        requestId.current++;
        log('warn', 'removeBackground cancelled by user');
      }
      setActiveUrl(null);
    } else {
      setActiveUrl({ url: imageUrl, mode: 'choice' });
    }
  };

  const handleFull = (imageUrl: string) => {
    onSelect(imageUrl);
    onClose();
  };

  const handleDismiss = () => {
    if (activeUrl?.mode === 'processing') {
      requestId.current++;
      log('warn', 'removeBackground cancelled by user');
    }
    setActiveUrl(null);
  };

  const searchImages = useCallback(async (q: string, p: number, append: boolean) => {
    if (!q.trim()) return;
    if (append) {
      setLoadingMore(true);
    } else {
      setImageLoading(true);
    }
    setImageError('');
    try {
      const res = await fetch('/api/image/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, page: p }),
      });
      const data = await res.json();
      if (data.success) {
        setImageResults(prev => append ? [...prev, ...(data.data || [])] : (data.data || []));
        setTotalHits(data.totalHits || 0);
        setPage(p);
      } else {
        setImageError(data.error || 'Search failed');
      }
    } catch {
      setImageError('Search failed. Check your network.');
    } finally {
      setImageLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const handleSearch = () => {
    if (!search.trim()) return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    setActiveQuery(search);
    setImageResults([]);
    setPage(1);
    searchImages(search, 1, false);
  };

  const handleLoadMore = () => {
    if (!activeQuery) return;
    searchImages(activeQuery, page + 1, true);
  };

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (search.trim() && search !== activeQuery) {
      searchTimeout.current = setTimeout(() => {
        setActiveQuery(search);
        setImageResults([]);
        setPage(1);
        searchImages(search, 1, false);
      }, 500);
    }
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [search, searchImages]);

  const hasMore = totalHits > imageResults.length;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 style={{ margin: 0 }}>Image Search</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {model.status === 'downloading' && (
          <div className={styles.processingBanner} style={{ background: '#fff3cd', color: '#856404', flexDirection: 'column', gap: 6 }}>
            <span>Downloading AI model... {model.progress}%</span>
            <div style={{
              width: '100%', height: 8, background: '#ffe69c', borderRadius: 4, overflow: 'hidden',
            }}>
              <div style={{
                width: `${model.progress}%`, height: '100%', background: '#856404',
                borderRadius: 4, transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        )}
        {model.status === 'error' && (
          <div className={styles.processingBanner} style={{ background: '#f8d7da', color: '#721c24', flexDirection: 'column', gap: 8 }}>
            <span>⚠ AI model failed to load</span>
            {model.errorMessage && (
              <span style={{ fontSize: 11, opacity: 0.8 }}>{model.errorMessage}</span>
            )}
            <button
              onClick={model.retry}
              style={{
                padding: '6px 16px', borderRadius: 6, border: '1px solid #721c24',
                background: '#fff', color: '#721c24', fontWeight: 600, fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Retry Download
            </button>
          </div>
        )}
        {model.status === 'checking' && (
          <div className={styles.processingBanner} style={{ background: '#e2e3f5', color: '#383d41' }}>
            <div className={styles.spinner} />
            <span>Preparing AI model...</span>
          </div>
        )}
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Search images..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
              style={{ marginBottom: 0, flex: 1 }}
              autoFocus
            />
            <button
              className={styles.searchBtn}
              onClick={handleSearch}
              disabled={imageLoading || !search.trim()}
            >
              {imageLoading ? '...' : 'Search'}
            </button>
          </div>

          {imageError && (
            <p style={{ fontSize: 13, color: '#e74c3c', textAlign: 'center', padding: 12 }}>
              {imageError}
            </p>
          )}

          {imageLoading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
              <div className={styles.spinner} />
            </div>
          )}

          {imageResults.length > 0 && !imageLoading && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
              Select an image to remove background and add to canvas
            </p>
          )}

          {imageResults.length > 0 && (
            <div className={styles.imageGrid}>
              {imageResults.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.stickerItem} ${activeUrl?.url === img.url ? styles.active : ''}`}
                  onClick={() => handleImageClick(img.url)}
                  disabled={!!activeUrl && activeUrl.url !== img.url}
                  title={img.title}
                >
                  <img src={img.thumbnail} alt={img.title} loading="lazy" />
                  {activeUrl?.url === img.url && activeUrl.mode === 'choice' && (
                    <div className={styles.choiceOverlay}>
                      <button className={styles.choiceBtn} onClick={(e) => { e.stopPropagation(); handleFull(img.url); }}>
                        Full
                      </button>
                      <button className={styles.choiceBtn} onClick={(e) => { e.stopPropagation(); handleRemoveBg(img.url); }}>
                        Transparent
                      </button>
                    </div>
                  )}
                  {activeUrl?.url === img.url && activeUrl.mode === 'processing' && (
                    <div className={styles.processingOverlay}>
                      <div className={styles.spinner} />
                      <span>Removing Background...</span>
                      <button className={styles.cancelBtn} onClick={(e) => { e.stopPropagation(); handleDismiss(); }}>Cancel</button>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {hasMore && !imageLoading && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                className={styles.searchBtn}
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : `Load more (${imageResults.length}/${totalHits})`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
