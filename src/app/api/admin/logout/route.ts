import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('satark_admin_id', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 });
  return res;
}
