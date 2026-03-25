'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, LanguageCode, TranslationKey } from '@/lib/translations';

type LanguageContextType = {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('english');

  useEffect(() => {
    // Load preference from local storage on mount
    const storedLang = localStorage.getItem('appLanguage') as LanguageCode;
    if (storedLang && translations[storedLang]) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem('appLanguage', lang);
    }
  };

  const t = (key: TranslationKey): string => {
    const langObj = translations[language] || translations.english;
    return langObj[key] || translations.english[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
