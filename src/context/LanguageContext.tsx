import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  SupportedLanguage,
  getLocalizedStopName,
  UI_TRANSLATIONS,
} from '../lib/services/localizationService';
import { Stop } from '../types/transit';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  getStopName: (stopOrName: Stop | string | null | undefined, stopId?: string) => string;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'madras_macha_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'ta' || saved === 'en') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  const getStopName = useMemo(() => {
    return (stopOrName: Stop | string | null | undefined, stopId?: string) => {
      return getLocalizedStopName(stopOrName, language, stopId);
    };
  }, [language]);

  const t = (key: string): string => {
    const entry = UI_TRANSLATIONS[key];
    if (!entry) return key;
    return entry[language] || entry.en;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        getStopName,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback if rendered outside provider
    return {
      language: 'en',
      setLanguage: () => {},
      toggleLanguage: () => {},
      getStopName: (stopOrName, stopId) => getLocalizedStopName(stopOrName, 'en', stopId),
      t: (key) => UI_TRANSLATIONS[key]?.en || key,
    };
  }
  return context;
}
