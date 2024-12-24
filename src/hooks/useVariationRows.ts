import { useMemo } from "react";
import { StringEntry } from "../types";
import { processVariationRows } from "../utils/variationUtils";

export const useVariationRows = (
  sourceLocalization: StringEntry["localizations"][string] | undefined,
  targetLocalization: StringEntry["localizations"][string] | undefined,
) => {
  const variationRows = useMemo(() => {
    return processVariationRows(sourceLocalization, targetLocalization);
  }, [sourceLocalization, targetLocalization]);

  return { variationRows };
};
