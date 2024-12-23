import { useState, useEffect, useCallback } from "react";
import { LocalizableStrings } from "../types";
import { ERROR_MESSAGES } from "../constants";
import { extractAvailableLanguages } from "../utils/stringUtils";
import { FileManager } from "../utils/FileManager";

interface UpdateTranslationParams {
  key: string;
  value: string;
  language: string;
  path?: string;
}

/**
 * Custom hook to manage localizable strings with support for nested variations.
 */
export const useLocalizableStrings = () => {
  const [localizableStrings, setLocalizableStrings] = useState<LocalizableStrings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    return localStorage.getItem("selectedLanguage") || "";
  });
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [fileManager] = useState(() => new FileManager());

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

  const initializeLanguages = (data: LocalizableStrings) => {
    const languagesArray = extractAvailableLanguages(data.strings);
    setAvailableLanguages(languagesArray);
    // Only set source language if no language was previously selected
    if (!localStorage.getItem("selectedLanguage")) {
      setSelectedLanguage(data.sourceLanguage);
    }
  };

  // Save selected language to localStorage whenever it changes
  useEffect(() => {
    if (selectedLanguage) {
      localStorage.setItem("selectedLanguage", selectedLanguage);
    }
  }, [selectedLanguage]);

  const importFile = useCallback(
    async (file: File) => {
      try {
        const data = await fileManager.importFile(file);
        validateData(data);
        setLocalizableStrings(data);
        initializeLanguages(data);
        setError(null);
      } catch (err) {
        handleError(err, "importFile");
      }
    },
    [fileManager],
  );

  const exportFile = useCallback(async () => {
    if (!localizableStrings) {
      throw new Error("No file loaded");
    }
    try {
      await fileManager.exportFile(localizableStrings);
    } catch (err) {
      handleError(err, "exportFile");
    }
  }, [fileManager, localizableStrings]);

  const updateTranslation = useCallback(
    async ({ key, value, language, path }: UpdateTranslationParams): Promise<void> => {
      if (!localizableStrings) return;

      try {
        const updatedStrings = fileManager.updateTranslation(localizableStrings, key, language, value, path);
        console.log("Updated strings:", updatedStrings);

        setLocalizableStrings(updatedStrings);
      } catch (err) {
        handleError(err, "updateTranslation");
      }
    },
    [fileManager, localizableStrings],
  );

  const memoizedUpdateTranslation = useCallback(
    (key: string, value: string, language: string, path?: string) => updateTranslation({ key, value, language, path }),
    [updateTranslation],
  );

  const memoizedSetSelectedLanguage = useCallback((language: string) => {
    setSelectedLanguage(language);
  }, []);

  return {
    localizableStrings,
    error,
    selectedLanguage,
    setSelectedLanguage: memoizedSetSelectedLanguage,
    availableLanguages,
    importFile,
    exportFile,
    updateTranslation: memoizedUpdateTranslation,
  };
};
