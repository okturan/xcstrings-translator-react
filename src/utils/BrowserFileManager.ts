import { LocalizableStrings, VariationsMap, VariationValue } from "../types";

export class BrowserFileManager {
  private currentFile: LocalizableStrings | null = null;

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

  getCurrentFile(): LocalizableStrings | null {
    return this.currentFile;
  }

  async exportFile(data: LocalizableStrings): Promise<void> {
    const jsonString = JSON.stringify(data, null, 2);
    const formattedJson = jsonString.replace(/"([^"]+)":/g, '"$1" :');
    const blob = new Blob([formattedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "Localizable.xcstrings";
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  updateTranslation(strings: LocalizableStrings, key: string, language: string, value: string, path?: string): LocalizableStrings {
    const updatedStrings = JSON.parse(JSON.stringify(strings));
    const localization = this.initializeLocalization(updatedStrings, key, language);
    const trimmedValue = value?.trim();

    if (path) {
      console.log("updateTranslation called with:", { key, value, language, path });
      console.log("trimmedValue:", trimmedValue);

      if (trimmedValue) {
        console.log("Variation update with non-empty value");

        if (!localization.variations) {
          console.log("Variation delete logic running");

          localization.variations = {};
        }
        this.updateVariationAtPath(localization.variations, path.split("."), trimmedValue);
        delete localization.stringUnit;
      } else if (localization.variations) {
        const pathParts = path.split(".");
        console.log("Variation delete logic running for path:", pathParts);
        console.log("Before deletion, variations:", JSON.stringify(localization.variations, null, 2));
        
        // Delete the specific variation node
        this.deleteVariationAtPath(localization.variations, pathParts);
        
        // Optional cleanup of any remaining empty objects
        this.cleanupEmptyVariations(localization.variations, pathParts);

        // Remove variations object if it's empty
        if (Object.keys(localization.variations).length === 0) {
          delete localization.variations;
        }
      }
    } else {
      if (trimmedValue) {
        console.log("Main row update with non-empty value");

        delete localization.variations;
        localization.stringUnit = {
          value: trimmedValue,
          state: "translated",
        };
      } else {
        console.log("Main row delete logic running");

        delete localization.stringUnit;
        if (Object.keys(localization).length === 0) {
          delete updatedStrings.strings[key].localizations[language];
        }
      }
    }

    this.currentFile = updatedStrings;
    return updatedStrings;
  }

  private initializeLocalization(strings: LocalizableStrings, key: string, language: string) {
    if (!strings.strings[key]) {
      throw new Error("String key not found");
    }

    if (!strings.strings[key].localizations[language]) {
      strings.strings[key].localizations[language] = {};
    }

    return strings.strings[key].localizations[language];
  }

  private updateVariationAtPath(variations: VariationsMap, pathParts: string[], value: string): void {
    let currentVariations = variations;

    pathParts.forEach((part, index) => {
      const [variationType, variationKey] = part.split(":");

      if (!currentVariations[variationType]) {
        currentVariations[variationType] = {};
      }

      if (index === pathParts.length - 1) {
        if (value.trim()) {
          currentVariations[variationType][variationKey] = {
            stringUnit: {
              state: "translated",
              value,
            },
          };
        } else {
          delete currentVariations[variationType][variationKey];
        }
      } else {
        const nestedVariation = this.ensureNestedVariation(currentVariations[variationType], variationKey);
        currentVariations = nestedVariation.variations as VariationsMap;
      }
    });
  }

  private ensureNestedVariation(container: { [key: string]: VariationValue }, key: string): VariationValue {
    if (!container[key]) {
      container[key] = { variations: {} };
    } else if (!container[key].variations) {
      container[key].variations = {};
    }
    return container[key];
  }

  private deleteVariationAtPath(variations: VariationsMap, pathParts: string[]): void {
    let current = variations;

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      const [variationType, variationKey] = part.split(":");

      // If we've reached the final path segment:
      if (i === pathParts.length - 1) {
        // Delete this specific variation node
        if (current[variationType]) {
          delete current[variationType][variationKey];
          // If the "variationType" object has no remaining keys, remove it too
          if (Object.keys(current[variationType]).length === 0) {
            delete current[variationType];
          }
        }
      } else {
        // Descend to the nested .variations if present
        const next = current[variationType]?.[variationKey]?.variations;
        if (!next) {
          // If we can't go deeper, no further removal is possible
          break;
        }
        current = next;
      }
    }
  }

  private cleanupEmptyVariations(variations: VariationsMap, pathParts: string[]): void {
    const stack: Array<{
      variations: VariationsMap;
      variationType: string;
      variationKey: string;
    }> = [];

    console.log("cleanupEmptyVariations, pathParts:", pathParts);
    
    let current = variations;
    for (const part of pathParts) {
      const [variationType, variationKey] = part.split(":");
      console.log("At part:", part, " =>", { variationType, variationKey });
      console.log("current object:", JSON.stringify(current, null, 2));
      
      stack.push({ variations: current, variationType, variationKey });

      if (!current[variationType]?.[variationKey]?.variations) break;
      current = current[variationType][variationKey].variations!;
    }

    for (let i = stack.length - 1; i >= 0; i--) {
      const { variations: vars, variationType } = stack[i];
      if (vars[variationType] && Object.keys(vars[variationType]).length === 0) {
        delete vars[variationType];
      }
    }
    
    console.log("After deleting empty stuff, variations is:", JSON.stringify(variations, null, 2));
  }
}
