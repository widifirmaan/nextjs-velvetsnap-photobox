// File: src/lib/hooks/useClipRecorder.ts
// Description: Records short 480p @30fps webcam clips (MP4 preferred, WEBM fallback)
// for the photobooth capture flow, producing a downloadable blob URL per shot.

'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

const CLIP_WIDTH = 854;
const CLIP_HEIGHT = 480;
const CLIP_FPS = 30;
const CLIP_BITRATE = 2_000_000;

function pickMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = [
    'video/mp4;codecs=avc1',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm',
  ];
  for (const mime of candidates) {
    try { if (MediaRecorder.isTypeSupported(mime)) return mime; } catch { /* skip */ }
  }
  return '';
}

export interface ClipRecorderState {
  recording: boolean;
  startClip: (videoEl: HTMLVideoElement | null, mirrored: boolean) => boolean;
  stopClip: () => Promise<string | null>;
}

export function useClipRecorder(): ClipRecorderState {
  const [recording, setRecording] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number>(0);

  const stopMedia = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = 0; }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    canvasRef.current = null;
  }, []);

  const startClip = useCallback((videoEl: HTMLVideoElement | null, mirrored: boolean): boolean => {
    stopMedia();
    if (!videoEl || typeof MediaRecorder === 'undefined') return false;
    const canvas = document.createElement('canvas');
    canvas.width = CLIP_WIDTH;
    canvas.height = CLIP_HEIGHT;
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) { stopMedia(); return false; }

    const draw = () => {
      if (videoEl.videoWidth && videoEl.videoHeight) {
        ctx.save();
        if (mirrored) { ctx.translate(CLIP_WIDTH, 0); ctx.scale(-1, 1); }
        const scale = Math.max(CLIP_WIDTH / videoEl.videoWidth, CLIP_HEIGHT / videoEl.videoHeight);
        const dw = videoEl.videoWidth * scale;
        const dh = videoEl.videoHeight * scale;
        ctx.drawImage(videoEl, (CLIP_WIDTH - dw) / 2, (CLIP_HEIGHT - dh) / 2, dw, dh);
        ctx.restore();
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    const stream = canvas.captureStream(CLIP_FPS);
    streamRef.current = stream;
    chunksRef.current = [];
    const mime = pickMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: CLIP_BITRATE })
        : new MediaRecorder(stream);
    } catch {
      recorder = new MediaRecorder(stream);
    }
    recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
    recorder.onstop = () => { stopMedia(); };
    recorderRef.current = recorder;
    recorder.start();
    setRecording(true);
    return true;
  }, [stopMedia]);

  const stopClip = useCallback((): Promise<string | null> => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      recorderRef.current = null;
      stopMedia();
      setRecording(false);
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      recorder.addEventListener('stop', () => {
        recorderRef.current = null;
        stopMedia();
        setRecording(false);
        if (!chunksRef.current.length) { resolve(null); return; }
        const type = chunksRef.current[0].type || recorder.mimeType || 'video/webm';
        const blob = new Blob(chunksRef.current, { type });
        chunksRef.current = [];
        resolve(URL.createObjectURL(blob));
      });
      recorder.stop();
    });
  }, [stopMedia]);

  useEffect(() => stopMedia, [stopMedia]);

  return { recording, startClip, stopClip };
}