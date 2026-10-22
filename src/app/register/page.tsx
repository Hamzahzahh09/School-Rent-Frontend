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
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    class: '',
    major: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Kata sandi minimal 8 karakter.');
      return;
    }
    if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      setError('Kata sandi harus mengandung kombinasi huruf dan angka.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        class: form.class.trim() || undefined,
        major: form.major.trim() || undefined,
        phone: form.phone.trim() || undefined,
      });
      router.push('/login');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Pendaftaran gagal. Silakan coba kembali.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-6">
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
            Daftar Akun Siswa
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Registrasi publik ditujukan untuk siswa. Akun staf &amp; administrator
            dikelola oleh admin sistem.
          </p>
        </div>

        {/* Register Card */}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Siswa <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                placeholder="mis. Muhammad Raihan"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email Siswa <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="raihan@siswa.sekolah.id"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kelas
                </label>
                <input
                  type="text"
                  value={form.class}
                  onChange={(e) => set('class', e.target.value)}
                  placeholder="mis. XII RPL 1"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jurusan / Program
                </label>
                <input
                  type="text"
                  value={form.major}
                  onChange={(e) => set('major', e.target.value)}
                  placeholder="mis. Rekayasa Perangkat Lunak"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor WhatsApp / HP Aktif
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="081234567890"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Sandi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    placeholder="Min. 8 karakter"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-9 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ulangi Sandi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={form.confirmPassword}
                    onChange={(e) => set('confirmPassword', e.target.value)}
                    placeholder="Konfirmasi"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-9 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              Sandi harus memuat minimal 8 karakter dengan perpaduan huruf dan angka.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mendaftarkan akun...</span>
                </>
              ) : (
                <>
                  <span>Daftar Sebagai Siswa</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <p className="text-xs text-slate-500">
              Sudah memiliki akun terdaftar?{' '}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
