export interface StringUnit {
  value?: string;
  state?: "new" | "needs_review" | "translated" | "missing";
  comment?: string;
}

export interface VariationsMap {
  [variationType: string]: {
    [key: string]: {
      stringUnit?: StringUnit;
    };
  };
}

export interface Localization {
  stringUnit?: StringUnit;
  variations?: VariationsMap;
}

export interface StringEntry {
  localizations: {
    [language: string]: Localization;
  };
  comment?: string;
  shouldTranslate?: boolean;
  extractionState?: string;
}

export interface LocalizableStrings {
  sourceLanguage: string;
  strings: {
    [key: string]: StringEntry;
  };
}

export interface VariationRow {
  variationType: string;
  varKey: string;
  sourceValue: string;
  targetValue?: string;
  targetState?: StringUnit["state"];
  depth: number;
  path?: string;
}

export interface TranslationRequest {
  sourceLanguage: string;
  targetLanguage: string;
  translationKey: string;
  comment?: string;
  sourceText: string;
}
