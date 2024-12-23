import "./App.css";
import { useLocalizableStrings } from "./hooks/useLocalizableStrings";
import { LanguageSelector } from "./components/LanguageSelector";
import { TranslationsTable } from "./components/TranslationsTable";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { FileControls } from "./components/FileControls";
import { Header } from "./components/Header";
import { EmptyState } from "./components/EmptyState";
import { Layout } from "./components/Layout";
import { memo } from "react";
import { LocalizableStrings } from "./types";

interface MainContentProps {
  localizableStrings: LocalizableStrings;
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  availableLanguages: string[];
  updateTranslation: (key: string, value: string, language: string, path?: string) => Promise<void>;
  importFile: (file: File) => Promise<void>;
  exportFile: () => Promise<void>;
}

const MainContent = memo(
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
    <Layout>
      <Header />
      {localizableStrings ? (
        <MainContent
          localizableStrings={localizableStrings}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          availableLanguages={availableLanguages}
          updateTranslation={updateTranslation}
          importFile={importFile}
          exportFile={exportFile}
        />
      ) : (
        <EmptyState onImport={importFile} onExport={exportFile} />
      )}
    </Layout>
  );
}

export default App;
