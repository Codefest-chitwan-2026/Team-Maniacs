import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  if (!supabaseServer) return NextResponse.json({ ok: false }, { status: 500 });
  const body = await req.json().catch(() => ({}));
  const { id } = body;
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });

  const { data, error } = await supabaseServer.from('profiles').select('role').eq('id', id).limit(1).maybeSingle();
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  if (!data) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, role: data.role });
}
