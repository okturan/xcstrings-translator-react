import { ReactNode } from "react";
import { StringsContext } from "./context";
import { usePersistedLanguageState } from "../../hooks/usePersistedLanguageState";
import { useLocalizableStrings } from "../../hooks/useLocalizableStrings";
import { useFileControls } from "../../hooks/useFileControls";
import { useTranslationUpdates } from "../../hooks/useTranslationUpdates";

interface StringsProviderProps {
  children: ReactNode;
}

export const StringsProvider = ({ children }: StringsProviderProps) => {
  const {
    localizableStrings,
    error,
    availableLanguages,
    initializeStrings,
    setError,
  } = useLocalizableStrings();

  const { selectedLanguage, setSelectedLanguage } = usePersistedLanguageState("");

  const { importFile, exportFile } = useFileControls({
    initializeStrings,
    localizableStrings,
    setError,
  });

  const { updateTranslation } = useTranslationUpdates({
    localizableStrings,
    initializeStrings,
    setError,
  });

  return (
    <StringsContext.Provider
      value={{
        localizableStrings,
        error,
        selectedLanguage,
        setSelectedLanguage,
        availableLanguages,
        importFile,
        exportFile,
        updateTranslation,
      }}
    >
      {children}
    </StringsContext.Provider>
  );
};
