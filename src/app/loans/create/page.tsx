'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Package,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Info,
  Clock,
} from 'lucide-react';
import { api, asArray } from '@/lib/api';
import { RequireRole } from '@/lib/auth';
import { ErrorState, Loading } from '@/components/States';
import { StatusBadge } from '@/components/StatusBadge';
import type { Item } from '@/lib/types';

export default function CreateLoanPage() {
  return (
    <RequireRole allow={['student']}>
      <Suspense fallback={<Loading text="Menyiapkan formulir peminjaman..." />}>
        <FormInner />
      </Suspense>
    </RequireRole>
  );
}

function FormInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const presetItem = sp.get('itemId') ?? '';

  // Get today's ISO date string (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  const [items, setItems] = useState<Item[]>([]);
  const [itemId, setItemId] = useState(presetItem);
  const [quantity, setQuantity] = useState(1);
  const [loanDate, setLoanDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api<unknown>(
          '/api/items?only_available=true&onlyAvailable=true&limit=100',
        );
        setItems(asArray<Item>(res));
      } catch {
        // Items list optional fallback
      }
    })();
  }, []);

  const selectedItem = items.find((it) => it.id === itemId);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!itemId) return setError('Silakan pilih peralatan yang hendak dipinjam.');
    if (quantity < 1) return setError('Jumlah peminjaman minimal 1 unit.');
    if (selectedItem && quantity > selectedItem.availableStock) {
      return setError(
        `Jumlah melebihi stok yang tersedia (${selectedItem.availableStock} unit).`,
      );
    }
    if (!loanDate || !dueDate) {
      return setError('Tanggal mulai pinjam dan tanggal jatuh tempo wajib ditentukan.');
    }
    if (dueDate < loanDate) {
      return setError('Tanggal jatuh tempo tidak boleh mendahului tanggal peminjaman.');
    }
    if (!purpose.trim()) {
      return setError('Tuliskan keperluan peminjaman secara jelas.');
    }

    setLoading(true);
    try {
      await api('/api/loans', {
        method: 'POST',
        body: JSON.stringify({
          // Backend NestJS DTO
          item_id: itemId,
          quantity: Number(quantity),
          borrow_date: loanDate,
          due_date: dueDate,
          purpose: purpose.trim(),
          notes: notes.trim() || undefined,
          // Fallback properties
          items: [{ itemId, quantity: Number(quantity) }],
          loanDate,
          dueDate,
        }),
      });
      router.push('/loans');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Pengajuan peminjaman gagal dikirimkan.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header & Back */}
      <div className="flex items-center gap-2">
        <Link
          href="/items"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Katalog</span>
        </Link>
        <span className="text-xs text-slate-400">/</span>
        <span className="text-xs font-medium text-slate-700">
          Formulir Pengajuan Peminjaman
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Pengajuan Peminjaman Barang
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Lengkapi formulir di bawah. Permintaan Anda akan masuk antrean verifikasi
            petugas dengan status awal <span className="font-semibold text-amber-600">MENUNGGU (PENDING)</span>.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Item Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Peralatan / Fasilitas <span className="text-rose-500">*</span>
            </label>
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            >
              <option value="">— Pilih Barang yang Tersedia —</option>
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name} (Tersedia: {it.availableStock} • Kondisi: {it.condition})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Item Preview Pill if any */}
          {selectedItem && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-blue-950">{selectedItem.name}</p>
                <p className="text-[11px] text-blue-800">
                  Kategori: {selectedItem.category?.name || 'Inventaris'} • Kondisi:{' '}
                  {selectedItem.condition}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                  Stok: {selectedItem.availableStock} Unit
                </span>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jumlah Unit <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={selectedItem?.availableStock || 99}
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full sm:w-48 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Mulai Pinjam <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={loanDate}
                onChange={(e) => setLoanDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Jatuh Tempo (Kembali) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                min={loanDate || todayStr}
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keperluan / Kegiatan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="mis. Praktik Pemrograman Web Lab Komputer 2"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Tambahan (Opsional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informasi pelengkap atau nomor kontak penanggung jawab..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          {/* Informational Policy Box */}
          <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-[11px] text-slate-500 leading-relaxed">
            <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              Dengan mengirimkan formulir ini, Anda berkomitmen menjaga keutuhan
              peralatan sekolah dan mengembalikannya sebelum atau tepat pada tanggal
              jatuh tempo.
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memproses Pengajuan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Kirimkan Pengajuan Peminjaman</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
