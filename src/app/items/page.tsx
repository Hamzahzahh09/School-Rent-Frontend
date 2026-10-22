'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Box,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  PlusCircle,
  X,
} from 'lucide-react';
import { api, asArray } from '@/lib/api';
import { RequireRole } from '@/lib/auth';
import { Empty, ErrorState, Loading } from '@/components/States';
import { StatusBadge } from '@/components/StatusBadge';
import type { Category, Item, ItemCondition } from '@/lib/types';

export default function ItemsPage() {
  return (
    <RequireRole allow={['student', 'staff', 'admin']}>
      <Suspense fallback={<Loading text="Menyiapkan katalog peralatan..." />}>
        <ItemsInner />
      </Suspense>
    </RequireRole>
  );
}

function ItemsInner() {
  const sp = useSearchParams();
  const [keyword, setKeyword] = useState(sp.get('keyword') ?? '');
  const [categoryId, setCategoryId] = useState(sp.get('categoryId') ?? '');
  const [onlyAvailable, setOnlyAvailable] = useState(
    sp.get('onlyAvailable') === 'true',
  );
  const [conditionFilter, setConditionFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'stock-desc' | 'stock-asc'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function muat() {
    setLoading(true);
    setError('');
    try {
      const q = new URLSearchParams();
      if (keyword.trim()) {
        q.set('keyword', keyword.trim());
        q.set('search', keyword.trim());
      }
      if (categoryId) {
        q.set('categoryId', categoryId);
        q.set('category_id', categoryId);
      }
      if (onlyAvailable) {
        q.set('onlyAvailable', 'true');
        q.set('only_available', 'true');
      }
      q.set('limit', '100');

      const res = await api<unknown>(`/api/items?${q.toString()}`);
      setItems(asArray<Item>(res));

      if (categories.length === 0) {
        try {
          const c = await api<unknown>('/api/categories');
          setCategories(asArray<Category>(c));
        } catch {
          // Kategori opsional
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat daftar barang.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter and sort items locally for smooth client-side filtering
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Condition filter (supporting both Indonesian and English)
    if (conditionFilter !== 'ALL') {
      result = result.filter((it) => {
        if (it.condition === conditionFilter) return true;
        if (conditionFilter === 'GOOD' && it.condition === 'BAIK') return true;
        if (conditionFilter === 'FAIR' && it.condition === 'RUSAK_RINGAN') return true;
        if (conditionFilter === 'DAMAGED' && (it.condition === 'RUSAK_BERAT' || it.condition === 'HILANG')) return true;
        return false;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'stock-desc') return b.availableStock - a.availableStock;
      if (sortBy === 'stock-asc') return a.availableStock - b.availableStock;
      return 0;
    });

    return result;
  }, [items, conditionFilter, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header Title & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Katalog Inventaris Sekolah
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Jelajahi dan temukan perlengkapan, fasilitas, serta perangkat lab yang siap dipinjam.
          </p>
        </div>
        <Link
          href="/loans/create"
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Ajukan Peminjaman</span>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            muat();
          }}
          className="flex flex-col md:flex-row items-stretch md:items-center gap-3"
        >
          {/* Keyword Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Cari nama barang, mis. Proyektor Epson, Kamera..."
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-9 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Condition Filter */}
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
          >
            <option value="ALL">Semua Kondisi</option>
            <option value="GOOD">Kondisi Baik</option>
            <option value="FAIR">Kondisi Cukup</option>
            <option value="DAMAGED">Kondisi Rusak</option>
          </select>

          {/* Availability Checkbox Pill */}
          <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-medium text-slate-700 cursor-pointer select-none hover:bg-slate-50 transition">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
            />
            <span>Hanya Tersedia</span>
          </label>

          {/* Submit Search Button */}
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-[0.98] transition"
          >
            Terapkan
          </button>
        </form>

        {/* View mode toggle and sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:outline-none"
            >
              <option value="name">Nama (A-Z)</option>
              <option value="stock-desc">Stok Terbanyak</option>
              <option value="stock-asc">Stok Tersedikit</option>
            </select>
            <span className="text-slate-400">|</span>
            <span>
              Menampilkan <strong>{filteredItems.length}</strong> barang
            </span>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Grid"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Tabel/List"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* STATE HANDLERS */}
      {loading && <Loading text="Memuat katalog barang..." />}
      {error && !loading && <ErrorState message={error} onRetry={muat} />}

      {!loading && !error && filteredItems.length === 0 && (
        <Empty
          title="Barang Tidak Ditemukan"
          text="Tidak ada inventaris yang cocok dengan kriteria pencarian atau filter yang dipilih."
          action={{
            label: 'Reset Filter',
            onClick: () => {
              setKeyword('');
              setCategoryId('');
              setOnlyAvailable(false);
              setConditionFilter('ALL');
              muat();
            },
          }}
        />
      )}

      {/* GRID VIEW */}
      {!loading && !error && filteredItems.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isAvail = item.availableStock > 0 && item.status === 'AVAILABLE';
            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                      <Box className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge value={item.condition} />
                      <StatusBadge value={item.status} />
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      {item.category?.name || 'Tanpa Kategori'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                      {item.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                      {item.description || 'Tidak ada deskripsi rinci untuk barang ini.'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                  {/* Stock Availability indicator */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">Ketersediaan Stok</span>
                      <span className="font-semibold text-slate-900">
                        {item.availableStock} / {item.totalStock}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.availableStock > 0 ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              (item.availableStock / Math.max(1, item.totalStock)) *
                                100,
                            ),
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/items/${item.id}`}
                      className="flex-1 rounded-xl border border-slate-200 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Detail
                    </Link>
                    {isAvail ? (
                      <Link
                        href={`/loans/create?itemId=${item.id}`}
                        className="flex-1 rounded-xl bg-blue-600 py-2 text-center text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
                      >
                        Pinjam
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="flex-1 rounded-xl bg-slate-100 py-2 text-center text-xs font-medium text-slate-400 cursor-not-allowed"
                      >
                        Tidak Tersedia
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST / TABLE VIEW */}
      {!loading && !error && filteredItems.length > 0 && viewMode === 'list' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Nama Barang</th>
                <th className="px-4 py-3 font-semibold">Kategori</th>
                <th className="px-4 py-3 font-semibold">Stok Tersedia</th>
                <th className="px-4 py-3 font-semibold">Kondisi</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {item.description || '-'}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {item.category?.name || '-'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-slate-900">
                      {item.availableStock}
                    </span>{' '}
                    <span className="text-slate-400">/ {item.totalStock}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge value={item.condition} />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge value={item.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/items/${item.id}`}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 transition"
                      >
                        Detail
                      </Link>
                      {item.availableStock > 0 && item.status === 'AVAILABLE' && (
                        <Link
                          href={`/loans/create?itemId=${item.id}`}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 font-semibold text-white shadow-xs hover:bg-blue-700 transition"
                        >
                          Pinjam
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
