import { memo, useCallback } from "react";
import { StringEntry } from "../types";
import { StatusBadge } from "./StatusBadge";
import { TranslationEditor } from "./TranslationEditor";
import { CELL_STYLES } from "../constants";
import { hasVariations } from "../utils/stringUtils";
import { getVariationValue, processVariationRows } from "../utils/variationUtils";

interface TableRowProps {
  stringKey: string;
  entry: StringEntry;
  sourceLanguage: string;
  selectedLanguage: string;
  isSourceSelected: boolean;
  onUpdateTranslation?: (key: string, value: string, language: string, path?: string) => Promise<void>;
  showMissingOnly?: boolean;
}

export const TableRows = memo(
  ({ stringKey, entry, sourceLanguage, selectedLanguage, isSourceSelected, onUpdateTranslation, showMissingOnly }: TableRowProps) => {
    const sourceLocalization = entry.localizations?.[sourceLanguage];
    const targetLocalization = entry.localizations?.[selectedLanguage];
    const hasVariationsFlag = hasVariations(sourceLocalization, targetLocalization);

    let sourceValue: string = "";
    let targetValue: string | undefined;
    let targetState: string | undefined;

    if (!hasVariationsFlag) {
      sourceValue = sourceLocalization?.stringUnit?.value ?? stringKey;
      targetValue = targetLocalization?.stringUnit?.value;
      targetState = targetLocalization?.stringUnit?.state ?? "missing";
    }

    const handleSave = useCallback(
      async (newValue: string, path?: string) => {
        if (!onUpdateTranslation) return;
        await onUpdateTranslation(stringKey, newValue, selectedLanguage, path);
      },
      [onUpdateTranslation, stringKey, selectedLanguage],
    );

    const handleTransferText = useCallback(() => {
      if (!onUpdateTranslation) return;
      onUpdateTranslation(stringKey, sourceValue, selectedLanguage);
    }, [onUpdateTranslation, stringKey, sourceValue, selectedLanguage]);

    const variationRows = hasVariationsFlag ? processVariationRows(sourceLocalization, targetLocalization) : [];

    // Check if we should skip rendering this row when showMissingOnly is true
    const mainTargetState = !hasVariationsFlag ? targetLocalization?.stringUnit?.state ?? "missing" : undefined;
    if (showMissingOnly && mainTargetState !== "missing") {
      const hasMissingVariations = variationRows.some((row) => row.targetState === "missing");
      if (!hasMissingVariations) {
        return null;
      }
    }

    return (
      <>
        <tr className="hover:bg-gray-50">
          {/* Key Column */}
          <td className={`${CELL_STYLES.base} ${CELL_STYLES.key}`}>{stringKey}</td>

          {/* Source Value Column */}
          <td className={`${CELL_STYLES.base} ${CELL_STYLES.content}`}>
            <div className="flex items-center justify-between space-x-2">
              <span>{sourceValue}</span>
              {!hasVariationsFlag && !isSourceSelected && (
                <button
                  onClick={handleTransferText}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="Transfer source text">
                  →
                </button>
              )}
            </div>
          </td>

          {/* Target Value Column */}
          {!isSourceSelected && (
            <td className={`${CELL_STYLES.base} ${CELL_STYLES.content}`}>
              <TranslationEditor
                value={targetValue}
                showEditButton={!hasVariationsFlag}
                onSave={handleSave}
                translationKey={stringKey}
                sourceText={sourceValue}
                targetLanguage={selectedLanguage}
                sourceLanguage={sourceLanguage}
                comment={entry.comment || ""}
              />
            </td>
          )}

          {/* Comment Column */}
          <td className={`${CELL_STYLES.base} ${CELL_STYLES.content}`}>{entry.comment || ""}</td>

          {/* Target State Column */}
          {!isSourceSelected && <td className={CELL_STYLES.base}>{targetState && <StatusBadge state={targetState} />}</td>}

          {/* Extraction State Column */}
          <td className={CELL_STYLES.base}>
            {entry.shouldTranslate === false && <StatusBadge state="don't translate" />}
            {entry.extractionState && <StatusBadge state={entry.extractionState} />}
          </td>
        </tr>

        {/* Variation Rows */}
        {hasVariationsFlag &&
          variationRows.map((row) => {
            // Skip non-missing rows when showMissingOnly is true
            if (showMissingOnly && row.targetState !== "missing") {
              return null;
            }
            const currentTargetValue = getVariationValue(targetLocalization?.variations, row.path);
            const indentationStyle = { width: `${row.depth * 20}px` };

            return (
              <tr key={`${stringKey}-${row.path}`} className="hover:bg-gray-50 bg-gray-50">
                <td className={`${CELL_STYLES.base} ${CELL_STYLES.key}`}>
                  <div className="flex items-center">
                    <div style={indentationStyle} aria-hidden="true" />
                    <span className="text-gray-500 pl-8">
                      {row.variationType}: {row.varKey}
                    </span>
                  </div>
                </td>
                <td className={`${CELL_STYLES.base} ${CELL_STYLES.content}`}>{row.sourceValue}</td>
                {!isSourceSelected && (
                  <>
                    <td className={`${CELL_STYLES.base} ${CELL_STYLES.content}`}>
                      <TranslationEditor
                        value={currentTargetValue ?? ""}
                        showEditButton={true}
                        onSave={(newValue) => handleSave(newValue, row.path)}
                        translationKey={stringKey}
                        sourceText={row.sourceValue}
                        targetLanguage={selectedLanguage}
                        sourceLanguage={sourceLanguage}
                      />
                    </td>
                    <td className={`${CELL_STYLES.base} ${CELL_STYLES.content}`} />
                    <td className={CELL_STYLES.base}>{row.targetState && <StatusBadge state={row.targetState} />}</td>
                  </>
                )}
                <td className={CELL_STYLES.base} />
              </tr>
            );
          })}
      </>
    );
  },
);

TableRows.displayName = "TableRow";
