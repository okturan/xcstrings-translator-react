import { useCallback, useMemo } from 'react';
import { LocalizableStrings } from '../types';
import { FileManager } from '../utils/FileManager';

interface UseTranslationUpdatesArgs {
  localizableStrings: LocalizableStrings | null;
  initializeStrings: (data: LocalizableStrings) => void;
  setError: (error: string | null) => void;
}

export function useTranslationUpdates({
  localizableStrings,
  initializeStrings,
  setError,
}: UseTranslationUpdatesArgs) {
  const fileManager = useMemo(() => new FileManager(), []);

  const updateTranslation = useCallback(async (
    key: string,
    value: string,
    language: string,
    path?: string
  ) => {
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
  }, [fileManager, localizableStrings, initializeStrings, setError]);

  return { updateTranslation };
}
