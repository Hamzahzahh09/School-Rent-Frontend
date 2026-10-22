'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  Package,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Box,
  ClipboardList,
  Clock,
  AlertTriangle,
  RotateCcw,
  Users,
  BarChart3,
  ChevronDown,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const role = user?.role;

  // Build navigation items based on role
  let navItems: { href: string; label: string; icon?: React.ComponentType<{ className?: string }> }[] = [];

  if (!user) {
    // Public visitor
    navItems = [
      { href: '/', label: 'Beranda' },
      { href: '/items', label: 'Katalog Barang' },
      { href: '/#cara-kerja', label: 'Cara Kerja' },
      { href: '/#keunggulan', label: 'Keunggulan' },
    ];
  } else if (role === 'student') {
    navItems = [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/items', label: 'Katalog Barang', icon: Box },
      { href: '/loans', label: 'Peminjaman', icon: ClipboardList },
      { href: '/history', label: 'Riwayat', icon: Clock },
      { href: '/fines', label: 'Denda', icon: AlertTriangle },
    ];
  } else if (role === 'staff') {
    navItems = [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/items', label: 'Katalog', icon: Box },
      { href: '/admin/loans', label: 'Pengajuan', icon: ClipboardList },
      { href: '/admin/returns', label: 'Pengembalian', icon: RotateCcw },
      { href: '/admin/fines', label: 'Denda', icon: AlertTriangle },
      { href: '/admin/reports', label: 'Laporan', icon: BarChart3 },
    ];
  } else if (role === 'admin') {
    navItems = [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/items', label: 'Katalog', icon: Box },
      { href: '/admin/loans', label: 'Pengajuan', icon: ClipboardList },
      { href: '/admin/returns', label: 'Pengembalian', icon: RotateCcw },
      { href: '/admin/items', label: 'Kelola Barang', icon: Box },
      { href: '/admin/users', label: 'Pengguna', icon: Users },
      { href: '/admin/reports', label: 'Laporan', icon: BarChart3 },
    ];
  }

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/#')) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link
            href={user ? '/dashboard' : '/'}
            className="flex items-center gap-2.5 transition hover:opacity-90"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <Package className="h-5 w-5" />
            </span>
            <div className="flex flex-col">
              <span className="text-base font-bold leading-tight tracking-tight text-slate-900">
                School<span className="text-blue-600">Rent</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                Rental &amp; Inventory
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.icon && <item.icon className="h-3.5 w-3.5" />}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: User Status or Auth CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                title="Notifikasi"
              >
                <Bell className="h-4 w-4" />
              </Link>

              {/* Profile dropdown trigger */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  onBlur={() => setTimeout(() => setProfileDropdownOpen(false), 200)}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-[11px]">
                    {(user.fullName || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="text-left hidden md:block max-w-[120px] truncate">
                    <p className="truncate text-xs font-medium text-slate-900">
                      {user.fullName || user.email.split('@')[0]}
                    </p>
                  </div>
                  <StatusBadge value={user.role} showDot={false} className="text-[10px] py-0 px-1.5" />
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg animate-in fade-in zoom-in-95 duration-100 z-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {user.fullName || 'Pengguna'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition mt-1"
                    >
                      <UserIcon className="h-3.5 w-3.5 text-slate-500" />
                      Profil Saya
                    </Link>

                    {role === 'admin' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                      >
                        <LayoutDashboard className="h-3.5 w-3.5 text-slate-500" />
                        Menu Admin Lengkap
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="h-3.5 w-3.5 text-rose-500" />
                      Keluar (Logout)
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-95"
              >
                Daftar Siswa
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          {user && (
            <Link
              href="/notifications"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600"
            >
              <Bell className="h-4 w-4" />
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pt-3 pb-6 sm:hidden space-y-3">
          {user && (
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-xs font-bold text-slate-900">{user.fullName || user.email}</p>
                <p className="text-[11px] text-slate-500">{user.email}</p>
              </div>
              <StatusBadge value={user.role} />
            </div>
          )}

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              );
            })}

            {user && (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <UserIcon className="h-4 w-4" />
                  Profil Saya
                </Link>
                {role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Panel Administrator
                  </Link>
                )}
              </>
            )}
          </nav>

          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700"
              >
                <LogOut className="h-4 w-4" />
                Keluar (Logout)
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-xs"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
