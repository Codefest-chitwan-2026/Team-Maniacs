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

  const url = new URL(req.url);
  const q = url.searchParams.get('q');
  const id = url.searchParams.get('id');

  if (id) {
    const { data, error } = await supabaseServer.from('profiles').select('id, name, email, phone, role, satark_points, created_at').eq('id', id).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // fetch reports and transactions for user
    const { data: reports } = await supabaseServer.from('disaster_reports').select('*').eq('user_id', id).order('created_at', { ascending: false });
    const { data: tx } = await supabaseServer.from('satark_points_transactions').select('*').eq('user_id', id).order('created_at', { ascending: false });

    return NextResponse.json({ ok: true, profile: data, reports, transactions: tx });
  }

  // list users
  let query = supabaseServer.from('profiles').select('id, name, email, phone, role, satark_points, created_at').order('created_at', { ascending: false });
  if (q) {
    query = query.ilike('name', `%${q}%`);
  }
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, users: data });
}
