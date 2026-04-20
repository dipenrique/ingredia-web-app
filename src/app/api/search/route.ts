import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL ?? 'http://localhost:4001';
const INTERNAL_SECRET = process.env.API_INTERNAL_SECRET ?? '';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const url = new URL('/api/search', API_BASE);
  searchParams.forEach((value, key) => url.searchParams.set(key, value));

  const headers: HeadersInit = {};
  if (INTERNAL_SECRET) headers['x-internal-secret'] = INTERNAL_SECRET;

  try {
    const res = await fetch(url.toString(), { headers });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
  }
}
