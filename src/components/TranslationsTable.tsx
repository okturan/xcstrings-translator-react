import React from "react";
import { LocalizableStrings, StringEntry } from "../types";
import { TableHeader } from "./TableHeader";
import { MainRow } from "./MainRow";
import { VariationRow } from "./VariationRow";
import { hasVariations } from "../utils/stringUtils";

interface TranslationsTableProps {
  localizableStrings: LocalizableStrings;
  selectedLanguage: string;
  onUpdateTranslation?: (key: string, value: string, language: string, path?: string) => Promise<void>;
}

export const TranslationsTable = ({ 
  localizableStrings, 
  selectedLanguage,
  onUpdateTranslation 
}: TranslationsTableProps) => {
  const { sourceLanguage, strings } = localizableStrings;
  const isSourceSelected = sourceLanguage === selectedLanguage;

  const renderStringEntry = (key: string, entry: StringEntry) => {
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
          <VariationRow
            entryKey={key}
            sourceLocalization={sourceLocalization}
            targetLocalization={targetLocalization}
            isSourceSelected={isSourceSelected}
            onUpdateTranslation={onUpdateTranslation}
            selectedLanguage={selectedLanguage}
          />
        )}
      </React.Fragment>
    );
  };

  return (
    <table className="table-auto divide-y-2 border border-gray-200 divide-gray-300 text-xs">
      <TableHeader sourceLanguage={sourceLanguage} selectedLanguage={selectedLanguage} />
      <tbody className="bg-white divide-y divide-gray-200">
        {Object.entries(strings).map(([key, entry]) => renderStringEntry(key, entry))}
      </tbody>
    </table>
  );
};
