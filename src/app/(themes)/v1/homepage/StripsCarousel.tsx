// File: src/app/(themes)/v1/homepage/StripsCarousel.tsx
// Description: Auto-added top comment for easier file identification.

'use client';
import { useCallback, useEffect, useRef } from 'react';
import { Camera as CameraIcon } from 'lucide-react';
import styles from '@/app/(themes)/v1/page.module.css';
import type { StripResult } from '../types';
import { STRIPS_CAROUSEL_RESUME_DELAY, STRIPS_CAROUSEL_AUTO_START_DELAY, STRIPS_CAROUSEL_ONREADY_TIMEOUT } from '@/lib/utils/constants';

export default function StripsCarousel({ strips, smallVpRef, onReady }: {
  strips: StripResult[]; smallVpRef: React.MutableRefObject<boolean>; onReady?: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLImageElement | null)[]>([]);
  const posRef = useRef(0);
  const autoRef = useRef(0);
  const resumeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const readyRef = useRef(false);
  const loadedCount = useRef(0);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartPos = useRef(0);

  const tripled = [...strips.slice(0, 10), ...strips.slice(0, 10), ...strips.slice(0, 10)];

  const applyTransform = useCallback(() => {
    const c = trackRef.current;
    if (!c) return;
    c.style.transform = `translateX(${posRef.current}px)`;
  }, []);

  const loopPos = useCallback((pos: number) => {
    const c = trackRef.current;
    if (!c) return pos;
    const totalWidth = c.scrollWidth;
    const oneSet = totalWidth / 3;
    if (pos <= -oneSet * 2) pos += oneSet;
    else if (pos >= -oneSet) pos -= oneSet;
    return pos;
  }, []);

  const updateTransforms = useCallback(() => {
    const c = trackRef.current;
    if (!c) return;
    if (smallVpRef.current) {
      slideRefs.current.forEach((el) => {
        if (!el) return;
        el.style.transform = '';
        el.style.zIndex = '';
        el.style.opacity = '1';
      });
      return;
    }
    const containerW = c.parentElement?.clientWidth || c.clientWidth;
    const cx = containerW / 2 - posRef.current;
    slideRefs.current.forEach((el) => {
      if (!el) return;
      const ecx = el.offsetLeft + el.offsetWidth / 2;
      const dist = (ecx - cx) / (containerW * 0.5);
      const abs = Math.abs(dist);
      const sign = Math.sign(dist);
      let rotY: number, scale: number, zIdx: number;
      if (abs < 0.5) {
        rotY = sign * abs * 10;
        scale = 1 - abs * 0.12;
        zIdx = 50;
      } else if (abs < 1) {
        const t = (abs - 0.5) / 0.5;
        rotY = sign * 5;
        scale = 0.94 - t * 0.21;
        zIdx = 50 - t * 35;
      } else {
        rotY = sign * 5;
        scale = 0.73;
        zIdx = 15;
      }
      el.style.transform = `perspective(700px) rotateY(${rotY}deg) scale(${scale})`;
      el.style.zIndex = Math.round(zIdx).toString();
      el.style.opacity = String(Math.max(0.1, 1 - abs * 0.55));
    });
  }, [smallVpRef]);

  const stepAuto = useCallback(() => {
    posRef.current -= 0.8;
    posRef.current = loopPos(posRef.current);
    applyTransform();
    updateTransforms();
    autoRef.current = requestAnimationFrame(stepAuto);
  }, [applyTransform, updateTransforms, loopPos]);

  const startAutoScroll = useCallback(() => {
    cancelAnimationFrame(autoRef.current);
    autoRef.current = requestAnimationFrame(stepAuto);
  }, [stepAuto]);

  const stopAuto = useCallback(() => {
    cancelAnimationFrame(autoRef.current);
    clearTimeout(resumeTimer.current);
  }, []);

  const resumeAuto = useCallback(() => {
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(startAutoScroll, STRIPS_CAROUSEL_RESUME_DELAY);
  }, [startAutoScroll]);

  useEffect(() => {
    if (!strips.length) return;
    const c = trackRef.current;
    if (!c) return;
    posRef.current = -(c.scrollWidth / 3);
    c.style.transform = `translateX(${posRef.current}px)`;
    c.style.willChange = 'transform';
    applyTransform();
    updateTransforms();
    const t = setTimeout(startAutoScroll, STRIPS_CAROUSEL_AUTO_START_DELAY);
    return () => { clearTimeout(t); stopAuto(); };
  }, [strips.length, applyTransform, updateTransforms, startAutoScroll, stopAuto]);

  useEffect(() => {
    if (!strips.length || !onReady) return;
    const fallback = setTimeout(() => {
      if (!readyRef.current) {
        readyRef.current = true;
        onReady();
      }
    }, STRIPS_CAROUSEL_ONREADY_TIMEOUT);
    return () => clearTimeout(fallback);
  }, [onReady, strips]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    stopAuto();
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragStartPos.current = posRef.current;
    const c = trackRef.current;
    if (c) c.style.transition = 'none';
  }, [stopAuto]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStartX.current;
    posRef.current = dragStartPos.current + dx;
    posRef.current = loopPos(posRef.current);
    applyTransform();
    updateTransforms();
  }, [applyTransform, updateTransforms, loopPos]);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
    const c = trackRef.current;
    if (c) c.style.transition = '';
    resumeAuto();
  }, [resumeAuto]);

  const handleLoad = useCallback(() => {
    loadedCount.current++;
    if (onReady) {
      const total = Math.min(strips.length, 10) * 3;
      if (loadedCount.current >= total && !readyRef.current) {
        readyRef.current = true;
        onReady();
      }
    }
  }, [onReady, strips.length]);

  return (
    <div className={styles.colRight}>
      {strips.length > 0 ? (
        <div className={styles.fanViewport}>
          <div
            ref={trackRef}
            className={styles.fanTrack}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onTouchStart={(e) => {
              stopAuto();
              dragging.current = true;
              dragStartX.current = e.touches[0].clientX;
              dragStartPos.current = posRef.current;
              const c = trackRef.current;
              if (c) c.style.transition = 'none';
            }}
            onTouchMove={(e) => {
              if (!dragging.current) return;
              const dx = e.touches[0].clientX - dragStartX.current;
              posRef.current = dragStartPos.current + dx;
              posRef.current = loopPos(posRef.current);
              applyTransform();
              updateTransforms();
            }}
            onTouchEnd={() => {
              dragging.current = false;
              const c = trackRef.current;
              if (c) c.style.transition = '';
              resumeAuto();
            }}
            onTouchCancel={() => {
              dragging.current = false;
              const c = trackRef.current;
              if (c) c.style.transition = '';
              resumeAuto();
            }}
          >
            {tripled.map((s, i) => (
              <img
                key={`${s._id}-${i}`}
                ref={(el) => { slideRefs.current[i] = el; }}
                src={s.finalImage?.replace('/image/upload/', '/image/upload/f_auto,q_auto/') || ''}
                alt=""
                className={styles.fanSlide}
                draggable={false}
                loading="lazy"
                decoding="async"
                onLoad={() => { updateTransforms(); handleLoad(); }}
                onError={() => { updateTransforms(); handleLoad(); }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.rightEmpty}>
          <CameraIcon size={32} />
          <span>Belum ada hasil strip</span>
        </div>
      )}
    </div>
  );
}
