'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  Package,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Email dan kata sandi wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.push('/dashboard');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Login gagal. Silakan coba lagi.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 transition hover:opacity-90"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Package className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              School<span className="text-blue-600">Rent</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 pt-1">
            Selamat Datang Kembali
          </h1>
          <p className="text-xs text-slate-500">
            Masuk ke portal peminjaman perlengkapan dan sarana sekolah
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Alamat Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@sekolah.id"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memverifikasi akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Akun</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration link */}
          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <p className="text-xs text-slate-500">
              Belum terdaftar sebagai peminjam?{' '}
              <Link
                href="/register"
                className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2"
              >
                Daftar akun siswa
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge note */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
          <span>Autentikasi sesi tersinkronisasi dengan aman</span>
        </div>
      </div>
    </div>
  );
}
