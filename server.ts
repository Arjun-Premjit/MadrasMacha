import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { getSupabaseClient, isSupabaseConfigured } from './lib/supabase/client';
import {
  findUserByIdentifier,
  findUserById,
  createUser,
  updateUser,
  checkAndMigrateLegacyUser,
  getActiveServiceAlerts,
  createServiceAlert,
  updateServiceAlert,
  deleteServiceAlert,
} from './src/lib/server/authStore';
import {
  hashPassword,
  verifyPassword,
  generateTotpSecret,
  generateQrCodeDataUrl,
  verifyTotpCode,
  encryptTotpSecret,
  decryptTotpSecret,
  signMfaChallengeToken,
  signSessionToken,
  verifyJwtToken,
  checkRateLimit,
  resetRateLimit,
  SessionTokenPayload,
  MfaChallengePayload,
} from './src/lib/server/security';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'madras-macha-data') : path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Interface for stored user record in backend database
interface StoredUser {
  id: string;
  username: string;
  fullName: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

// In-memory active session tokens map (token -> user session info)
interface ActiveSession {
  userId: string;
  username: string;
  expiresAt: number;
}
const activeSessions = new Map<string, ActiveSession>();

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure users.json exists with seed demo user
function initDatabase() {
  if (!fs.existsSync(USERS_FILE)) {
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.scryptSync('macha123', salt, 64).toString('hex');
    const now = new Date().toISOString();
    const defaultUsers: StoredUser[] = [
      {
        id: 'usr_seed_001',
        username: 'chennaimacha',
        fullName: 'Chennai Commuter',
        salt,
        passwordHash,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      },
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2), 'utf-8');
  }
}

if (!process.env.VERCEL) initDatabase();

// Atomic read/write helpers
function readUsers(): StoredUser[] {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      initDatabase();
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw) as StoredUser[];
  } catch (err) {
    console.error('[Backend DB] Failed to read users.json:', err);
    return [];
  }
}

function writeUsers(users: StoredUser[]): void {
  try {
    const tempFile = `${USERS_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(users, null, 2), 'utf-8');
    fs.renameSync(tempFile, USERS_FILE);
  } catch (err) {
    console.error('[Backend DB] Failed to write users.json:', err);
    throw err;
  }
}

function scryptHashLegacy(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'hex');
    const bufB = Buffer.from(b, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

function configureRoutes() {

  app.use(express.json());

  // Minimal CORS headers for /api routes to support cross-origin API consumers (e.g. deployed Vercel frontend)
  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // ─────────────────────────────────────────────────────────────
  // AUTHENTICATION & RBAC MIDDLEWARES
  // ─────────────────────────────────────────────────────────────

  interface AuthenticatedRequest extends Request {
    user?: SessionTokenPayload;
  }

  const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: missing or malformed Bearer token',
      });
    }

    const token = authHeader.slice(7).trim();
    const payload = verifyJwtToken<SessionTokenPayload>(token);

    if (!payload || payload.purpose !== 'session' || !payload.mfaVerified) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: invalid or expired session token',
      });
    }

    req.user = payload;
    next();
  };

  const requireRole = (requiredRole: 'commuter' | 'transit_admin') => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      if (req.user.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          error: `Forbidden: role "${requiredRole}" required for this operation`,
        });
      }
      next();
    };
  };

  // ─────────────────────────────────────────────────────────────
  // BACKEND AUTH & USER MANAGEMENT REST API (DA 3 QUESTION 2)
  // ─────────────────────────────────────────────────────────────

  // POST /api/auth/register - Register new account (Bcrypt work factor 12 + TOTP MFA setup)
  app.post('/api/auth/register', async (req: Request, res: Response): Promise<any> => {
    try {
      const { email, username, password, fullName } = req.body;

      if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({ error: 'A valid email address is required' });
      }

      if (!username || typeof username !== 'string' || !/^[a-zA-Z0-9_-]{3,30}$/.test(username.trim())) {
        return res.status(400).json({
          error: 'Username must be 3-30 characters long and contain only letters, numbers, underscores, or hyphens',
        });
      }

      if (!password || typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({
          error: 'Password is required and must be at least 8 characters long',
        });
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanUsername = username.trim().toLowerCase();

      // Check if user already exists
      const existingEmail = await findUserByIdentifier(cleanEmail);
      if (existingEmail) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }

      const existingUsername = await findUserByIdentifier(cleanUsername);
      if (existingUsername) {
        return res.status(409).json({ error: 'Username is already taken' });
      }

      // Hash password using bcrypt (work factor 12)
      const passwordHash = await hashPassword(password);

      // Generate TOTP Authenticator secret
      const totpSecret = generateTotpSecret(cleanUsername);
      const encryptedSecret = encryptTotpSecret(totpSecret.base32);
      const qrCodeDataUrl = await generateQrCodeDataUrl(totpSecret.otpauthUrl);

      // Public registration ALWAYS assigns role: 'commuter' (enforcing zero privilege escalation)
      const newUser = await createUser({
        email: cleanEmail,
        username: cleanUsername,
        full_name: (fullName && typeof fullName === 'string' && fullName.trim()) || cleanUsername,
        password_hash: passwordHash,
        role: 'commuter',
        mfa_enabled: false,
        mfa_secret: encryptedSecret.ciphertext,
        mfa_secret_iv: encryptedSecret.iv,
        mfa_secret_tag: encryptedSecret.tag,
        legacy_source: 'native_bcrypt',
      });

      // Issue short-lived challenge token specifically for completing TOTP enrolment
      const mfaToken = signMfaChallengeToken({
        userId: newUser.id,
        email: newUser.email,
        username: newUser.username,
      });

      console.log(`[Security Auth] Registered new commuter: ${newUser.username} (${newUser.id})`);

      return res.status(201).json({
        success: true,
        message: 'Account created. Scan the QR code with your authenticator app to enable MFA.',
        mfaRequired: true,
        mfaEnrollmentRequired: true,
        mfaToken,
        qrCode: qrCodeDataUrl,
        manualKey: totpSecret.base32,
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          fullName: newUser.full_name,
          role: newUser.role,
        },
      });
    } catch (err: any) {
      console.error('[Security Auth] Registration error:', err);
      return res.status(500).json({ error: 'Internal server error during registration' });
    }
  });

  // POST /api/auth/login - Authenticate credentials and initiate TOTP MFA challenge
  app.post('/api/auth/login', async (req: Request, res: Response): Promise<any> => {
    try {
      const { identifier, username, email, password } = req.body;
      const targetIdentifier = (identifier || email || username || '').trim();

      if (!targetIdentifier || !password) {
        return res.status(400).json({ error: 'Email/username and password are required' });
      }

      // Brute-force & credential stuffing defense
      const rateLimitKey = `login_${targetIdentifier.toLowerCase()}_${req.ip}`;
      const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
      if (!rateLimit.allowed) {
        return res.status(429).json({
          error: `Too many failed attempts. Please retry after ${rateLimit.retryAfterSeconds} seconds.`,
        });
      }

      // Lookup user in persistent store
      let user = await findUserByIdentifier(targetIdentifier);

      // If not found in app_users, check if legacy scrypt record exists in data/users.json
      if (!user) {
        user = await checkAndMigrateLegacyUser(targetIdentifier, String(password));
      }

      // Timing-safe password check
      if (!user) {
        return res.status(401).json({ error: 'Invalid email/username or password' });
      }

      const isMatch = await verifyPassword(String(password), user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email/username or password' });
      }

      // Reset failed attempt counter on success
      resetRateLimit(rateLimitKey);

      // Check if TOTP MFA is enrolled
      if (user.mfa_enabled && user.mfa_secret && user.mfa_secret_iv && user.mfa_secret_tag) {
        const mfaToken = signMfaChallengeToken({
          userId: user.id,
          email: user.email,
          username: user.username,
        });

        return res.json({
          success: true,
          message: 'Password verified. Please enter the 6-digit code from your authenticator app.',
          mfaRequired: true,
          mfaEnrollmentRequired: false,
          mfaToken,
        });
      }

      // If MFA is not yet enrolled (e.g. legacy migrated user), initiate setup flow
      const totpSecret = generateTotpSecret(user.username);
      const encrypted = encryptTotpSecret(totpSecret.base32);
      await updateUser(user.id, {
        mfa_secret: encrypted.ciphertext,
        mfa_secret_iv: encrypted.iv,
        mfa_secret_tag: encrypted.tag,
      });

      const qrCodeDataUrl = await generateQrCodeDataUrl(totpSecret.otpauthUrl);
      const mfaToken = signMfaChallengeToken({
        userId: user.id,
        email: user.email,
        username: user.username,
      });

      return res.json({
        success: true,
        message: 'MFA setup required. Scan the QR code to connect Google/Microsoft Authenticator.',
        mfaRequired: true,
        mfaEnrollmentRequired: true,
        mfaToken,
        qrCode: qrCodeDataUrl,
        manualKey: totpSecret.base32,
      });
    } catch (err: any) {
      console.error('[Security Auth] Login error:', err);
      return res.status(500).json({ error: 'Internal server error during authentication' });
    }
  });

  // POST /api/auth/mfa/verify - Verify TOTP code and issue authenticated session token
  app.post('/api/auth/mfa/verify', async (req: Request, res: Response): Promise<any> => {
    try {
      const { mfaToken, code } = req.body;

      if (!mfaToken || typeof mfaToken !== 'string') {
        return res.status(400).json({ error: 'MFA challenge token is required' });
      }

      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: '6-digit authenticator code is required' });
      }

      // Verify challenge token signature and expiry
      const payload = verifyJwtToken<MfaChallengePayload>(mfaToken);
      if (!payload || payload.purpose !== 'mfa_challenge') {
        return res.status(401).json({ error: 'MFA challenge expired or invalid. Please sign in again.' });
      }

      // Rate limit MFA verification attempts
      const rateLimitKey = `mfa_${payload.userId}`;
      const rateLimit = checkRateLimit(rateLimitKey, 5, 5 * 60 * 1000);
      if (!rateLimit.allowed) {
        return res.status(429).json({
          error: `Too many invalid codes. Please wait ${rateLimit.retryAfterSeconds} seconds before retrying.`,
        });
      }

      // Fetch user and decrypt stored TOTP secret
      const user = await findUserById(payload.userId);
      if (!user || !user.mfa_secret || !user.mfa_secret_iv || !user.mfa_secret_tag) {
        return res.status(404).json({ error: 'User MFA configuration not found' });
      }

      const decryptedSecret = decryptTotpSecret({
        ciphertext: user.mfa_secret,
        iv: user.mfa_secret_iv,
        tag: user.mfa_secret_tag,
      });

      // Verify 6-digit TOTP code
      const isValid = verifyTotpCode(code, decryptedSecret);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid or expired 6-digit authenticator code' });
      }

      // Reset rate limit
      resetRateLimit(rateLimitKey);

      // Confirm MFA activation and update login timestamp
      const updatedUser = await updateUser(user.id, {
        mfa_enabled: true,
        last_login_at: new Date().toISOString(),
      });

      const effectiveRole = updatedUser?.role || user.role;

      // Issue full authenticated session JWT
      const sessionToken = signSessionToken({
        userId: user.id,
        email: user.email,
        username: user.username,
        role: effectiveRole,
      });

      console.log(`[Security Auth] Full MFA verification successful for user: ${user.username} (${effectiveRole})`);

      return res.json({
        success: true,
        message: 'MFA verification successful. Session authenticated.',
        token: sessionToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.full_name,
          role: effectiveRole,
          mfaEnabled: true,
        },
      });
    } catch (err: any) {
      console.error('[Security Auth] MFA verification error:', err);
      return res.status(500).json({ error: 'Internal server error during MFA verification' });
    }
  });

  // GET /api/auth/me - Validate session and retrieve sanitized current user profile
  app.get('/api/auth/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const user = await findUserById(req.user!.userId);
      if (!user) {
        return res.status(404).json({ error: 'User record not found' });
      }

      // Strictly sanitized: NEVER return password hashes or MFA secrets
      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.full_name,
          role: user.role,
          mfaEnabled: user.mfa_enabled,
          createdAt: user.created_at,
          lastLoginAt: user.last_login_at,
        },
      });
    } catch (err: any) {
      console.error('[Security Auth] Me profile error:', err);
      return res.status(500).json({ error: 'Internal server error retrieving user profile' });
    }
  });

  // POST /api/auth/logout - Invalidate session acknowledgment
  app.post('/api/auth/logout', (_req: Request, res: Response): any => {
    return res.json({ success: true, message: 'Logged out successfully' });
  });

  // ─────────────────────────────────────────────────────────────
  // ROLE-PROTECTED TRANSIT SERVICE ALERTS API (DA 3 QUESTION 2)
  // ─────────────────────────────────────────────────────────────

  // GET /api/transit/service-alerts - Public view of active transit disruptions
  app.get('/api/transit/service-alerts', async (_req: Request, res: Response): Promise<any> => {
    try {
      const alerts = await getActiveServiceAlerts();
      return res.json({
        success: true,
        count: alerts.length,
        data: alerts,
      });
    } catch (err: any) {
      console.error('[Service Alerts] Fetch error:', err);
      return res.status(500).json({ success: false, error: 'Failed to retrieve service alerts' });
    }
  });

  // POST /api/admin/service-alerts - Create alert (transit_admin only)
  app.post('/api/admin/service-alerts', requireAuth, requireRole('transit_admin'), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const { title, description, severity, route_id, affected_stations } = req.body;

      if (!title || typeof title !== 'string' || title.trim().length < 3) {
        return res.status(400).json({ error: 'Alert title is required (minimum 3 characters)' });
      }

      if (!description || typeof description !== 'string') {
        return res.status(400).json({ error: 'Alert description is required' });
      }

      const validSeverities = ['info', 'warning', 'severe'];
      const alertSeverity = validSeverities.includes(severity) ? severity : 'warning';

      const alert = await createServiceAlert({
        title: title.trim(),
        description: description.trim(),
        severity: alertSeverity as 'info' | 'warning' | 'severe',
        route_id: route_id ? String(route_id).trim() : undefined,
        affected_stations: Array.isArray(affected_stations) ? affected_stations : [],
        active: true,
        created_by: req.user!.userId,
      });

      console.log(`[Admin Alert] New alert published by ${req.user!.username}: "${alert.title}" (${alert.id})`);

      return res.status(201).json({
        success: true,
        message: 'Transit service alert published successfully',
        alert,
      });
    } catch (err: any) {
      console.error('[Admin Alert] Create error:', err);
      return res.status(500).json({ error: 'Failed to create service alert' });
    }
  });

  // PATCH /api/admin/service-alerts/:id - Modify alert (transit_admin only)
  app.patch('/api/admin/service-alerts/:id', requireAuth, requireRole('transit_admin'), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const { id } = req.params;
      const { title, description, severity, active, affected_stations } = req.body;

      const updates: any = {};
      if (title && typeof title === 'string') updates.title = title.trim();
      if (description && typeof description === 'string') updates.description = description.trim();
      if (severity && ['info', 'warning', 'severe'].includes(severity)) updates.severity = severity;
      if (typeof active === 'boolean') updates.active = active;
      if (Array.isArray(affected_stations)) updates.affected_stations = affected_stations;

      const updated = await updateServiceAlert(id, updates);
      if (!updated) {
        return res.status(404).json({ error: 'Service alert not found' });
      }

      console.log(`[Admin Alert] Alert updated by ${req.user!.username}: ${id}`);
      return res.json({
        success: true,
        message: 'Service alert updated successfully',
        alert: updated,
      });
    } catch (err: any) {
      console.error('[Admin Alert] Update error:', err);
      return res.status(500).json({ error: 'Failed to update service alert' });
    }
  });

  // DELETE /api/admin/service-alerts/:id - Remove alert (transit_admin only)
  app.delete('/api/admin/service-alerts/:id', requireAuth, requireRole('transit_admin'), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const { id } = req.params;
      const deleted = await deleteServiceAlert(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Service alert not found' });
      }

      console.log(`[Admin Alert] Alert deleted by ${req.user!.username}: ${id}`);
      return res.json({
        success: true,
        message: 'Service alert deleted successfully',
      });
    } catch (err: any) {
      console.error('[Admin Alert] Delete error:', err);
      return res.status(500).json({ error: 'Failed to delete service alert' });
    }
  });

  // GET /api/backend-status - Server & Database health status
  app.get('/api/backend-status', async (_req: Request, res: Response): Promise<any> => {
    const alerts = await getActiveServiceAlerts();
    return res.json({
      status: 'online',
      serverTime: new Date().toISOString(),
      securityTier: 'DA3-bcrypt-AES256GCM-TOTP-RBAC',
      activeAlertsCount: alerts.length,
      storageType: 'supabase-postgresql-with-resilient-fallback',
    });
  });

  // ─────────────────────────────────────────────────────────────
  // PUBLIC TRANSIT READ-ONLY REST API
  // ─────────────────────────────────────────────────────────────

  // GET /api/transit/routes - Query transit routes from Supabase PostgreSQL
  app.get('/api/transit/routes', async (req: Request, res: Response): Promise<any> => {
    try {
      const client = getSupabaseClient();
      if (!client || !isSupabaseConfigured) {
        return res.status(503).json({
          success: false,
          error: 'Transit database service is temporarily unavailable',
        });
      }

      // Base query on the actual GTFS 'routes' table
      let query = client.from('routes').select('*', { count: 'exact' });

      // Optional agency filter: support MTC (agency_id '69' or 'MTC') and CMRL (agency_id 'CMRL' or route_type 1)
      const agencyParam = typeof req.query.agency === 'string' ? req.query.agency.trim() : undefined;
      if (agencyParam && agencyParam.toLowerCase() !== 'all') {
        const upper = agencyParam.toUpperCase();
        if (upper === 'MTC') {
          query = query.or('agency_id.eq.MTC,agency_id.eq.69');
        } else if (upper === 'CMRL' || upper === 'METRO') {
          query = query.or('agency_id.eq.CMRL,route_type.eq.1');
        } else {
          query = query.eq('agency_id', agencyParam);
        }
      }

      // Default pagination limit to ensure predictable high-concurrency load testing performance
      // Allows optional ?limit=XX (1 to 500, default 50) and ?offset=YY (default 0)
      const parsedLimit = parseInt(req.query.limit as string, 10);
      const limit = !isNaN(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 500) : 50;

      const parsedOffset = parseInt(req.query.offset as string, 10);
      const offset = !isNaN(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;

      query = query.order('route_id', { ascending: true }).range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('[Backend Transit API] Supabase query error:', error.message);
        return res.status(500).json({
          success: false,
          error: 'Failed to retrieve transit routes from database',
        });
      }

      const rows = data || [];

      return res.status(200).json({
        success: true,
        count: rows.length,
        total: count ?? rows.length,
        limit,
        offset,
        data: rows,
      });
    } catch (err: any) {
      console.error('[Backend Transit API] Internal error:', err?.message || err);
      return res.status(500).json({
        success: false,
        error: 'Internal server error while processing transit query',
      });
    }
  });

}

configureRoutes();

// Vercel imports this Express app as a serverless function.
// Static frontend assets are served by Vercel's Vite output/CDN, not Express.
export default app;

// Preserve the existing local development and Docker server workflow.
async function startLocalServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MadrasMacha] Full-stack backend server listening on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startLocalServer().catch((err) => {
    console.error('[MadrasMacha] Fatal error starting server:', err);
    process.exit(1);
  });
}
