// Client REST ke backend NestJS. Base URL dari env, default https://school-rent.vercel.app.
// - Access token (memory + localStorage) dikirim via Authorization: Bearer
// - credentials: 'include' agar refresh-token cookie httpOnly ikut terkirim
// - Semua error diterjemahkan ke Bahasa Indonesia yang jelas (PRD §35).

import type {
  Category,
  Fine,
  FineStatus,
  Item,
  ItemCondition,
  ItemStatus,
  Loan,
  LoanItemRow,
  LoanStatus,
  Role,
  User,
} from './types';

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'https://school-rent.vercel.app';

const TOKEN_KEY = 'schoolrent_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function toIndonesian(status: number, backendMsg: string): string {
  if (backendMsg && !/internal|exception|query failed/i.test(backendMsg))
    return backendMsg;
  switch (status) {
    case 400:
      return backendMsg || 'Data yang dikirim tidak valid.';
    case 401:
      return 'Sesi berakhir. Silakan login kembali.';
    case 403:
      return 'Anda tidak memiliki akses untuk aksi ini.';
    case 404:
      return 'Data tidak ditemukan.';
    case 409:
      return backendMsg || 'Aksi ditolak karena status data tidak memungkinkan.';
    case 422:
      return backendMsg || 'Validasi gagal. Periksa kembali isian form.';
    case 429:
      return 'Terlalu banyak percobaan. Coba lagi sebentar.';
    default:
      if (status >= 500) return 'Server bermasalah. Coba lagi nanti.';
      return backendMsg || 'Terjadi kesalahan.';
  }
}

export function normalizeItem(raw: unknown): Item {
  if (!raw || typeof raw !== 'object') return raw as Item;
  const o = raw as Record<string, unknown>;
  const cat = (o.categories ?? o.category) as Category | undefined;
  return {
    ...(o as unknown as Item),
    id: String(o.id ?? ''),
    name: String(o.name ?? ''),
    code: o.code ? String(o.code) : undefined,
    description: (o.description as string) ?? null,
    imageUrl: (o.image_url ?? o.imageUrl ?? null) as string | null,
    categoryId: (o.category_id ?? o.categoryId ?? cat?.id ?? null) as string | null,
    category: cat
      ? { id: String(cat.id), name: String(cat.name), description: cat.description }
      : ((o.category as Category | null) ?? null),
    totalStock: Number(o.total_stock ?? o.totalStock ?? 0),
    availableStock: Number(o.available_stock ?? o.availableStock ?? 0),
    condition: (o.condition as ItemCondition) ?? 'GOOD',
    status: (o.status as ItemStatus) ?? 'AVAILABLE',
  };
}

export function normalizeLoan(raw: unknown): Loan {
  if (!raw || typeof raw !== 'object') return raw as Loan;
  const o = raw as Record<string, unknown>;

  let items: LoanItemRow[] = [];
  if (Array.isArray(o.items) && o.items.length > 0) {
    items = o.items.map((it: any) => ({
      itemId: String(it.item_id ?? it.itemId ?? it.id ?? ''),
      quantity: Number(it.quantity ?? 1),
      item: it.item
        ? normalizeItem(it.item)
        : it.items
        ? normalizeItem(it.items)
        : null,
    }));
  } else if (o.item_id || o.itemId) {
    items = [
      {
        itemId: String(o.item_id ?? o.itemId ?? ''),
        quantity: Number(o.quantity ?? 1),
        item: o.item
          ? normalizeItem(o.item)
          : o.items
          ? normalizeItem(o.items)
          : null,
      },
    ];
  }

  const rawUser = o.borrower ?? o.user ?? o.users;
  let borrower: User | null = null;
  if (rawUser && typeof rawUser === 'object') {
    const u = rawUser as Record<string, unknown>;
    const rawRole = String(u.role ?? 'SISWA').toUpperCase();
    let role: Role = 'student';
    if (rawRole === 'ADMIN') role = 'admin';
    else if (rawRole === 'PETUGAS' || rawRole === 'STAFF') role = 'staff';

    const cName = (u.class_name as string) || (u.class as string) || null;
    const aUrl = (u.avatar_url as string) || (u.avatarUrl as string) || null;
    const act = typeof u.is_active === 'boolean' ? u.is_active : typeof u.isActive === 'boolean' ? u.isActive : true;

    borrower = {
      id: String(u.id ?? ''),
      fullName: (u.name ?? u.fullName ?? '') as string,
      name: (u.name ?? u.fullName ?? '') as string,
      email: String(u.email ?? ''),
      role,
      class: cName,
      class_name: cName,
      major: (u.major as string) ?? null,
      phone: (u.phone as string) ?? null,
      avatarUrl: aUrl,
      avatar_url: aUrl,
      isActive: act,
      is_active: act,
    };
  }

  return {
    ...(o as unknown as Loan),
    id: String(o.id ?? ''),
    borrowerId: (o.borrower_id ?? o.borrowerId ?? o.user_id ?? o.userId) as
      | string
      | undefined,
    borrower,
    status: (o.status as LoanStatus) ?? 'PENDING',
    loanDate: String(
      o.borrow_date ?? o.loan_date ?? o.loanDate ?? o.created_at ?? '',
    ),
    dueDate: String(o.due_date ?? o.dueDate ?? ''),
    returnedAt: (o.returned_at ?? o.return_date ?? o.returnedAt ?? null) as
      | string
      | null,
    purpose: String(o.purpose ?? ''),
    notes: (o.notes as string) ?? null,
    rejectReason: (o.rejection_reason ??
      o.reject_reason ??
      o.rejectReason ??
      null) as string | null,
    items,
    fine: o.fine
      ? normalizeFine(o.fine)
      : o.fines
      ? normalizeFine(o.fines)
      : null,
    createdAt: (o.created_at ?? o.createdAt) as string | undefined,
  };
}

export function normalizeFine(raw: unknown): Fine {
  if (!raw || typeof raw !== 'object') return raw as Fine;
  const o = raw as Record<string, unknown>;
  const rawUser = o.borrower ?? o.user ?? o.users;
  let borrower: User | null = null;
  if (rawUser && typeof rawUser === 'object') {
    const u = rawUser as Record<string, unknown>;
    const rawRole = String(u.role ?? 'SISWA').toUpperCase();
    let role: Role = 'student';
    if (rawRole === 'ADMIN') role = 'admin';
    else if (rawRole === 'PETUGAS' || rawRole === 'STAFF') role = 'staff';

    const cName = (u.class_name as string) || (u.class as string) || null;
    const aUrl = (u.avatar_url as string) || (u.avatarUrl as string) || null;
    const act = typeof u.is_active === 'boolean' ? u.is_active : typeof u.isActive === 'boolean' ? u.isActive : true;

    borrower = {
      id: String(u.id ?? ''),
      fullName: (u.name ?? u.fullName ?? '') as string,
      name: (u.name ?? u.fullName ?? '') as string,
      email: String(u.email ?? ''),
      role,
      class: cName,
      class_name: cName,
      major: (u.major as string) ?? null,
      phone: (u.phone as string) ?? null,
      avatarUrl: aUrl,
      avatar_url: aUrl,
      isActive: act,
      is_active: act,
    };
  }

  return {
    ...(o as unknown as Fine),
    id: String(o.id ?? ''),
    loanId: String(o.loan_id ?? o.loanId ?? ''),
    loan: o.loan
      ? normalizeLoan(o.loan)
      : o.loans
      ? normalizeLoan(o.loans)
      : null,
    borrower,
    daysLate: Number(o.days_late ?? o.daysLate ?? 0),
    amount: Number(o.amount ?? 0),
    status: (o.status as FineStatus) ?? 'UNPAID',
    paidAt: (o.paid_at ?? o.paidAt ?? null) as string | null,
  };
}

function autoNormalize<T>(item: unknown): T {
  if (!item || typeof item !== 'object') return item as T;
  const o = item as Record<string, unknown>;
  if (
    'total_stock' in o ||
    'available_stock' in o ||
    'categories' in o ||
    ('name' in o && 'condition' in o && 'status' in o)
  ) {
    return normalizeItem(o) as unknown as T;
  }
  if (
    'borrow_date' in o ||
    'due_date' in o ||
    'loan_date' in o ||
    'rejection_reason' in o ||
    ('purpose' in o && 'status' in o)
  ) {
    return normalizeLoan(o) as unknown as T;
  }
  if (
    'days_late' in o ||
    'loan_id' in o ||
    ('amount' in o && 'status' in o && 'daysLate' in o)
  ) {
    return normalizeFine(o) as unknown as T;
  }
  return item as T;
}

interface ApiOptions extends RequestInit {
  auth?: boolean;
}

export async function api<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const token = auth ? getToken() : null;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...rest,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
    });
  } catch {
    throw new ApiError(
      0,
      `Tidak dapat terhubung ke backend di ${API_BASE}. Periksa koneksi internet Anda atau pastikan server aktif.`,
    );
  }

  if (res.status === 204) return undefined as T;

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const msg =
      (body as { message?: string | string[] } | null)?.message ??
      `HTTP ${res.status}`;
    const text = Array.isArray(msg) ? msg.join(', ') : String(msg);
    throw new ApiError(res.status, toIndonesian(res.status, text));
  }

  // Backend NestJS kadang membungkus { data }, kadang langsung.
  if (body && typeof body === 'object' && 'data' in (body as object)) {
    const d = (body as { data: T }).data;
    return autoNormalize<T>(d);
  }
  return autoNormalize<T>(body as T);
}

/** Ambil list yang toleran terhadap variasi bentuk response backend. */
export function asArray<T>(input: unknown): T[] {
  let list: unknown[] = [];
  if (Array.isArray(input)) list = input;
  else if (input && typeof input === 'object') {
    const o = input as Record<string, unknown>;
    if (Array.isArray(o.data)) list = o.data;
    else if (Array.isArray(o.items)) list = o.items;
  }
  return list.map((item) => autoNormalize<T>(item));
}

export function formatRupiah(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n);
}

export function formatTanggal(iso?: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(d);
}
