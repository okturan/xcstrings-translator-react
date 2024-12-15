import "./App.css";
import { useLocalizableStrings } from "./hooks/useLocalizableStrings";
import { LanguageSelector } from "./components/LanguageSelector";
import { TranslationsTable } from "./components/TranslationsTable";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { LoadingSpinner } from "./components/LoadingSpinner";

function App() {
  const { localizableStrings, error, selectedLanguage, setSelectedLanguage, availableLanguages } = useLocalizableStrings();

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!localizableStrings) {
    return <LoadingSpinner size="md" />;
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <LanguageSelector
        selectedLanguage={selectedLanguage}
        availableLanguages={availableLanguages}
        sourceLanguage={localizableStrings.sourceLanguage}
        onLanguageChange={setSelectedLanguage}
      />
      <TranslationsTable localizableStrings={localizableStrings} selectedLanguage={selectedLanguage} />
    </div>
  );
}

export default App;
