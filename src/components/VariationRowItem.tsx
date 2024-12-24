import { memo, useCallback } from "react";
import { CELL_STYLES } from "../constants";
import { StatusBadge } from "./StatusBadge";
import { StringEntry, VariationRow } from "../types";
import { TranslationEditor } from "./TranslationEditor";
import { getVariationValue } from "../utils/variationUtils";

interface TranslationConfig {
  entryKey: string;
  sourceLanguage: string;
  targetLanguage: string;
  isSourceSelected: boolean;
  onUpdateTranslation?: (key: string, value: string, language: string, path?: string) => Promise<void>;
}

interface VariationRowItemProps extends Omit<VariationRow, "targetValue"> {
  targetLocalization: StringEntry["localizations"][string] | undefined;
  config: TranslationConfig;
}

export const VariationRowItem = memo(
  ({
    variationType,
    varKey,
    sourceValue,
    targetLocalization,
    targetState,
    depth,
    path,
    config,
  }: VariationRowItemProps) => {
    const { entryKey, isSourceSelected, onUpdateTranslation, targetLanguage, sourceLanguage } = config;
    const currentTargetValue = getVariationValue(targetLocalization?.variations, path);

    const handleSave = useCallback(
      async (newValue: string) => {
        if (!onUpdateTranslation) return;
        await onUpdateTranslation(entryKey, newValue, targetLanguage, path);
      },
      [onUpdateTranslation, entryKey, targetLanguage, path],
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
                targetLanguage={targetLanguage}
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

VariationRowItem.displayName = "VariationRowItem";
