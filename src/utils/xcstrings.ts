import { LocalizableStrings, VariationsMap } from "../types";

export const SUPPORTED_XCSTRINGS_VERSION = "1.0";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unsupported(reason: string): never {
  throw new Error(`Unsupported Localizable.xcstrings: ${reason}`);
}

function validateStringUnit(value: unknown, path: string): void {
  if (!isRecord(value)) {
    unsupported(`${path} must be an object.`);
  }

  if (value.value !== undefined && typeof value.value !== "string") {
    unsupported(`${path}.value must be a string.`);
  }

  if (value.state !== undefined && typeof value.state !== "string") {
    unsupported(`${path}.state must be a string.`);
  }
}

function validateVariations(value: unknown, path: string): void {
  if (!isRecord(value)) {
    unsupported(`${path} must be an object.`);
  }

  Object.entries(value).forEach(([variationType, variants]) => {
    if (!isRecord(variants)) {
      unsupported(`${path}.${variationType} must be an object.`);
    }

    Object.entries(variants).forEach(([variant, variationValue]) => {
      const variationPath = `${path}.${variationType}.${variant}`;
      if (!isRecord(variationValue)) {
        unsupported(`${variationPath} must be an object.`);
      }

      if (variationValue.stringUnit !== undefined) {
        validateStringUnit(variationValue.stringUnit, `${variationPath}.stringUnit`);
      }

      if (variationValue.variations !== undefined) {
        validateVariations(variationValue.variations, `${variationPath}.variations`);
      }

      if (variationValue.stringUnit !== undefined && variationValue.variations !== undefined) {
        unsupported(`${variationPath} cannot contain both stringUnit and variations.`);
      }
    });
  });
}

function validateSubstitutions(value: unknown, path: string): void {
  if (!isRecord(value)) {
    unsupported(`${path} must be an object.`);
  }

  Object.entries(value).forEach(([name, substitution]) => {
    const substitutionPath = `${path}.${name}`;
    if (!isRecord(substitution)) {
      unsupported(`${substitutionPath} must be an object.`);
    }

    if (substitution.argNum !== undefined && typeof substitution.argNum !== "number") {
      unsupported(`${substitutionPath}.argNum must be a number.`);
    }

    if (substitution.formatSpecifier !== undefined && typeof substitution.formatSpecifier !== "string") {
      unsupported(`${substitutionPath}.formatSpecifier must be a string.`);
    }

    if (substitution.variations !== undefined) {
      validateVariations(substitution.variations, `${substitutionPath}.variations`);
    }
  });
}

export function validateXCStrings(value: unknown): asserts value is LocalizableStrings {
  if (!isRecord(value)) {
    unsupported("the document root must be an object.");
  }

  if (value.version !== SUPPORTED_XCSTRINGS_VERSION) {
    unsupported(`version must be "${SUPPORTED_XCSTRINGS_VERSION}".`);
  }

  if (typeof value.sourceLanguage !== "string" || value.sourceLanguage.trim().length === 0) {
    unsupported("sourceLanguage must be a non-empty string.");
  }

  if (!isRecord(value.strings)) {
    unsupported("strings must be an object.");
  }

  Object.entries(value.strings).forEach(([key, entry]) => {
    const entryPath = `strings.${key}`;
    if (!isRecord(entry)) {
      unsupported(`${entryPath} must be an object.`);
    }

    if (entry.comment !== undefined && typeof entry.comment !== "string") {
      unsupported(`${entryPath}.comment must be a string.`);
    }

    if (entry.localizations === undefined) {
      return;
    }

    if (!isRecord(entry.localizations)) {
      unsupported(`${entryPath}.localizations must be an object.`);
    }

    Object.entries(entry.localizations).forEach(([language, localization]) => {
      const localizationPath = `${entryPath}.localizations.${language}`;
      if (!isRecord(localization)) {
        unsupported(`${localizationPath} must be an object.`);
      }

      if (localization.stringUnit !== undefined) {
        validateStringUnit(localization.stringUnit, `${localizationPath}.stringUnit`);
      }

      if (localization.variations !== undefined) {
        validateVariations(localization.variations, `${localizationPath}.variations`);
      }

      if (localization.substitutions !== undefined) {
        if (localization.stringUnit === undefined) {
          unsupported(`${localizationPath}.substitutions requires stringUnit.`);
        }
        validateSubstitutions(localization.substitutions, `${localizationPath}.substitutions`);
      }

      if (localization.stringUnit !== undefined && localization.variations !== undefined) {
        unsupported(`${localizationPath} cannot contain both stringUnit and variations.`);
      }
    });
  });
}

export function parseXCStrings(contents: string): LocalizableStrings {
  let parsed: unknown;

  try {
    parsed = JSON.parse(contents);
  } catch {
    throw new Error("Invalid JSON: unable to parse Localizable.xcstrings.");
  }

  validateXCStrings(parsed);
  return parsed;
}

export function serializeXCStrings(data: LocalizableStrings): string {
  validateXCStrings(data);
  return `${JSON.stringify(data, null, 2)}\n`;
}

export const isEmptyVariationsMap = (variations: VariationsMap): boolean =>
  Object.keys(variations).length === 0;
