// Tipe data mengikuti PRD SchoolRent (§20-22, §33) + kontrak backend /api.
// Backend adalah sumber kebenaran; tipe ini dibuat toleran (field opsional)
// agar UI tidak crash saat backend belum jalan / response berbeda.

export type Role = 'student' | 'staff' | 'admin';

export interface User {
  id: string;
  fullName?: string;
  name?: string;
  email: string;
  role: Role;
  class?: string | null;
  class_name?: string | null;
  major?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  avatar_url?: string | null;
  isActive?: boolean;
  is_active?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
}

export type ItemStatus = 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE' | 'INACTIVE';
export type ItemCondition =
  | 'GOOD'
  | 'FAIR'
  | 'DAMAGED'
  | 'BAIK'
  | 'RUSAK_RINGAN'
  | 'RUSAK_BERAT'
  | 'HILANG';

export interface Item {
  id: string;
  name: string;
  code?: string;
  description?: string | null;
  imageUrl?: string | null;
  image_url?: string | null;
  categoryId?: string | null;
  category_id?: string | null;
  category?: Category | null;
  categories?: Category | null;
  totalStock: number;
  total_stock?: number;
  availableStock: number;
  available_stock?: number;
  condition: ItemCondition;
  status: ItemStatus;
}

export type LoanStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'BORROWED'
  | 'RETURNED'
  | 'CANCELLED'
  | 'OVERDUE';

export interface LoanItemRow {
  itemId: string;
  quantity: number;
  item?: Item | null;
}

export interface Loan {
  id: string;
  borrowerId?: string;
  borrower_id?: string;
  user_id?: string;
  borrower?: User | null;
  user?: User | null;
  users?: User | null;
  status: LoanStatus;
  loanDate: string;
  borrow_date?: string;
  dueDate: string;
  due_date?: string;
  returnedAt?: string | null;
  returned_at?: string | null;
  purpose: string;
  notes?: string | null;
  rejectReason?: string | null;
  rejection_reason?: string | null;
  items: LoanItemRow[];
  item_id?: string;
  quantity?: number;
  fine?: Fine | null;
  createdAt?: string;
  created_at?: string;
}

export type FineStatus = 'UNPAID' | 'PAID' | 'WAIVED';

export interface Fine {
  id: string;
  loanId: string;
  loan_id?: string;
  loan?: Loan | null;
  borrower?: User | null;
  user?: User | null;
  daysLate: number;
  days_late?: number;
  amount: number;
  status: FineStatus;
  paidAt?: string | null;
  paid_at?: string | null;
}

export interface ReturnRow {
  id: string;
  loanId: string;
  loan?: Loan | null;
  returnedAt: string;
  condition: ItemCondition;
  notes?: string | null;
}

export interface NotificationRow {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  meta?: { total: number; page: number; limit: number; totalPages?: number };
  total?: number;
}
