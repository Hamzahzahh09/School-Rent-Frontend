import { NextResponse } from 'next/server';
import { API_BASE, SESSION_COOKIE } from '@/lib/config';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

/** Tolak permintaan lintas situs agar situs lain tidak bisa menanam sesi. */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: 'Asal permintaan tidak diizinkan.' }, { status: 403 });
  }

  let token = '';
  try {
    const body = (await request.json()) as { token?: unknown };
    token = typeof body.token === 'string' ? body.token.trim() : '';
  } catch {
    return NextResponse.json({ message: 'Permintaan sesi tidak valid.' }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ message: 'Token sesi wajib diisi.' }, { status: 400 });
  }

  let verification: Response;
  try {
    verification = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return NextResponse.json(
      { message: 'Server autentikasi tidak dapat dihubungi.' },
      { status: 503 },
    );
  }

  if (!verification.ok) {
    return NextResponse.json({ message: 'Token sesi tidak valid.' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, token, { ...cookieOptions, maxAge: 60 * 60 * 24 * 7 });
  return response;
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: 'Asal permintaan tidak diizinkan.' }, { status: 403 });
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, '', { ...cookieOptions, expires: new Date(0) });
  return response;
}
