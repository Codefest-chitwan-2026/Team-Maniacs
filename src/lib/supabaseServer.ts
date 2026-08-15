import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!url || !serviceKey) {
  // We intentionally don't throw here to allow local dev without Supabase configured.
}

export const supabaseServer = url && serviceKey ? createClient(url, serviceKey) : null;

export async function ensureAdminById(id: string) {
  if (!supabaseServer) return false;
  const { data, error } = await supabaseServer.from('profiles').select('role').eq('id', id).limit(1).maybeSingle();
  if (error) return false;
  return data?.role === 'admin';
}
