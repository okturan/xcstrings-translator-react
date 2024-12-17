import { useMemo } from "react";
import { StringEntry, VariationRow, VariationValue, VariationsMap } from "../types";

const getVariationTypes = (sourceVar?: VariationsMap, targetVar?: VariationsMap): string[] => {
  const types = new Set([...Object.keys(sourceVar || {}), ...Object.keys(targetVar || {})]);
  return Array.from(types);
};

const createVariationRow = (
  variationType: string,
  varKey: string,
  sourceValue: VariationValue | undefined,
  targetValue: VariationValue | undefined,
  depth: number,
  currentPath: string,
  hasNestedVariations: boolean,
): VariationRow => ({
  variationType,
  varKey,
  sourceValue: sourceValue?.stringUnit?.value || "",
  targetValue: targetValue?.stringUnit?.value || "",
  targetState: hasNestedVariations ? null : targetValue?.stringUnit?.state || "missing",
  depth,
  path: currentPath,
});

const processNestedVariations = (
  sourceValue: VariationValue | undefined,
  targetValue: VariationValue | undefined,
  depth: number,
  currentPath: string,
): VariationRow[] => {
  if (!sourceValue?.variations && !targetValue?.variations) return [];

  const nestedTypes = getVariationTypes(sourceValue?.variations, targetValue?.variations);

  return nestedTypes.flatMap((nestedType) =>
    processVariationLevel(sourceValue?.variations?.[nestedType], targetValue?.variations?.[nestedType], nestedType, depth + 1, currentPath),
  );
};

const processVariationLevel = (
  sourceVar: { [key: string]: VariationValue } | undefined,
  targetVar: { [key: string]: VariationValue } | undefined,
  variationType: string,
  depth: number = 0,
  parentPath: string = "",
): VariationRow[] => {
  if (!sourceVar && !targetVar) return [];

  const variations = new Set([...Object.keys(sourceVar || {}), ...Object.keys(targetVar || {})]);

  return Array.from(variations).flatMap((varKey) => {
    const sourceValue = sourceVar?.[varKey];
    const targetValue = targetVar?.[varKey];
    const currentPath = parentPath ? `${parentPath}.${variationType}:${varKey}` : `${variationType}:${varKey}`;
    const hasNestedVariations = !!(sourceValue?.variations || targetValue?.variations);

    const rows: VariationRow[] = [
      createVariationRow(variationType, varKey, sourceValue, targetValue, depth, currentPath, hasNestedVariations),
    ];

    if (hasNestedVariations) {
      const nestedRows = processNestedVariations(sourceValue, targetValue, depth, currentPath);
      rows.push(...nestedRows);
    }

    return rows;
  });
};

export const useVariationRows = (
  sourceLocalization: StringEntry["localizations"][string] | undefined,
  targetLocalization: StringEntry["localizations"][string] | undefined,
) => {
  const variationRows = useMemo(() => {
    const sourceVariations = sourceLocalization?.variations;
    const targetVariations = targetLocalization?.variations;

    if (!sourceVariations && !targetVariations) return [];

    const variationTypes = getVariationTypes(sourceVariations, targetVariations);

    return variationTypes.flatMap((variationType) =>
      processVariationLevel(sourceVariations?.[variationType], targetVariations?.[variationType], variationType),
    );
  }, [sourceLocalization, targetLocalization]);

  return { variationRows };
};
