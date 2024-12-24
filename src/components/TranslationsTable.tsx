import React, { useState, useCallback, memo } from "react";
import { LocalizableStrings, StringEntry } from "../types";
import { TableHeader } from "./TableHeader";
import { TableRows } from "./TableRows";

interface TranslationsTableProps {
  localizableStrings: LocalizableStrings;
  selectedLanguage: string;
  onUpdateTranslation?: (key: string, value: string, language: string, path?: string) => Promise<void>;
}

export const TranslationsTable = memo(({ localizableStrings, selectedLanguage, onUpdateTranslation }: TranslationsTableProps) => {
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  const { sourceLanguage, strings } = localizableStrings;
  const isSourceSelected = sourceLanguage === selectedLanguage;

  const renderStringEntry = useCallback(
    (key: string, entry: StringEntry) => {
      return (
        <React.Fragment key={key}>
          <TableRows
            stringKey={key}
            entry={entry}
            sourceLanguage={sourceLanguage}
            selectedLanguage={selectedLanguage}
            isSourceSelected={isSourceSelected}
            onUpdateTranslation={onUpdateTranslation}
            showMissingOnly={showMissingOnly}
          />
        </React.Fragment>
      );
    },
    [sourceLanguage, selectedLanguage, isSourceSelected, onUpdateTranslation, showMissingOnly],
  );

  return (
    <table className="table-fixed w-full divide-y-2 border border-gray-200 divide-gray-300 text-xs">
      <TableHeader
        sourceLanguage={sourceLanguage}
        selectedLanguage={selectedLanguage}
        showMissingOnly={showMissingOnly}
        onShowMissingOnlyChange={setShowMissingOnly}
        isSourceSelected={isSourceSelected}
      />
      <tbody className="bg-white divide-y divide-gray-200">
        {Object.entries(strings).map(([key, entry]) => renderStringEntry(key, entry))}
      </tbody>
    </table>
  );
});

TranslationsTable.displayName = "TranslationsTable";
