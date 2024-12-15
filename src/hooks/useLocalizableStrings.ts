import { useState, useEffect } from "react";
import { LocalizableStrings } from "../types";
import { API_ENDPOINTS, ERROR_MESSAGES } from "../constants";
import { extractAvailableLanguages } from "../utils/stringUtils";

export const useLocalizableStrings = () => {
  const [localizableStrings, setLocalizableStrings] = useState<LocalizableStrings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);

  useEffect(() => {
    const fetchStrings = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.strings);
        if (!response.ok) {
          throw new Error(ERROR_MESSAGES.httpError(response.status));
        }

        const data: LocalizableStrings = await response.json();

        if (!data.sourceLanguage || !data.strings || !data.version) {
          throw new Error(ERROR_MESSAGES.invalidData);
        }

        setLocalizableStrings(data);

        const languagesArray = extractAvailableLanguages(data.strings);
        setAvailableLanguages(languagesArray);
        setSelectedLanguage(data.sourceLanguage);
      } catch (err) {
        setError(err instanceof Error ? err.message : ERROR_MESSAGES.genericError);
        console.error("Error loading strings:", err);
      }
    };

    fetchStrings();
  }, []);

  return {
    localizableStrings,
    error,
    selectedLanguage,
    setSelectedLanguage,
    availableLanguages,
  };
};
