export const CHROMA_KEY_GREEN = '#00bf63';
export const CHROMA_KEY_THRESHOLD = 5000;
export const CHROMA_KEY_TARGET: [number, number, number] = [0, 191, 99];

export const COMPOSE_JPEG_QUALITY = 0.95;
export const STRIP_JPEG_QUALITY = 0.85;
export const DEFAULT_CANVAS_WIDTH = 1000;
export const DEFAULT_CANVAS_HEIGHT = 3000;
export const FRAME_RENDER_MAX_W = 720;

export const MIDTRANS_SNAP_URL = 'https://app.sandbox.midtrans.com/snap/snap.js';
export const MIDTRANS_PAYMENT_EXPIRY_DURATION = 30;
export const MIDTRANS_PAYMENT_EXPIRY_UNIT = 'minutes' as const;

export const CAPTURE_COOLDOWN_MS = 400;
export const FLASH_DURATION_MS = 180;
export const COUNTDOWN_SEC = 3;

export const UPLOAD_COMPRESS_THRESHOLD = 3.8 * 1024 * 1024;
export const UPLOAD_MAX_DIM = 1200;
export const UPLOAD_JPEG_QUALITY = 0.75;

export const TEMPLATE_PRELOAD_W = 200;
export const TEMPLATE_PRELOAD_H = 600;

export const PRELOADER_DURATION_MS = 4000;
export const PRELOADER_FADE_MS = 500;
export const PRELOADER_CAROUSEL_READY_DELAY = 300;

export const MORPH_BUTTON_DELAY_MS = 900;
export const MORPH_CLEANUP_MS = 2000;

export const STRIPS_CAROUSEL_RESUME_DELAY = 3000;
export const STRIPS_CAROUSEL_AUTO_START_DELAY = 100;
export const STRIPS_CAROUSEL_ONREADY_TIMEOUT = 3000;

export const MODEL_RETRY_DELAY = 1500;
export const MODEL_CLEAR_CACHE_DELAY = 300;

export const STORAGE_KEYS = {
  ACCOUNT: 'velvetsnap_account_id',
  TEMPLATES: 'velvetsnap_templates',
  CAMERA: 'velvetsnap_camera_device',
  DEVICE_SETTINGS: 'velvetsnap_device_settings',
  SKIP_PRELOADER: 'skipPreloader',
  ADMIN_SESSION: 'admin_account_id',
  ADMIN_SESSION_TOKEN: 'admin_session_token',
  ADMIN_IS_ROOT: 'admin_is_root',
  ADMIN_USERNAME: 'admin_username',
  IMGLY_MODEL_READY: 'imgly_model_ready',
  IMGLY_MODEL_RETRY: 'imgly_model_retry',
} as const;

