import { FileControls } from "./FileControls";

interface EmptyStateProps {
  onImport: (file: File) => void;
  onExport: () => void;
}

export function EmptyState({ onImport, onExport }: EmptyStateProps) {
  return (
    <div className="text-center mx-[10%] py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
      <div className="text-5xl mb-4" role="img" aria-label="file">
        📄
      </div>
      <h2 className="text-xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">No File Loaded</h2>
      <p className="text-gray-600 text-lg leading-relaxed mb-4 max-w-2xl mx-auto">
        Import your <span className="font-mono text-blue-600">.xcstrings</span> file to start managing translations
      </p>
      <ul className="text-gray-600 max-w-md mx-auto text-left list-disc list-inside mb-6 leading-relaxed">
        <li>Supports Apple string catalog localization files (.xcstrings)</li>
        <li>Edit translations for multiple languages</li>
        <li>Export back to .xcstrings format</li>
      </ul>
      <div className="flex justify-center">
        <FileControls onImport={onImport} onExport={onExport} hasFile={false} />
      </div>
    </div>
  );
}
