import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Helper to retrieve public environment variables in both Vite and Next.js runtimes.
 * Never hardcode either value.
 */
function getEnvVar(key: string): string {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return String(process.env[key]).trim();
  }
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
    return String((import.meta as any).env[key]).trim();
  }
  return '';
}

// Primary project URL and ID from user specification:
// Project URL: https://qrcuvjgimkycijxbrpaj.supabase.co
// Project ID: qrcuvjgimkycijxbrpaj
export const SUPABASE_PROJECT_ID = 'qrcuvjgimkycijxbrpaj';
export const DEFAULT_SUPABASE_URL = 'https://qrcuvjgimkycijxbrpaj.supabase.co';

const supabaseUrl =
  getEnvVar('SUPABASE_URL') ||
  getEnvVar('VITE_SUPABASE_URL') ||
  getEnvVar('NEXT_PUBLIC_SUPABASE_URL') ||
  DEFAULT_SUPABASE_URL;

const supabasePublishableKey =
  getEnvVar('SUPABASE_ANON_KEY') ||
  getEnvVar('VITE_SUPABASE_ANON_KEY') ||
  getEnvVar('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ||
  getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  !supabaseUrl.includes('your-project') &&
  !supabasePublishableKey.includes('your-anon') &&
  !supabasePublishableKey.includes('your-publishable')
);

// Reusable Supabase client using current JavaScript client approach (@supabase/supabase-js v2)
// Handles database as read-only from the public client (no secret or service_role key exposed)
let cachedClient: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    cachedClient = createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err) {
    console.warn('[Supabase] Initialization error:', err);
  }
}

export const supabase = cachedClient;

export function getSupabaseClient(): SupabaseClient | null {
  return cachedClient;
}

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  url: string;
  maskedUrl: string;
  hasKey: boolean;
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  let maskedUrl = 'Not configured';
  if (supabaseUrl) {
    try {
      const parsed = new URL(supabaseUrl);
      maskedUrl = parsed.hostname;
    } catch {
      maskedUrl = supabaseUrl.slice(0, 15) + '...';
    }
  }

  return {
    isConfigured: isSupabaseConfigured,
    url: maskedUrl,
    maskedUrl,
    hasKey: Boolean(supabasePublishableKey && !supabasePublishableKey.includes('your-anon')),
  };
}
