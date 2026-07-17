import { FileControls } from "./FileControls";
import representativeCatalog from "../../tests/fixtures/representative.xcstrings?raw";

interface EmptyStateProps {
  onImport: (file: File) => void;
  onExport: () => void;
}

export function EmptyState({ onImport, onExport }: EmptyStateProps) {
  const loadSampleCatalog = () => {
    onImport(
      new File([representativeCatalog], "Sample.xcstrings", {
        type: "application/json",
      }),
    );
  };

  return (
    <div className="text-center mx-[10%] py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-white/80">
      <div className="text-5xl mb-4" role="img" aria-label="file">
        📄
      </div>
      <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Bring a string catalog—or explore the sample</h2>
      <p className="text-gray-600 text-lg leading-relaxed mb-4 max-w-2xl mx-auto">
        Review and edit an Apple <span className="font-mono text-blue-600">.xcstrings</span> catalog directly in your browser.
      </p>
      <ul className="text-gray-600 max-w-md mx-auto text-left list-disc list-inside mb-6 leading-relaxed">
        <li>Imported catalogs stay in this browser</li>
        <li>Manual review and editing require no API key</li>
        <li>AI translation is optional and sent only when requested</li>
      </ul>
      <div className="flex flex-wrap justify-center gap-2">
        <FileControls onImport={onImport} onExport={onExport} hasFile={false} />
        <button
          type="button"
          onClick={loadSampleCatalog}
          className="mb-4 rounded-md border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Try sample catalog
        </button>
      </div>
    </div>
  );
}
