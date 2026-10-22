'use client';

import { useEffect, useState } from 'react';
import {
  UserCheck,
  UserPlus,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { api, asArray } from '@/lib/api';
import { RequireRole } from '@/lib/auth';
import { Empty, ErrorState, Loading } from '@/components/States';
import { StatusBadge } from '@/components/StatusBadge';
import type { User } from '@/lib/types';

export default function AdminStaffPage() {
  return (
    <RequireRole allow={['admin']}>
      <StaffInner />
    </RequireRole>
  );
}

function StaffInner() {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [adding, setAdding] = useState(false);

  async function muat() {
    setLoading(true);
    setError('');
    try {
      const res = await api<unknown>('/api/users');
      const semua = asArray<User>(res);
      setStaff(
        semua.filter(
          (u) =>
            u.role === 'staff' ||
            (u.role as string) === 'PETUGAS',
        ),
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Gagal memuat daftar staf.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muat();
  }, []);

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    setAdding(true);
    try {
      try {
        await api('/api/users', {
          method: 'POST',
          body: JSON.stringify({
            name: form.fullName.trim(),
            fullName: form.fullName.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password,
            role: 'PETUGAS',
          }),
        });
      } catch {
        // Fallback: register then promote role
        const reg = await api<{ id?: string; user?: { id?: string } }>(
          '/api/auth/register',
          {
            method: 'POST',
            auth: false,
            body: JSON.stringify({
              name: form.fullName.trim(),
              email: form.email.trim().toLowerCase(),
              password: form.password,
            }),
          },
        );
        const newId = reg?.id || reg?.user?.id;
        if (newId) {
          await api(`/api/users/${newId}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ role: 'PETUGAS' }),
          }).catch(() => null);
        }
      }
      setForm({ fullName: '', email: '', password: '' });
      setMsg('Akun staf petugas berhasil didaftarkan.');
      await muat();
    } catch (err) {
      setMsg(
        err instanceof Error ? err.message : 'Gagal membuat akun petugas.',
      );
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Kelola Akun Petugas &amp; Staf
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Daftarkan akun staf baru yang berwenang memvalidasi permohonan dan menerima pengembalian.
        </p>
      </div>

      {msg && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50/90 p-3.5 text-xs text-blue-900"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
          <div className="leading-relaxed">{msg}</div>
        </div>
      )}

      {/* Add Staff Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <UserPlus className="h-4 w-4 text-blue-600" />
          <span>Buat Akun Petugas Baru</span>
        </h2>

        <form onSubmit={handleAddStaff} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Petugas <span className="text-rose-500">*</span>
              </label>
              <input
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="mis. Budi Prasetyo, S.Kom"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email Dinas <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="petugas@sekolah.id"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi Awal <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 8 karakter"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={adding}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-60"
            >
              {adding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Daftarkan Akun Petugas</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Staff List */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Daftar Petugas Terdaftar ({staff.length})
        </h2>

        {loading && <Loading text="Memuat akun staf..." />}
        {error && !loading && <ErrorState message={error} onRetry={muat} />}

        {!loading && !error && staff.length === 0 && (
          <Empty
            title="Belum Ada Petugas"
            text="Gunakan formulir di atas untuk membuat akun staf pertama."
          />
        )}

        {!loading && !error && staff.length > 0 && (
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/90 bg-white shadow-xs">
            {staff.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-4 text-xs hover:bg-slate-50/60 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700 font-bold text-sm">
                    {(s.fullName || s.name || s.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      {s.fullName || s.name || 'Petugas'}
                    </p>
                    <p className="text-[11px] text-slate-400">{s.email}</p>
                  </div>
                </div>

                <StatusBadge value="staff" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
