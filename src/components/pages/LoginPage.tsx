import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Info,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { LanguageToggle } from '../LanguageToggle';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onExploreAsGuest?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onExploreAsGuest,
}) => {
  const { language } = useLanguage();

  // Form states (in-memory only, never persisted to localStorage or sessionStorage)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation & UI states
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<{
    type: 'auth_pending' | 'forgot_password' | 'create_account';
    text: string;
  } | null>(null);

  // Email format validator
  const isValidEmail = (val: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email =
        language === 'ta'
          ? 'மின்னஞ்சல் முகவரியை உள்ளிடவும்.'
          : 'Please enter your email address.';
    } else if (!isValidEmail(email)) {
      newErrors.email =
        language === 'ta'
          ? 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும் (எ.கா. user@example.com).'
          : 'Please enter a valid email address (e.g. user@example.com).';
    }

    if (!password) {
      newErrors.password =
        language === 'ta'
          ? 'கடவுச்சொல்லை உள்ளிடவும்.'
          : 'Please enter your password.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Input is valid: Simulate client-side UI processing while strictly NOT persisting credentials
    setIsSubmitting(true);
    setErrors({});

    setTimeout(() => {
      setIsSubmitting(false);
      // Explicitly notify that backend authentication is not yet connected
      setNoticeMessage({
        type: 'auth_pending',
        text:
          language === 'ta'
            ? 'படிவம் வெற்றிகரமாக சரிபார்க்கப்பட்டது. இந்த கட்டத்தில் பின்தள அங்கீகாரம் (Backend Authentication) இன்னும் இணைக்கப்படவில்லை. உங்கள் கடவுச்சொல் சேமிக்கப்படவில்லை.'
            : 'Form inputs validated successfully. Backend authentication has not yet been connected in this development stage. Your credentials were not stored or transmitted.',
      });
    }, 450);
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setNoticeMessage({
      type: 'forgot_password',
      text:
        language === 'ta'
          ? 'கடவுச்சொல் மீட்பு சேவை இன்னும் இணைக்கப்படவில்லை. பின்தள அங்கீகாரம் ஒருங்கிணைக்கப்பட்ட பிறகு இது கிடைக்கும்.'
          : 'Password recovery is not yet connected. This service will be enabled once backend authentication is integrated.',
    });
  };

  const handleCreateAccount = (e: React.MouseEvent) => {
    e.preventDefault();
    setNoticeMessage({
      type: 'create_account',
      text:
        language === 'ta'
          ? 'புதிய பயனர் பதிவு சேவை இன்னும் இணைக்கப்படவில்லை. பின்தள அங்கீகாரம் ஒருங்கிணைக்கப்பட்ட பிறகு இது கிடைக்கும்.'
          : 'User registration is not yet connected. This service will be enabled once backend authentication is integrated.',
    });
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
              Chennai Unified Transit Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageToggle variant="pill" />
        </div>
      </header>

      {/* Main Login Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Transit Illustration & Visual Identity */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 rounded-3xl bg-white border border-neutral-200/90 shadow-xs h-full min-h-[520px]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] font-bold text-neutral-800 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
                <span>Chennai Public Transit</span>
              </div>

              <h2 className="text-3xl font-black tracking-tight text-neutral-900 leading-tight">
                Madras Macha
              </h2>
              <p className="mt-2 text-sm text-neutral-600 font-medium italic">
                Your city. Your route. Your journey.
              </p>

              <p className="mt-6 text-xs text-neutral-500 leading-relaxed">
                {language === 'ta'
                  ? 'சென்னை மாநகர பேருந்துகள் (MTC) மற்றும் சென்னை மெட்ரோ ரயில் வழித்தடங்களுக்கான துல்லியமான வழிசெலுத்தல் மற்றும் கட்டண தகவல் தளம்.'
                  : 'Comprehensive real-time schedules, corridor stops, live GTFS-RT tracking, and official fare rules for MTC buses and Chennai Metro Rail.'}
              </p>
            </div>

            {/* Chennai Transit Schematic Motif */}
            <div className="my-6 p-5 rounded-2xl bg-[#FAFAFA] border border-neutral-200/70">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center justify-between">
                <span>Chennai Transit Corridors</span>
                <span className="text-[10px] font-mono text-neutral-400">CMRL &bull; MTC</span>
              </div>

              {/* Transit Line SVG Motif */}
              <svg viewBox="0 0 320 120" className="w-full h-auto" aria-hidden="true">
                {/* Blue Metro Line */}
                <path
                  d="M 20 30 L 120 30 L 180 80 L 300 80"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Green Metro Line */}
                <path
                  d="M 20 80 L 120 80 L 180 30 L 300 30"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* MTC Bus Accent Line */}
                <path
                  d="M 20 55 L 300 55"
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />

                {/* Stations */}
                <circle cx="20" cy="30" r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
                <circle cx="120" cy="30" r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
                <circle cx="180" cy="80" r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
                <circle cx="300" cy="80" r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />

                <circle cx="20" cy="80" r="5" fill="#FFFFFF" stroke="#059669" strokeWidth="3" />
                <circle cx="120" cy="80" r="5" fill="#FFFFFF" stroke="#059669" strokeWidth="3" />
                <circle cx="180" cy="30" r="5" fill="#FFFFFF" stroke="#059669" strokeWidth="3" />
                <circle cx="300" cy="30" r="5" fill="#FFFFFF" stroke="#059669" strokeWidth="3" />

                {/* Interchange Central Station Node */}
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
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> MTC Corridors
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span>Direct access to 600+ corridors</span>
              <span className="font-semibold text-neutral-800">CUMTA GTFS Feed</span>
            </div>
          </div>

          {/* Right Column: Form Card */}
          <div className="lg:col-span-7 max-w-lg mx-auto w-full">
            <div className="bg-white rounded-3xl border border-neutral-200/90 p-7 sm:p-10 shadow-xs">
              
              {/* Card Header */}
              <div className="mb-8">
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
                  {language === 'ta' ? 'மீண்டும் வருக' : 'Welcome back'}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  {language === 'ta'
                    ? 'உங்கள் சென்னை போக்குவரத்து அனுபவத்தைத் தொடர உள்நுழையவும்.'
                    : 'Sign in to continue to your Chennai transit experience.'}
                </p>
              </div>

              {/* Informational Callout / Alert Box */}
              {noticeMessage && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`mb-6 p-4 rounded-2xl border text-xs leading-relaxed transition-all ${
                    noticeMessage.type === 'auth_pending'
                      ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {noticeMessage.type === 'auth_pending' ? (
                      <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-bold text-[13px] mb-1">
                        {noticeMessage.type === 'auth_pending'
                          ? language === 'ta'
                            ? 'அங்கீகார சேவை இணைப்பு நிலுவையில் உள்ளது'
                            : 'Authentication Pending Connection'
                          : language === 'ta'
                          ? 'அறிவிப்பு'
                          : 'Notice'}
                      </div>
                      <p className="text-neutral-700">{noticeMessage.text}</p>

                      {noticeMessage.type === 'auth_pending' && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={onLoginSuccess}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 transition cursor-pointer shadow-xs"
                          >
                            <span>
                              {language === 'ta'
                                ? 'போக்குவரத்து வழிகாட்டியை ஆராயுங்கள் →'
                                : 'Continue to Transit Guide →'}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-bold text-neutral-800 mb-1.5"
                  >
                    {language === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email address'}
                  </label>
                  <div className="relative">
                    <input
                      id="login-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="name@example.com"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 rounded-xl border text-sm text-neutral-900 placeholder:text-neutral-400 bg-[#FAFAFA] focus:bg-white transition outline-none ${
                        errors.email
                          ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                          : 'border-neutral-200 focus:border-black focus:ring-2 focus:ring-black/5'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p
                      id="email-error"
                      className="mt-1.5 text-xs text-red-600 font-medium"
                      role="alert"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-bold text-neutral-800"
                    >
                      {language === 'ta' ? 'கடவுச்சொல்' : 'Password'}
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? 'password-error' : undefined}
                      disabled={isSubmitting}
                      className={`w-full pl-4 pr-11 py-3 rounded-xl border text-sm text-neutral-900 placeholder:text-neutral-400 bg-[#FAFAFA] focus:bg-white transition outline-none ${
                        errors.password
                          ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                          : 'border-neutral-200 focus:border-black focus:ring-2 focus:ring-black/5'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p
                      id="password-error"
                      className="mt-1.5 text-xs text-red-600 font-medium"
                      role="alert"
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Controls Row: Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-700">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isSubmitting}
                      className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black cursor-pointer accent-black"
                    />
                    <span>{language === 'ta' ? 'என்னை நினைவில் கொள்' : 'Remember me'}</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-semibold text-neutral-700 hover:text-black hover:underline cursor-pointer"
                  >
                    {language === 'ta' ? 'கடவுச்சொல் மறந்துவிட்டதா?' : 'Forgot password?'}
                  </button>
                </div>

                {/* Submit Sign In Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-black text-white text-sm font-bold hover:bg-neutral-800 disabled:opacity-60 transition cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{language === 'ta' ? 'சரிபார்க்கிறது...' : 'Validating...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{language === 'ta' ? 'உள்நுழையவும்' : 'Sign in'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Secondary Action: Explore Transit Directly */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={onExploreAsGuest || onLoginSuccess}
                    className="w-full py-2.5 px-4 rounded-xl border border-neutral-200/90 bg-[#FAFAFA] hover:bg-neutral-100 text-xs font-semibold text-neutral-800 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>
                      {language === 'ta'
                        ? 'விருந்தினராக தொடரவும் (உள்நுழைவு தேவையில்லை) →'
                        : 'Explore transit platform as guest →'}
                    </span>
                  </button>
                </div>

                {/* Footer Link: Create Account */}
                <div className="pt-4 border-t border-neutral-100 text-center">
                  <p className="text-xs text-neutral-600">
                    {language === 'ta' ? 'கணக்கு இல்லையா?' : "Don't have an account?"}{' '}
                    <button
                      type="button"
                      onClick={handleCreateAccount}
                      className="font-bold text-black hover:underline cursor-pointer ml-1"
                    >
                      {language === 'ta' ? 'கணக்கை உருவாக்கவும்' : 'Create account'}
                    </button>
                  </p>
                </div>
              </form>

              {/* Privacy / Security Notice */}
              <div className="mt-6 pt-4 border-t border-neutral-100 text-[11px] text-neutral-400 text-center leading-normal">
                {language === 'ta'
                  ? 'பாதுகாப்பான சென்னை போக்குவரத்து தகவல் போர்டல். பின்தள அங்கீகாரம் இணைக்கப்பட்ட பின் பயனர் நற்சான்றிதழ்கள் பாதுகாப்பாக கையாளப்படும்.'
                  : 'Secure transit information directory. Real authentication integration point prepared for future backend setup.'}
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
