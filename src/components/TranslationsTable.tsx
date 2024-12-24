import React, { useState, useCallback, useMemo, memo } from "react";
import { LocalizableStrings, StringEntry, VariationsMap } from "../types";
import { TableHeader } from "./TableHeader";
import { MainRow } from "./MainRow";
import { VariationRows } from "./VariationRows";
import { hasVariations } from "../utils/stringUtils";

interface TranslationsTableProps {
  localizableStrings: LocalizableStrings;
  selectedLanguage: string;
  onUpdateTranslation?: (key: string, value: string, language: string, path?: string) => Promise<void>;
}

export const TranslationsTable = memo(({ localizableStrings, selectedLanguage, onUpdateTranslation }: TranslationsTableProps) => {
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  const { sourceLanguage, strings } = localizableStrings;
  const isSourceSelected = sourceLanguage === selectedLanguage;

  const hasAnyMissingVariations = useCallback((variations: VariationsMap): boolean => {
    return Object.values(variations).some((variationTypeMap) =>
      Object.values(variationTypeMap).some((variation) => !variation.stringUnit?.value),
    );
  }, []);

  const isEntryMissing = useCallback((entry: StringEntry): boolean => {
    const targetLocalization = entry.localizations?.[selectedLanguage];
    // If there are variations, check if any variation is missing
    if (hasVariations(entry.localizations?.[sourceLanguage], targetLocalization)) {
      return !targetLocalization?.variations || hasAnyMissingVariations(targetLocalization.variations);
    }
    // For regular entries, check if the translation is missing
    return targetLocalization?.stringUnit?.state === "missing" || !targetLocalization?.stringUnit?.value;
  }, [selectedLanguage, sourceLanguage, hasAnyMissingVariations]);

  const filteredStrings = useMemo(() =>
    showMissingOnly && !isSourceSelected ? Object.entries(strings).filter(([, entry]) => isEntryMissing(entry)) : Object.entries(strings),
    [showMissingOnly, isSourceSelected, strings, isEntryMissing]
  );

  const renderStringEntry = useCallback((key: string, entry: StringEntry) => {
    const sourceLocalization = entry.localizations?.[sourceLanguage];
    const targetLocalization = entry.localizations?.[selectedLanguage];
    const hasVariationsFlag = hasVariations(sourceLocalization, targetLocalization);

    return (
      <React.Fragment key={key}>
        <MainRow
          stringKey={key}
          entry={entry}
          sourceLanguage={sourceLanguage}
          selectedLanguage={selectedLanguage}
          isSourceSelected={isSourceSelected}
          onUpdateTranslation={onUpdateTranslation}
        />
        {hasVariationsFlag && (
          <VariationRows
            entryKey={key}
            sourceLanguage={sourceLanguage}
            sourceLocalization={sourceLocalization}
            targetLocalization={targetLocalization}
            isSourceSelected={isSourceSelected}
            onUpdateTranslation={onUpdateTranslation}
            selectedLanguage={selectedLanguage}
          />
        )}
      </React.Fragment>
    );
  }, [sourceLanguage, selectedLanguage, isSourceSelected, onUpdateTranslation]);

  return (
    <table className="table-fixed w-full divide-y-2 border border-gray-200 divide-gray-300 text-xs">
      <TableHeader
        sourceLanguage={sourceLanguage}
        selectedLanguage={selectedLanguage}
        showMissingOnly={showMissingOnly}
        onShowMissingOnlyChange={setShowMissingOnly}
      />
      <tbody className="bg-white divide-y divide-gray-200">{filteredStrings.map(([key, entry]) => renderStringEntry(key, entry))}</tbody>
    </table>
  );
});

TranslationsTable.displayName = "TranslationsTable";
