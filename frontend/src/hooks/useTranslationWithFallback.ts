import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useCallback } from 'react';

interface TranslationOptions {
  [key: string]: string | number | boolean | undefined;
}

export const useTranslationWithFallback = () => {
  const { t, i18n } = useI18nTranslation();

  const translate = useCallback(
    (key: string, options?: TranslationOptions) => {
      const translation = t(key, options);
      
      // If translation is missing or equals the key, try to find a fallback
      if (translation === key) {
        // Try to find a more generic key by removing the last segment
        const segments = key.split('.');
        if (segments.length > 1) {
          const fallbackKey = segments.slice(0, -1).join('.');
          const fallbackTranslation = t(fallbackKey, options);
          if (fallbackTranslation !== fallbackKey) {
            return fallbackTranslation;
          }
        }
        
        // If no fallback found, return the key with a warning in development
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Missing translation for key: ${key}`);
        }
      }
      
      return translation;
    },
    [t]
  );

  const translatePlural = useCallback(
    (key: string, count: number, options?: TranslationOptions) => {
      return translate(key, { count, ...options });
    },
    [translate]
  );

  const translateWithFallback = useCallback(
    (key: string, fallback: string, options?: TranslationOptions) => {
      const translation = translate(key, options);
      return translation === key ? fallback : translation;
    },
    [translate]
  );

  return {
    t: translate,
    tPlural: translatePlural,
    tWithFallback: translateWithFallback,
    i18n
  };
}; 