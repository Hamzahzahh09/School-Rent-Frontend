import { NextResponse, type NextRequest } from 'next/server';
import { API_BASE, SESSION_COOKIE } from '@/lib/config';
import type { Role } from '@/lib/types';

const ALL_ROLES: Role[] = ['student', 'staff', 'admin'];

function normalizeRole(value: unknown): Role {
  const role = String(value ?? 'SISWA').toUpperCase();
  if (role === 'ADMIN') return 'admin';
  if (role === 'PETUGAS' || role === 'STAFF') return 'staff';
  return 'student';
}

/** Peta akses route. Backend tetap wajib memeriksa role pada setiap endpoint. */
function allowedRoles(pathname: string): Role[] {
  if (
    pathname === '/admin' ||
    pathname.startsWith('/admin/users') ||
    pathname.startsWith('/admin/staff')
  ) {
    return ['admin'];
  }
  if (pathname.startsWith('/admin/')) return ['staff', 'admin'];

  // Daftar pinjaman, form pengajuan, riwayat, dan denda pribadi khusus siswa.
  // Detail /loans/:id juga dibuka petugas/admin dari portal verifikasi.
  if (
    pathname === '/loans' ||
    pathname.startsWith('/loans/create') ||
    pathname.startsWith('/history') ||
    pathname.startsWith('/fines')
  ) {
    return ['student'];
  }
  return ALL_ROLES;
}

function loginRedirect(request: NextRequest, clearCookie: boolean) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
  const response = NextResponse.redirect(loginUrl);
  if (clearCookie) response.cookies.delete(SESSION_COOKIE);
  return response;
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return loginRedirect(request, false);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    // Backend tidak dapat dihubungi: tolak akses, tetapi jangan hapus sesi yang mungkin masih valid.
    return loginRedirect(request, false);
  }

  if (response.status === 401 || response.status === 403) {
    return loginRedirect(request, true);
  }
  if (!response.ok) return loginRedirect(request, false);

  let role: Role = 'student';
  try {
    const raw = (await response.json()) as Record<string, unknown>;
    const data = (raw.data ?? raw.user ?? raw) as Record<string, unknown>;
    const nested = (data.user ?? data) as Record<string, unknown>;
    role = normalizeRole(nested.role);
  } catch {
    return loginRedirect(request, false);
  }

  if (!allowedRoles(request.nextUrl.pathname).includes(role)) {
    return NextResponse.redirect(new URL('/dashboard?akses=ditolak', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/loans/:path*',
    '/history/:path*',
    '/fines/:path*',
    '/notifications/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
};
