import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { secret, email, password, name } = body;

  const SEED_SECRET = process.env.SEED_ADMIN_SECRET || '';
  if (!SEED_SECRET || secret !== SEED_SECRET) return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  if (!supabaseServer) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

  // Create a profile with admin role; if profile exists, update role
  const id = crypto.randomUUID();
  const password_hash = bcrypt.hashSync(password || 'password', 10);

  // Upsert into profiles
  const payload = {
    id,
    name: name || 'Satark Admin',
    email,
    phone: null,
    location: 'Admin',
    language: 'en',
    role: 'admin',
    satark_points: 0,
    is_volunteer: false,
    rank: 'Guardian',
    password_hash,
  };

  const { data, error } = await supabaseServer.from('profiles').upsert(payload, { onConflict: 'email' }).select().limit(1).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, profile: data });
}
