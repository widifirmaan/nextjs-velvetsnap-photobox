// File: src/app/admin/template-studio/component/AssetSearch.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Search, FolderUp, Palette, X } from 'lucide-react';
import { useModel } from '@/lib/context/ModelContext';
import { adminFetch } from '@/lib/utils/admin-fetch';
import styles from './AssetSearch.module.css';

interface AssetSearchProps {
  onSelect: (url: string) => void;
  onClose: () => void;
  isBackground?: boolean;
}

export default function AssetSearch({ onSelect, onClose, isBackground }: AssetSearchProps) {
  const model = useModel();
  const [activeTab, setActiveTab] = useState<'search' | 'upload' | 'color'>('search');
  const [search, setSearch] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [imageResults, setImageResults] = useState<{ url: string; thumbnail: string; title: string }[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [imageError, setImageError] = useState('');
  const [activeUrl, setActiveUrl] = useState<{ url: string; mode: 'choice' | 'processing' } | null>(null);
  const [page, setPage] = useState(1);
  const [totalHits, setTotalHits] = useState(0);
  const [color, setColor] = useState('#3d2c2c');
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);

  const log = useCallback(async (level: string, message: string, data?: unknown) => {
    try {
      await adminFetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, message, data }),
      });
    } catch (e) { console.error('AssetSearch: log route failed', e); }
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
    } catch (err: unknown) {
      if (id !== requestId.current) { log('warn', 'removeBackground cancelled after error'); return; }
      const msg = err instanceof Error ? err.message : String(err);
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
    if (isBackground) {
      onSelect(imageUrl);
      onClose();
      return;
    }
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
      const res = await adminFetch('/api/image/search', {
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
    } catch (e) {
      setImageError('Search failed. Check your network.');
      console.error('AssetSearch: image search failed', e);
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
          <h3 className={styles.modalTitle}>Image Search</h3>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        {model.status === 'downloading' && (
          <div className={`${styles.processingBanner} ${styles.bannerDownload}`}>
            <span>Downloading AI model... {model.progress}%</span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${model.progress}%` }} />
            </div>
          </div>
        )}
        {model.status === 'error' && (
          <div className={`${styles.processingBanner} ${styles.bannerError}`}>
            <span>⚠ AI model failed to load</span>
            {model.errorMessage && (
              <span className={styles.errorDetail}>{model.errorMessage}</span>
            )}
            <button onClick={model.retry} className="btn btn-danger">
              Retry Download
            </button>
          </div>
        )}
        {model.status === 'checking' && (
          <div className={`${styles.processingBanner} ${styles.bannerChecking}`}>
            <div className={styles.spinner} />
            <span>Preparing AI model...</span>
          </div>
        )}
        <div className={styles.tabBar}>
          {(['search', 'upload', 'color'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
            >
              {tab === 'search' ? <><Search size={16} /> Search</> : tab === 'upload' ? <><FolderUp size={16} /> Upload</> : <><Palette size={16} /> Color</>}
            </button>
          ))}
        </div>

        {activeTab === 'search' && (
          <div>
            <div className="flex-row flex-row-sm">
              <input
                type="text"
                placeholder="Search images..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input grow"
                autoFocus
              />
              <button
                className="btn btn-primary"
                onClick={handleSearch}
                disabled={imageLoading || !search.trim()}
              >
                {imageLoading ? '...' : 'Search'}
              </button>
            </div>

            {imageError && (
              <p className={styles.searchError}>
                {imageError}
              </p>
            )}

            {imageLoading && (
              <div className={`flex-center ${styles.loaderWrap}`}>
                <div className={styles.spinner} />
              </div>
            )}

            {imageResults.length > 0 && !imageLoading && (
              <p className={`text-muted-sm ${styles.hintText}`}>
                Select an image to remove background and add to canvas
              </p>
            )}

            {imageResults.length > 0 && (
              <div className={styles.imageGrid}>
                {imageResults.map((img, i) => (
                  <div
                    key={i}
                    className={`${styles.stickerItem} ${activeUrl?.url === img.url ? styles.active : ''}`}
                    onClick={() => handleImageClick(img.url)}
                    title={img.title}
                  >
                    <Image src={img.thumbnail} alt={img.title} fill sizes="100px" />
                    {activeUrl?.url === img.url && activeUrl.mode === 'choice' && !isBackground && (
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
                  </div>
                ))}
              </div>
            )}

            {hasMore && !imageLoading && (
              <div className={`text-center ${styles.loadMoreWrap}`}>
                <button
                  className="btn btn-primary"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading...' : `Load more (${imageResults.length}/${totalHits})`}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className={`text-center ${styles.uploadTab}`}>
            {!uploadedUrl ? (
              <label className={styles.uploadArea}>
                <span className={styles.uploadIcon}><FolderUp size={40} /></span>
                <span className={styles.uploadHint}>Click to upload an image</span>
                <span className={styles.uploadFormats}>PNG, JPG, WebP</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    if (isBackground) {
                      onSelect(url);
                      onClose();
                    } else {
                      setUploadedUrl(url);
                    }
                  }}
                />
              </label>
            ) : (
              <div className={styles.previewContainer}>
                <img
                  src={uploadedUrl}
                  alt="Uploaded"
                  className={styles.previewImage}
                />
                {activeUrl?.url === uploadedUrl && activeUrl.mode === 'choice' && !isBackground && (
                  <div className={styles.choiceOverlay}>
                    <button className={styles.choiceBtn} onClick={(e) => { e.stopPropagation(); handleFull(uploadedUrl); }}>
                      Full
                    </button>
                    <button className={styles.choiceBtn} onClick={(e) => { e.stopPropagation(); handleRemoveBg(uploadedUrl); }}>
                      Transparent
                    </button>
                  </div>
                )}
                {activeUrl?.url === uploadedUrl && activeUrl.mode === 'processing' && (
                  <div className={styles.processingOverlay}>
                    <div className={styles.spinner} />
                    <span>Removing Background...</span>
                    <button className={styles.cancelBtn} onClick={(e) => { e.stopPropagation(); handleDismiss(); }}>Cancel</button>
                  </div>
                )}
              </div>
            )}
            {uploadedUrl && !isBackground && (
              <div className={`flex-center ${styles.actionRow}`}>
                <button
                  onClick={() => { setUploadedUrl(null); setActiveUrl(null); }}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                {!activeUrl && (
                  <button
                    onClick={() => handleImageClick(uploadedUrl)}
                    className="btn btn-primary"
                  >
                    Use this image
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'color' && (
          <div className={`text-center ${styles.colorTab}`}>
            <div className={styles.colorTabInner}>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className={styles.colorPicker}
              />
            </div>
            <div className="flex-center">
              <input
                type="text"
                value={color}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9a-fA-F]{6}$/.test(val)) setColor(val);
                }}
                placeholder="#000000"
                className={styles.hexInput}
              />
              <button
                onClick={() => {
                  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1" fill="${color}"/></svg>`;
                  const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;
                  onSelect(dataUrl);
                  onClose();
                }}
                className="btn btn-primary"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
