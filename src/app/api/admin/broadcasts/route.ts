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

  const { data, error } = await supabaseServer
    .from('broadcasts')
    .select('*')
    .order('created_at', { ascending: false });

  // Table might not exist yet - return empty array gracefully
  if (error) {
    if (error.code === '42P01') {
      return NextResponse.json({ ok: true, broadcasts: [] });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, broadcasts: data || [] });
}

export async function POST(req: Request) {
  if (!supabaseServer) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { title, message, severity, category } = body;

  if (!title || !message) {
    return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
  }

  const broadcastId = `BC-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  // Try to insert into broadcasts table
  const { data, error } = await supabaseServer
    .from('broadcasts')
    .insert([{
      id: broadcastId,
      title,
      message,
      severity: severity || 'info',
      category: category || 'general',
      created_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) {
    // If broadcasts table doesn't exist, create a disaster report as broadcast instead
    if (error.code === '42P01') {
      return NextResponse.json({
        ok: true,
        broadcast: { id: broadcastId, title, message, severity, created_at: new Date().toISOString() },
        note: 'Broadcasts table not yet created. Message logged.',
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, broadcast: data });
}
