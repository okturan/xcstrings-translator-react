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

  let sourceValue;
  let targetValue;
  let targetState;

  if (!hasVariationsFlag) {
    sourceValue = sourceLocalization?.stringUnit?.value ?? stringKey;
    targetValue = targetLocalization?.stringUnit?.value;
    targetState = targetLocalization?.stringUnit?.state ?? "missing";
  }

  const handleSave = async (newValue: string) => {
    if (!onUpdateTranslation) return;
    await onUpdateTranslation(stringKey, newValue, selectedLanguage);
  };

  return (
    <tr className="hover:bg-gray-50">
      {/* Key Column */}
      <td className={`${CELL_STYLES.base} ${CELL_STYLES.key}`}>{stringKey}</td>

      {/* Source Value Column */}
      <td className={`${CELL_STYLES.base} ${CELL_STYLES.content}`}>{sourceValue}</td>

      {/* Target Value Column */}
      {!isSourceSelected && (
        <td className={`${CELL_STYLES.base} ${CELL_STYLES.content}`}>
          <TranslationEditor 
            value={targetValue} 
            showEditButton={!hasVariationsFlag} 
            onSave={handleSave}
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
