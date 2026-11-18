'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, api, getToken, setToken } from './api';
import type { Role, User } from './types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    fullName: string;
    email: string;
    password: string;
    class?: string;
    major?: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function normalizeUser(raw: unknown): User | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const u = (o.user ?? o.data ?? o) as Record<string, unknown>;
  if (!u || typeof u !== 'object' || !('email' in u)) return null;

  const rawRole = String(u.role ?? 'SISWA').toUpperCase();
  let role: Role = 'student';
  if (rawRole === 'ADMIN') role = 'admin';
  else if (rawRole === 'PETUGAS' || rawRole === 'STAFF') role = 'staff';
  else role = 'student';

  const cName = (u.class_name as string) || (u.class as string) || null;
  const aUrl = (u.avatar_url as string) || (u.avatarUrl as string) || null;
  const act = typeof u.is_active === 'boolean' ? u.is_active : typeof u.isActive === 'boolean' ? u.isActive : true;

  return {
    id: String(u.id ?? ''),
    fullName: (u.name ?? u.fullName ?? '') as string,
    name: (u.name ?? u.fullName ?? '') as string,
    email: String(u.email ?? ''),
    role,
    class: cName,
    class_name: cName,
    major: (u.major as string) ?? null,
    phone: (u.phone as string) ?? null,
    avatarUrl: aUrl,
    avatar_url: aUrl,
    isActive: act,
    is_active: act,
  };
}

function extractToken(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const direct = o.accessToken ?? o.access_token ?? o.token;
  if (typeof direct === 'string') return direct;
  const nested = o.data as Record<string, unknown> | undefined;
  const inner =
    nested?.accessToken ?? nested?.access_token ?? nested?.token;
  return typeof inner === 'string' ? inner : null;
}

async function syncServerSession(token: string | null) {
  const response = await fetch('/api/session', {
    method: token ? 'POST' : 'DELETE',
    headers: token ? { 'Content-Type': 'application/json' } : undefined,
    body: token ? JSON.stringify({ token }) : undefined,
  });
  if (!response.ok) {
    throw new Error('Sesi aman tidak dapat dibuat. Silakan masuk kembali.');
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    const t = getToken();
    if (!t) {
      setUser(null);
      setTokenState(null);
      return;
    }
    setTokenState(t);
    try {
      const me = await api<unknown>('/api/auth/me');
      const normalized = normalizeUser(me);
      if (!normalized) throw new ApiError(401, 'Profil sesi tidak valid.');
      setUser(normalized);
    } catch (error) {
      setUser(null);
      setTokenState(null);
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        setToken(null);
        await syncServerSession(null).catch(() => undefined);
      }
      return;
    }
    // Sesi lama (sebelum cookie server ada) ikut disinkronkan. Kegagalan di sini
    // tidak membuat pengguna keluar, karena backend sudah memvalidasi token.
    await syncServerSession(t).catch(() => undefined);
  }, []);

  useEffect(() => {
    refreshMe().finally(() => setLoading(false));
  }, [refreshMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api<unknown>('/api/auth/login', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email, password }),
      });
      const t = extractToken(res);
      if (!t) throw new Error('Login gagal. Server tidak mengirim token sesi.');

      setToken(t);
      try {
        await syncServerSession(t);
      } catch (error) {
        setToken(null);
        throw error;
      }
      setTokenState(t);

      const u = normalizeUser(res);
      if (u) {
        setUser(u);
        return;
      }
      // Respons login hanya berisi token: ambil profil dari /me.
      await refreshMe();
    },
    [refreshMe],
  );

  const register = useCallback(async (input: {
    fullName: string;
    email: string;
    password: string;
    class?: string;
    major?: string;
    phone?: string;
  }) => {
    await api('/api/auth/register', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({
        name: input.fullName,
        fullName: input.fullName,
        email: input.email,
        password: input.password,
        class_name: input.class || undefined,
        class: input.class || undefined,
        major: input.major || undefined,
        phone: input.phone || undefined,
      }),
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch {
      // Abaikan; tetap bersihkan sesi lokal.
    }
    setToken(null);
    await syncServerSession(null).catch(() => undefined);
    setUser(null);
    setTokenState(null);
    router.push('/login');
  }, [router]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshMe }),
    [user, token, loading, login, register, logout, refreshMe],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  return ctx;
}

/** Guard role untuk halaman. Redirect ke /login jika belum login. */
export function RequireRole({
  allow,
  children,
}: {
  allow: Role[];
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const hasRole = Boolean(user && allow.includes(user.role));

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    else if (!loading && user && !hasRole) router.replace('/dashboard');
  }, [loading, user, hasRole, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse space-y-4 px-4 py-8">
        <div className="h-8 w-56 rounded bg-slate-200" />
        <div className="h-40 rounded-2xl bg-slate-200" />
      </div>
    );
  }
  if (!user) return null;
  if (!hasRole)
    return <p className="p-6 text-sm">Anda tidak memiliki akses.</p>;
  return <>{children}</>;
}
