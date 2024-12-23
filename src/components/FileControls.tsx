import React, { useRef, memo } from "react";

interface FileControlsProps {
  onImport: (file: File) => void;
  onExport: () => void;
  hasFile: boolean;
}

export const FileControls = memo(function FileControls({ onImport, onExport, hasFile }: FileControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      event.target.value = "";
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex gap-2 mb-4">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xcstrings" className="hidden" />
      <button
        onClick={handleImportClick}
        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
        Import Strings File
      </button>
      {hasFile && (
        <button
          onClick={onExport}
          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
          Export Translations
        </button>
      )}
    </div>
  );
});
