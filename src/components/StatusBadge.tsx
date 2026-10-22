import React from 'react';

type StatusType =
  | 'AVAILABLE'
  | 'BORROWED'
  | 'MAINTENANCE'
  | 'INACTIVE'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED'
  | 'CANCELLED'
  | 'OVERDUE'
  | 'UNPAID'
  | 'PAID'
  | 'WAIVED'
  | 'GOOD'
  | 'FAIR'
  | 'DAMAGED'
  | 'student'
  | 'staff'
  | 'admin'
  | string;

interface StatusConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
}

const statusMap: Record<string, StatusConfig> = {
  // Item availability
  AVAILABLE: {
    label: 'Tersedia',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  BORROWED: {
    label: 'Dipinjam',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  MAINTENANCE: {
    label: 'Perawatan',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  INACTIVE: {
    label: 'Nonaktif',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },

  // Loan status
  PENDING: {
    label: 'Menunggu',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  APPROVED: {
    label: 'Disetujui',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
  },
  REJECTED: {
    label: 'Ditolak',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  RETURNED: {
    label: 'Dikembalikan',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'Dibatalkan',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
  OVERDUE: {
    label: 'Terlambat',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },

  // Fine status
  UNPAID: {
    label: 'Belum Lunas',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  PAID: {
    label: 'Lunas',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  WAIVED: {
    label: 'Pemutihan',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },

  // Condition (English & Indonesian Backend Enums)
  GOOD: {
    label: 'Baik',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  BAIK: {
    label: 'Baik',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  FAIR: {
    label: 'Cukup',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  RUSAK_RINGAN: {
    label: 'Rusak Ringan',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  DAMAGED: {
    label: 'Rusak',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  RUSAK_BERAT: {
    label: 'Rusak Berat',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  HILANG: {
    label: 'Hilang',
    bg: 'bg-slate-200',
    text: 'text-slate-800',
    border: 'border-slate-300',
    dot: 'bg-slate-500',
  },

  // Roles
  student: {
    label: 'Siswa',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  SISWA: {
    label: 'Siswa',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  staff: {
    label: 'Petugas',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
  PETUGAS: {
    label: 'Petugas',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
  admin: {
    label: 'Admin',
    bg: 'bg-slate-900',
    text: 'text-white',
    border: 'border-slate-800',
    dot: 'bg-blue-400',
  },
  ADMIN: {
    label: 'Admin',
    bg: 'bg-slate-900',
    text: 'text-white',
    border: 'border-slate-800',
    dot: 'bg-blue-400',
  },
};

export function StatusBadge({
  value,
  showDot = true,
  className = '',
}: {
  value: StatusType;
  showDot?: boolean;
  className?: string;
}) {
  const cfg = statusMap[value] || {
    label: value,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors ${cfg.bg} ${cfg.text} ${cfg.border} ${className}`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{cfg.label}</span>
    </span>
  );
}
