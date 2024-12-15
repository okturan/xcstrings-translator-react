export interface LocalizableStrings {
  sourceLanguage: string;
  strings: {
    [key: string]: StringEntry;
  };
  version: string;
}

export interface StringEntry {
  extractionState?: string;
  shouldTranslate?: boolean;
  comment?: string;
  localizations: {
    [langCode: string]: Localization;
  };
}

export interface Localization {
  stringUnit?: StringUnit;
  variations?: VariationsMap;
  comment?: string;
}

export interface VariationValue {
  stringUnit?: StringUnit;
  variations?: VariationsMap;
}

export interface StringUnit {
  state: string;
  value: string;
}

export interface VariationRow {
  variationType: string;
  varKey: string;
  sourceValue: string;
  targetValue: string;
  targetState: string | null;
  depth: number;
  path: string;
}

export interface VariationsMap {
  [variationType: string]: {
    [variationKey: string]: VariationValue;
  };
}
