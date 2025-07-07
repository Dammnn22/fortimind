
import { useCallback } from 'react'; // Import useCallback
import { translations } from '../translations';
import { Language, TranslationKey } from '../types';
import { useLocalStorage } from './useLocalStorage';

export const useLocalization = () => {
  const [language, setLanguageState] = useLocalStorage<Language>('appLanguage', 'en');

  const t = useCallback((key: TranslationKey, ...args: (string | number)[]): string => {
    // Ensure 'language' from state is used, not a stale closure.
    // The translations object for the current language, or fallback to 'en'.
    const currentTranslations = translations[language] || translations.en;
    let translationValue = currentTranslations[key];

    // If the key is not found in the current language, try 'en' as a fallback.
    if (translationValue === undefined && language !== 'en') {
        translationValue = translations.en[key];
    }

    if (typeof translationValue === 'string') {
      let result = translationValue;
      if (args.length > 0) {
          args.forEach((arg, index) => {
              result = result.replace(new RegExp(`\\{${index}\\}`, 'g'), String(arg));
          });
      }
      return result;
    }
    // If translationValue is an array (like monthNames/dayNames if mistakenly passed)
    // or not found, return the key as a string (fallback).
    return String(key); 
  }, [language]); // Depend on language

  const setAppLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    // You might want to force a re-render or reload if components don't update automatically
    // window.location.reload(); // Or a more sophisticated state management update
  }, [setLanguageState]); // setLanguageState from useLocalStorage should be stable

  return { t, setLanguage: setAppLanguage, currentLanguage: language };
};
