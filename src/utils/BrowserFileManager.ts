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
    const blob = new Blob([formattedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Localizable.xcstrings';
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  updateTranslation(
    strings: LocalizableStrings,
    key: string,
    language: string,
    value: string,
    path?: string
  ): LocalizableStrings {
    const updatedStrings = JSON.parse(JSON.stringify(strings));
    const localization = this.initializeLocalization(updatedStrings, key, language);
    const trimmedValue = value?.trim();

    if (path) {
      if (trimmedValue) {
        if (!localization.variations) {
          localization.variations = {};
        }
        this.updateVariationAtPath(
          localization.variations,
          path.split("."),
          trimmedValue
        );
        delete localization.stringUnit;
      } else if (localization.variations) {
        const pathParts = path.split(".");
        this.cleanupEmptyVariations(localization.variations, pathParts);
        
        if (Object.keys(localization.variations).length === 0) {
          delete localization.variations;
        }
      }
    } else {
      if (trimmedValue) {
        delete localization.variations;
        localization.stringUnit = {
          value: trimmedValue,
          state: "translated",
        };
      } else {
        delete localization.stringUnit;
        if (Object.keys(localization).length === 0) {
          delete updatedStrings.strings[key].localizations[language];
        }
      }
    }

    this.currentFile = updatedStrings;
    return updatedStrings;
  }

  private initializeLocalization(
    strings: LocalizableStrings,
    key: string,
    language: string
  ) {
    if (!strings.strings[key]) {
      throw new Error("String key not found");
    }

    if (!strings.strings[key].localizations[language]) {
      strings.strings[key].localizations[language] = {};
    }

    return strings.strings[key].localizations[language];
  }

  private updateVariationAtPath(
    variations: VariationsMap,
    pathParts: string[],
    value: string
  ): void {
    let currentVariations = variations;

    pathParts.forEach((part, index) => {
      const [variationType, variationKey] = part.split(":");
      
      if (!currentVariations[variationType]) {
        currentVariations[variationType] = {};
      }

      if (index === pathParts.length - 1) {
        currentVariations[variationType][variationKey] = {
          stringUnit: {
            state: "translated",
            value,
          },
        };
      } else {
        if (!currentVariations[variationType][variationKey]) {
          currentVariations[variationType][variationKey] = { variations: {} };
        }
        if (!currentVariations[variationType][variationKey].variations) {
          currentVariations[variationType][variationKey].variations = {};
        }
        currentVariations = currentVariations[variationType][variationKey].variations as VariationsMap;
      }
    });
  }

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

  private cleanupEmptyVariations(variations: VariationsMap, pathParts: string[]): void {
    const stack: Array<{
      variations: VariationsMap;
      variationType: string;
      variationKey: string;
    }> = [];

    let current = variations;
    for (const part of pathParts) {
      const [variationType, variationKey] = part.split(":");
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
  }
}