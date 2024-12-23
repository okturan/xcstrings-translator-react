import { memo, useCallback, useMemo } from "react";
import { CELL_STYLES } from "../constants";
import { StatusBadge } from "./StatusBadge";
import { StringEntry, VariationRow as VariationRowType, VariationsMap } from "../types";
import { TranslationEditor } from "./TranslationEditor";
import { useVariationRows } from "../hooks/useVariationRows";

// Internal SingleVariationRow component
interface SingleVariationRowProps extends Omit<VariationRowType, "targetValue"> {
  targetLocalization: StringEntry["localizations"][string] | undefined;
  isSourceSelected: boolean;
  entryKey: string;
  onUpdateTranslation?: (key: string, value: string, language: string, path?: string) => Promise<void>;
  selectedLanguage: string;
  sourceLanguage: string;
}

const getVariationValue = (variations: VariationsMap | undefined, path: string | undefined): string | undefined => {
  if (!variations || !path) return undefined;

  const parts = path.split(".");
  let current = variations;

  for (const part of parts) {
    const [type, key] = part.split(":");
    const variationValue = current[type]?.[key];
    if (!variationValue) return undefined;

    if (!variationValue.variations) {
      return variationValue.stringUnit?.value;
    }
    current = variationValue.variations;
  }

  return undefined;
};

const SingleVariationRow = memo(
  ({
    variationType,
    varKey,
    sourceValue,
    targetLocalization,
    targetState,
    depth,
    path,
    isSourceSelected,
    entryKey,
    onUpdateTranslation,
    selectedLanguage,
    sourceLanguage,
  }: SingleVariationRowProps) => {
    const currentTargetValue = getVariationValue(targetLocalization?.variations, path);

    const handleSave = useCallback(
      async (newValue: string) => {
        if (!onUpdateTranslation) return;
        console.log("handleSave, newValue:", newValue);
        console.log("handleSave path:", path);
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
                value={currentTargetValue ?? ""}
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
            targetLocalization={targetLocalization}
            isSourceSelected={isSourceSelected}
            entryKey={entryKey}
            onUpdateTranslation={onUpdateTranslation}
            selectedLanguage={selectedLanguage}
            sourceLanguage={sourceLanguage}
          />
        )),
      [variationRows, entryKey, targetLocalization, isSourceSelected, onUpdateTranslation, selectedLanguage, sourceLanguage],
    );

    return <>{memoizedRows}</>;
  },
);

VariationRow.displayName = "VariationRow";
