import { createClient } from "@supabase/supabase-js";

// Helper to safely extract and validate URL and Anon key
function getValidatedUrl() {
  const envObj = typeof import.meta !== 'undefined' && import.meta?.env ? import.meta.env : (typeof process !== 'undefined' ? process.env : {});
  const raw = ((envObj && envObj.VITE_SUPABASE_URL) || (envObj && envObj.SUPABASE_URL) || '').trim();
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }
  // Check if anon key had the URL by mistake
  const keyRaw = ((envObj && envObj.VITE_SUPABASE_ANON_KEY) || (envObj && envObj.SUPABASE_ANON_KEY) || '').trim();
  if (keyRaw.startsWith('http://') || keyRaw.startsWith('https://')) {
    return keyRaw;
  }
  // If a JWT token was accidentally provided in VITE_SUPABASE_URL, extract project ref
  if (raw.includes('.')) {
    try {
      const parts = raw.split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload?.ref) {
          return `https://${payload.ref}.supabase.co`;
        }
      }
    } catch {
      // ignore
    }
  }
  return 'https://qrcuvjgimkycijxbrpaj.supabase.co';
}

function getValidatedKey() {
  const envObj = typeof import.meta !== 'undefined' && import.meta?.env ? import.meta.env : (typeof process !== 'undefined' ? process.env : {});
  const rawKey = ((envObj && envObj.VITE_SUPABASE_ANON_KEY) || (envObj && envObj.SUPABASE_ANON_KEY) || (envObj && envObj.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) || '').trim();
  if (rawKey && !rawKey.startsWith('http://') && !rawKey.startsWith('https://')) {
    return rawKey;
  }
  const rawUrl = ((envObj && envObj.VITE_SUPABASE_URL) || '').trim();
  if (rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    return rawUrl;
  }
  return '';
}

const supabaseUrl = getValidatedUrl();
const supabaseAnonKey = getValidatedKey();

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
