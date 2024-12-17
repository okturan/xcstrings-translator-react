import "./App.css";
import { useLocalizableStrings } from "./hooks/useLocalizableStrings";
import { LanguageSelector } from "./components/LanguageSelector";
import { TranslationsTable } from "./components/TranslationsTable";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { FileControls } from "./components/FileControls";

function App() {
  const {
    localizableStrings,
    error,
    selectedLanguage,
    setSelectedLanguage,
    availableLanguages,
    updateTranslation,
    importFile,
    exportFile,
  } = useLocalizableStrings();

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <div className="container-xl pl-4">
      <FileControls
        onImport={importFile}
        onExport={exportFile}
        hasFile={!!localizableStrings}
      />
      {localizableStrings ? (
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-1 min-w-18">
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
      ) : (
        <div className="text-center text-gray-500 mt-8">
          Import a Localizable.xcstrings file to begin
        </div>
      )}
    </div>
  );
}

export default App;
