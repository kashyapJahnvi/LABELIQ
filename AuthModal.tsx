import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'reset';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const { login, signup, resetPassword, authError, clearError, isConfigured } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();
    setResetSuccess(false);

    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }

    if (mode === 'reset') {
      setLoading(true);
      const ok = await resetPassword(email);
      setLoading(false);
      if (ok) {
        setResetSuccess(true);
      }
      return;
    }

    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match.');
        return;
      }

      setLoading(true);
      const ok = await signup(email, password, name);
      setLoading(false);
      if (ok) {
        onClose();
      }
      return;
    }

    if (mode === 'signin') {
      setLoading(true);
      const ok = await login(email, password);
      setLoading(false);
      if (ok) {
        onClose();
      }
    }
  };

  const switchMode = (newMode: 'signin' | 'signup' | 'reset') => {
    setMode(newMode);
    setLocalError('');
    clearError();
    setResetSuccess(false);
  };

  const activeError = localError || authError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative bg-[#FCFDF9] rounded-3xl max-w-md w-full shadow-2xl border border-[#244D2C]/20 overflow-hidden my-6 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#244D2C]/10 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#244D2C] text-[#EAF2D5] flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-[#F07853]" />
            </div>
            <div>
              <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#244D2C]">
                {mode === 'signin' && 'Sign In to LABELIQ'}
                {mode === 'signup' && 'Create Your Account'}
                {mode === 'reset' && 'Reset Password'}
              </h2>
              <p className="text-xs text-[#244D2C]/70">
                {mode === 'signin' && 'Access your private scan history & health profiles'}
                {mode === 'signup' && 'Join for verified ingredient & allergen tracking'}
                {mode === 'reset' && 'Enter your email to receive recovery instructions'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning if Firebase environment variables are not configured */}
        {!isConfigured && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Firebase Configuration Required</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800/90">
              Firebase credentials are not yet defined in environment variables. Add <code>VITE_FIREBASE_API_KEY</code>, <code>VITE_FIREBASE_AUTH_DOMAIN</code>, and <code>VITE_FIREBASE_PROJECT_ID</code> to your <code>.env</code> file.
            </p>
          </div>
        )}

        {/* Tabs */}
        {mode !== 'reset' && (
          <div className="flex rounded-xl bg-[#EAF2D5]/60 p-1 border border-[#244D2C]/10 text-xs font-semibold">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-[#244D2C] text-[#EAF2D5] shadow-xs'
                  : 'text-[#244D2C]/70 hover:text-[#244D2C]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-[#244D2C] text-[#EAF2D5] shadow-xs'
                  : 'text-[#244D2C]/70 hover:text-[#244D2C]'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Error & Success Banners */}
        {activeError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{activeError}</span>
          </div>
        )}

        {resetSuccess && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <span>A password reset email has been dispatched. Please check your inbox.</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#244D2C]">Full Name:</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jahnvi Kashyap"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#244D2C]/20 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#244D2C]/30 text-[#244D2C]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#244D2C]">Email Address:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#244D2C]/20 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#244D2C]/30 text-[#244D2C]"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#244D2C]">Password:</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => switchMode('reset')}
                    className="text-[11px] font-semibold text-[#F07853] hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#244D2C]/20 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#244D2C]/30 text-[#244D2C]"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#244D2C]">Confirm Password:</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#244D2C]/20 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#244D2C]/30 text-[#244D2C]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#244D2C] hover:bg-[#1A3620] text-[#EAF2D5] font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <span>
              {loading
                ? 'Processing...'
                : mode === 'signin'
                ? 'Sign In with Email'
                : mode === 'signup'
                ? 'Create New Account'
                : 'Send Password Reset Email'}
            </span>
            {!loading && <ArrowRight className="w-3.5 h-3.5 text-[#F07853]" />}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-2 text-center text-xs text-[#244D2C]/70">
          {mode === 'reset' && (
            <button
              onClick={() => switchMode('signin')}
              className="text-[#F07853] font-bold hover:underline"
            >
              ← Back to Sign In
            </button>
          )}
          {mode === 'signin' && (
            <p>
              Don&apos;t have an account yet?{' '}
              <button
                onClick={() => switchMode('signup')}
                className="text-[#F07853] font-bold hover:underline"
              >
                Register here
              </button>
            </p>
          )}
          {mode === 'signup' && (
            <p>
              Already registered?{' '}
              <button
                onClick={() => switchMode('signin')}
                className="text-[#F07853] font-bold hover:underline"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
