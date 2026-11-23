import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from './en';
import zh from './zh';

export const DICTS = { en, zh };
export const LANG_ORDER = ['en', 'zh'];

const STORAGE_KEY = 'wsa-lang';
const LanguageContext = createContext(null);

function readInitialLang() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && DICTS[saved]) return saved;
    const browser = (navigator.language || '').toLowerCase();
    return browser.startsWith('zh') ? 'zh' : 'en';
  } catch (error) {
    return 'en';
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readInitialLang);

  useEffect(() => {
    document.documentElement.lang = DICTS[lang].htmlLang;
    document.documentElement.dataset.lang = lang;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      /* private mode — ignore */
    }
  }, [lang]);

  const setLang = useCallback((next) => {
    if (DICTS[next]) setLangState(next);
  }, []);

  const toggle = useCallback(() => {
    setLangState((prev) => (prev === 'en' ? 'zh' : 'en'));
  }, []);

  const value = useMemo(
    () => ({ lang, m: DICTS[lang], setLang, toggle }),
    [lang, setLang, toggle]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useI18n must be used inside <LanguageProvider>');
  return ctx;
}
