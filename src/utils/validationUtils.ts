import { LocalizableStrings, VariationsMap, VariationValue } from "../types";

export interface ValidationIssue {
  severity: "error" | "warning";
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

/**
 * Deep comparison of two xcstrings objects to detect any differences
 * Useful for round-trip testing
 */
export function deepCompareXCStrings(
  original: LocalizableStrings,
  modified: LocalizableStrings,
  ignorePaths: string[] = []
): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Compare root fields
  if (original.version !== modified.version) {
    issues.push({
      severity: "error",
      path: "version",
      message: `Version mismatch: "${original.version}" vs "${modified.version}"`,
    });
  }

  if (original.sourceLanguage !== modified.sourceLanguage) {
    issues.push({
      severity: "error",
      path: "sourceLanguage",
      message: `Source language mismatch: "${original.sourceLanguage}" vs "${modified.sourceLanguage}"`,
    });
  }

  // Compare strings
  const originalKeys = Object.keys(original.strings || {});
  const modifiedKeys = Object.keys(modified.strings || {});

  // Check for missing keys
  for (const key of originalKeys) {
    if (!modifiedKeys.includes(key)) {
      issues.push({
        severity: "error",
        path: `strings.${key}`,
        message: `Missing string key in modified version`,
      });
    }
  }

  // Check for extra keys
  for (const key of modifiedKeys) {
    if (!originalKeys.includes(key)) {
      issues.push({
        severity: "warning",
        path: `strings.${key}`,
        message: `Extra string key in modified version`,
      });
    }
  }

  // Compare each string entry
  for (const key of originalKeys) {
    if (modifiedKeys.includes(key)) {
      const originalEntry = original.strings[key];
      const modifiedEntry = modified.strings[key];

      compareStringEntry(originalEntry, modifiedEntry, `strings.${key}`, issues);
    }
  }

  return {
    valid: issues.filter((i) => i.severity === "error").length === 0,
    issues,
  };
}

function compareStringEntry(
  original: any,
  modified: any,
  path: string,
  issues: ValidationIssue[]
): void {
  // Compare metadata
  if (original.comment !== modified.comment) {
    issues.push({
      severity: "warning",
      path: `${path}.comment`,
      message: `Comment changed from "${original.comment}" to "${modified.comment}"`,
    });
  }

  if (original.extractionState !== modified.extractionState) {
    issues.push({
      severity: "warning",
      path: `${path}.extractionState`,
      message: `Extraction state changed`,
    });
  }

  // Compare localizations
  const originalLangs = Object.keys(original.localizations || {});
  const modifiedLangs = Object.keys(modified.localizations || {});

  for (const lang of originalLangs) {
    if (!modifiedLangs.includes(lang)) {
      issues.push({
        severity: "error",
        path: `${path}.localizations.${lang}`,
        message: `Missing language in modified version`,
      });
      continue;
    }

    const originalLoc = original.localizations[lang];
    const modifiedLoc = modified.localizations[lang];

    compareLocalization(originalLoc, modifiedLoc, `${path}.localizations.${lang}`, issues);
  }
}

function compareLocalization(
  original: any,
  modified: any,
  path: string,
  issues: ValidationIssue[]
): void {
  // Check if both have stringUnit or both have variations
  const origHasStringUnit = !!original.stringUnit;
  const modHasStringUnit = !!modified.stringUnit;
  const origHasVariations = !!original.variations;
  const modHasVariations = !!modified.variations;

  if (origHasStringUnit !== modHasStringUnit) {
    issues.push({
      severity: "error",
      path: `${path}.stringUnit`,
      message: `StringUnit presence mismatch`,
    });
  }

  if (origHasVariations !== modHasVariations) {
    issues.push({
      severity: "error",
      path: `${path}.variations`,
      message: `Variations presence mismatch`,
    });
  }

  // Compare stringUnit if present
  if (origHasStringUnit && modHasStringUnit) {
    if (original.stringUnit.value !== modified.stringUnit.value) {
      issues.push({
        severity: "error",
        path: `${path}.stringUnit.value`,
        message: `Value mismatch: "${original.stringUnit.value}" vs "${modified.stringUnit.value}"`,
      });
    }

    if (original.stringUnit.state !== modified.stringUnit.state) {
      issues.push({
        severity: "warning",
        path: `${path}.stringUnit.state`,
        message: `State changed from "${original.stringUnit.state}" to "${modified.stringUnit.state}"`,
      });
    }
  }

  // Compare variations if present
  if (origHasVariations && modHasVariations) {
    compareVariations(original.variations, modified.variations, `${path}.variations`, issues);
  }

  // Compare substitutions if present
  if (original.substitutions || modified.substitutions) {
    if (!original.substitutions && modified.substitutions) {
      issues.push({
        severity: "error",
        path: `${path}.substitutions`,
        message: `Substitutions added in modified version`,
      });
    } else if (original.substitutions && !modified.substitutions) {
      issues.push({
        severity: "error",
        path: `${path}.substitutions`,
        message: `Substitutions removed in modified version`,
      });
    } else if (original.substitutions && modified.substitutions) {
      // Deep compare substitutions (complex structure)
      const origSubKeys = Object.keys(original.substitutions);
      const modSubKeys = Object.keys(modified.substitutions);

      for (const key of origSubKeys) {
        if (!modSubKeys.includes(key)) {
          issues.push({
            severity: "error",
            path: `${path}.substitutions.${key}`,
            message: `Missing substitution key`,
          });
        }
      }
    }
  }
}

function compareVariations(
  original: VariationsMap,
  modified: VariationsMap,
  path: string,
  issues: ValidationIssue[]
): void {
  const originalTypes = Object.keys(original || {});
  const modifiedTypes = Object.keys(modified || {});

  // Check for missing variation types
  for (const type of originalTypes) {
    if (!modifiedTypes.includes(type)) {
      issues.push({
        severity: "error",
        path: `${path}.${type}`,
        message: `Missing variation type in modified version`,
      });
      continue;
    }

    const originalKeys = Object.keys(original[type] || {});
    const modifiedKeys = Object.keys(modified[type] || {});

    // Check for missing variation keys
    for (const key of originalKeys) {
      if (!modifiedKeys.includes(key)) {
        issues.push({
          severity: "error",
          path: `${path}.${type}.${key}`,
          message: `Missing variation key in modified version`,
        });
        continue;
      }

      const origValue = original[type][key];
      const modValue = modified[type][key];

      compareVariationValue(origValue, modValue, `${path}.${type}.${key}`, issues);
    }
  }
}

function compareVariationValue(
  original: VariationValue,
  modified: VariationValue,
  path: string,
  issues: ValidationIssue[]
): void {
  // Compare stringUnit
  if (original.stringUnit && modified.stringUnit) {
    if (original.stringUnit.value !== modified.stringUnit.value) {
      issues.push({
        severity: "error",
        path: `${path}.stringUnit.value`,
        message: `Value mismatch: "${original.stringUnit.value}" vs "${modified.stringUnit.value}"`,
      });
    }
  } else if (original.stringUnit && !modified.stringUnit) {
    issues.push({
      severity: "error",
      path: `${path}.stringUnit`,
      message: `StringUnit removed in modified version`,
    });
  } else if (!original.stringUnit && modified.stringUnit) {
    issues.push({
      severity: "error",
      path: `${path}.stringUnit`,
      message: `StringUnit added in modified version`,
    });
  }

  // Recursively compare nested variations
  if (original.variations && modified.variations) {
    compareVariations(original.variations, modified.variations, `${path}.variations`, issues);
  } else if (original.variations && !modified.variations) {
    issues.push({
      severity: "error",
      path: `${path}.variations`,
      message: `Nested variations removed in modified version`,
    });
  } else if (!original.variations && modified.variations) {
    issues.push({
      severity: "error",
      path: `${path}.variations`,
      message: `Nested variations added in modified version`,
    });
  }
}

/**
 * Validates the structure of an xcstrings object
 */
export function validateXCStringsStructure(data: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!data || typeof data !== "object") {
    issues.push({
      severity: "error",
      path: "root",
      message: "Root must be an object",
    });
    return { valid: false, issues };
  }

  const obj = data as any;

  // Required fields
  if (!obj.version || typeof obj.version !== "string") {
    issues.push({
      severity: "error",
      path: "version",
      message: 'Missing or invalid "version" field',
    });
  }

  if (!obj.sourceLanguage || typeof obj.sourceLanguage !== "string") {
    issues.push({
      severity: "error",
      path: "sourceLanguage",
      message: 'Missing or invalid "sourceLanguage" field',
    });
  }

  if (!obj.strings || typeof obj.strings !== "object") {
    issues.push({
      severity: "error",
      path: "strings",
      message: 'Missing or invalid "strings" field',
    });
    return { valid: false, issues };
  }

  // Validate each string entry
  for (const [key, entry] of Object.entries(obj.strings || {})) {
    if (!entry || typeof entry !== "object") {
      issues.push({
        severity: "error",
        path: `strings.${key}`,
        message: `Invalid string entry`,
      });
      continue;
    }

    const stringEntry = entry as any;

    if (!stringEntry.localizations || typeof stringEntry.localizations !== "object") {
      issues.push({
        severity: "error",
        path: `strings.${key}.localizations`,
        message: `Missing or invalid localizations`,
      });
      continue;
    }

    // Validate each localization
    for (const [lang, localization] of Object.entries(stringEntry.localizations)) {
      if (!localization || typeof localization !== "object") {
        issues.push({
          severity: "error",
          path: `strings.${key}.localizations.${lang}`,
          message: `Invalid localization object`,
        });
        continue;
      }

      const loc = localization as any;

      // Must have either stringUnit or variations (or both in some cases), but not neither
      if (!loc.stringUnit && !loc.variations && !loc.substitutions) {
        issues.push({
          severity: "warning",
          path: `strings.${key}.localizations.${lang}`,
          message: `Localization has no stringUnit, variations, or substitutions`,
        });
      }

      // Validate stringUnit structure if present
      if (loc.stringUnit) {
        if (typeof loc.stringUnit !== "object") {
          issues.push({
            severity: "error",
            path: `strings.${key}.localizations.${lang}.stringUnit`,
            message: `StringUnit must be an object`,
          });
        } else {
          // value can be undefined for missing translations
          if (loc.stringUnit.value !== undefined && typeof loc.stringUnit.value !== "string") {
            issues.push({
              severity: "error",
              path: `strings.${key}.localizations.${lang}.stringUnit.value`,
              message: `StringUnit value must be a string`,
            });
          }

          if (loc.stringUnit.state && !["new", "needs_review", "translated", "missing"].includes(loc.stringUnit.state)) {
            issues.push({
              severity: "warning",
              path: `strings.${key}.localizations.${lang}.stringUnit.state`,
              message: `Unknown state value: "${loc.stringUnit.state}"`,
            });
          }
        }
      }

      // Validate variations structure if present
      if (loc.variations) {
        validateVariationsStructure(loc.variations, `strings.${key}.localizations.${lang}.variations`, issues);
      }
    }
  }

  return {
    valid: issues.filter((i) => i.severity === "error").length === 0,
    issues,
  };
}

function validateVariationsStructure(variations: any, path: string, issues: ValidationIssue[]): void {
  if (!variations || typeof variations !== "object") {
    issues.push({
      severity: "error",
      path,
      message: `Variations must be an object`,
    });
    return;
  }

  // Each variation type should be an object
  for (const [type, typeObj] of Object.entries(variations)) {
    if (!typeObj || typeof typeObj !== "object") {
      issues.push({
        severity: "error",
        path: `${path}.${type}`,
        message: `Variation type must be an object`,
      });
      continue;
    }

    // Each variation key should map to a VariationValue
    for (const [key, value] of Object.entries(typeObj as any)) {
      if (!value || typeof value !== "object") {
        issues.push({
          severity: "error",
          path: `${path}.${type}.${key}`,
          message: `Variation value must be an object`,
        });
        continue;
      }

      const varValue = value as any;

      // Must have stringUnit or nested variations
      if (!varValue.stringUnit && !varValue.variations) {
        issues.push({
          severity: "error",
          path: `${path}.${type}.${key}`,
          message: `Variation must have either stringUnit or variations`,
        });
      }

      // Recursively validate nested variations
      if (varValue.variations) {
        validateVariationsStructure(varValue.variations, `${path}.${type}.${key}.variations`, issues);
      }
    }
  }
}

/**
 * Round-trip test: parse -> modify -> export -> re-parse -> compare
 */
export function testRoundTrip(
  originalData: LocalizableStrings,
  modifications: Array<{
    key: string;
    language: string;
    value: string;
    path?: string;
  }>,
  updateFunction: (data: LocalizableStrings, key: string, lang: string, value: string, path?: string) => LocalizableStrings
): ValidationResult {
  const issues: ValidationIssue[] = [];

  try {
    // Apply all modifications
    let modifiedData = originalData;
    for (const mod of modifications) {
      modifiedData = updateFunction(modifiedData, mod.key, mod.language, mod.value, mod.path);
    }

    // Simulate export -> import by JSON round-trip
    const exported = JSON.stringify(modifiedData, null, 2);
    const reimported = JSON.parse(exported) as LocalizableStrings;

    // Validate structure after round-trip
    const structureValidation = validateXCStringsStructure(reimported);
    issues.push(...structureValidation.issues);

    // Verify modifications were preserved
    for (const mod of modifications) {
      const entry = reimported.strings[mod.key];
      if (!entry) {
        issues.push({
          severity: "error",
          path: `strings.${mod.key}`,
          message: `Modified string key lost after round-trip`,
        });
        continue;
      }

      const localization = entry.localizations[mod.language];
      if (!localization) {
        issues.push({
          severity: "error",
          path: `strings.${mod.key}.localizations.${mod.language}`,
          message: `Modified localization lost after round-trip`,
        });
        continue;
      }

      // Check if value is at the right place
      if (mod.path) {
        // Variation modification
        const parts = mod.path.split(".");
        let current: any = localization.variations;
        let found = false;

        for (const part of parts) {
          const [type, key] = part.split(":");
          if (!current?.[type]?.[key]) {
            issues.push({
              severity: "error",
              path: `strings.${mod.key}.localizations.${mod.language}.variations.${mod.path}`,
              message: `Modified variation lost after round-trip`,
            });
            break;
          }

          if (parts.indexOf(part) === parts.length - 1) {
            // Last part - should have stringUnit
            if (current[type][key].stringUnit?.value !== mod.value) {
              issues.push({
                severity: "error",
                path: `strings.${mod.key}.localizations.${mod.language}.variations.${mod.path}`,
                message: `Modified variation value mismatch: expected "${mod.value}", got "${current[type][key].stringUnit?.value}"`,
              });
            } else {
              found = true;
            }
          } else {
            // Not last part - traverse deeper
            current = current[type][key].variations;
          }
        }
      } else {
        // Simple stringUnit modification
        if (localization.stringUnit?.value !== mod.value) {
          issues.push({
            severity: "error",
            path: `strings.${mod.key}.localizations.${mod.language}.stringUnit.value`,
            message: `Modified value mismatch: expected "${mod.value}", got "${localization.stringUnit?.value}"`,
          });
        }
      }
    }

    // Deep compare to check for unexpected changes
    const comparison = deepCompareXCStrings(originalData, reimported);
    // Filter out expected changes from our modifications
    const unexpectedIssues = comparison.issues.filter((issue) => {
      // Check if this issue is from our intentional modifications
      return !modifications.some((mod) => {
        const expectedPath = mod.path
          ? `strings.${mod.key}.localizations.${mod.language}.variations`
          : `strings.${mod.key}.localizations.${mod.language}.stringUnit.value`;
        return issue.path.startsWith(expectedPath);
      });
    });

    issues.push(...unexpectedIssues);
  } catch (error) {
    issues.push({
      severity: "error",
      path: "roundtrip",
      message: `Round-trip test failed: ${error instanceof Error ? error.message : String(error)}`,
    });
  }

  return {
    valid: issues.filter((i) => i.severity === "error").length === 0,
    issues,
  };
}
