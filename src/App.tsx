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
    <div className="container-xl mx-auto pl-4 h-screen">
      <div className="flex gap-2">
        <div className="flex-0 w-40">
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            availableLanguages={availableLanguages}
            sourceLanguage={localizableStrings.sourceLanguage}
            onLanguageChange={setSelectedLanguage}
          />
        </div>
        <div className="flex-1">
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
