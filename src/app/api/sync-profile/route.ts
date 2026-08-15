import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { id, name, email, phone } = body;
  if (!supabaseServer) return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 });
  if (!id || !email) return NextResponse.json({ ok: false, error: 'Missing id/email' }, { status: 400 });

  // Force role to 'citizen' for normal syncs
  const payload = {
    id,
    name: name || 'Unnamed',
    email,
    phone: phone || null,
    role: 'citizen',
  };

  const { data, error } = await supabaseServer.from('profiles').upsert(payload, { onConflict: ['id', 'email'] }).select().limit(1).maybeSingle();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, profile: data });
}
