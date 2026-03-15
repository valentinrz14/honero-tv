import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Use service role key for admin panel (bypasses RLS)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface User {
  id: string;
  access_code: string;
  label: string;
  max_devices: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  user_id: string;
  device_id: string;
  device_name: string | null;
  registered_at: string;
  expires_at: string;
  is_active: boolean;
  last_seen_at: string | null;
}

// Generate a random 6-digit code
export function generateAccessCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Calculate days remaining
export function daysRemaining(expiresAt: string): number {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Status badge color based on days remaining
export function expiryStatus(expiresAt: string, isActive: boolean): 'ok' | 'warning' | 'expired' | 'revoked' {
  if (!isActive) return 'revoked';
  const days = daysRemaining(expiresAt);
  if (days <= 0) return 'expired';
  if (days <= 5) return 'warning';
  return 'ok';
}
