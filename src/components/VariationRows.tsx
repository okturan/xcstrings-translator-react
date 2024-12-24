import { memo, useMemo } from "react";
import { StringEntry } from "../types";
import { useVariationRows } from "../hooks/useVariationRows";
import { VariationRowItem } from "./VariationRowItem";

interface VariationRowsProps {
  sourceLocalization: StringEntry["localizations"][string] | undefined;
  targetLocalization: StringEntry["localizations"][string] | undefined;
  entryKey: string;
  sourceLanguage: string;
  selectedLanguage: string;
  isSourceSelected: boolean;
  onUpdateTranslation?: (key: string, value: string, language: string, path?: string) => Promise<void>;
}

export const VariationRows = memo(({
  sourceLocalization,
  targetLocalization,
  entryKey,
  sourceLanguage,
  selectedLanguage,
  isSourceSelected,
  onUpdateTranslation,
}: VariationRowsProps) => {
  const { variationRows } = useVariationRows(sourceLocalization, targetLocalization);

  const config = useMemo(
    () => ({
      entryKey,
      sourceLanguage,
      targetLanguage: selectedLanguage,
      isSourceSelected,
      onUpdateTranslation,
    }),
    [entryKey, sourceLanguage, selectedLanguage, isSourceSelected, onUpdateTranslation]
  );

  const memoizedRows = useMemo(
    () =>
      variationRows.map((row) => (
        <VariationRowItem
          key={`${config.entryKey}-${row.path}`}
          {...row}
          targetLocalization={targetLocalization}
          config={config}
        />
      )),
    [variationRows, config, targetLocalization]
  );

  return <>{memoizedRows}</>;
});

VariationRows.displayName = "VariationRows";
