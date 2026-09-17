import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, TRANSLATIONS, Translations } from './translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: Translations;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved =
        localStorage.getItem('sajda_app_language') ||
        localStorage.getItem('sakinward_language') ||
        localStorage.getItem('nur_language');
      if (saved && saved in TRANSLATIONS) {
        return saved as SupportedLanguage;
      }
      // Check timezone and browser language in background on first visit
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const navLang = navigator.language?.toLowerCase() || '';

      if (tz.includes('Tashkent') || tz.includes('Samarkand') || navLang.startsWith('uz')) {
        return 'uz';
      }
      if (navLang.startsWith('ar') || tz.includes('Riyadh') || tz.includes('Dubai') || tz.includes('Cairo')) {
        return 'ar';
      }
      if (navLang.startsWith('ru') || tz.includes('Moscow')) {
        return 'ru';
      }
      if (navLang.startsWith('tr') || tz.includes('Istanbul')) {
        return 'tr';
      }
      if (navLang.startsWith('id') || tz.includes('Jakarta')) {
        return 'id';
      }
      if (navLang.startsWith('fr') || tz.includes('Paris')) {
        return 'fr';
      }
      return 'en'; // Strict Default
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('sajda_app_language', lang);
      localStorage.setItem('sakinward_language', lang);
    } catch {}
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const RTL_LANGS: SupportedLanguage[] = ['ar', 'fa', 'ur', 'ps', 'ku', 'ug', 'sd', 'dv'];
  const dir = RTL_LANGS.includes(language) ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
