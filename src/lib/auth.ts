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
  return h === hash;
}

export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}
