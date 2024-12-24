import { Localization, StringEntry } from "../types";

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

export const hasVariations = (sourceLocalization?: Localization, targetLocalization?: Localization): boolean => {
  const sourceVariations = sourceLocalization?.variations || {};
  const targetVariations = targetLocalization?.variations || {};

  // Check if there are any variation types (like "plural") that contain variations
  return (
    Object.values(sourceVariations).some((type) => Object.keys(type).length > 0) ||
    Object.values(targetVariations).some((type) => Object.keys(type).length > 0)
  );
};
