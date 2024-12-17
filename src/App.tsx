import "./App.css";
import { useLocalizableStrings } from "./hooks/useLocalizableStrings";
import { LanguageSelector } from "./components/LanguageSelector";
import { TranslationsTable } from "./components/TranslationsTable";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { LoadingSpinner } from "./components/LoadingSpinner";

function App() {
  const { localizableStrings, error, selectedLanguage, setSelectedLanguage, availableLanguages, updateTranslation } =
    useLocalizableStrings();

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!localizableStrings) {
    return <LoadingSpinner size="md" />;
  }

  return (
    <div className="container-xl pl-4">
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
    </div>
  );
}

export default App;
