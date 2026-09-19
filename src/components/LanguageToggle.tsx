import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { Languages } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
  variant?: 'pill' | 'minimal';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className = '',
  variant = 'pill',
}) => {
  const { language, setLanguage } = useLanguage();

  if (variant === 'minimal') {
    return (
      <div className={`inline-flex items-center text-xs font-medium ${className}`}>
        <button
          type="button"
          onClick={() => setLanguage('ta')}
          className={`px-2 py-1 transition cursor-pointer ${
            language === 'ta'
              ? 'text-black font-bold underline underline-offset-4'
              : 'text-neutral-500 hover:text-black'
          }`}
          aria-label="Switch language to Tamil"
        >
          தமிழ்
        </button>
        <span className="text-neutral-300">|</span>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2 py-1 transition cursor-pointer ${
            language === 'en'
              ? 'text-black font-bold underline underline-offset-4'
              : 'text-neutral-500 hover:text-black'
          }`}
          aria-label="Switch language to English"
        >
          English
        </button>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-full bg-neutral-100/90 border border-neutral-200/80 shadow-xs text-xs font-semibold ${className}`}
      role="group"
      aria-label="Language selection"
    >
      <button
        type="button"
        onClick={() => setLanguage('ta')}
        className={`px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1 ${
          language === 'ta'
            ? 'bg-black text-white shadow-xs font-bold'
            : 'text-neutral-600 hover:text-black'
        }`}
        aria-pressed={language === 'ta'}
      >
        <span>தமிழ்</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1 ${
          language === 'en'
            ? 'bg-black text-white shadow-xs font-bold'
            : 'text-neutral-600 hover:text-black'
        }`}
        aria-pressed={language === 'en'}
      >
        <span>English</span>
      </button>
    </div>
  );
};
