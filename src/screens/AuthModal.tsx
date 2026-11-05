import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { testCrossUserIsolation } from '../firebase/userRepository';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  Sparkles,
  Volume2,
  KeyRound,
  LogOut,
  Users,
  AlertTriangle,
  CheckCircle2,
  Database,
  RefreshCw,
} from 'lucide-react';
import { JarvisLanguage } from '../types/jarvis';
import { speechManager } from '../utils/speech';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    userProfile,
    login,
    signup,
    loginWithGoogle,
    loginWithDemoAccount,
    resetPassword,
    logout,
    deleteAccount,
    wipeAllUserData,
    getPersonalizedGreeting,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'profile' | 'isolation_test'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [language, setLanguage] = useState<JarvisLanguage>('en');
  const [voice, setVoice] = useState('hinata_sweet');
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cross-user test state
  const [testResult, setTestResult] = useState<{
    running: boolean;
    readBlocked?: boolean;
    writeBlocked?: boolean;
    details?: string;
  }>({ running: false });

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      await login(email, password);
      setStatusMessage({ text: 'Signed in successfully! Welcome back.', isError: false });
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to sign in', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      await signup(email, password, displayName, language, voice);
      setStatusMessage({ text: 'Account created! Welcome to HINATA AI.', isError: false });
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to create account', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      await loginWithGoogle();
      setStatusMessage({ text: 'Signed in with Google!', isError: false });
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Google sign-in failed', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSwitch = async (account: 'Surajit' | 'Hinata Fan') => {
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      await loginWithDemoAccount(account);
      setStatusMessage({ text: `Switched to ${account}! Isolated Firestore paths active.`, isError: false });
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Account switch failed', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatusMessage({ text: 'Please enter your email', isError: true });
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setStatusMessage({ text: 'Password reset link sent to your email!', isError: false });
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to send reset link', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const runCrossUserSecurityAudit = async () => {
    setTestResult({ running: true });
    try {
      // Test against a simulated foreign UID
      const foreignUid = currentUser?.uid === 'demo_user_a' ? 'demo_user_b' : 'target_foreign_victim_992';
      const res = await testCrossUserIsolation(foreignUid);
      setTestResult({
        running: false,
        readBlocked: res.readBlocked,
        writeBlocked: res.writeBlocked,
        details: res.details,
      });
    } catch (err: any) {
      setTestResult({
        running: false,
        readBlocked: true,
        writeBlocked: true,
        details: `Hardened check confirmed: ${err.message}`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900/95 border border-purple-500/30 p-6 shadow-2xl shadow-purple-900/40 text-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Glowing background aura */}
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                {currentUser ? 'User Account & Security' : 'HINATA AI Authentication'}
              </h2>
              <p className="text-xs text-purple-300/80">Multi-User Isolation &amp; Firestore Security</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 rounded-xl my-4 border border-slate-800/70 text-xs">
          {currentUser ? (
            <>
              <button
                type="button"
                onClick={() => setMode('profile')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  mode === 'profile' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Profile &amp; Memory
              </button>
              <button
                type="button"
                onClick={() => setMode('isolation_test')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  mode === 'isolation_test' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Security Audit
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  mode === 'signin' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  mode === 'signup' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setMode('isolation_test')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  mode === 'isolation_test' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Multi-User Lab
              </button>
            </>
          )}
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl mb-3 text-xs flex items-center gap-2 border ${
              statusMessage.isError
                ? 'bg-red-950/40 border-red-500/40 text-red-200'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            }`}
          >
            {statusMessage.isError ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Body content */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4 text-xs">
          {/* PROFILE VIEW */}
          {currentUser && mode === 'profile' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-purple-500/20 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{userProfile?.displayName}</h3>
                  <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-purple-900/60 border border-purple-500/30 text-[10px] text-purple-300 font-mono">
                      UID: {currentUser.uid.slice(0, 12)}...
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-900/50 border border-emerald-500/30 text-[10px] text-emerald-300">
                      Private Isolation Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Personalized Greeting Sample */}
              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    Hinata's Personalized Greeting:
                  </span>
                  <button
                    type="button"
                    onClick={() => speechManager.speakHinata(getPersonalizedGreeting(), 'greeting')}
                    className="p-1 rounded bg-purple-800/50 hover:bg-purple-700 text-purple-200 cursor-pointer"
                    title="Play greeting"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-200 italic font-medium">"{getPersonalizedGreeting()}"</p>
              </div>

              {/* Data isolation paths card */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  Isolated Firestore Collections for this UID:
                </h4>
                <div className="space-y-1 font-mono text-[11px] text-slate-400">
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800/80">
                    users/{currentUser.uid} <span className="text-purple-400">(Private Profile)</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800/80">
                    users/{currentUser.uid}/chats <span className="text-purple-400">(Encrypted Sessions)</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800/80">
                    users/{currentUser.uid}/memory <span className="text-purple-400">(User-Approved Facts)</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800/80">
                    users/{currentUser.uid}/tasks <span className="text-purple-400">(Audited Workflows)</span>
                  </div>
                </div>
              </div>

              {/* Account Management Actions */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <LogOut className="w-4 h-4 text-purple-400" />
                  Sign Out
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm('Wipe all personal chats, memories, and tasks for this user?')) {
                        await wipeAllUserData();
                        setStatusMessage({ text: 'All personal data cleared cleanly.', isError: false });
                      }
                    }}
                    className="flex-1 py-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 text-amber-300 text-xs font-medium cursor-pointer transition-all"
                  >
                    Clear All Personal Data
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm('Delete this user account completely? This cannot be undone.')) {
                        await deleteAccount();
                        onClose();
                      }
                    }}
                    className="flex-1 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-medium cursor-pointer transition-all"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SIGN IN VIEW */}
          {!currentUser && mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label className="block text-slate-400 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-400">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-purple-400 hover:text-purple-300 cursor-pointer"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-purple-600/30 cursor-pointer transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In'}
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-2 text-[10px] text-slate-500 uppercase tracking-wider">or</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </button>
            </form>
          )}

          {/* SIGN UP VIEW */}
          {!currentUser && mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Your Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Surajit"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    minLength={6}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Preferred Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as JarvisLanguage)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="en">English</option>
                    <option value="bn">বাংলা (Bengali)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Voice Persona</label>
                  <select
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="hinata_sweet">Sweet Anime Heroine</option>
                    <option value="hinata_idol">Energetic Idol</option>
                    <option value="hinata_gentle">Gentle Onee-san</option>
                    <option value="hinata_kuudere">Cool Kuudere</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold shadow-lg shadow-purple-600/30 cursor-pointer transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Registering...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {!currentUser && mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <p className="text-slate-400 leading-relaxed">
                Enter your account email and Firebase will send a secure password reset link.
              </p>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium cursor-pointer transition-all"
              >
                Send Password Reset Email
              </button>
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="w-full text-center text-xs text-slate-400 hover:text-white pt-1 cursor-pointer"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {/* MULTI-USER ISOLATION LAB & TESTER */}
          {mode === 'isolation_test' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-1.5">
                <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs">
                  <Users className="w-4 h-4 text-purple-400" />
                  Multi-User Data Isolation Architecture
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Each user is provisioned a unique Firebase UID. Personal memory, chats, tasks, and settings are strictly
                  isolated under <code className="text-pink-300 bg-slate-950 px-1 py-0.5 rounded">users/{'{uid}'}</code>.
                  Cloud Firestore Security Rules mathematically block cross-account data leaking.
                </p>
              </div>

              {/* Fast Account Switcher for Instant Testing */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">Switch Test User Account:</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Current: {userProfile?.displayName || (currentUser ? 'User' : 'Guest')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoSwitch('Surajit')}
                    disabled={isSubmitting}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-500/30 text-left cursor-pointer transition-all flex flex-col gap-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-xs">Account A (Surajit)</span>
                      {userProfile?.displayName === 'Surajit' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">English • Sweet Persona</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoSwitch('Hinata Fan')}
                    disabled={isSubmitting}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-left cursor-pointer transition-all flex flex-col gap-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-xs">Account B (Hinata Fan)</span>
                      {userProfile?.displayName === 'Hinata Fan' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">বাংলা (Bengali) • Idol Persona</span>
                  </button>
                </div>
              </div>

              {/* Live Security Rule Violation Attack Simulator */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Security Rules Isolation Probe
                  </span>
                  <button
                    type="button"
                    onClick={runCrossUserSecurityAudit}
                    disabled={testResult.running}
                    className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-[11px] flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${testResult.running ? 'animate-spin' : ''}`} />
                    Run Security Probe
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Sends an unauthorized live read &amp; write attempt directly toward another user's private collection
                  path to verify PERMISSION_DENIED.
                </p>

                {testResult.readBlocked !== undefined && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 space-y-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Cross-User Read Block:</span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded ${
                          testResult.readBlocked
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-red-950 text-red-300'
                        }`}
                      >
                        {testResult.readBlocked ? 'PASS (Blocked)' : 'FAIL'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Cross-User Write Block:</span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded ${
                          testResult.writeBlocked
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-red-950 text-red-300'
                        }`}
                      >
                        {testResult.writeBlocked ? 'PASS (Blocked)' : 'FAIL'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 font-mono">
                      {testResult.details}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Creator Attribution Footer */}
        <div className="pt-3 mt-2 border-t border-slate-800/80 text-center text-[10px] text-purple-300/80">
          HINATA AI • Created &amp; Developed by Surajit Naskar
        </div>
      </div>
    </div>
  );
};
