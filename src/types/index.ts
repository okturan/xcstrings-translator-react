export interface StringUnit {
  value?: string;
  state?: "new" | "needs_review" | "translated" | "missing" | "stale";
  comment?: string;
  [key: string]: unknown;
}

export interface VariationsMap {
  [variationType: string]: {
    [key: string]: VariationValue;
  };
}

export interface Localization {
  stringUnit?: StringUnit;
  variations?: VariationsMap;
  substitutions?: {
    [name: string]: Substitution;
  };
  [key: string]: unknown;
}

export interface Substitution {
  argNum?: number;
  formatSpecifier?: string;
  variations?: VariationsMap;
  [key: string]: unknown;
}

export interface StringEntry {
  localizations?: {
    [language: string]: Localization;
  };
  comment?: string;
  shouldTranslate?: boolean;
  extractionState?: string;
  [key: string]: unknown;
}

export interface VariationValue {
  stringUnit?: StringUnit;
  variations?: VariationsMap;
  [key: string]: unknown;
}

export interface LocalizableStrings {
  sourceLanguage: string;
  strings: {
    [key: string]: StringEntry;
  };
  version: string;
  [key: string]: unknown;
}

export interface VariationRow {
  variationType: string;
  varKey: string;
  sourceValue: string;
  targetValue?: string;
  targetState?: StringUnit["state"];
  depth: number;
  path?: string;
  isTerminal: boolean;
}

export interface TranslationRequest {
  sourceLanguage: string;
  targetLanguage: string;
  translationKey: string;
  comment?: string;
  sourceText: string;
}
