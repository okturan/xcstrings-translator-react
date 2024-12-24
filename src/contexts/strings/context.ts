import { createContext } from "react";
import { LocalizableStrings } from "../../types";

export interface StringsContextType {
  localizableStrings: LocalizableStrings | null;
  error: string | null;
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  availableLanguages: string[];
  importFile: (file: File) => Promise<void>;
  exportFile: () => Promise<void>;
  updateTranslation: (key: string, value: string, language: string, path?: string) => Promise<void>;
}

export const StringsContext = createContext<StringsContextType | null>(null);
