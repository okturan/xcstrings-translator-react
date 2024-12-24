import { StringEntry, VariationRow, VariationValue, VariationsMap } from "../types";

export const getVariationValue = (variations: VariationsMap | undefined, path: string | undefined): string | undefined => {
  if (!variations || !path) return undefined;

  const parts = path.split(".");
  let current = variations;

  for (const part of parts) {
    const [type, key] = part.split(":");
    const variationValue = current[type]?.[key];
    if (!variationValue) return undefined;

    if (!variationValue.variations) {
      return variationValue.stringUnit?.value;
    }
    current = variationValue.variations;
  }

  return undefined;
};


export const getVariationTypes = (sourceVar?: VariationsMap): string[] => {
  // Only include variation types that exist in the source
  return Object.keys(sourceVar || {});
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
  targetState: hasNestedVariations 
    ? undefined 
    : targetValue?.stringUnit?.state || (sourceValue?.stringUnit?.value ? "missing" : undefined),
  depth,
  path: currentPath,
});

const processNestedVariations = (
  sourceValue: VariationValue | undefined,
  targetValue: VariationValue | undefined,
  depth: number,
  currentPath: string,
): VariationRow[] => {
  if (!sourceValue?.variations) return [];

  const nestedTypes = getVariationTypes(sourceValue.variations);

  return nestedTypes.flatMap((nestedType) =>
    processVariationLevel(
      sourceValue.variations?.[nestedType], 
      targetValue?.variations?.[nestedType], 
      nestedType, 
      depth + 1, 
      currentPath
    ),
  );
};

export const processVariationLevel = (
  sourceVar: { [key: string]: VariationValue } | undefined,
  targetVar: { [key: string]: VariationValue } | undefined,
  variationType: string,
  depth: number = 0,
  parentPath: string = "",
): VariationRow[] => {
  if (!sourceVar) return [];

  // Only process variations that exist in the source
  const variations = Object.keys(sourceVar);

  return variations.flatMap((varKey) => {
    const sourceValue = sourceVar[varKey];
    const targetValue = targetVar?.[varKey];
    const currentPath = parentPath ? `${parentPath}.${variationType}:${varKey}` : `${variationType}:${varKey}`;
    const hasNestedVariations = !!sourceValue?.variations;

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

export function processVariationRows(
  sourceLocalization: StringEntry["localizations"][string] | undefined,
  targetLocalization: StringEntry["localizations"][string] | undefined
): VariationRow[] {
  const sourceVariations = sourceLocalization?.variations;
  if (!sourceVariations) return [];

  // 1) Find variation types
  const variationTypes = getVariationTypes(sourceVariations);

  // 2) Recursively build up VariationRow[] across all types
  return variationTypes.flatMap((variationType) =>
    processVariationLevel(
      sourceVariations[variationType],
      targetLocalization?.variations?.[variationType],
      variationType
    ),
  );
}
