import { TABLE_COLUMN_WIDTHS, CELL_STYLES } from "../constants";

interface TableHeaderProps {
  sourceLanguage: string;
  selectedLanguage: string;
  showMissingOnly: boolean;
  onShowMissingOnlyChange: (value: boolean) => void;
}

export const TableHeader = ({ sourceLanguage, selectedLanguage, showMissingOnly, onShowMissingOnlyChange }: TableHeaderProps) => {
  const isSourceSelected = sourceLanguage == selectedLanguage;
  return (
    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
      <tr>
        <th className={`${TABLE_COLUMN_WIDTHS.key} ${CELL_STYLES.base} ${CELL_STYLES.header}`}>
          <div className="flex items-center gap-4">
            <span>Key</span>
          </div>
        </th>

        <th
          className={`${isSourceSelected ? TABLE_COLUMN_WIDTHS.sourceDefault : TABLE_COLUMN_WIDTHS.sourceWithTarget} ${CELL_STYLES.base} ${
            CELL_STYLES.header
          }`}>
          {sourceLanguage} (Default)
        </th>

        {!isSourceSelected && (
          <th className={`${TABLE_COLUMN_WIDTHS.target} ${CELL_STYLES.base} ${CELL_STYLES.header}`}>
            <div className="flex gap-4">
              {selectedLanguage}
              <label className="flex items-center space-x-1 text-xs font-normal">
                <input
                  type="checkbox"
                  checked={showMissingOnly}
                  onChange={(e) => onShowMissingOnlyChange(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-center capitalize">Show missing only</span>
              </label>
            </div>
          </th>
        )}

        <th className={`${TABLE_COLUMN_WIDTHS.comment} ${CELL_STYLES.base} ${CELL_STYLES.header}`}>Comment</th>

        {!isSourceSelected && <th className={`${TABLE_COLUMN_WIDTHS.status} ${CELL_STYLES.base} ${CELL_STYLES.header}`}>Status</th>}

        <th className={`${TABLE_COLUMN_WIDTHS.extractionState} ${CELL_STYLES.base} ${CELL_STYLES.header}`}>Extraction State</th>
      </tr>
    </thead>
  );
};
