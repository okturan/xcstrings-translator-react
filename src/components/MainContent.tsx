import { memo } from "react";
import { FileControls } from "./FileControls";
import { LanguageSelector } from "./LanguageSelector";
import { TranslationsTable } from "./TranslationsTable";
import { useStrings } from "../contexts/strings";

export const MainContent = memo(() => {
  const {
    localizableStrings: strings,
    selectedLanguage,
    setSelectedLanguage,
    availableLanguages,
    updateTranslation,
    importFile,
    exportFile,
  } = useStrings();

  // We know strings is not null because MainContent is only rendered when localizableStrings exists
  const localizableStrings = strings!;
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
