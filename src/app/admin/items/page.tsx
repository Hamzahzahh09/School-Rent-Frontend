'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Plus,
  Search,
  AlertTriangle,
  Pencil,
} from 'lucide-react';
import { api, asArray } from '@/lib/api';
import { RequireRole } from '@/lib/auth';
import { Empty, ErrorState, Loading } from '@/components/States';
import { StatusBadge } from '@/components/StatusBadge';
import { toast } from '@/components/ToastProvider';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: '',
    name: '',
    categoryId: '',
    totalStock: 1,
    description: '',
    condition: 'BAIK',
    status: 'AVAILABLE',
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

  function resetForm() {
    setForm({
      code: '',
      name: '',
      categoryId: '',
      totalStock: 1,
      description: '',
      condition: 'BAIK',
      status: 'AVAILABLE',
    });
    setEditingId(null);
    setIsAdding(false);
  }

  function startEdit(item: Item) {
    setForm({
      code: item.code ?? '',
      name: item.name,
      categoryId: item.categoryId ?? item.category?.id ?? '',
      totalStock: item.totalStock,
      description: item.description ?? '',
      condition: item.condition,
      status: item.status,
    });
    setEditingId(item.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    const name = form.name.trim();
    const categoryId = form.categoryId;
    if (!name) return toast.error('Nama peralatan wajib diisi.');
    if (!categoryId) return toast.error('Kategori peralatan wajib dipilih.');
    if (!Number.isInteger(form.totalStock) || form.totalStock < 1) {
      return toast.error('Total stok harus berupa bilangan bulat minimal 1.');
    }

    const existing = editingId
      ? items.find((item) => item.id === editingId)
      : undefined;
    const borrowedCount = existing
      ? Math.max(0, existing.totalStock - existing.availableStock)
      : 0;
    if (form.totalStock < borrowedCount) {
      return toast.error(
        `Total stok tidak boleh kurang dari ${borrowedCount} unit yang sedang dipinjam.`,
      );
    }

    setSubmitting(true);
    const itemCode = form.code.trim() || `BRG-${Date.now().toString().slice(-6)}`;
    const availableStock = existing
      ? Math.max(0, existing.availableStock + form.totalStock - existing.totalStock)
      : form.totalStock;

    try {
      await api(editingId ? `/api/items/${editingId}` : '/api/items', {
        method: editingId ? 'PATCH' : 'POST',
        body: JSON.stringify({
          category_id: categoryId,
          code: itemCode,
          name,
          total_stock: Number(form.totalStock),
          available_stock: availableStock,
          description: form.description.trim() || undefined,
          condition: form.condition,
          status: form.status,
        }),
      });
      const action = editingId ? 'diperbarui' : 'ditambahkan';
      resetForm();
      const message = `Barang inventaris berhasil ${action}.`;
      toast.success(message);
      await muat();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan inventaris.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api(`/api/items/${id}`, { method: 'DELETE' });
      setDeleteConfirmId(null);
      const message = 'Barang berhasil dihapus atau dinonaktifkan.';
      toast.success(message);
      await muat();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gagal menghapus barang.';
      toast.error(message);
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
          onClick={() => {
            if (isAdding) resetForm();
            else setIsAdding(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>{isAdding ? 'Tutup Formulir' : 'Tambah Peralatan Baru'}</span>
        </button>
      </div>


      {/* Add Item Card */}
      {isAdding && (
        <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm space-y-4 animate-in fade-in duration-150">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Box className="h-4 w-4 text-blue-600" />
            <span>{editingId ? 'Formulir Edit Inventaris' : 'Formulir Tambah Inventaris'}</span>
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode Barang
                </label>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="Otomatis jika kosong"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kondisi
                </label>
                <select
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                >
                  <option value="BAIK">Baik</option>
                  <option value="RUSAK_RINGAN">Rusak Ringan</option>
                  <option value="RUSAK_BERAT">Rusak Berat</option>
                  <option value="HILANG">Hilang</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Katalog
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                >
                  <option value="AVAILABLE">Tersedia</option>
                  <option value="BORROWED">Dipinjam</option>
                  <option value="MAINTENANCE">Perawatan</option>
                  <option value="INACTIVE">Nonaktif</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-60"
              >
                {submitting
                  ? 'Menyimpan...'
                  : editingId
                    ? 'Simpan Perubahan'
                    : 'Simpan Inventaris'}
              </button>
              <button
                type="button"
                onClick={resetForm}
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
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(it)}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(it.id)}
                        className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
                      >
                        Hapus
                      </button>
                    </div>
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
