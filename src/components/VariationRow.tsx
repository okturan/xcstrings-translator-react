import { memo } from "react";
import { CELL_STYLES } from "../constants";
import { StatusBadge } from "./StatusBadge";
import { StringEntry, VariationRow as IVariationRow } from "../types";
import { useVariationRows } from "../hooks/useVariationRows";
import { TranslationEditor } from "./TranslationEditor";

interface VariationRowProps {
  sourceLocalization: StringEntry["localizations"][string] | undefined;
  targetLocalization: StringEntry["localizations"][string] | undefined;
  isSourceSelected: boolean;
  entryKey: string;
  onUpdateTranslation?: (key: string, value: string, language: string, path?: string) => Promise<void>;
  selectedLanguage: string;
  sourceLanguage: string;
}

interface SingleRowProps extends IVariationRow {
  isSourceSelected: boolean;
  entryKey: string;
  onUpdateTranslation?: (key: string, value: string, language: string, path?: string) => Promise<void>;
  selectedLanguage: string;
  sourceLanguage: string;
}

const SingleRow = memo(({ 
  variationType, 
  varKey, 
  sourceValue, 
  targetValue, 
  targetState, 
  depth, 
  path,
  isSourceSelected,
  entryKey,
  onUpdateTranslation,
  selectedLanguage,
  sourceLanguage
}: SingleRowProps) => {
  const handleSave = async (newValue: string) => {
    if (!onUpdateTranslation) return;
    await onUpdateTranslation(entryKey, newValue, selectedLanguage, path);
  };

  return (
    <tr key={`${entryKey}-${path}`} className="hover:bg-gray-50 bg-gray-50">
      <td className={`${CELL_STYLES.base} ${CELL_STYLES.key}`}>
        <div className="flex items-center">
          <div style={{ width: `${depth * 20}px` }} aria-hidden="true" /> {/* Indentation based on depth */}
          <span className="text-gray-500 pl-8">
            {variationType}: {varKey}
          </span>
        </div>
      </td>
      <td className={`${CELL_STYLES.base} ${CELL_STYLES.content}`}>
        {sourceValue}
      </td>
      {!isSourceSelected && (
        <>
          <td className={`${CELL_STYLES.base} ${CELL_STYLES.content}`}>
            <TranslationEditor 
              value={targetValue} 
              showEditButton={true}
              onSave={handleSave}
              translationKey={entryKey}
              sourceText={sourceValue}
              targetLanguage={selectedLanguage}
              sourceLanguage={sourceLanguage}
            />
          </td>
          <td className={`${CELL_STYLES.base} ${CELL_STYLES.content}`} />
          <td className={CELL_STYLES.base}>
            {targetState && <StatusBadge state={targetState} />}
          </td>
        </>
      )}
      {/* empty cell, for background color  */}
      <td className={CELL_STYLES.base} />
    </tr>
  );
});

SingleRow.displayName = "SingleRow";

export const VariationRow = memo(({ 
  sourceLocalization, 
  targetLocalization, 
  isSourceSelected, 
  entryKey,
  onUpdateTranslation,
  selectedLanguage,
  sourceLanguage
}: VariationRowProps) => {
  const { variationRows } = useVariationRows(sourceLocalization, targetLocalization);

  return (
    <>
      {variationRows.map((row) => (
        <SingleRow
          key={`${entryKey}-${row.path}`}
          {...row}
          isSourceSelected={isSourceSelected}
          entryKey={entryKey}
          onUpdateTranslation={onUpdateTranslation}
          selectedLanguage={selectedLanguage}
          sourceLanguage={sourceLanguage}
        />
      ))}
    </>
  );
});

VariationRow.displayName = "VariationRow";
