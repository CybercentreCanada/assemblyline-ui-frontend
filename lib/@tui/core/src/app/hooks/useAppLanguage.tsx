import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCookiesStore } from '../../cookies';
import { MODULE_NAME } from '../../name';

export type UseAppLanguageType = {
  isFR: () => boolean;
  isEN: () => boolean;
  toggle: () => void;
};

export const useAppLanguage = (onChange?: (language: 'en' | 'fr') => void): UseAppLanguageType => {
  const lang = useCookiesStore(state => state.lang);
  const setLang = useCookiesStore(state => state.setLang);

  const { i18n } = useTranslation(MODULE_NAME);

  const toggle = useCallback(() => {
    setLang(lang === 'en' ? 'fr' : 'en');
  }, [lang, setLang]);

  useEffect(() => {
    if (onChange) {
      i18n.on('languageChanged', onChange);
    }
    return () => {
      if (onChange) {
        i18n.off('languageChanged', onChange);
      }
    };
  }, [i18n, onChange]);

  return useMemo(
    () => ({
      isFR: () => lang === 'fr',
      isEN: () => lang === 'en',
      toggle
    }),
    [lang, toggle]
  );
};
