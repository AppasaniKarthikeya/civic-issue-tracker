'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { logoutUser } from '@/services/authService';
import { useRouter } from 'next/navigation';
import { APP_NAME } from '@/lib/constants';
import toast from 'react-hot-toast';
import {
  LogOut,
  Home,
  PlusCircle,
  List,
  LayoutDashboard,
  User,
  Menu,
  X,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Navbar() {
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success('Logged out successfully');
      router.push('/');
    } catch {
      toast.error('Error logging out');
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CT</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">{APP_NAME}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                {isAdmin ? (
                  <>
                    <NavLink href="/admin/dashboard" icon={<LayoutDashboard size={18} />}>
                      {t('nav.dashboard')}
                    </NavLink>
                    <NavLink href="/admin/issues" icon={<List size={18} />}>
                      {t('nav.allIssues')}
                    </NavLink>
                    <NavLink href="/admin/map" icon={<Home size={18} />}>
                      {t('nav.mapView')}
                    </NavLink>
                  </>
                ) : (
                  <>
                    <NavLink href="/dashboard" icon={<Home size={18} />}>
                      {t('nav.home')}
                    </NavLink>
                    <NavLink href="/report" icon={<PlusCircle size={18} />}>
                      {t('nav.report')}
                    </NavLink>
                    <NavLink href="/my-reports" icon={<List size={18} />}>
                      {t('nav.myReports')}
                    </NavLink>
                  </>
                )}
                
                <div className="ml-2 flex flex-row items-center">
                  <NavLink href="/settings" icon={<Settings size={18} />}>
                    {t('nav.settings')}
                  </NavLink>
                </div>

                <div className="ml-4 flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                  <button
                    onClick={toggleTheme}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
                    title="Toggle Theme"
                  >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                      <User size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">{profile?.displayName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{profile?.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors mr-2"
                  title="Toggle Theme"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white pb-4">
          <div className="px-4 pt-2 space-y-1">
            {user ? (
              <>
                {isAdmin ? (
                  <>
                    <MobileNavLink href="/admin/dashboard" onClick={() => setMenuOpen(false)}>
                      {t('nav.dashboard')}
                    </MobileNavLink>
                    <MobileNavLink href="/admin/issues" onClick={() => setMenuOpen(false)}>
                      {t('nav.allIssues')}
                    </MobileNavLink>
                    <MobileNavLink href="/admin/map" onClick={() => setMenuOpen(false)}>
                      {t('nav.mapView')}
                    </MobileNavLink>
                  </>
                ) : (
                  <>
                    <MobileNavLink href="/dashboard" onClick={() => setMenuOpen(false)}>
                      {t('nav.home')}
                    </MobileNavLink>
                    <MobileNavLink href="/report" onClick={() => setMenuOpen(false)}>
                      {t('nav.report')}
                    </MobileNavLink>
                    <MobileNavLink href="/my-reports" onClick={() => setMenuOpen(false)}>
                      {t('nav.myReports')}
                    </MobileNavLink>
                  </>
                )}
                <div className="pt-2 mt-2 border-t border-gray-200">
                  <p className="px-3 py-1 text-sm text-gray-500">
                    {profile?.displayName} ({profile?.role})
                  </p>
                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <MobileNavLink href="/login" onClick={() => setMenuOpen(false)}>
                  {t('nav.login')}
                </MobileNavLink>
                <MobileNavLink href="/register" onClick={() => setMenuOpen(false)}>
                  {t('nav.register')}
                </MobileNavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
    >
      {children}
    </Link>
  );
}
