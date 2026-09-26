import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { Activity, ShieldCheck, Menu, X, User, Settings, LogOut, ChevronDown } from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/auth/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 font-semibold text-slate-900 dark:text-slate-50">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 font-bold text-sm tracking-tight">
              IP
            </div>
            <span className="tracking-tight font-medium text-base">
              InterviewPilot{' '}
              <span className="text-xs font-semibold uppercase px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 ml-1 border border-brand-200 dark:border-brand-900">
                AI
              </span>
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-3">
          <Link
            to="/health"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            System Health
          </Link>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <ThemeToggle />

          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="w-7 h-7 rounded-md bg-brand-500 text-white font-medium text-xs flex items-center justify-center">
                  {getInitials(user.name)}
                </div>
                <span className="text-xs font-medium hidden md:inline-block max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg py-1.5 text-xs text-slate-700 dark:text-slate-300 z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Profile
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    Account Settings
                  </Link>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-lg transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
