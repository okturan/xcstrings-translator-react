import { useCallback, useRef } from "react";
import { FileManager } from "../utils/FileManager";
import { LocalizableStrings } from "../types";

export function useFileManager() {
  const fileManagerRef = useRef(new FileManager());

  const importStringsFile = useCallback(
    async (file: File): Promise<LocalizableStrings> => {
      return fileManagerRef.current.importFile(file);
    },
    []
  );

  const exportStringsFile = useCallback(
    async (data: LocalizableStrings): Promise<void> => {
      return fileManagerRef.current.exportFile(data);
    },
    []
  );

  return {
    importStringsFile,
    exportStringsFile,
    fileManager: fileManagerRef.current
  };
}
