'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './AssetSearch.module.css';

interface AssetSearchProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function AssetSearch({ onSelect, onClose }: AssetSearchProps) {
  const [search, setSearch] = useState('');
  const [imageResults, setImageResults] = useState<{ url: string; thumbnail: string; title: string }[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [processingUrl, setProcessingUrl] = useState<string | null>(null);
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

  const searchImages = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setImageLoading(true);
    setImageError('');
    try {
      const res = await fetch('/api/image/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.success) {
        setImageResults(data.data || []);
      } else {
        setImageError(data.error || 'Search failed');
      }
    } catch {
      setImageError('Search failed. Check your network.');
    } finally {
      setImageLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (search.trim()) {
      searchTimeout.current = setTimeout(() => searchImages(search), 500);
    }
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [search, searchImages]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 style={{ margin: 0 }}>Image Search</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

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
              onClick={() => searchImages(search)}
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
        </div>
      </div>
    </div>
  );
}
