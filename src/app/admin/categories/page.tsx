'use client';

import { useEffect, useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { api, asArray } from '@/lib/api';
import { RequireRole } from '@/lib/auth';
import { Empty, ErrorState, Loading } from '@/components/States';
import type { Category } from '@/lib/types';

export default function AdminCategoriesPage() {
  return (
    <RequireRole allow={['staff', 'admin']}>
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [adding, setAdding] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  async function muat() {
    setLoading(true);
    setError('');
    try {
      const res = await api<unknown>('/api/categories');
      setCats(asArray<Category>(res));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Gagal memuat kategori inventaris.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muat();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    setAdding(true);
    try {
      await api('/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim() }),
      });
      setName('');
      setMsg('Kategori baru berhasil ditambahkan.');
      await muat();
    } catch (err) {
      setMsg(
        err instanceof Error ? err.message : 'Gagal menambahkan kategori.',
      );
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    setMsg('');
    try {
      await api(`/api/categories/${id}`, { method: 'DELETE' });
      setDeleteConfirmId(null);
      setMsg('Kategori berhasil dihapus.');
      await muat();
    } catch (e) {
      setMsg(
        e instanceof Error
          ? e.message
          : 'Gagal menghapus kategori. Pastikan tidak sedang digunakan oleh barang.',
      );
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Kelola Kategori Inventaris
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Pengelompokan jenis peralatan dan fasilitas sekolah untuk kemudahan pencarian.
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

      {/* Add Category Form */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Tambah Kategori Baru
        </h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="mis. Multimedia & Proyektor, Olahraga, Lab Komputer..."
            className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
          />
          <button
            type="submit"
            disabled={adding}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            <span>{adding ? 'Menyimpan...' : 'Tambah Kategori'}</span>
          </button>
        </form>
      </div>

      {/* States */}
      {loading && <Loading text="Memuat daftar kategori..." />}
      {error && !loading && <ErrorState message={error} onRetry={muat} />}

      {!loading && !error && cats.length === 0 && (
        <Empty
          title="Belum Ada Kategori"
          text="Silakan tambahkan kategori pertama untuk mengelompokkan peralatan sekolah."
        />
      )}

      {/* Categories Grid */}
      {!loading && !error && cats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cats.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs hover:border-slate-300 transition"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900">{c.name}</h3>
                  <p className="text-[11px] text-slate-400">
                    {c.description || 'Kategori aktif'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(c.id)}
                className="rounded-lg p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Hapus Kategori"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hapus Kategori Ini?
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Penghapusan akan ditolak server jika masih ada inventaris yang
                terkait dengan kategori ini.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 rounded-xl bg-rose-600 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
