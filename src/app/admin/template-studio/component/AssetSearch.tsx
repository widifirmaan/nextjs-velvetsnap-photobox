'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './AssetSearch.module.css';

interface AssetSearchProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function AssetSearch({ onSelect, onClose }: AssetSearchProps) {
  const [search, setSearch] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [imageResults, setImageResults] = useState<{ url: string; thumbnail: string; title: string }[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [imageError, setImageError] = useState('');
  const [processingUrl, setProcessingUrl] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalHits, setTotalHits] = useState(0);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleImageSelect = async (imageUrl: string) => {
    setProcessingUrl(imageUrl);
    try {
      const res = await fetch('/api/image/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await res.json();
      if (data.success) {
        onSelect(data.data.url);
        onClose();
      } else {
        setImageError(data.error || 'Remove background failed');
        setProcessingUrl(null);
      }
    } catch {
      setImageError('Remove background failed');
      setProcessingUrl(null);
    }
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

        {processingUrl && (
          <div className={styles.processingBanner}>
            <div className={styles.spinner} />
            <span>Removing Background with wAI, Please Wait...</span>
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
                  className={`${styles.stickerItem} ${processingUrl === img.url ? styles.processing : ''}`}
                  onClick={() => handleImageSelect(img.url)}
                  disabled={!!processingUrl}
                  title={img.title}
                >
                  <img src={img.thumbnail} alt={img.title} loading="lazy" />
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
