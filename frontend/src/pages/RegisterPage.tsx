import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '@interviewpilot/shared';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, User, ArrowRight, Check, X } from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CANDIDATE);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password criteria check
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isPasswordValid) {
      setFormError('Password must meet all complexity requirements.');
      return;
    }

    setSubmitting(true);
    try {
      await register({ name, email, password, role });
      navigate('/', { replace: true });
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="mb-6 space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Create InterviewPilot Account
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Start your interview journey
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Join candidates mastering technical and behavioral interviews.
          </p>
        </div>

        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength checklist */}
            <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                {hasMinLength ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-400" />}
                <span>At least 8 chars</span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasUppercase ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-400" />}
                <span>One uppercase</span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasLowercase ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-400" />}
                <span>One lowercase</span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasNumber ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-400" />}
                <span>One number</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole(UserRole.CANDIDATE)}
                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
                  role === UserRole.CANDIDATE
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                }`}
              >
                Candidate
              </button>
              <button
                type="button"
                onClick={() => setRole(UserRole.ADMIN)}
                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
                  role === UserRole.ADMIN
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                }`}
              >
                Admin / Evaluator
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !isPasswordValid}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-medium text-brand-600 dark:text-brand-400 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
