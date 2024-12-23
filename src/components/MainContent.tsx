import { memo } from "react";
import { LocalizableStrings } from "../types";
import { FileControls } from "./FileControls";
import { LanguageSelector } from "./LanguageSelector";
import { TranslationsTable } from "./TranslationsTable";

export interface MainContentProps {
  localizableStrings: LocalizableStrings;
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  availableLanguages: string[];
  updateTranslation: (key: string, value: string, language: string, path?: string) => Promise<void>;
  importFile: (file: File) => Promise<void>;
  exportFile: () => Promise<void>;
}

export const MainContent = memo(
  ({
    localizableStrings,
    selectedLanguage,
    setSelectedLanguage,
    availableLanguages,
    updateTranslation,
    importFile,
    exportFile,
  }: MainContentProps) => {
    return (
      <>
        <div className="mb-6 flex justify-center">
          <FileControls onImport={importFile} onExport={exportFile} hasFile={!!localizableStrings} />
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-1 pl-4">
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              availableLanguages={availableLanguages}
              sourceLanguage={localizableStrings.sourceLanguage}
              onLanguageChange={setSelectedLanguage}
            />
          </div>
          <div className="col-span-11">
            <TranslationsTable
              localizableStrings={localizableStrings}
              selectedLanguage={selectedLanguage}
              onUpdateTranslation={updateTranslation}
            />
          </div>
        </div>
      </>
    );
  },
);

MainContent.displayName = "MainContent";
