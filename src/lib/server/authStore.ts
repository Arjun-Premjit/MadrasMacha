import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { hashPassword, verifyLegacyScrypt } from './security';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PERSISTENT_AUTH_FILE = path.join(DATA_DIR, 'app_users.json');
const ALERTS_FILE = path.join(DATA_DIR, 'transit_service_alerts.json');

// Interface for persistent user account in PostgreSQL / backend store
export interface AppUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  password_hash: string; // bcrypt hash
  role: 'commuter' | 'transit_admin';
  mfa_enabled: boolean;
  mfa_secret?: string; // AES-256-GCM ciphertext
  mfa_secret_iv?: string;
  mfa_secret_tag?: string;
  legacy_source?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

// Interface for transit service alert
export interface TransitServiceAlert {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'severe';
  route_id?: string;
  affected_stations: string[];
  active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Server-side Supabase client for backend operations
function getSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://qrcuvjgimkycijxbrpaj.supabase.co';
  // Use service-role key for backend operations if provided; fallback to anon key
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (url && key && !key.includes('your-anon')) {
    try {
      return createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    } catch (err) {
      console.warn('[Backend AuthStore] Supabase client init error:', err);
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// LOCAL FALLBACK STORE (SYNCED WITH SUPABASE WHEN ONLINE)
// Guarantees zero downtime and complete multi-container testability
// ─────────────────────────────────────────────────────────────

function readLocalUsers(): AppUser[] {
  try {
    if (!fs.existsSync(PERSISTENT_AUTH_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(PERSISTENT_AUTH_FILE, 'utf-8');
    return JSON.parse(raw) as AppUser[];
  } catch (err) {
    console.error('[Backend AuthStore] Failed to read app_users.json:', err);
    return [];
  }
}

function writeLocalUsers(users: AppUser[]): void {
  try {
    const tmp = `${PERSISTENT_AUTH_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmp, JSON.stringify(users, null, 2), 'utf-8');
    fs.renameSync(tmp, PERSISTENT_AUTH_FILE);
  } catch (err) {
    console.error('[Backend AuthStore] Failed to write app_users.json:', err);
  }
}

function readLocalAlerts(): TransitServiceAlert[] {
  try {
    if (!fs.existsSync(ALERTS_FILE)) {
      const defaultAlerts: TransitServiceAlert[] = [
        {
          id: 'a0000000-0000-0000-0000-000000000001',
          title: 'Anna Salai Metro Corridor Track Maintenance',
          description: 'Scheduled maintenance between Nandanam and Guindy stations. 10-minute headway in effect.',
          severity: 'warning',
          route_id: 'CMRL_1',
          affected_stations: ['Nandanam', 'Saidapet', 'Little Mount', 'Guindy'],
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      fs.writeFileSync(ALERTS_FILE, JSON.stringify(defaultAlerts, null, 2), 'utf-8');
      return defaultAlerts;
    }
    const raw = fs.readFileSync(ALERTS_FILE, 'utf-8');
    return JSON.parse(raw) as TransitServiceAlert[];
  } catch (err) {
    console.error('[Backend AuthStore] Failed to read alerts:', err);
    return [];
  }
}

function writeLocalAlerts(alerts: TransitServiceAlert[]): void {
  try {
    const tmp = `${ALERTS_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmp, JSON.stringify(alerts, null, 2), 'utf-8');
    fs.renameSync(tmp, ALERTS_FILE);
  } catch (err) {
    console.error('[Backend AuthStore] Failed to write alerts:', err);
  }
}

// ─────────────────────────────────────────────────────────────
// USER OPERATIONS (SUPABASE PRIMARY, FILE-BACKED RESILIENCE)
// ─────────────────────────────────────────────────────────────

export async function findUserByIdentifier(identifier: string): Promise<AppUser | null> {
  const clean = identifier.trim().toLowerCase();
  const client = getSupabaseServerClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('app_users')
        .select('*')
        .or(`email.ilike.${clean},username.ilike.${clean}`)
        .limit(1);

      if (!error && data && data.length > 0) {
        return data[0] as AppUser;
      }
    } catch (err) {
      console.warn('[Backend AuthStore] Supabase query fallback:', err);
    }
  }

  // Fallback to persistent local file store
  const localUsers = readLocalUsers();
  return (
    localUsers.find(
      (u) => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
    ) || null
  );
}

export async function findUserById(id: string): Promise<AppUser | null> {
  const client = getSupabaseServerClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('app_users')
        .select('*')
        .eq('id', id)
        .limit(1);

      if (!error && data && data.length > 0) {
        return data[0] as AppUser;
      }
    } catch (err) {
      console.warn('[Backend AuthStore] Supabase findById fallback:', err);
    }
  }

  const localUsers = readLocalUsers();
  return localUsers.find((u) => u.id === id) || null;
}

export async function createUser(
  userData: Omit<AppUser, 'id' | 'created_at' | 'updated_at'>
): Promise<AppUser> {
  const now = new Date().toISOString();
  const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const newUser: AppUser = {
    ...userData,
    id,
    created_at: now,
    updated_at: now,
  };

  const client = getSupabaseServerClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('app_users')
        .insert([newUser])
        .select();

      if (!error && data && data.length > 0) {
        const created = data[0] as AppUser;
        // Keep local fallback in sync
        const local = readLocalUsers();
        local.push(created);
        writeLocalUsers(local);
        return created;
      }
    } catch (err) {
      console.warn('[Backend AuthStore] Supabase insert fallback:', err);
    }
  }

  // Local persistent storage
  const local = readLocalUsers();
  local.push(newUser);
  writeLocalUsers(local);
  return newUser;
}

export async function updateUser(
  id: string,
  updates: Partial<AppUser>
): Promise<AppUser | null> {
  const now = new Date().toISOString();
  const payload = { ...updates, updated_at: now };

  const client = getSupabaseServerClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('app_users')
        .update(payload)
        .eq('id', id)
        .select();

      if (!error && data && data.length > 0) {
        const updated = data[0] as AppUser;
        const local = readLocalUsers();
        const idx = local.findIndex((u) => u.id === id);
        if (idx !== -1) local[idx] = updated;
        writeLocalUsers(local);
        return updated;
      }
    } catch (err) {
      console.warn('[Backend AuthStore] Supabase update fallback:', err);
    }
  }

  const local = readLocalUsers();
  const idx = local.findIndex((u) => u.id === id);
  if (idx === -1) return null;

  local[idx] = { ...local[idx], ...payload };
  writeLocalUsers(local);
  return local[idx];
}

// ─────────────────────────────────────────────────────────────
// SAFE SCRYPT-TO-BCRYPT MIGRATION FOR LEGACY ACCOUNTS
// Checks data/users.json; if verified, creates a new bcrypt record
// ─────────────────────────────────────────────────────────────

export async function checkAndMigrateLegacyUser(
  identifier: string,
  plainTextPassword: string
): Promise<AppUser | null> {
  if (!fs.existsSync(USERS_FILE)) return null;

  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    const legacyUsers = JSON.parse(raw);
    const clean = identifier.trim().toLowerCase();

    const legacy = legacyUsers.find(
      (u: any) =>
        (u.username && u.username.toLowerCase() === clean) ||
        (u.id && u.id.toLowerCase() === clean)
    );

    if (!legacy || !legacy.passwordHash || !legacy.salt) {
      return null;
    }

    // Verify scrypt hash
    const isValid = verifyLegacyScrypt(plainTextPassword, legacy.salt, legacy.passwordHash);
    if (!isValid) {
      return null;
    }

    console.log(`[Migration] Migrating legacy scrypt user "${legacy.username}" to bcrypt...`);
    const newBcryptHash = await hashPassword(plainTextPassword);

    const migratedUser = await createUser({
      email: `${legacy.username.toLowerCase()}@madrasmacha.local`,
      username: legacy.username.toLowerCase(),
      full_name: legacy.fullName || legacy.username,
      password_hash: newBcryptHash,
      role: 'commuter',
      mfa_enabled: false, // User must enroll in TOTP MFA
      legacy_source: 'scrypt_migrated',
    });

    return migratedUser;
  } catch (err) {
    console.error('[Migration] Error migrating legacy user:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// TRANSIT SERVICE ALERTS OPERATIONS
// ─────────────────────────────────────────────────────────────

export async function getActiveServiceAlerts(): Promise<TransitServiceAlert[]> {
  const client = getSupabaseServerClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('transit_service_alerts')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as TransitServiceAlert[];
      }
    } catch (err) {
      console.warn('[Backend AuthStore] Supabase alerts query fallback:', err);
    }
  }
  return readLocalAlerts().filter((a) => a.active);
}

export async function createServiceAlert(
  data: Omit<TransitServiceAlert, 'id' | 'created_at' | 'updated_at'>
): Promise<TransitServiceAlert> {
  const now = new Date().toISOString();
  const id = `alt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const newAlert: TransitServiceAlert = {
    ...data,
    id,
    created_at: now,
    updated_at: now,
  };

  const client = getSupabaseServerClient();
  if (client) {
    try {
      const { data: inserted, error } = await client
        .from('transit_service_alerts')
        .insert([newAlert])
        .select();

      if (!error && inserted && inserted.length > 0) {
        const item = inserted[0] as TransitServiceAlert;
        const local = readLocalAlerts();
        local.unshift(item);
        writeLocalAlerts(local);
        return item;
      }
    } catch (err) {
      console.warn('[Backend AuthStore] Supabase insert alert fallback:', err);
    }
  }

  const local = readLocalAlerts();
  local.unshift(newAlert);
  writeLocalAlerts(local);
  return newAlert;
}

export async function updateServiceAlert(
  id: string,
  updates: Partial<TransitServiceAlert>
): Promise<TransitServiceAlert | null> {
  const now = new Date().toISOString();
  const payload = { ...updates, updated_at: now };

  const client = getSupabaseServerClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('transit_service_alerts')
        .update(payload)
        .eq('id', id)
        .select();

      if (!error && data && data.length > 0) {
        const updated = data[0] as TransitServiceAlert;
        const local = readLocalAlerts();
        const idx = local.findIndex((a) => a.id === id);
        if (idx !== -1) local[idx] = updated;
        writeLocalAlerts(local);
        return updated;
      }
    } catch (err) {
      console.warn('[Backend AuthStore] Supabase update alert fallback:', err);
    }
  }

  const local = readLocalAlerts();
  const idx = local.findIndex((a) => a.id === id);
  if (idx === -1) return null;

  local[idx] = { ...local[idx], ...payload };
  writeLocalAlerts(local);
  return local[idx];
}

export async function deleteServiceAlert(id: string): Promise<boolean> {
  const client = getSupabaseServerClient();
  if (client) {
    try {
      const { error } = await client
        .from('transit_service_alerts')
        .delete()
        .eq('id', id);

      if (!error) {
        const local = readLocalAlerts().filter((a) => a.id !== id);
        writeLocalAlerts(local);
        return true;
      }
    } catch (err) {
      console.warn('[Backend AuthStore] Supabase delete alert fallback:', err);
    }
  }

  const local = readLocalAlerts();
  const filtered = local.filter((a) => a.id !== id);
  if (filtered.length !== local.length) {
    writeLocalAlerts(filtered);
    return true;
  }
  return false;
}
