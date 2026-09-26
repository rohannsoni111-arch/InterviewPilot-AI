import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, KeyRound, LogOut, Check, X } from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const SettingsPage: React.FC = () => {
  const { user, changePassword, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Complexity validation
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;
  const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && passwordsMatch;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isValid) {
      setErrorMsg('Please ensure all password requirements and matching confirmation.');
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand-500" />
          Account & Security Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your credentials, active authentication sessions, and security parameters.
        </p>
      </div>

      {/* Change Password Card */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-slate-500" />
          Update Password
        </h2>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Password Validation Indicator */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              {hasMinLength ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-400" />}
              <span>8+ characters</span>
            </div>
            <div className="flex items-center gap-1.5">
              {hasUppercase ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-400" />}
              <span>Uppercase letter</span>
            </div>
            <div className="flex items-center gap-1.5">
              {hasLowercase ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-400" />}
              <span>Lowercase letter</span>
            </div>
            <div className="flex items-center gap-1.5">
              {hasNumber ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-400" />}
              <span>Number</span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2 sm:col-span-2">
              {passwordsMatch ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-400" />}
              <span>Passwords match</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingPassword || !isValid}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {savingPassword ? <LoadingSpinner size="sm" /> : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Session Management Card */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <LogOut className="w-4 h-4 text-slate-500" />
          Active Sessions & Sign Out
        </h2>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          You are currently signed in as <strong className="text-slate-700 dark:text-slate-300 font-medium">{user.email}</strong>. Logging out terminates the current token family and requires re-authenticating.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-medium rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out of InterviewPilot
          </button>
        </div>
      </div>
    </div>
  );
};
