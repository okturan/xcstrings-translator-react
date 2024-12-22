import { StringEntry } from "../types";
import { StatusBadge } from "./StatusBadge";
import { TranslationEditor } from "./TranslationEditor";
import { CELL_STYLES } from "../constants";
import { hasVariations } from "../utils/stringUtils";

interface MainRowProps {
  stringKey: string;
  entry: StringEntry;
  sourceLanguage: string;
  selectedLanguage: string;
  isSourceSelected: boolean;
  onUpdateTranslation?: (key: string, value: string, language: string) => Promise<void>;
}

export const MainRow = ({ stringKey, entry, sourceLanguage, selectedLanguage, isSourceSelected, onUpdateTranslation }: MainRowProps) => {
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

  const handleSave = async (newValue: string) => {
    if (!onUpdateTranslation) return;
    await onUpdateTranslation(stringKey, newValue, selectedLanguage);
  };

  const handleTransferText = () => {
    if (!onUpdateTranslation) return;
    onUpdateTranslation(stringKey, sourceValue, selectedLanguage);
  };

  return (
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
              title="Transfer source text"
            >
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
  );
};
