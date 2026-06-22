import crypto from 'crypto';

const ITERATIONS = 10000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

export function hashPassword(password: string, salt?: string) {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, s, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return { hash, salt: s };
}

export function verifyPassword(password: string, hash: string, salt: string) {
  const { hash: h } = hashPassword(password, salt);
  try {
    return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(hash));
  } catch {
    return false;
  }
}

export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}
