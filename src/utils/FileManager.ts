import { LocalizableStrings, VariationsMap, VariationValue } from "../types";
import { isEmptyVariationsMap, parseXCStrings, serializeXCStrings } from "./xcstrings";

export class FileManager {
  private currentFile: LocalizableStrings | null = null;

  /**
   * Imports a file (JSON) and stores it internally.
   */
  async importFile(file: File): Promise<LocalizableStrings> {
    try {
      const text = await file.text();
      const data = parseXCStrings(text);
      this.currentFile = data;
      return data;
    } catch (err) {
      console.error("Import error:", err);
      if (err instanceof Error) {
        throw err;
      }
      throw new Error("Failed to import Localizable.xcstrings.");
    }
  }

  /**
   * Returns the current file data in memory, if any.
   */
  getCurrentFile(): LocalizableStrings | null {
    return this.currentFile;
  }

  /**
   * Exports the current data as a file named "Localizable.xcstrings".
   */
  async exportFile(data: LocalizableStrings): Promise<void> {
    const blob = new Blob([serializeXCStrings(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "Localizable.xcstrings";
    document.body.appendChild(anchor);
    anchor.click();

    // Cleanup
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  /**
   * Main entry point for updating a translation or variation:
   * - If `path` is provided, updates/deletes a nested variation.
   * - Otherwise updates/deletes the main stringUnit.
   */
  updateTranslation(strings: LocalizableStrings, key: string, language: string, value: string, path?: string): LocalizableStrings {
    const updatedStrings = this.cloneData(strings);
    const entry = updatedStrings.strings[key];
    if (!entry) {
      throw new Error(`String key not found: ${key}`);
    }

    const hasValue = value.trim().length > 0;

    if (path) {
      const pathParts = this.parseVariationPath(path);

      // Variation update
      if (hasValue) {
        const localization = this.getOrCreateLocalization(entry, language);
        // If the variation doesn't exist yet, ensure the structure is in place
        if (!localization.variations) {
          localization.variations = {};
        }
        this.updateVariationAtPath(localization.variations, pathParts, value);
        // Remove main stringUnit to avoid conflicts
        delete localization.stringUnit;
      } else {
        const localization = entry.localizations?.[language];
        // Empty => delete the variation
        if (localization?.variations) {
          this.deleteVariationAtPath(localization.variations, pathParts);

          // If no variations remain, remove the object
          if (isEmptyVariationsMap(localization.variations)) {
            delete localization.variations;
          }

          this.removeEmptyLocalization(entry, language);
        }
      }
    } else {
      // Main stringUnit update
      if (hasValue) {
        const localization = this.getOrCreateLocalization(entry, language);
        // Non-empty => store in stringUnit, remove variations
        delete localization.variations;
        localization.stringUnit = {
          ...localization.stringUnit,
          state: "translated",
          value,
        };
      } else {
        const localization = entry.localizations?.[language];
        if (!localization) {
          this.currentFile = updatedStrings;
          return updatedStrings;
        }

        // Empty => delete main stringUnit
        delete localization.stringUnit;
        this.removeEmptyLocalization(entry, language);
      }
    }

    this.currentFile = updatedStrings;
    return updatedStrings;
  }

  /**
   * Safely retrieves or creates a localization object for the given key/language.
   */
  private getOrCreateLocalization(entry: LocalizableStrings["strings"][string], language: string) {
    if (!entry.localizations) {
      entry.localizations = {};
    }

    if (!entry.localizations[language]) {
      entry.localizations[language] = {};
    }
    return entry.localizations[language];
  }

  /**
   * Updates a nested variation at a specified path with a non-empty value.
   */
  private updateVariationAtPath(variations: VariationsMap, pathParts: string[], value: string): void {
    let current = variations;

    pathParts.forEach((part, index) => {
      const [variationType, variationKey] = part.split(":");
      if (!current[variationType]) {
        current[variationType] = {};
      }

      if (index === pathParts.length - 1) {
        // Final segment => set stringUnit
        const existingValue = current[variationType][variationKey] ?? {};
        const updatedValue: VariationValue = {
          ...existingValue,
          stringUnit: {
            ...existingValue.stringUnit,
            state: "translated",
            value,
          },
        };
        delete updatedValue.variations;
        current[variationType][variationKey] = updatedValue;
      } else {
        // Traverse deeper
        const nested = this.ensureNestedVariation(current[variationType], variationKey);
        current = nested.variations as VariationsMap;
      }
    });
  }

  /**
   * Ensures a nested variation object exists at the given key, creating it if necessary.
   */
  private ensureNestedVariation(container: { [key: string]: VariationValue }, key: string): VariationValue {
    if (!container[key]) {
      container[key] = { variations: {} };
    } else if (!container[key].variations) {
      container[key].variations = {};
    }
    delete container[key].stringUnit;
    return container[key];
  }

  /**
   * Deletes a specific nested variation node (leaf) at the given path.
   */
  private deleteVariationAtPath(variations: VariationsMap, pathParts: string[], index: number = 0): boolean {
    const [variationType, variationKey] = pathParts[index].split(":");
    const variationTypeMap = variations[variationType];
    const variationValue = variationTypeMap?.[variationKey];
    if (!variationTypeMap || !variationValue) {
      return false;
    }

    if (index === pathParts.length - 1) {
      delete variationTypeMap[variationKey];
    } else if (variationValue.variations) {
      const deleted = this.deleteVariationAtPath(variationValue.variations, pathParts, index + 1);
      if (!deleted) {
        return false;
      }

      if (isEmptyVariationsMap(variationValue.variations)) {
        delete variationTypeMap[variationKey];
      }
    } else {
      return false;
    }

    if (Object.keys(variationTypeMap).length === 0) {
      delete variations[variationType];
    }

    return true;
  }

  private parseVariationPath(path: string): string[] {
    const parts = path.split(".");
    const valid = parts.length > 0 && parts.every((part) => /^[^:.]+:[^:.]+$/.test(part));
    if (!valid) {
      throw new Error(`Unsupported variation path: ${path}`);
    }
    return parts;
  }

  private removeEmptyLocalization(entry: LocalizableStrings["strings"][string], language: string): void {
    const localization = entry.localizations?.[language];
    if (!localization || Object.keys(localization).length > 0) {
      return;
    }

    delete entry.localizations?.[language];
    if (entry.localizations && Object.keys(entry.localizations).length === 0) {
      delete entry.localizations;
    }
  }

  /**
   * Utility: deep clones the data to avoid mutating the original references.
   */
  private cloneData(data: LocalizableStrings): LocalizableStrings {
    return JSON.parse(JSON.stringify(data));
  }
}
