'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './AssetSearch.module.css';
import { STICKER_CATEGORIES, renderEmojiToDataUrl } from '../data/stickers';

interface AssetSearchProps {
  onSelect: (url: string) => void;
  onClose: () => void;
  mode?: 'sticker' | 'background';
}

const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || '';

const FREE_BG_URLS = [
  { name: 'Solid Beige', value: '#F6F0D7' },
  { name: 'Solid Sage', value: '#C5D89D' },
  { name: 'Solid Blush', value: '#E8C4C4' },
  { name: 'Solid Lavender', value: '#D4C5E8' },
  { name: 'Solid Sky', value: '#C4D9E8' },
  { name: 'Gradient Warm', value: 'linear-gradient(135deg, #F6F0D7, #E8C4C4)' },
  { name: 'Gradient Cool', value: 'linear-gradient(135deg, #C5D89D, #D4C5E8)' },
  { name: 'Gradient Peach', value: 'linear-gradient(135deg, #FFD6D6, #FFE8D6)' },
  { name: 'Gradient Mint', value: 'linear-gradient(135deg, #C5D89D, #D4E8C5)' },
  { name: 'Solid Cream', value: '#FFF8E7' },
  { name: 'Solid Dusty Rose', value: '#D4A5A5' },
  { name: 'Solid Taupe', value: '#B8A99A' },
];

export default function AssetSearch({ onSelect, onClose, mode = 'sticker' }: AssetSearchProps) {
  const [tab, setTab] = useState<'emoji' | 'giphy' | 'backgrounds'>(
    mode === 'background' ? 'backgrounds' : 'emoji'
  );
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>(STICKER_CATEGORIES[0]?.name || '');
  const [giphyResults, setGiphyResults] = useState<any[]>([]);
  const [giphyLoading, setGiphyLoading] = useState(false);
  const [giphyError, setGiphyError] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [recentStickers, setRecentStickers] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('strips_studio_recent_stickers');
      if (stored) setRecentStickers(JSON.parse(stored));
    } catch {}
  }, []);

  const saveRecent = (url: string) => {
    const next = [url, ...recentStickers.filter(s => s !== url)].slice(0, 20);
    setRecentStickers(next);
    localStorage.setItem('strips_studio_recent_stickers', JSON.stringify(next));
  };

  const handleSelect = (url: string) => {
    saveRecent(url);
    onSelect(url);
  };

  const searchGiphy = useCallback(async (query: string) => {
    if (!GIPHY_API_KEY) {
      setGiphyError('GIPHY API key not configured. Set NEXT_PUBLIC_GIPHY_API_KEY in .env');
      return;
    }
    if (!query.trim()) return;
    setGiphyLoading(true);
    setGiphyError('');
    try {
      const res = await fetch(
        `https://api.giphy.com/v1/stickers/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=24&rating=g`
      );
      const data = await res.json();
      if (data.data) {
        setGiphyResults(data.data);
      } else {
        setGiphyError('No results found');
      }
    } catch (e) {
      setGiphyError('Failed to fetch stickers. Check your network.');
    } finally {
      setGiphyLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (tab === 'giphy' && search.trim()) {
      searchTimeout.current = setTimeout(() => searchGiphy(search), 500);
    }
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [search, tab, searchGiphy]);

  const currentCategory = STICKER_CATEGORIES.find(c => c.name === category);
  const filteredEmojis = search.trim()
    ? STICKER_CATEGORIES.flatMap(c => c.emojis).filter(e => e.includes(search))
    : currentCategory?.emojis || [];

  const tabs = mode === 'background'
    ? [{ id: 'backgrounds' as const, label: 'Backgrounds' }]
    : [
        { id: 'emoji' as const, label: 'Emoji' },
        ...(GIPHY_API_KEY ? [{ id: 'giphy' as const, label: 'Online' }] : []),
        { id: 'backgrounds' as const, label: 'Background' },
      ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 style={{ margin: 0 }}>
            {mode === 'background' ? 'Backgrounds' : 'Sticker Gallery'}
          </h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.tabs}>
          {tabs.map(t => (
            <button
              key={t.id}
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
              onClick={() => { setTab(t.id); setSearch(''); setGiphyResults([]); }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'emoji' && (
          <div>
            <input
              type="text"
              placeholder="Search emoji..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
              autoFocus
            />
            {!search.trim() && (
              <div className={styles.categories}>
                {STICKER_CATEGORIES.map(c => (
                  <button
                    key={c.name}
                    className={`${styles.catBtn} ${c.name === category ? styles.catActive : ''}`}
                    onClick={() => setCategory(c.name)}
                  >
                    <span style={{ fontSize: 20 }}>{c.emojis[0]}</span>
                    <span style={{ fontSize: 11 }}>{c.name}</span>
                  </button>
                ))}
              </div>
            )}
            <div className={styles.grid}>
              {filteredEmojis.map((emoji, i) => (
                <button
                  key={i}
                  className={styles.stickerItem}
                  title={emoji}
                  onClick={() => handleSelect(renderEmojiToDataUrl(emoji, 300))}
                >
                  <span style={{ fontSize: 28 }}>{emoji}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'giphy' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Search stickers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={styles.searchInput}
                style={{ marginBottom: 0, flex: 1 }}
                autoFocus
              />
              <button
                className={styles.searchBtn}
                onClick={() => searchGiphy(search)}
                disabled={giphyLoading || !search.trim()}
              >
                {giphyLoading ? '...' : 'Search'}
              </button>
            </div>
            {giphyError && (
              <p style={{ fontSize: 13, color: '#e74c3c', textAlign: 'center', padding: 12 }}>
                {giphyError}
              </p>
            )}
            {!GIPHY_API_KEY && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>
                Set <code>NEXT_PUBLIC_GIPHY_API_KEY</code> in .env.local to enable online sticker search.
                Get a free key at <a href="https://developers.giphy.com" target="_blank" rel="noopener" style={{ color: 'var(--accent-color)' }}>developers.giphy.com</a>
              </p>
            )}
            {giphyResults.length > 0 && (
              <div className={styles.grid}>
                {giphyResults.map((sticker: any, i: number) => {
                  const url = sticker.images?.fixed_width?.webp || sticker.images?.fixed_width?.url;
                  return url ? (
                    <button
                      key={sticker.id || i}
                      className={styles.stickerItem}
                      onClick={() => handleSelect(url)}
                    >
                      <img
                        src={url}
                        alt={sticker.title || 'Sticker'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                        loading="lazy"
                      />
                    </button>
                  ) : null;
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'backgrounds' && (
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              Click a background to apply it. Gradients work as CSS backgrounds.
            </p>
            <div className={styles.bgGrid}>
              {FREE_BG_URLS.map((bg, i) => (
                <button
                  key={i}
                  className={styles.bgItem}
                  onClick={() => onSelect(bg.value)}
                >
                  <div
                    className={styles.bgPreview}
                    style={{ background: bg.value }}
                  />
                  <span className={styles.bgLabel}>{bg.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {recentStickers.length > 0 && tab !== 'backgrounds' && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Recent</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {recentStickers.slice(0, 8).map((url, i) => (
                <button
                  key={i}
                  onClick={() => onSelect(url)}
                  style={{
                    width: 44, height: 44, borderRadius: 8, overflow: 'hidden',
                    border: '1px solid rgba(0,0,0,0.06)', background: '#fff', cursor: 'pointer', padding: 0,
                  }}
                >
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
