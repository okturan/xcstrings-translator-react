import { useState, useCallback } from "react";
import { LocalizableStrings } from "../types";
import { ERROR_MESSAGES } from "../constants";
import { extractAvailableLanguages } from "../utils/stringUtils";

/**
 * Custom hook to manage localizable strings state with support for nested variations.
 */
export const useLocalizableStrings = () => {
  const [localizableStrings, setLocalizableStrings] = useState<LocalizableStrings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);

  const handleError = (err: unknown, context: string) => {
    const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.genericError;
    setError(errorMessage);
    console.error(`Error in ${context}:`, err);
    throw err;
  };

  const validateData = (data: LocalizableStrings) => {
    if (!data.sourceLanguage || !data.strings || !data.version) {
      throw new Error(ERROR_MESSAGES.invalidData);
    }
  };

  const initializeStrings = useCallback((data: LocalizableStrings) => {
    try {
      validateData(data);
      setLocalizableStrings(data);
      const languagesArray = extractAvailableLanguages(data.strings);
      setAvailableLanguages(languagesArray);
      setError(null);
    } catch (err) {
      handleError(err, "initializeStrings");
    }
  }, []);

  return {
    localizableStrings,
    error,
    setError,
    availableLanguages,
    validateData,
    initializeStrings,
  };
};
