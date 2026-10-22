'use client';

import { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Shield,
  Phone,
  GraduationCap,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { RequireRole, useAuth } from '@/lib/auth';
import { ErrorState, Loading } from '@/components/States';
import { StatusBadge } from '@/components/StatusBadge';

export default function ProfilePage() {
  return (
    <RequireRole allow={['student', 'staff', 'admin']}>
      <ProfileInner />
    </RequireRole>
  );
}

function ProfileInner() {
  const { user, refreshMe } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName ?? '',
    class: user?.class ?? '',
    major: user?.major ?? '',
    phone: user?.phone ?? '',
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return <Loading text="Menyiapkan data profil..." />;

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);
    try {
      const payload = {
        name: form.fullName.trim(),
        fullName: form.fullName.trim(),
        class_name: form.class.trim() || undefined,
        class: form.class.trim() || undefined,
        major: form.major.trim() || undefined,
        phone: form.phone.trim() || undefined,
      };

      try {
        await api('/api/users/profile', {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } catch {
        await api('/api/profile', {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      }
      await refreshMe();
      setMsg('Perubahan profil berhasil disimpan.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal memperbarui profil pengguna.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Profil Pengguna
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Kelola data identitas dan kontak aktif Anda di ekosistem SchoolRent.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 font-bold text-xl shadow-xs">
            {(user.fullName || user.email)[0].toUpperCase()}
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              {user.fullName || 'Nama Belum Diatur'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>{user.email}</span>
            </div>
          </div>
        </div>
        <StatusBadge value={user.role} />
      </div>

      {/* Profile Form Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Informasi Personal &amp; Akademik
        </h3>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {msg && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-800"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            <div className="leading-relaxed">{msg}</div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              placeholder="Nama lengkap sesuai kartu pelajar"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kelas
              </label>
              <input
                type="text"
                value={form.class}
                onChange={(e) => set('class', e.target.value)}
                placeholder="mis. XII RPL 2"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jurusan / Konsentrasi
              </label>
              <input
                type="text"
                value={form.major}
                onChange={(e) => set('major', e.target.value)}
                placeholder="mis. Teknik Komputer & Jaringan"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
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
              placeholder="08xxxxxxxxxx"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan Perubahan...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Perubahan Profil</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
