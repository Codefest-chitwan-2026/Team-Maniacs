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
  const { data, error } = await supabaseServer.from('satark_points_transactions').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, transactions: data });
}

export async function POST(req: Request) {
  if (!supabaseServer) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { action, userId, points, reason, referenceType, referenceId } = body;
  if (action === 'award') {
    if (!userId || !points) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    const txId = `TX-${Math.floor(100000 + Math.random() * 900000)}`;
    const { error: e1 } = await supabaseServer.from('satark_points_transactions').insert([{ id: txId, user_id: userId, points, reason: reason || 'Awarded by admin', reference_type: referenceType || 'admin', reference_id: referenceId || null }]);
    if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

    // Read current points and update
    const { data: profileData, error: eRead } = await supabaseServer.from('profiles').select('satark_points').eq('id', userId).limit(1).maybeSingle();
    if (eRead) return NextResponse.json({ error: eRead.message }, { status: 500 });
    const current = (profileData && (profileData as any).satark_points) || 0;
    const newPoints = current + points;
    const { error: e2 } = await supabaseServer.from('profiles').update({ satark_points: newPoints }).eq('id', userId);
    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
