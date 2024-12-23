import "./App.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocalizableStrings } from "./hooks/useLocalizableStrings";
import { Header } from "./components/Header";
import { EmptyState } from "./components/EmptyState";
import { Layout } from "./components/Layout";
import { useEffect } from "react";
import { ModelsProvider } from "./contexts/ModelContext";
import { MainContent } from "./components/MainContent";

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

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <ModelsProvider>
      <ToastContainer position="top-right" autoClose={5000} />
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
    </ModelsProvider>
  );
}

export default App;
