'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  Mail,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { api, asArray } from '@/lib/api';
import { RequireRole } from '@/lib/auth';
import { Empty, ErrorState, Loading } from '@/components/States';
import { StatusBadge } from '@/components/StatusBadge';
import type { Role, User } from '@/lib/types';

export default function AdminUsersPage() {
  return (
    <RequireRole allow={['admin']}>
      <UsersInner />
    </RequireRole>
  );
}

function UsersInner() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  async function muat() {
    setLoading(true);
    setError('');
    try {
      const res = await api<unknown>('/api/users');
      setUsers(asArray<User>(res));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Gagal memuat basis data pengguna.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muat();
  }, []);

  async function toggleAktif(u: User) {
    setMsg('');
    const newStatus = !(u.isActive ?? true);
    try {
      // Try dedicated status endpoint first
      try {
        await api(`/api/users/${u.id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ is_active: newStatus, isActive: newStatus }),
        });
      } catch {
        await api(`/api/users/${u.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ is_active: newStatus, isActive: newStatus }),
        });
      }
      setMsg(
        `Akun ${u.email} berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`,
      );
      await muat();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Gagal mengubah status akun.');
    }
  }

  async function ubahRole(u: User, role: Role) {
    setMsg('');
    const roleMap: Record<string, string> = {
      student: 'SISWA',
      staff: 'PETUGAS',
      admin: 'ADMIN',
    };
    const backendRole = roleMap[role] || role.toUpperCase();
    try {
      await api(`/api/users/${u.id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: backendRole }),
      });
      setMsg(`Role untuk akun ${u.email} diperbarui menjadi ${role}.`);
      await muat();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Gagal memperbarui role akun.');
    }
  }

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (roleFilter !== 'ALL') {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((u) => {
        const name = (u.fullName || u.name || '').toLowerCase();
        const email = u.email.toLowerCase();
        const uClass = (u.class || '').toLowerCase();
        return name.includes(q) || email.includes(q) || uClass.includes(q);
      });
    }

    return result;
  }, [users, roleFilter, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Manajemen Pengguna &amp; Hak Akses
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Kelola data seluruh akun siswa, petugas inventaris, dan administrator sistem.
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

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama, email, atau kelas..."
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">Semua Role ({users.length})</option>
            <option value="student">
              Siswa ({users.filter((u) => u.role === 'student').length})
            </option>
            <option value="staff">
              Petugas ({users.filter((u) => u.role === 'staff').length})
            </option>
            <option value="admin">
              Admin ({users.filter((u) => u.role === 'admin').length})
            </option>
          </select>
        </div>
      </div>

      {/* States */}
      {loading && <Loading text="Memuat daftar pengguna..." />}
      {error && !loading && <ErrorState message={error} onRetry={muat} />}

      {!loading && !error && filteredUsers.length === 0 && (
        <Empty
          title="Pengguna Tidak Ditemukan"
          text="Tidak ada akun yang sesuai dengan pencarian atau filter yang dipilih."
        />
      )}

      {/* Table */}
      {!loading && !error && filteredUsers.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Pengguna</th>
                <th className="px-4 py-3 font-semibold">Role Sistem</th>
                <th className="px-4 py-3 font-semibold">Kelas &amp; Jurusan</th>
                <th className="px-4 py-3 font-semibold">Status Akun</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const isActive = u.isActive !== false;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-xs">
                          {(u.fullName || u.name || u.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {u.fullName || u.name || 'Pengguna'}
                          </p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={u.role}
                        onChange={(e) => ubahRole(u, e.target.value as Role)}
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 font-medium focus:border-blue-500 focus:outline-none"
                      >
                        <option value="student">student (Siswa)</option>
                        <option value="staff">staff (Petugas)</option>
                        <option value="admin">admin (Administrator)</option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {u.class ? `${u.class} ${u.major ? `• ${u.major}` : ''}` : '-'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isActive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => toggleAktif(u)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                          isActive
                            ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                            : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
