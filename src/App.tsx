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
    <div className="container-xl px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <span role="img" aria-label="globe">🌐</span>
          iOS Strings Translator
        </h1>
        <p className="text-gray-600">
          A tool for managing and translating iOS localization files (.xcstrings).
          Import your Localizable.xcstrings file, edit translations, and export with ease.
        </p>
      </div>

      <div className="mb-6">
        <FileControls
          onImport={importFile}
          onExport={exportFile}
          hasFile={!!localizableStrings}
        />
      </div>

      {localizableStrings ? (
        <div className="grid grid-cols-12 gap-4">
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
        <div className="text-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="text-5xl mb-4" role="img" aria-label="file">📄</div>
          <h2 className="text-xl font-semibold mb-2">No File Loaded</h2>
          <p className="text-gray-600 mb-4">
            Import your Localizable.xcstrings file to start managing translations
          </p>
          <ul className="text-sm text-gray-500 max-w-md mx-auto text-left list-disc list-inside">
            <li>Supports iOS localization files (.xcstrings)</li>
            <li>Edit translations for multiple languages</li>
            <li>Export back to .xcstrings format</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
