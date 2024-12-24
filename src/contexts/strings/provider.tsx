import { ReactNode } from "react";
import { StringsContext } from "./context";
import { useLocalizableStrings } from "../../hooks/useLocalizableStrings";
import { usePersistedLanguageState } from "../../hooks/usePersistedLanguageState";
import { useFileManager } from "../../hooks/useFileManager";

interface StringsProviderProps {
  children: ReactNode;
}

export const StringsProvider = ({ children }: StringsProviderProps) => {
  const {
    localizableStrings,
    error,
    availableLanguages,
    validateData,
    initializeStrings,
    setError,
  } = useLocalizableStrings();

  const { selectedLanguage, setSelectedLanguage } = usePersistedLanguageState("");
  const { importStringsFile, exportStringsFile, fileManager } = useFileManager();

  async function handleImportFile(file: File) {
    try {
      const data = await importStringsFile(file);
      validateData(data);
      initializeStrings(data);
    } catch (err) {
      console.error("Import error:", err);
    }
  }

  async function handleExportFile() {
    if (!localizableStrings) return;
    try {
      await exportStringsFile(localizableStrings);
    } catch (err) {
      console.error("Export error:", err);
    }
  }

  return (
    <StringsContext.Provider
      value={{
        localizableStrings,
        error,
        selectedLanguage,
        setSelectedLanguage,
        availableLanguages,
        importFile: handleImportFile,
        exportFile: handleExportFile,
        updateTranslation: async (key: string, value: string, language: string, path?: string) => {
          if (!localizableStrings) return;
          try {
            const updated = fileManager.updateTranslation(
              localizableStrings,
              key,
              language,
              value,
              path
            );
            setError(null);
            initializeStrings(updated);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to update translation";
            setError(errorMessage);
            console.error("Update error:", err);
          }
        },
      }}
    >
      {children}
    </StringsContext.Provider>
  );
};
