import { useState, useEffect } from "react";

export function reconcileSelectedLanguage(
  selectedLanguage: string,
  availableLanguages: string[],
  sourceLanguage: string,
): string {
  if (availableLanguages.includes(selectedLanguage)) {
    return selectedLanguage;
  }

  return availableLanguages.find((language) => language !== sourceLanguage) ?? sourceLanguage;
}

export function usePersistedLanguageState(
  defaultLanguage: string,
  availableLanguages: string[] = [],
  sourceLanguage: string = defaultLanguage,
) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    return localStorage.getItem("selectedLanguage") || defaultLanguage;
  });

  useEffect(() => {
    if (!sourceLanguage) return;

    setSelectedLanguage((currentLanguage) =>
      reconcileSelectedLanguage(currentLanguage, availableLanguages, sourceLanguage),
    );
  }, [availableLanguages, sourceLanguage]);

  useEffect(() => {
    if (selectedLanguage) {
      localStorage.setItem("selectedLanguage", selectedLanguage);
    }
  }, [selectedLanguage]);

  return { selectedLanguage, setSelectedLanguage };
}
