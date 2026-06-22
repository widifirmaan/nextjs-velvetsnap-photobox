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

export const COUNTDOWN_SEC = 3;

export const SNAP_LOAD_TIMEOUT = 15000;
export const SNAP_PAY_TIMEOUT = 30000;
export const PAYMENT_SUCCESS_DELAY = 800;
export const PAYMENT_POLL_INTERVAL = 3000;

export const LOGOUT_REDIRECT_DELAY = 1500;
export const SAVED_MSG_TIMEOUT = 3000;
export const PRINT_WINDOW_DELAY = 500;
export const UPLOAD_PAYMENT_MAX_DIM = 1600;
export const CURTAIN_ANIM_DELAY = 400;
export const CURTAIN_FALLBACK_TIMEOUT = 5000;

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

export const COOKIE_NAME = 'admin_session';

export const COOKIE_BASE = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
} as const;

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
  PHOTOBOOTH_SESSION: 'photobooth_session',
  PHOTOBOOTH_TX_ID: 'photobooth_txId',
} as const;

