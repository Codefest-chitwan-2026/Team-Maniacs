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

  const [
    { count: totalUsers },
    { count: totalReports },
    { count: pendingReports },
    { count: verifiedReports },
    { count: activeSos },
    { count: totalVolunteers },
    { data: recentReports },
    { data: recentSos },
  ] = await Promise.all([
    supabaseServer.from('profiles').select('*', { count: 'exact', head: true }),
    supabaseServer.from('disaster_reports').select('*', { count: 'exact', head: true }),
    supabaseServer.from('disaster_reports').select('*', { count: 'exact', head: true }).eq('status', 'NEW'),
    supabaseServer.from('disaster_reports').select('*', { count: 'exact', head: true }).eq('verified', true),
    supabaseServer.from('sos_alerts').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
    supabaseServer.from('profiles').select('*', { count: 'exact', head: true }).eq('is_volunteer', true),
    supabaseServer.from('disaster_reports').select('id, title, description, category, severity, status, created_at, user_name').order('created_at', { ascending: false }).limit(5),
    supabaseServer.from('sos_alerts').select('id, status, notes, created_at, latitude, longitude').eq('status', 'ACTIVE').order('created_at', { ascending: false }).limit(5),
  ]);

  return NextResponse.json({
    ok: true,
    stats: {
      totalUsers: totalUsers || 0,
      totalReports: totalReports || 0,
      pendingReports: pendingReports || 0,
      verifiedReports: verifiedReports || 0,
      activeSos: activeSos || 0,
      totalVolunteers: totalVolunteers || 0,
    },
    recentReports: recentReports || [],
    recentSos: recentSos || [],
  });
}
