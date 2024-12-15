import { StringEntry } from "../types";
import { StatusBadge } from "./StatusBadge";
import { CELL_STYLES } from "../constants";
import { hasVariations } from "../utils/stringUtils";

interface MainRowProps {
  stringKey: string;
  entry: StringEntry;
  sourceLanguage: string;
  selectedLanguage: string;
  isSourceSelected: boolean;
}

export const MainRow = ({ stringKey, entry, sourceLanguage, selectedLanguage, isSourceSelected }: MainRowProps) => {
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

  return (
    <tr className="hover:bg-gray-50">
      <td className={`${CELL_STYLES.base} ${CELL_STYLES.key}`}>{stringKey}</td>

      <td className={`${CELL_STYLES.base} ${CELL_STYLES.content}`}>{sourceValue}</td>

      {!isSourceSelected && <td className={`${CELL_STYLES.base} ${CELL_STYLES.content}`}>{targetValue}</td>}

      <td className={`${CELL_STYLES.base} ${CELL_STYLES.content}`}>{entry.comment || ""}</td>

      {!isSourceSelected && <td className={CELL_STYLES.base}>{targetState && <StatusBadge state={targetState} />}</td>}
      
      <td className={CELL_STYLES.base}>
        {entry.shouldTranslate === false && <StatusBadge state="don't translate" />}
        {entry.extractionState && <StatusBadge state={entry.extractionState} />}
      </td>
    </tr>
  );
};
