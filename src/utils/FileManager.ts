import { LocalizableStrings, VariationsMap, VariationValue } from "../types";

export class FileManager {
  private currentFile: LocalizableStrings | null = null;

  /**
   * Imports a file (JSON) and stores it internally.
   */
  async importFile(file: File): Promise<LocalizableStrings> {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as LocalizableStrings;
      this.currentFile = data;
      return data;
    } catch (err) {
      console.error("Import error:", err);
      throw new Error("Failed to parse the imported file. Please ensure it's a valid JSON file.");
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
    const jsonString = JSON.stringify(data, null, 2);
    // Optionally tweak formatting if desired:
    const formattedJson = jsonString.replace(/"([^"]+)":/g, '"$1" :');
    
    const blob = new Blob([formattedJson], { type: "application/json" });
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
  updateTranslation(
    strings: LocalizableStrings,
    key: string,
    language: string,
    value: string,
    path?: string
  ): LocalizableStrings {
    const updatedStrings = this.cloneData(strings);
    const localization = this.getOrCreateLocalization(updatedStrings, key, language);
    const trimmedValue = value?.trim();

    if (path) {
      // Variation update
      if (trimmedValue) {
        // If the variation doesn't exist yet, ensure the structure is in place
        if (!localization.variations) {
          localization.variations = {};
        }
        this.updateVariationAtPath(localization.variations, path.split("."), trimmedValue);
        // Remove main stringUnit to avoid conflicts
        delete localization.stringUnit;
      } else {
        // Empty => delete the variation
        if (localization.variations) {
          const pathParts = path.split(".");
          this.deleteVariationAtPath(localization.variations, pathParts);
          this.cleanupEmptyVariations(localization.variations, pathParts);

          // If no variations remain, remove the object
          if (Object.keys(localization.variations).length === 0) {
            delete localization.variations;
          }
        }
      }
    } else {
      // Main stringUnit update
      if (trimmedValue) {
        // Non-empty => store in stringUnit, remove variations
        delete localization.variations;
        localization.stringUnit = {
          value: trimmedValue,
          state: "translated",
        };
      } else {
        // Empty => delete main stringUnit
        delete localization.stringUnit;
        // If the entire localization is now empty, remove this language
        if (Object.keys(localization).length === 0) {
          delete updatedStrings.strings[key].localizations[language];
        }
      }
    }

    this.currentFile = updatedStrings;
    return updatedStrings;
  }

  /**
   * Safely retrieves or creates a localization object for the given key/language.
   */
  private getOrCreateLocalization(
    strings: LocalizableStrings,
    key: string,
    language: string
  ) {
    const entry = strings.strings[key];
    if (!entry) {
      throw new Error(`String key not found: ${key}`);
    }

    if (!entry.localizations[language]) {
      entry.localizations[language] = {};
    }
    return entry.localizations[language];
  }

  /**
   * Updates a nested variation at a specified path with a non-empty value.
   */
  private updateVariationAtPath(
    variations: VariationsMap,
    pathParts: string[],
    value: string
  ): void {
    let current = variations;

    pathParts.forEach((part, index) => {
      const [variationType, variationKey] = part.split(":");
      if (!current[variationType]) {
        current[variationType] = {};
      }

      if (index === pathParts.length - 1) {
        // Final segment => set stringUnit
        current[variationType][variationKey] = {
          stringUnit: {
            state: "translated",
            value,
          },
        };
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
  private ensureNestedVariation(
    container: { [key: string]: VariationValue },
    key: string
  ): VariationValue {
    if (!container[key]) {
      container[key] = { variations: {} };
    } else if (!container[key].variations) {
      container[key].variations = {};
    }
    return container[key];
  }

  /**
   * Deletes a specific nested variation node (leaf) at the given path.
   */
  private deleteVariationAtPath(
    variations: VariationsMap,
    pathParts: string[]
  ): void {
    let current = variations;

    for (let i = 0; i < pathParts.length; i++) {
      const [variationType, variationKey] = pathParts[i].split(":");

      // Final part => remove the node
      if (i === pathParts.length - 1) {
        if (current[variationType]) {
          delete current[variationType][variationKey];
          // If that variation type is now empty, remove it too
          if (Object.keys(current[variationType]).length === 0) {
            delete current[variationType];
          }
        }
      } else {
        // Descend deeper
        const next = current[variationType]?.[variationKey]?.variations;
        if (!next) {
          // If we can't go further, nothing to delete
          break;
        }
        current = next;
      }
    }
  }

  /**
   * Cleans up any leftover empty variation objects up the chain.
   */
  private cleanupEmptyVariations(
    variations: VariationsMap,
    pathParts: string[]
  ): void {
    // We track all ancestors so we can remove empty parents.
    const stack: Array<{
      variations: VariationsMap;
      variationType: string;
      variationKey: string;
    }> = [];

    let current = variations;
    for (const part of pathParts) {
      const [variationType, variationKey] = part.split(":");
      stack.push({ variations: current, variationType, variationKey });

      const deeperVariations = current[variationType]?.[variationKey]?.variations;
      if (!deeperVariations) break;
      current = deeperVariations;
    }

    // Work backward, removing any fully empty blocks
    for (let i = stack.length - 1; i >= 0; i--) {
      const { variations: parent, variationType } = stack[i];
      if (parent[variationType] && Object.keys(parent[variationType]).length === 0) {
        delete parent[variationType];
      }
    }
  }

  /**
   * Utility: deep clones the data to avoid mutating the original references.
   */
  private cloneData(data: LocalizableStrings): LocalizableStrings {
    return JSON.parse(JSON.stringify(data));
  }
}
