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

  const updateTranslation = useCallback(
    (key: string, value: string, language: string, path?: string): void => {
      if (!localizableStrings) return;

      try {
        // Create a deep copy of the current state
        const updatedStrings = JSON.parse(JSON.stringify(localizableStrings));
        
        // Navigate to the correct location in the strings object
        let target = updatedStrings.strings[key];
        if (!target) {
          throw new Error(`Key not found: ${key}`);
        }

        if (path) {
          // Split the path and traverse to the correct variation
          const pathParts = path.split('.');
          for (const part of pathParts) {
            target = target.variations?.[part];
            if (!target) {
              throw new Error(`Invalid variation path: ${path}`);
            }
          }
        }

        // Update the translation
        if (!target.localizations) {
          target.localizations = {};
        }
        target.localizations[language] = value;

        setLocalizableStrings(updatedStrings);
        setError(null);
      } catch (err) {
        handleError(err, "updateTranslation");
      }
    },
    [localizableStrings],
  );

  return {
    localizableStrings,
    error,
    availableLanguages,
    validateData,
    initializeStrings,
    updateTranslation,
  };
};
