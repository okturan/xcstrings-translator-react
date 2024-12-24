import { useCallback, useMemo } from 'react';
import { LocalizableStrings } from '../types';
import { FileManager } from '../utils/FileManager';

interface UseFileControlsArgs {
  initializeStrings: (data: LocalizableStrings) => void;
  localizableStrings: LocalizableStrings | null;
  setError: (error: string | null) => void;
}

export function useFileControls({ 
  initializeStrings, 
  localizableStrings, 
  setError 
}: UseFileControlsArgs) {
  const fileManager = useMemo(() => new FileManager(), []);

  const importFile = useCallback(async (file: File) => {
    try {
      const data = await fileManager.importFile(file);
      initializeStrings(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to import file";
      setError(errorMessage);
      console.error("Import error:", err);
    }
  }, [fileManager, initializeStrings, setError]);

  const exportFile = useCallback(async () => {
    if (!localizableStrings) return;
    try {
      await fileManager.exportFile(localizableStrings);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to export file";
      setError(errorMessage);
      console.error("Export error:", err);
    }
  }, [fileManager, localizableStrings, setError]);

  return { importFile, exportFile };
}
