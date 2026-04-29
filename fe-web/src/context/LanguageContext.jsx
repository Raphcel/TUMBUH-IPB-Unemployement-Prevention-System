import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { en } from '../i18n/en';
import { id } from '../i18n/id';

const STORAGE_KEY = 'tumbuh_lang';
const DICTIONARIES = { en, id };
const SUPPORTED = ['en', 'id'];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED.includes(stored) ? stored : 'id';
  });

  const setLang = useCallback((newLang) => {
    if (!SUPPORTED.includes(newLang)) return;
    localStorage.setItem(STORAGE_KEY, newLang);
    setLangState(newLang);
  }, []);

  const t = useCallback(
    (key, fallback) => {
      const dict = DICTIONARIES[lang];
      const val = dict[key];
      if (val !== undefined) return val;
      // Fall back to EN, then to the key itself
      return DICTIONARIES.en[key] ?? fallback ?? key;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * useTranslation()
 * Returns { t, lang, setLang }
 *
 * Usage:
 *   const { t, lang, setLang } = useTranslation();
 *   <p>{t('lamaran_title')}</p>
 */
export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useTranslation must be used inside <LanguageProvider>');
  return ctx;
}
