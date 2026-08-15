import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

async function isAdmin(req: Request) {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/satark_admin_id=([^;]+)/);
  const id = match ? decodeURIComponent(match[1]) : null;
  if (!id) return false;
  if (!supabaseServer) return false;
  const { data } = await supabaseServer.from('profiles').select('role').eq('id', id).limit(1).maybeSingle();
  return data?.role === 'admin';
}

export async function GET(req: Request) {
  if (!supabaseServer) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Query profiles table for volunteers (is_volunteer = true)
  const { data, error } = await supabaseServer
    .from('profiles')
    .select('id, name, email, phone, location, satark_points, rank, is_volunteer, role, created_at')
    .eq('is_volunteer', true)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, volunteers: data || [] });
}

export async function POST(req: Request) {
  if (!supabaseServer) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { action, id } = body;
  if (!action || !id) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  if (action === 'verify') {
    // Mark as volunteer and set role to volunteer
    const { error } = await supabaseServer
      .from('profiles')
      .update({ is_volunteer: true, role: 'volunteer' })
      .eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'reject') {
    // Revoke volunteer status
    const { error } = await supabaseServer
      .from('profiles')
      .update({ is_volunteer: false, role: 'citizen' })
      .eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
