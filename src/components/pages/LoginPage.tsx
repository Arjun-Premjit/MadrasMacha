import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Sparkles,
  QrCode,
  KeyRound,
  Lock,
  Mail,
  User,
  ArrowLeft,
  Copy,
  Check,
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { LanguageToggle } from '../LanguageToggle';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  role: 'commuter' | 'transit_admin';
  mfaEnabled: boolean;
}

interface LoginPageProps {
  onLoginSuccess: (token: string, user: AuthUser) => void;
}

type AuthMode = 'login' | 'register' | 'mfa_verify' | 'mfa_enroll';

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { language } = useLanguage();

  // Mode state: 'login' | 'register' | 'mfa_verify' | 'mfa_enroll'
  const [mode, setMode] = useState<AuthMode>('login');

  // Input states
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // MFA Challenge State
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [manualKey, setManualKey] = useState<string | null>(null);

  // UI status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Clear messages on input
  const clearMessages = () => {
    if (errorMessage) setErrorMessage(null);
    if (infoMessage) setInfoMessage(null);
  };

  // ─────────────────────────────────────────────────────────────
  // 1. LOGIN SUBMISSION (PASSWORD VERIFICATION STEP)
  // ─────────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!identifier.trim() || !password) {
      setErrorMessage(
        language === 'ta'
          ? 'மின்னஞ்சல்/பயனர்பெயர் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.'
          : 'Please enter your email/username and password.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Authentication failed. Please verify your credentials.');
        return;
      }

      // Password verified -> Server requires MFA
      setMfaToken(data.mfaToken);

      if (data.mfaEnrollmentRequired) {
        setQrCodeDataUrl(data.qrCode);
        setManualKey(data.manualKey);
        setMode('mfa_enroll');
        setInfoMessage(
          language === 'ta'
            ? 'அங்கீகாரப் பயன்பாட்டை (Google/Microsoft Authenticator) ஸ்கேன் செய்து 6-இலக்கக் குறியீட்டை உள்ளிடவும்.'
            : 'Scan the QR code with Google/Microsoft Authenticator to complete MFA setup.'
        );
      } else {
        setMode('mfa_verify');
        setInfoMessage(
          language === 'ta'
            ? 'உங்கள் அங்கீகாரப் பயன்பாட்டிலிருந்து 6-இலக்கக் குறியீட்டை உள்ளிடவும்.'
            : 'Please enter the 6-digit verification code from your authenticator app.'
        );
      }
    } catch (err: any) {
      setErrorMessage(
        language === 'ta'
          ? 'சேவையகத்தை அணுக முடியவில்லை. உங்கள் இணைப்பைச் சரிபார்க்கவும்.'
          : 'Unable to reach authentication server. Please check your network connection.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 2. REGISTRATION SUBMISSION (CREATES COMMUTER ACCOUNT + MFA)
  // ─────────────────────────────────────────────────────────────
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage(
        language === 'ta'
          ? 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.'
          : 'Please enter a valid email address.'
      );
      return;
    }

    if (!username.trim() || !/^[a-zA-Z0-9_-]{3,30}$/.test(username.trim())) {
      setErrorMessage(
        language === 'ta'
          ? 'பயனர்பெயர் 3 முதல் 30 எழுத்துகள் வரை இருக்க வேண்டும் (எழுத்துக்கள், எண்கள் மட்டும்).'
          : 'Username must be 3-30 alphanumeric characters.'
      );
      return;
    }

    if (!password || password.length < 8) {
      setErrorMessage(
        language === 'ta'
          ? 'கடவுச்சொல் குறைந்தது 8 எழுத்துக்கள் கொண்டதாக இருக்க வேண்டும்.'
          : 'Password must be at least 8 characters long.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          username: username.trim(),
          fullName: fullName.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Registration failed. Please choose another username/email.');
        return;
      }

      // Registration successful -> immediately switch to MFA enrolment
      setMfaToken(data.mfaToken);
      setQrCodeDataUrl(data.qrCode);
      setManualKey(data.manualKey);
      setMode('mfa_enroll');
      setInfoMessage(
        language === 'ta'
          ? 'கணக்கு உருவாக்கப்பட்டது! உங்கள் கணக்கைப் பாதுகாக்க அங்கீகாரப் பயன்பாட்டை ஸ்கேன் செய்யவும்.'
          : 'Account created! Scan the QR code to connect your authenticator app.'
      );
    } catch (err: any) {
      setErrorMessage('Unable to complete registration. Please check server connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 3. TOTP CODE VERIFICATION (COMPLETES REAL LOGIN/ENROLMENT)
  // ─────────────────────────────────────────────────────────────
  const handleTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const cleanCode = totpCode.trim().replace(/\s+/g, '');
    if (!cleanCode || cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      setErrorMessage(
        language === 'ta'
          ? 'சரியான 6-இலக்க அங்கீகாரக் குறியீட்டை உள்ளிடவும்.'
          : 'Please enter a valid 6-digit numerical code.'
      );
      return;
    }

    if (!mfaToken) {
      setErrorMessage('Session expired. Please restart login.');
      setMode('login');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mfaToken, code: cleanCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Invalid or expired 6-digit code. Please verify time synchronization.');
        return;
      }

      // Real server-side authentication complete!
      localStorage.setItem('mm_session_token', data.token);
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setErrorMessage('Failed to verify authenticator code. Please check server connectivity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyManualKey = () => {
    if (manualKey) {
      navigator.clipboard.writeText(manualKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 selection:bg-black selection:text-white font-sans flex flex-col justify-between">
      {/* Top Bar with Minimal Brand & Language Switch */}
      <header className="w-full px-6 py-6 sm:px-10 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-black text-white text-xs font-black shadow-xs">
            MM
          </span>
          <div>
            <span className="font-bold tracking-tight text-sm text-neutral-950 block leading-tight">
              Madras Macha
            </span>
            <span className="text-[11px] text-neutral-500 font-medium hidden sm:inline">
              Chennai Unified Transit Platform &bull; Security Hardened (DA 3)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageToggle variant="pill" />
        </div>
      </header>

      {/* Main Auth Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Visual Identity & Transit Schematic */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 rounded-3xl bg-white border border-neutral-200/90 shadow-xs h-full min-h-[520px]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] font-bold text-neutral-800 mb-6">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bcrypt + TOTP MFA Secured</span>
              </div>

              <h2 className="text-3xl font-black tracking-tight text-neutral-900 leading-tight">
                Madras Macha
              </h2>
              <p className="mt-2 text-sm text-neutral-600 font-medium italic">
                Your city. Your route. Your journey.
              </p>

              <p className="mt-6 text-xs text-neutral-500 leading-relaxed">
                {language === 'ta'
                  ? 'சென்னை மாநகர பேருந்துகள் (MTC) மற்றும் சென்னை மெட்ரோ ரயில் பயணங்களுக்கான பாதுகாப்பான தளம். இரட்டை அடுக்கு அங்கீகாரம் (MFA) செயல்படுத்தப்பட்டுள்ளது.'
                  : 'Chennai public transit platform protected with salted bcrypt password storage, AES-256-GCM encrypted TOTP authenticator MFA, and role-based access control.'}
              </p>
            </div>

            {/* Chennai Transit Schematic Motif */}
            <div className="my-6 p-5 rounded-2xl bg-[#FAFAFA] border border-neutral-200/70">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center justify-between">
                <span>Chennai Transit Corridors</span>
                <span className="text-[10px] font-mono text-neutral-400">CMRL &bull; MTC</span>
              </div>

              <svg viewBox="0 0 320 120" className="w-full h-auto" aria-hidden="true">
                <path d="M 20 30 L 120 30 L 180 80 L 300 80" fill="none" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
                <path d="M 20 80 L 120 80 L 180 30 L 300 30" fill="none" stroke="#059669" strokeWidth="4" strokeLinecap="round" />
                <path d="M 20 55 L 300 55" fill="none" stroke="#D97706" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
                <circle cx="20" cy="30" r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
                <circle cx="120" cy="30" r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
                <circle cx="180" cy="80" r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
                <circle cx="300" cy="80" r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
                <circle cx="20" cy="80" r="5" fill="#FFFFFF" stroke="#059669" strokeWidth="3" />
                <circle cx="120" cy="80" r="5" fill="#FFFFFF" stroke="#059669" strokeWidth="3" />
                <circle cx="180" cy="30" r="5" fill="#FFFFFF" stroke="#059669" strokeWidth="3" />
                <circle cx="300" cy="30" r="5" fill="#FFFFFF" stroke="#059669" strokeWidth="3" />
                <circle cx="150" cy="55" r="7" fill="#000000" stroke="#FFFFFF" strokeWidth="2" />
              </svg>

              <div className="flex items-center justify-between text-[10px] font-medium text-neutral-600 mt-2 px-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> Blue Line
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" /> Green Line
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> MTC Bus
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span>Security Tier: DA 3 Question 2</span>
              <span className="font-semibold text-neutral-800">RBAC Enabled</span>
            </div>
          </div>

          {/* Right Column: Interactive Multi-Step Authentication Card */}
          <div className="lg:col-span-7 max-w-lg mx-auto w-full">
            <div className="bg-white rounded-3xl border border-neutral-200/90 p-7 sm:p-10 shadow-xs">
              
              {/* Card Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold tracking-wider uppercase text-neutral-500">
                    Madras Macha
                  </span>
                  <span className="w-1 h-1 rounded-full bg-neutral-300" />
                  <span className="text-xs text-neutral-500 italic">
                    Your city. Your route. Your journey.
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
                  {mode === 'login' && (language === 'ta' ? 'உள்நுழையவும்' : 'Welcome back')}
                  {mode === 'register' && (language === 'ta' ? 'புதிய கணக்கு' : 'Create account')}
                  {mode === 'mfa_enroll' && (language === 'ta' ? 'MFA அமைப்பு' : 'Set up Authenticator')}
                  {mode === 'mfa_verify' && (language === 'ta' ? 'இரு காரணி சரிபார்ப்பு' : 'Two-Factor Verification')}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  {mode === 'login' && (language === 'ta' ? 'உங்கள் கணக்கில் பாதுகாப்பாக நுழையவும்.' : 'Sign in to access your Chennai transit account.')}
                  {mode === 'register' && (language === 'ta' ? 'இலவச பயணியர் கணக்கை பதிவு செய்யவும்.' : 'Register a new commuter account.')}
                  {mode === 'mfa_enroll' && (language === 'ta' ? 'QR குறியீட்டை ஸ்கேன் செய்து 6-இலக்கக் குறியீட்டை உள்ளிடவும்.' : 'Scan QR code with Google or Microsoft Authenticator.')}
                  {mode === 'mfa_verify' && (language === 'ta' ? 'அங்கீகாரப் பயன்பாட்டிலிருந்து குறியீட்டை உள்ளிடவும்.' : 'Enter the 6-digit code from your authenticator app.')}
                </p>
              </div>

              {/* Informative / Error Callout Banner */}
              {errorMessage && (
                <div
                  role="alert"
                  className="mb-5 p-4 rounded-2xl border border-red-200 bg-red-50/80 text-xs text-red-900 flex items-start gap-2.5 animate-in fade-in"
                >
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold mb-0.5">Authentication Error</div>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              )}

              {infoMessage && (
                <div
                  role="status"
                  className="mb-5 p-4 rounded-2xl border border-blue-200 bg-blue-50/80 text-xs text-blue-900 flex items-start gap-2.5 animate-in fade-in"
                >
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold mb-0.5">MFA Step Required</div>
                    <p>{infoMessage}</p>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────
                  MODE 1: LOGIN FORM (EMAIL / USERNAME + PASSWORD)
                  ───────────────────────────────────────────────────────── */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
                  <div>
                    <label htmlFor="auth-identifier" className="block text-xs font-bold text-neutral-800 mb-1.5">
                      {language === 'ta' ? 'மின்னஞ்சல் அல்லது பயனர்பெயர்' : 'Email or Username'}
                    </label>
                    <div className="relative">
                      <input
                        id="auth-identifier"
                        type="text"
                        autoComplete="username"
                        value={identifier}
                        onChange={(e) => {
                          setIdentifier(e.target.value);
                          clearMessages();
                        }}
                        placeholder="name@example.com or chennaimacha"
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 bg-[#FAFAFA] focus:bg-white focus:border-black focus:ring-2 focus:ring-black/5 transition outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="auth-password" className="block text-xs font-bold text-neutral-800 mb-1.5">
                      {language === 'ta' ? 'கடவுச்சொல்' : 'Password'}
                    </label>
                    <div className="relative">
                      <input
                        id="auth-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          clearMessages();
                        }}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        className="w-full pl-4 pr-11 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 bg-[#FAFAFA] focus:bg-white focus:border-black focus:ring-2 focus:ring-black/5 transition outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-black text-white text-sm font-bold hover:bg-neutral-800 disabled:opacity-60 transition cursor-pointer shadow-xs"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying Credentials...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue with Password</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 text-center">
                    <p className="text-xs text-neutral-600">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          clearMessages();
                          setMode('register');
                        }}
                        className="font-bold text-black hover:underline cursor-pointer ml-1"
                      >
                        Create commuter account
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* ─────────────────────────────────────────────────────────
                  MODE 2: REGISTRATION FORM
                  ───────────────────────────────────────────────────────── */}
              {mode === 'register' && (
                <form onSubmit={handleRegisterSubmit} noValidate className="space-y-4">
                  <div>
                    <label htmlFor="reg-email" className="block text-xs font-bold text-neutral-800 mb-1.5">
                      Email address
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearMessages();
                      }}
                      placeholder="commuter@example.com"
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 bg-[#FAFAFA] focus:bg-white focus:border-black focus:ring-2 focus:ring-black/5 transition outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-username" className="block text-xs font-bold text-neutral-800 mb-1.5">
                      Username (3-30 letters/numbers)
                    </label>
                    <input
                      id="reg-username"
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        clearMessages();
                      }}
                      placeholder="chennaicommuter"
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 bg-[#FAFAFA] focus:bg-white focus:border-black focus:ring-2 focus:ring-black/5 transition outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-fullname" className="block text-xs font-bold text-neutral-800 mb-1.5">
                      Full Name (Optional)
                    </label>
                    <input
                      id="reg-fullname"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        clearMessages();
                      }}
                      placeholder="Arjun Premjit"
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 bg-[#FAFAFA] focus:bg-white focus:border-black focus:ring-2 focus:ring-black/5 transition outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-password" className="block text-xs font-bold text-neutral-800 mb-1.5">
                      Password (min. 8 characters)
                    </label>
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearMessages();
                      }}
                      placeholder="••••••••••••"
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 bg-[#FAFAFA] focus:bg-white focus:border-black focus:ring-2 focus:ring-black/5 transition outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-black text-white text-sm font-bold hover:bg-neutral-800 disabled:opacity-60 transition cursor-pointer shadow-xs"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating Secure Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Account &amp; Setup MFA</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        clearMessages();
                        setMode('login');
                      }}
                      className="text-xs font-semibold text-neutral-700 hover:text-black cursor-pointer inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign in
                    </button>
                  </div>
                </form>
              )}

              {/* ─────────────────────────────────────────────────────────
                  MODE 3: TOTP ENROLMENT (QR CODE + VERIFICATION CODE)
                  ───────────────────────────────────────────────────────── */}
              {mode === 'mfa_enroll' && (
                <form onSubmit={handleTotpSubmit} className="space-y-5">
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-center">
                    <p className="text-xs font-semibold text-neutral-700 mb-3">
                      1. Scan this QR code with Google Authenticator or Microsoft Authenticator:
                    </p>
                    {qrCodeDataUrl ? (
                      <div className="flex justify-center mb-3">
                        <img
                          src={qrCodeDataUrl}
                          alt="TOTP QR Code for Authenticator App"
                          className="w-44 h-44 rounded-xl border border-neutral-200 shadow-2xs bg-white p-2"
                        />
                      </div>
                    ) : (
                      <div className="w-44 h-44 mx-auto flex items-center justify-center bg-white rounded-xl border text-xs text-neutral-400">
                        Generating QR Code...
                      </div>
                    )}

                    {manualKey && (
                      <div className="text-left mt-2 pt-2 border-t border-neutral-200/80">
                        <div className="text-[11px] text-neutral-500 font-medium mb-1">
                          Or enter secret key manually:
                        </div>
                        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-mono">
                          <span className="tracking-wider select-all">{manualKey}</span>
                          <button
                            type="button"
                            onClick={copyManualKey}
                            className="p-1 text-neutral-500 hover:text-black transition cursor-pointer"
                            title="Copy Secret"
                          >
                            {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="totp-code-enroll" className="block text-xs font-bold text-neutral-800 mb-1.5">
                      2. Enter the 6-digit code shown in your app to activate:
                    </label>
                    <input
                      id="totp-code-enroll"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      value={totpCode}
                      onChange={(e) => {
                        setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                        clearMessages();
                      }}
                      placeholder="123456"
                      disabled={isSubmitting}
                      className="w-full text-center tracking-[0.4em] font-mono text-2xl py-3 rounded-xl border border-neutral-200 bg-[#FAFAFA] focus:bg-white focus:border-black focus:ring-2 focus:ring-black/5 transition outline-none font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || totpCode.trim().length !== 6}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-black text-white text-sm font-bold hover:bg-neutral-800 disabled:opacity-50 transition cursor-pointer shadow-xs"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying TOTP Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify &amp; Enter Platform</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        clearMessages();
                        setMode('login');
                      }}
                      className="text-xs text-neutral-500 hover:text-black cursor-pointer"
                    >
                      Cancel and back to login
                    </button>
                  </div>
                </form>
              )}

              {/* ─────────────────────────────────────────────────────────
                  MODE 4: RETURNING LOGIN TOTP VERIFICATION
                  ───────────────────────────────────────────────────────── */}
              {mode === 'mfa_verify' && (
                <form onSubmit={handleTotpSubmit} className="space-y-5">
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-800 shrink-0">
                      <KeyRound className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-xs text-neutral-600">
                      <div className="font-bold text-neutral-900">Authenticator Verification</div>
                      <div>Open your Google Authenticator or Microsoft Authenticator app to view your 6-digit passcode.</div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="totp-code-login" className="block text-xs font-bold text-neutral-800 mb-1.5 text-center">
                      6-Digit Passcode
                    </label>
                    <input
                      id="totp-code-login"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      value={totpCode}
                      onChange={(e) => {
                        setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                        clearMessages();
                      }}
                      placeholder="000000"
                      disabled={isSubmitting}
                      className="w-full text-center tracking-[0.4em] font-mono text-2xl py-3 rounded-xl border border-neutral-200 bg-[#FAFAFA] focus:bg-white focus:border-black focus:ring-2 focus:ring-black/5 transition outline-none font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || totpCode.trim().length !== 6}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-black text-white text-sm font-bold hover:bg-neutral-800 disabled:opacity-50 transition cursor-pointer shadow-xs"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authenticating Session...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify &amp; Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        clearMessages();
                        setMode('login');
                      }}
                      className="text-xs text-neutral-500 hover:text-black cursor-pointer inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to email/password
                    </button>
                  </div>
                </form>
              )}

              {/* Security Footer Notice */}
              <div className="mt-6 pt-4 border-t border-neutral-100 text-[11px] text-neutral-400 text-center leading-normal">
                Strict Zero-Trust Boundary &bull; Authenticator TOTP Required &bull; Bcrypt Salted Storage
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full px-6 py-4 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400 border-t border-neutral-200/60">
        <div>
          Madras Macha &bull; Chennai Metropolitan Transport Corporation &bull; CMRL
        </div>
        <div>
          &copy; {new Date().getFullYear()} MadrasMacha. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
