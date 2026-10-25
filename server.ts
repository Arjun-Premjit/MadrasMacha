import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { getSupabaseClient, isSupabaseConfigured } from './lib/supabase/client';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
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

initDatabase();

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

function hashPassword(password: string, salt: string): string {
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

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // ─────────────────────────────────────────────────────────────
  // BACKEND AUTH & USER MANAGEMENT REST API
  // ─────────────────────────────────────────────────────────────

  // POST /api/auth/register - Save new username & password to backend database
  app.post('/api/auth/register', (req: Request, res: Response): any => {
    try {
      const { username, password, fullName } = req.body;

      if (!username || typeof username !== 'string' || username.trim().length < 3) {
        return res.status(400).json({
          error: 'Username is required and must be at least 3 characters long',
        });
      }

      if (!password || typeof password !== 'string' || password.length < 4) {
        return res.status(400).json({
          error: 'Password is required and must be at least 4 characters long',
        });
      }

      const cleanUsername = username.trim().toLowerCase();
      const users = readUsers();

      // Check if username already exists
      const existing = users.find((u) => u.username.toLowerCase() === cleanUsername);
      if (existing) {
        return res.status(409).json({
          error: `Username "${username.trim()}" is already registered. Please choose another username or log in.`,
        });
      }

      // Generate salt and secure cryptographic hash
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = hashPassword(password, salt);
      const now = new Date().toISOString();
      const newUser: StoredUser = {
        id: `usr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        username: username.trim(),
        fullName: (fullName && typeof fullName === 'string' && fullName.trim()) || username.trim(),
        salt,
        passwordHash,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      };

      users.push(newUser);
      writeUsers(users);

      // Create session token
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
      activeSessions.set(sessionToken, {
        userId: newUser.id,
        username: newUser.username,
        expiresAt,
      });

      console.log(`[Backend Auth] New user registered and stored in backend: ${newUser.username} (${newUser.id})`);

      return res.status(201).json({
        success: true,
        message: 'Account created and credentials safely stored in backend database',
        token: sessionToken,
        user: {
          id: newUser.id,
          username: newUser.username,
          fullName: newUser.fullName,
          createdAt: newUser.createdAt,
          lastLoginAt: newUser.lastLoginAt,
        },
      });
    } catch (err: any) {
      console.error('[Backend Auth] Registration error:', err);
      return res.status(500).json({ error: 'Internal server error during registration' });
    }
  });

  // POST /api/auth/login - Authenticate username and password against backend database
  app.post('/api/auth/login', (req: Request, res: Response): any => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const cleanUsername = String(username).trim().toLowerCase();
      const users = readUsers();

      const user = users.find((u) => u.username.toLowerCase() === cleanUsername);
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const inputHash = hashPassword(password, user.salt);
      const isMatch = safeCompare(inputHash, user.passwordHash);

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Update last login timestamp in backend database
      user.lastLoginAt = new Date().toISOString();
      writeUsers(users);

      // Issue session token
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      activeSessions.set(sessionToken, {
        userId: user.id,
        username: user.username,
        expiresAt,
      });

      console.log(`[Backend Auth] User authenticated: ${user.username}`);

      return res.json({
        success: true,
        message: 'Authentication successful',
        token: sessionToken,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        },
      });
    } catch (err: any) {
      console.error('[Backend Auth] Login error:', err);
      return res.status(500).json({ error: 'Internal server error during authentication' });
    }
  });

  // GET /api/auth/me - Validate session and retrieve current user
  app.get('/api/auth/me', (req: Request, res: Response): any => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.slice(7).trim();
    const session = activeSessions.get(token);

    if (!session || session.expiresAt < Date.now()) {
      if (session) activeSessions.delete(token);
      return res.status(401).json({ error: 'Session expired or invalid' });
    }

    const users = readUsers();
    const user = users.find((u) => u.id === session.userId);

    if (!user) {
      activeSessions.delete(token);
      return res.status(404).json({ error: 'User not found in backend database' });
    }

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    });
  });

  // POST /api/auth/logout - Invalidate session token
  app.post('/api/auth/logout', (req: Request, res: Response): any => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      activeSessions.delete(token);
    }
    return res.json({ success: true, message: 'Logged out successfully' });
  });

  // GET /api/auth/users - Public safe listing of registered accounts in backend
  app.get('/api/auth/users', (_req: Request, res: Response): any => {
    const users = readUsers();
    const safeList = users.map((u) => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      isStoredInBackend: true,
    }));

    return res.json({
      count: safeList.length,
      storageFile: 'data/users.json',
      users: safeList,
    });
  });

  // GET /api/backend-status - Server & Database health status
  app.get('/api/backend-status', (_req: Request, res: Response): any => {
    const users = readUsers();
    return res.json({
      status: 'online',
      serverTime: new Date().toISOString(),
      storageType: 'backend-filesystem-json',
      databasePath: USERS_FILE,
      userCount: users.length,
      activeSessionsCount: activeSessions.size,
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

  // ─────────────────────────────────────────────────────────────
  // VITE DEV MIDDLEWARE / STATIC ASSETS
  // ─────────────────────────────────────────────────────────────
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

startServer().catch((err) => {
  console.error('[MadrasMacha] Fatal error starting server:', err);
  process.exit(1);
});
