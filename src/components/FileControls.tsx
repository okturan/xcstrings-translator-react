import React, { useRef } from 'react';

interface FileControlsProps {
  onImport: (file: File) => void;
  onExport: () => void;
  hasFile: boolean;
}

export function FileControls({ onImport, onExport, hasFile }: FileControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      event.target.value = '';
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex gap-2 mb-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xcstrings"
        className="hidden"
      />
      <button
        onClick={handleImportClick}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Import Strings File
      </button>
      {hasFile && (
        <button
          onClick={onExport}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Export Translations
        </button>
      )}
    </div>
  );
}