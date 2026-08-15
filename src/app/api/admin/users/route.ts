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
  const role = url.searchParams.get('role');

  if (id) {
    const { data, error } = await supabaseServer
      .from('profiles')
      .select('id, name, email, phone, role, satark_points, rank, is_volunteer, location, created_at')
      .eq('id', id)
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { data: reports } = await supabaseServer
      .from('disaster_reports')
      .select('id, title, description, status, category, severity, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: tx } = await supabaseServer
      .from('satark_points_transactions')
      .select('id, points, reason, reference_type, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({ ok: true, profile: { ...data, reports, transactions: tx } });
  }

  let query = supabaseServer
    .from('profiles')
    .select('id, name, email, phone, role, satark_points, rank, is_volunteer, created_at')
    .order('created_at', { ascending: false });

  if (q) query = query.ilike('name', `%${q}%`);
  if (role) query = query.eq('role', role);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, users: data });
}

export async function POST(req: Request) {
  if (!supabaseServer) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { action, id, role } = body;
  if (!action || !id) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  if (action === 'set_role') {
    if (!role) return NextResponse.json({ error: 'Missing role' }, { status: 400 });
    const validRoles = ['citizen', 'volunteer', 'admin', 'coordinator'];
    if (!validRoles.includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });

    const updateData: any = { role };
    if (role === 'volunteer') updateData.is_volunteer = true;
    if (role === 'citizen') updateData.is_volunteer = false;

    const { error } = await supabaseServer.from('profiles').update(updateData).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'verify') {
    const { error } = await supabaseServer.from('profiles').update({ role: 'volunteer', is_volunteer: true }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
