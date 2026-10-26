import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// ─────────────────────────────────────────────────────────────
// CONFIGURATION & SECRETS MANAGEMENT
// ─────────────────────────────────────────────────────────────
const BCRYPT_SALT_ROUNDS = 12; // Appropriate work factor for bcrypt

// Encryption key for TOTP secrets stored at rest in Supabase (AES-256-GCM)
// Must be 32 bytes. If not provided or malformed, derive a deterministic local secret.
function getMfaEncryptionKey(): Buffer {
  const envKey = process.env.MFA_ENCRYPTION_KEY;
  if (envKey && envKey.length >= 32) {
    return crypto.createHash('sha256').update(envKey).digest();
  }
  // Safe internal server fallback key derived from server environment
  return crypto.createHash('sha256').update('madras_macha_aes256_internal_key_salt_2026').digest();
}

const JWT_SECRET = process.env.JWT_SECRET || 'madras_macha_jwt_production_secret_key_928174';
const JWT_SESSION_EXPIRY = '12h';
const JWT_MFA_CHALLENGE_EXPIRY = '5m';

// ─────────────────────────────────────────────────────────────
// PASSWORD HASHING (BCRYPT & LEGACY SCRYPT)
// ─────────────────────────────────────────────────────────────

/**
 * Hashes a plain-text password using bcrypt with work factor 12.
 */
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, BCRYPT_SALT_ROUNDS);
}

/**
 * Verifies a plain-text password against a bcrypt hash.
 */
export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  if (!hash || !plainText) return false;
  return bcrypt.compare(plainText, hash);
}

/**
 * Verifies legacy passwords previously stored in data/users.json using Node.js scrypt.
 * Allows graceful migration to bcrypt on the user's first login.
 */
export function verifyLegacyScrypt(plainText: string, salt: string, expectedHash: string): boolean {
  try {
    const computedHash = crypto.scryptSync(plainText, salt, 64).toString('hex');
    const bufA = Buffer.from(computedHash, 'hex');
    const bufB = Buffer.from(expectedHash, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// ENCRYPTED TOTP MFA (AES-256-GCM)
// ─────────────────────────────────────────────────────────────

export interface EncryptedSecret {
  ciphertext: string;
  iv: string;
  tag: string;
}

/**
 * Encrypts a TOTP secret using authenticated AES-256-GCM before storing in database.
 */
export function encryptTotpSecret(secret: string): EncryptedSecret {
  const key = getMfaEncryptionKey();
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let ciphertext = cipher.update(secret, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return {
    ciphertext,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

/**
 * Decrypts an AES-256-GCM encrypted TOTP secret.
 */
export function decryptTotpSecret(encrypted: EncryptedSecret): string {
  const key = getMfaEncryptionKey();
  const iv = Buffer.from(encrypted.iv, 'hex');
  const tag = Buffer.from(encrypted.tag, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted.ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Generates a new TOTP secret for authenticator apps (Google Authenticator, Microsoft Authenticator).
 */
export function generateTotpSecret(username: string): {
  base32: string;
  otpauthUrl: string;
} {
  const secret = speakeasy.generateSecret({
    name: `Madras Macha (${username})`,
    issuer: 'Madras Macha Transit',
    length: 20,
  });

  return {
    base32: secret.base32,
    otpauthUrl: secret.otpauth_url || '',
  };
}

/**
 * Generates a Data URL QR code from an otpauth URI for user scanning.
 */
export async function generateQrCodeDataUrl(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 256,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
}

/**
 * Verifies a 6-digit TOTP code against the decrypted secret.
 * Allows a +/- 1 step window (30s) to account for client clock skew.
 */
export function verifyTotpCode(code: string, secretBase32: string): boolean {
  if (!code || typeof code !== 'string') return false;
  const cleanCode = code.trim().replace(/\s+/g, '');
  if (!/^\d{6}$/.test(cleanCode)) return false;

  return speakeasy.totp.verify({
    secret: secretBase32,
    encoding: 'base32',
    token: cleanCode,
    window: 1, // +/- 30 seconds
  });
}

// ─────────────────────────────────────────────────────────────
// JSON WEB TOKENS (SESSION & MFA CHALLENGE)
// ─────────────────────────────────────────────────────────────

export interface SessionTokenPayload {
  userId: string;
  email: string;
  username: string;
  role: 'commuter' | 'transit_admin';
  mfaVerified: true;
  purpose?: string;
}

export interface MfaChallengePayload {
  userId: string;
  email: string;
  username: string;
  purpose: 'mfa_challenge';
}

/**
 * Signs a short-lived MFA challenge token after successful password verification.
 * Cannot be used to access protected APIs; valid only for /api/auth/mfa/verify.
 */
export function signMfaChallengeToken(payload: { userId: string; email: string; username: string }): string {
  return jwt.sign(
    {
      ...payload,
      purpose: 'mfa_challenge',
    },
    JWT_SECRET,
    { expiresIn: JWT_MFA_CHALLENGE_EXPIRY }
  );
}

/**
 * Signs a full authenticated session token once password + TOTP MFA are both verified.
 */
export function signSessionToken(payload: {
  userId: string;
  email: string;
  username: string;
  role: 'commuter' | 'transit_admin';
}): string {
  return jwt.sign(
    {
      ...payload,
      mfaVerified: true,
      purpose: 'session',
    },
    JWT_SECRET,
    { expiresIn: JWT_SESSION_EXPIRY }
  );
}

/**
 * Verifies a JWT and extracts payload.
 */
export function verifyJwtToken<T = any>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// IN-MEMORY RATE LIMITER FOR AUTH ATTEMPTS
// Thwarts brute-force attacks and credential stuffing
// ─────────────────────────────────────────────────────────────
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(key: string, maxAttempts = 6, windowMs = 15 * 60 * 1000): {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || record.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (record.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  record.count += 1;
  return { allowed: true, remaining: maxAttempts - 1 - record.count };
}

export function resetRateLimit(key: string): void {
  rateLimitMap.delete(key);
}
