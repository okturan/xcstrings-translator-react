import { useState, useEffect } from "react";

export function usePersistedLanguageState(defaultLanguage: string) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    return localStorage.getItem("selectedLanguage") || defaultLanguage;
  });

  useEffect(() => {
    if (selectedLanguage) {
      localStorage.setItem("selectedLanguage", selectedLanguage);
    }
  }, [selectedLanguage]);

  return { selectedLanguage, setSelectedLanguage };
}
