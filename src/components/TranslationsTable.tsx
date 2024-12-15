import { LocalizableStrings, StringEntry } from "../types";
import { StatusBadge } from "./StatusBadge";
import { TableHeader } from "./TableHeader";
import { CELL_STYLES } from "../constants";
import { hasVariations, getStringValue, getStringState } from "../utils/stringUtils";

interface TranslationsTableProps {
  localizableStrings: LocalizableStrings;
  selectedLanguage: string;
}

export const TranslationsTable = ({ localizableStrings, selectedLanguage }: TranslationsTableProps) => {
  const { sourceLanguage, strings } = localizableStrings;
  const isSourceSelected = sourceLanguage === selectedLanguage;

  const renderMainRow = (key: string, entry: StringEntry) => {
    const sourceLocalization = entry.localizations?.[sourceLanguage];
    const targetLocalization = entry.localizations?.[selectedLanguage];

    const hasVariationsFlag = hasVariations(sourceLocalization, targetLocalization);
    const sourceValue = getStringValue(sourceLocalization) || (hasVariationsFlag ? "" : key);
    const targetValue = !isSourceSelected ? getStringValue(targetLocalization) : "";
    const targetState = !isSourceSelected ? getStringState(targetLocalization, sourceValue) : "";

    return (
      <tr key={key} className="hover:bg-gray-50">
        <td className={`${CELL_STYLES.base} ${CELL_STYLES.key}`}>{key}</td>
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

  const renderVariationRows = (key: string, entry: StringEntry) => {
    const sourceLocalization = entry.localizations?.[sourceLanguage];
    const targetLocalization = entry.localizations?.[selectedLanguage];
    const sourceVariations = sourceLocalization?.variations || {};
    const targetVariations = targetLocalization?.variations || {};

    const allVariationTypes = new Set([...Object.keys(sourceVariations), ...Object.keys(targetVariations)]);

    return Array.from(allVariationTypes).flatMap((variationType) => {
      const sourceTypeVariations = sourceVariations[variationType] || {};
      const targetTypeVariations = targetVariations[variationType] || {};

      const variationKeys = new Set([...Object.keys(sourceTypeVariations), ...Object.keys(targetTypeVariations)]);

      return Array.from(variationKeys).map((varKey) => {
        const sourceVarUnit = sourceTypeVariations[varKey]?.stringUnit;
        const sourceVarValue = sourceVarUnit?.value || "";

        let targetVarValue = "";
        let targetVarState = "";
        if (!isSourceSelected) {
          const targetVarUnit = targetTypeVariations[varKey]?.stringUnit;
          targetVarValue = targetVarUnit?.value || "";
          targetVarState = targetVarUnit?.state || "missing";
        }

        return (
          <tr key={`${key}-${variationType}-${varKey}`} className="hover:bg-gray-50 bg-gray-50">
            <td className={`${CELL_STYLES.base} ${CELL_STYLES.key} pl-8`}>
              <span className="text-gray-500">
                {variationType}: {varKey}
              </span>
            </td>
            <td className={`${CELL_STYLES.base} ${CELL_STYLES.content}`}>{sourceVarValue}</td>
            {!isSourceSelected && (
              <>
                <td className={`${CELL_STYLES.base} ${CELL_STYLES.content}`}>{targetVarValue}</td>
                <td className={`${CELL_STYLES.base} ${CELL_STYLES.content}`} />
                <td className={CELL_STYLES.base}>{targetVarState && <StatusBadge state={targetVarState} />}</td>
              </>
            )}
          </tr>
        );
      });
    });
  };

  return (
    <table className="table-auto divide-y-2 border border-gray-200 divide-gray-300 text-xs">
      <TableHeader sourceLanguage={sourceLanguage} selectedLanguage={selectedLanguage} />
      <tbody className="bg-white divide-y divide-gray-200">
        {Object.entries(strings).flatMap(([key, entry]) => {
          const mainRow = renderMainRow(key, entry);
          const variationRows = hasVariations(entry.localizations?.[sourceLanguage], entry.localizations?.[selectedLanguage])
            ? renderVariationRows(key, entry)
            : [];

          return [mainRow, ...variationRows];
        })}
      </tbody>
    </table>
  );
};
