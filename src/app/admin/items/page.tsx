'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Box,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { api, asArray } from '@/lib/api';
import { RequireRole } from '@/lib/auth';
import { Empty, ErrorState, Loading } from '@/components/States';
import { StatusBadge } from '@/components/StatusBadge';
import type { Category, Item } from '@/lib/types';

export default function AdminItemsPage() {
  return (
    <RequireRole allow={['staff', 'admin']}>
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const [items, setItems] = useState<Item[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: '',
    name: '',
    categoryId: '',
    totalStock: 1,
    description: '',
  });

  async function muat() {
    setLoading(true);
    setError('');
    try {
      const [ri, rc] = await Promise.all([
        api<unknown>('/api/items?limit=100'),
        api<unknown>('/api/categories').catch(() => []),
      ]);
      setItems(asArray<Item>(ri));
      setCats(asArray<Category>(rc));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Gagal memuat daftar inventaris.',
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
    setSubmitting(true);
    const itemCode =
      form.code.trim() ||
      `BRG-${Date.now().toString().slice(-6)}`;
    const catId = form.categoryId || (cats[0]?.id ?? '');

    try {
      await api('/api/items', {
        method: 'POST',
        body: JSON.stringify({
          category_id: catId,
          code: itemCode,
          name: form.name.trim(),
          total_stock: Number(form.totalStock),
          available_stock: Number(form.totalStock),
          description: form.description.trim() || undefined,
          condition: 'BAIK',
          status: 'AVAILABLE',
          // Fallbacks
          categoryId: catId,
          totalStock: Number(form.totalStock),
        }),
      });
      setForm({ code: '', name: '', categoryId: '', totalStock: 1, description: '' });
      setIsAdding(false);
      setMsg('Barang inventaris baru berhasil ditambahkan.');
      await muat();
    } catch (err) {
      setMsg(
        err instanceof Error ? err.message : 'Gagal menambahkan inventaris.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setMsg('');
    try {
      await api(`/api/items/${id}`, { method: 'DELETE' });
      setDeleteConfirmId(null);
      setMsg('Barang berhasil dihapus / dinonaktifkan.');
      await muat();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Gagal menghapus barang.');
    }
  }

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((it) => {
      const name = it.name.toLowerCase();
      const desc = (it.description || '').toLowerCase();
      const cat = (it.category?.name || '').toLowerCase();
      return name.includes(q) || desc.includes(q) || cat.includes(q);
    });
  }, [items, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Kelola Inventaris Peralatan
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Tambah, perbarui ketersediaan kuota stok, dan arsipkan peralatan sekolah.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>{isAdding ? 'Tutup Formulir' : 'Tambah Peralatan Baru'}</span>
        </button>
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

      {/* Add Item Card */}
      {isAdding && (
        <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm space-y-4 animate-in fade-in duration-150">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Box className="h-4 w-4 text-blue-600" />
            <span>Formulir Tambah Inventaris</span>
          </h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Peralatan <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="mis. Proyektor Epson EB-X51"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                >
                  <option value="">— Pilih Kategori —</option>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Stok Unit <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.totalStock}
                  onChange={(e) =>
                    setForm({ ...form, totalStock: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi / Spesifikasi
                </label>
                <input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Kelengkapan unit, nomor seri, atau penempatan..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-60"
              >
                {submitting ? 'Menyimpan...' : 'Simpan Inventaris'}
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Input */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari dalam daftar inventaris berdasarkan nama atau kategori..."
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
      </div>

      {/* States */}
      {loading && <Loading text="Memuat inventaris..." />}
      {error && !loading && <ErrorState message={error} onRetry={muat} />}

      {!loading && !error && filteredItems.length === 0 && (
        <Empty
          title="Tidak Ada Inventaris"
          text="Belum ada peralatan yang tersimpan dalam database."
        />
      )}

      {/* Table */}
      {!loading && !error && filteredItems.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Nama Peralatan</th>
                <th className="px-4 py-3 font-semibold">Kategori</th>
                <th className="px-4 py-3 font-semibold">Ketersediaan Stok</th>
                <th className="px-4 py-3 font-semibold">Kondisi</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((it) => (
                <tr key={it.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-slate-900">{it.name}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {it.description || '-'}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {it.category?.name || '-'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-slate-900">
                      {it.availableStock}
                    </span>{' '}
                    <span className="text-slate-400">/ {it.totalStock}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge value={it.condition} />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge value={it.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(it.id)}
                      className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                Konfirmasi Hapus Peralatan
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus / mengarsipkan peralatan ini dari katalog?
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
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
