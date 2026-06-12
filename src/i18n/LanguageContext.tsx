import { createContext, useContext, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { Language } from './translations';
import './i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Record<string, string>;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n, t: translate } = useTranslation();

  const language = (i18n.language || 'id') as Language;

  const setLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
  };

  const t = new Proxy({} as Record<string, string>, {
    get: (_, key: string) => {
      const val = translate(key);
      return val || key;
    },
  });

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isRTL: language === 'ar',
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
