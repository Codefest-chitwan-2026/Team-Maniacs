import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

async function isAdmin(req: Request) {
  // Prefer cookie-based admin id
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

  const { data, error } = await supabaseServer.from('disaster_reports').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, reports: data });
}

export async function POST(req: Request) {
  // Expected body: { action: 'verify'|'reject'|'delete', id }
  if (!supabaseServer) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { action, id } = body;
  if (!action || !id) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  if (action === 'verify') {
    const { error } = await supabaseServer.from('disaster_reports').update({ status: 'VERIFIED', verified: true }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'reject') {
    const { error } = await supabaseServer.from('disaster_reports').update({ status: 'REJECTED' }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'delete') {
    const { error } = await supabaseServer.from('disaster_reports').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
