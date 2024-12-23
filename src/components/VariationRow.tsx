import { memo, useCallback, useMemo } from "react";
import { CELL_STYLES } from "../constants";
import { StatusBadge } from "./StatusBadge";
import { StringEntry, VariationRow as VariationRowType } from "../types";
import { TranslationEditor } from "./TranslationEditor";
import { useVariationRows } from "../hooks/useVariationRows";

// Internal SingleVariationRow component
interface SingleVariationRowProps extends VariationRowType {
  isSourceSelected: boolean;
  entryKey: string;
  onUpdateTranslation?: (key: string, value: string, language: string, path?: string) => Promise<void>;
  selectedLanguage: string;
  sourceLanguage: string;
}

const SingleVariationRow = memo(
  ({
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
    sourceLanguage,
  }: SingleVariationRowProps) => {
    const handleSave = useCallback(
      async (newValue: string) => {
        if (!onUpdateTranslation) return;
        await onUpdateTranslation(entryKey, newValue, selectedLanguage, path);
      },
      [onUpdateTranslation, entryKey, selectedLanguage, path],
    );

    const indentationStyle = { width: `${depth * 20}px` };

    return (
      <tr className="hover:bg-gray-50 bg-gray-50">
        <td className={`${CELL_STYLES.base} ${CELL_STYLES.key}`}>
          <div className="flex items-center">
            <div style={indentationStyle} aria-hidden="true" />
            <span className="text-gray-500 pl-8">
              {variationType}: {varKey}
            </span>
          </div>
        </td>
        <td className={`${CELL_STYLES.base} ${CELL_STYLES.content}`}>{sourceValue}</td>
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
            <td className={CELL_STYLES.base}>{targetState && <StatusBadge state={targetState} />}</td>
          </>
        )}
        {/* empty cell, for background color  */}
        <td className={CELL_STYLES.base} />
      </tr>
    );
  },
);

SingleVariationRow.displayName = "SingleVariationRow";

// Main VariationRow component
interface VariationRowProps {
  sourceLocalization: StringEntry["localizations"][string] | undefined;
  targetLocalization: StringEntry["localizations"][string] | undefined;
  isSourceSelected: boolean;
  entryKey: string;
  onUpdateTranslation?: (key: string, value: string, language: string, path?: string) => Promise<void>;
  selectedLanguage: string;
  sourceLanguage: string;
}

export const VariationRow = memo(
  ({
    sourceLocalization,
    targetLocalization,
    isSourceSelected,
    entryKey,
    onUpdateTranslation,
    selectedLanguage,
    sourceLanguage,
  }: VariationRowProps) => {
    const { variationRows } = useVariationRows(sourceLocalization, targetLocalization);

    const memoizedRows = useMemo(
      () =>
        variationRows.map((row) => (
          <SingleVariationRow
            key={`${entryKey}-${row.path}`}
            {...row}
            isSourceSelected={isSourceSelected}
            entryKey={entryKey}
            onUpdateTranslation={onUpdateTranslation}
            selectedLanguage={selectedLanguage}
            sourceLanguage={sourceLanguage}
          />
        )),
      [variationRows, entryKey, isSourceSelected, onUpdateTranslation, selectedLanguage, sourceLanguage],
    );

    return <>{memoizedRows}</>;
  },
);

VariationRow.displayName = "VariationRow";
