import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body;

  // If Supabase configured, validate against profiles.password_hash
  if (supabaseServer) {
    const { data, error } = await supabaseServer.from('profiles').select('id, role, password_hash').eq('email', email).limit(1).maybeSingle();
    if (error) return NextResponse.json({ error: 'Server error' }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const match = data.password_hash ? bcrypt.compareSync(password || '', data.password_hash) : false;
    if (!match) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    if (data.role !== 'admin') return NextResponse.json({ error: 'Not an admin' }, { status: 403 });

    const res = NextResponse.json({ ok: true });
    // Set HTTP-only cookie to the admin profile id
    res.cookies.set('satark_admin_id', data.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    });
    return res;
  }

  // Fallback: legacy env-based admin
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD && process.env.ADMIN_TOKEN) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set('satark_admin_id', process.env.ADMIN_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    });
    return res;
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
