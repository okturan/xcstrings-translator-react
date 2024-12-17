import { useState, useEffect } from "react";
import { LocalizableStrings, Localization, VariationsMap, VariationValue } from "../types";
import { API_ENDPOINTS, ERROR_MESSAGES } from "../constants";
import { extractAvailableLanguages } from "../utils/stringUtils";

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
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);

  const handleError = (err: unknown, context: string) => {
    const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.genericError;
    setError(errorMessage);
    console.error(`Error in ${context}:`, err);
    throw err;
  };

  // Fetch localization strings on component mount
  useEffect(() => {
    const fetchStrings = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.strings);
        if (!response.ok) {
          throw new Error(ERROR_MESSAGES.httpError(response.status));
        }

        const data: LocalizableStrings = await response.json();
        validateData(data);

        setLocalizableStrings(data);
        initializeLanguages(data);
      } catch (err) {
        handleError(err, "fetchStrings");
      }
    };

    fetchStrings();
  }, []);

  const validateData = (data: LocalizableStrings) => {
    if (!data.sourceLanguage || !data.strings || !data.version) {
      throw new Error(ERROR_MESSAGES.invalidData);
    }
  };

  const initializeLanguages = (data: LocalizableStrings) => {
    const languagesArray = extractAvailableLanguages(data.strings);
    setAvailableLanguages(languagesArray);
    setSelectedLanguage(data.sourceLanguage);
  };

  const initializeLocalization = (strings: LocalizableStrings["strings"], key: string, language: string): Localization => {
    if (!strings[key]) {
      throw new Error(`String key "${key}" does not exist.`);
    }

    if (!strings[key].localizations[language]) {
      strings[key].localizations[language] = {};
    }

    return strings[key].localizations[language];
  };

  const updateVariationAtPath = (variations: VariationsMap, pathParts: string[], value: string): void => {
    let currentVariations = variations;

    pathParts.forEach((part, index) => {
      const [variationType, variationKey] = part.split(":");

      if (!currentVariations[variationType]) {
        currentVariations[variationType] = {};
      }

      const isLastPart = index === pathParts.length - 1;
      if (isLastPart) {
        currentVariations[variationType][variationKey] = {
          stringUnit: {
            state: "translated",
            value,
          },
        };
      } else {
        const currentValue = ensureNestedVariation(currentVariations[variationType], variationKey);
        currentVariations = currentValue.variations!;
      }
    });
  };

  const ensureNestedVariation = (container: { [key: string]: VariationValue }, key: string): VariationValue => {
    if (!container[key]) {
      container[key] = { variations: {} };
    } else if (!container[key].variations) {
      container[key].variations = {};
    }
    return container[key];
  };

  const updateLocalizationValue = (localization: Localization, value: string, path?: string): void => {
    if (path) {
      if (!localization.variations) {
        localization.variations = {};
      }
      updateVariationAtPath(localization.variations, path.split("."), value);
      delete localization.stringUnit;
    } else {
      delete localization.variations;
      localization.stringUnit = {
        state: "translated",
        value,
      };
    }
  };

  const saveToServer = async ({ key, language, value, path }: UpdateTranslationParams): Promise<void> => {
    const response = await fetch(API_ENDPOINTS.save, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key, language, value, path }),
    });

    if (!response.ok) {
      throw new Error(ERROR_MESSAGES.httpError(response.status));
    }
  };

  /**
   * Updates a translation string, handling nested variations if a path is provided.
   */
  const updateTranslation = async ({ key, value, language, path }: UpdateTranslationParams): Promise<void> => {
    if (!localizableStrings) return;

    try {
      const updatedStrings: LocalizableStrings = JSON.parse(JSON.stringify(localizableStrings));

      const localization = initializeLocalization(updatedStrings.strings, key, language);
      updateLocalizationValue(localization, value, path);
      setLocalizableStrings(updatedStrings);

      await saveToServer({ key, language, value, path });
    } catch (err) {
      handleError(err, "updateTranslation");
    }
  };

  return {
    localizableStrings,
    error,
    selectedLanguage,
    setSelectedLanguage,
    availableLanguages,
    updateTranslation: (key: string, value: string, language: string, path?: string) => updateTranslation({ key, value, language, path }),
  };
};
