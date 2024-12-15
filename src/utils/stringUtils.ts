import { Localization, StringEntry, StringUnit } from "../types";

interface VariationEntry {
  stringUnit: StringUnit;
}

type VariationsRecord = Record<string, Record<string, VariationEntry>>;

export const extractAvailableLanguages = (strings: Record<string, StringEntry>): string[] => {
  const languages = new Set<string>();
  Object.values(strings).forEach((entry) => {
    if (entry?.localizations) {
      Object.keys(entry.localizations).forEach((lang) => {
        languages.add(lang);
      });
    }
  });
  return Array.from(languages);
};

export const getStringValue = (localization?: Localization): string => {
  return localization?.stringUnit?.value || "";
};

export const getStringState = (localization?: Localization, sourceValue?: string): string => {
  return localization?.stringUnit?.state || (sourceValue ? "missing" : "");
};

export const hasVariations = (sourceLocalization?: Localization, targetLocalization?: Localization): boolean => {
  const sourceVariations = sourceLocalization?.variations || {};
  const targetVariations = targetLocalization?.variations || {};
  
  // Check if there are any variation types (like "plural") that contain variations
  return Object.values(sourceVariations).some(type => Object.keys(type).length > 0) ||
         Object.values(targetVariations).some(type => Object.keys(type).length > 0);
};

export const getAllVariationKeys = (sourceVariations: VariationsRecord, targetVariations: VariationsRecord): string[] => {
  const keys = new Set<string>();
  
  // For each variation type (e.g., "plural")
  Object.values(sourceVariations).forEach((typeVariations) => {
    // Add all variation keys (e.g., "one", "other", etc.)
    Object.keys(typeVariations).forEach((key) => keys.add(key));
  });
  
  Object.values(targetVariations).forEach((typeVariations) => {
    Object.keys(typeVariations).forEach((key) => keys.add(key));
  });
  
  return Array.from(keys).sort();
};

export const formatLanguageLabel = (language: string, sourceLanguage: string): string => {
  return language === sourceLanguage ? `${language} (source)` : language;
};
