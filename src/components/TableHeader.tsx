import { TABLE_COLUMN_WIDTHS, CELL_STYLES } from "../constants";

interface TableHeaderProps {
  sourceLanguage: string;
  selectedLanguage: string;
}

export const TableHeader = ({ sourceLanguage, selectedLanguage }: TableHeaderProps) => {
  const isSourceSelected = sourceLanguage == selectedLanguage;
  return (
    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
      <tr>
        <th className={`${TABLE_COLUMN_WIDTHS.key} ${CELL_STYLES.base} ${CELL_STYLES.header}`}>Key</th>

        <th
          className={`${isSourceSelected ? TABLE_COLUMN_WIDTHS.sourceDefault : TABLE_COLUMN_WIDTHS.sourceWithTarget} ${CELL_STYLES.base} ${
            CELL_STYLES.header
          }`}>
          {sourceLanguage} (Default)
        </th>

        {!isSourceSelected && (
          <>
            <th className={`${TABLE_COLUMN_WIDTHS.target} ${CELL_STYLES.base} ${CELL_STYLES.header}`}>{selectedLanguage}</th>
          </>
        )}

        <th className={`${TABLE_COLUMN_WIDTHS.comment} ${CELL_STYLES.base} ${CELL_STYLES.header}`}>Comment</th>

        {!isSourceSelected && (
          <>
            <th className={`${TABLE_COLUMN_WIDTHS.status} ${CELL_STYLES.base} ${CELL_STYLES.header}`}>Status</th>
          </>
        )}
        
        <th className={`${TABLE_COLUMN_WIDTHS.extractionState} ${CELL_STYLES.base} ${CELL_STYLES.header}`}>Extraction State</th>
      </tr>
    </thead>
  );
};
