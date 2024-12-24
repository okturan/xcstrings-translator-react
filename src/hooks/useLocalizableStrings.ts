import { useState, useCallback } from 'react';
import { LocalizableStrings } from '../types';
import { ERROR_MESSAGES } from '../constants';
import { extractAvailableLanguages } from '../utils/stringUtils';

interface UseLocalizableStringsReturn {
  localizableStrings: LocalizableStrings | null;
  error: string | null;
  availableLanguages: string[];
  initializeStrings: (data: LocalizableStrings) => void;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export function useLocalizableStrings(): UseLocalizableStringsReturn {
  const [localizableStrings, setLocalizableStrings] = useState<LocalizableStrings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);

  const validateData = useCallback((data: LocalizableStrings) => {
    if (!data.sourceLanguage || !data.strings || !data.version) {
      throw new Error(ERROR_MESSAGES.invalidData);
    }
  }, []);

  const initializeStrings = useCallback((data: LocalizableStrings) => {
    try {
      validateData(data);
      setLocalizableStrings(data);
      const languagesArray = extractAvailableLanguages(data.strings);
      setAvailableLanguages(languagesArray);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.genericError;
      setError(errorMessage);
      console.error("Error initializing strings:", err);
      throw err;
    }
  }, [validateData]);

  return {
    localizableStrings,
    error,
    availableLanguages,
    initializeStrings,
    setError,
  };
}
