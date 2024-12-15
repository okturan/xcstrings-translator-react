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
  variations?: {
    [variationType: string]: {
      [variationKey: string]: {
        stringUnit: StringUnit;
      };
    };
  };
  comment?: string;
}

export interface StringUnit {
  state: string;
  value: string;
}
