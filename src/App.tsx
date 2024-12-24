import "./App.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Header } from "./components/Header";
import { EmptyState } from "./components/EmptyState";
import { Layout } from "./components/Layout";
import { useEffect } from "react";
import { ModelsProvider } from "./contexts/ModelContext";
import { MainContent } from "./components/MainContent";
import { StringsProvider } from "./contexts/strings";
import { useStrings } from "./contexts/strings";

function AppContent() {
  const { localizableStrings, error, importFile, exportFile } = useStrings();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <Layout>
      <Header />
      {localizableStrings ? (
        <MainContent />
      ) : (
        <EmptyState onImport={importFile} onExport={exportFile} />
      )}
    </Layout>
  );
}

function App() {
  return (
    <ModelsProvider>
      <StringsProvider>
        <ToastContainer position="top-right" autoClose={5000} />
        <AppContent />
      </StringsProvider>
    </ModelsProvider>
  );
}

export default App;
