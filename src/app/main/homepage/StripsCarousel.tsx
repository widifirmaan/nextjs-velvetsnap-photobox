'use client';
import { useCallback, useEffect, useRef } from 'react';
import { Camera as CameraIcon } from 'lucide-react';
import styles from '@/app/main/page.module.css';
import type { StripResult } from '../types';

export default function StripsCarousel({ strips, smallVpRef, onReady }: {
  strips: StripResult[]; smallVpRef: React.MutableRefObject<boolean>; onReady?: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLImageElement | null)[]>([]);
  const autoRef = useRef(0);
  const resumeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const readyRef = useRef(false);
  const loadedCount = useRef(0);

  const tripled = [...strips.slice(0, 10), ...strips.slice(0, 10), ...strips.slice(0, 10)];

  const updateTransforms = useCallback(() => {
    const c = trackRef.current;
    if (!c) return;
    const oneSet = c.scrollWidth / 3;
    if (c.scrollLeft >= oneSet * 2) c.scrollLeft -= oneSet;
    else if (c.scrollLeft < oneSet) c.scrollLeft += oneSet;
    if (smallVpRef.current) {
      slideRefs.current.forEach((el) => {
        if (!el) return;
        el.style.transform = '';
        el.style.zIndex = '';
        el.style.opacity = '1';
      });
      return;
    }
    const cx = c.scrollLeft + c.clientWidth / 2;
    slideRefs.current.forEach((el) => {
      if (!el) return;
      const ecx = el.offsetLeft + el.offsetWidth / 2;
      const dist = (ecx - cx) / (c.clientWidth * 0.5);
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

  useEffect(() => {
    if (!strips.length) return;
    const c = trackRef.current;
    if (!c) return;
    requestAnimationFrame(() => {
      if (c.scrollWidth > c.clientWidth) c.scrollLeft = c.scrollWidth / 3;
      const onScroll = () => requestAnimationFrame(updateTransforms);
      c.addEventListener('scroll', onScroll, { passive: true });
      updateTransforms();
      return () => c.removeEventListener('scroll', onScroll);
    });
  }, [updateTransforms, strips]);

  useEffect(() => {
    if (!strips.length || !onReady) return;
    const total = Math.min(strips.length, 10) * 3;
    const check = () => {
      if (loadedCount.current >= total && !readyRef.current) {
        readyRef.current = true;
        onReady();
      }
    };
    const fallback = setTimeout(() => {
      if (!readyRef.current) {
        readyRef.current = true;
        onReady();
      }
    }, 3000);
    return () => clearTimeout(fallback);
  }, [onReady, strips]);

  const handleUserInteract = useCallback(() => {
    cancelAnimationFrame(autoRef.current);
    clearTimeout(resumeTimer.current);
  }, []);

  const scheduleResume = useCallback(() => {
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      const c = trackRef.current;
      if (!c || c.scrollWidth <= c.clientWidth) return;
      const step = () => {
        const oneSet = c.scrollWidth / 3;
        c.scrollLeft += 0.8;
        if (c.scrollLeft >= oneSet * 2) c.scrollLeft -= oneSet;
        else if (c.scrollLeft < oneSet) c.scrollLeft += oneSet;
        updateTransforms();
        autoRef.current = requestAnimationFrame(step);
      };
      autoRef.current = requestAnimationFrame(step);
    }, 3000);
  }, [updateTransforms]);

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

  const startAutoScroll = useCallback(() => {
    const c = trackRef.current;
    if (!c || c.scrollWidth <= c.clientWidth) return;
    const step = () => {
      const oneSet = c.scrollWidth / 3;
      c.scrollLeft += 0.8;
      if (c.scrollLeft >= oneSet * 2) c.scrollLeft -= oneSet;
      else if (c.scrollLeft < oneSet) c.scrollLeft += oneSet;
      updateTransforms();
      autoRef.current = requestAnimationFrame(step);
    };
    autoRef.current = requestAnimationFrame(step);
  }, [updateTransforms]);

  useEffect(() => {
    if (!strips.length) return;
    const t = setTimeout(startAutoScroll, 100);
    return () => { clearTimeout(t); cancelAnimationFrame(autoRef.current); clearTimeout(resumeTimer.current); };
  }, [startAutoScroll, strips.length]);

  return (
    <div className={styles.colRight}>
      {strips.length > 0 ? (
        <div
          ref={trackRef}
          className={styles.fanTrack}
          onPointerDown={handleUserInteract}
          onPointerUp={scheduleResume}
          onPointerLeave={scheduleResume}
        >
          {tripled.map((s, i) => (
            <img
              key={`${s._id}-${i}`}
              ref={(el) => { slideRefs.current[i] = el; }}
              src={s.finalImage}
              alt=""
              className={styles.fanSlide}
              draggable={false}
              onLoad={() => { updateTransforms(); handleLoad(); }}
              onError={() => { updateTransforms(); handleLoad(); }}
            />
          ))}
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
