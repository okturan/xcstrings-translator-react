import * as fs from "fs/promises";
import { LocalizableStrings, Localization, VariationsMap, VariationValue } from "../types";

export interface SaveTranslationBody {
  key: string;
  language: string;
  value: string;
  path?: string;
}

export class LocalizableStringsManager {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async readStrings(): Promise<LocalizableStrings> {
    const content = await fs.readFile(this.filePath, "utf-8");
    return JSON.parse(content);
  }

  async writeStrings(strings: LocalizableStrings): Promise<void> {
    const jsonString = JSON.stringify(strings, null, 2);
    const formattedJson = jsonString.replace(/"([^"]+)":/g, '"$1" :');
    await fs.writeFile(this.filePath, formattedJson);
  }

  private initializeLocalization(
    strings: LocalizableStrings,
    key: string,
    language: string
  ): Localization {
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
        const currentValue = this.ensureNestedVariation(
          currentVariations[variationType],
          variationKey
        );
        currentVariations = currentValue.variations!;
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

  private cleanupEmptyVariations(
    variations: VariationsMap,
    pathParts: string[]
  ): void {
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
      const { variations, variationType } = stack[i];
      if (variations[variationType] && Object.keys(variations[variationType]).length === 0) {
        delete variations[variationType];
      }
    }
  }

  async updateTranslation({
    key,
    language,
    value,
    path: translationPath,
  }: SaveTranslationBody): Promise<void> {
    const strings = await this.readStrings();
    const localization = this.initializeLocalization(strings, key, language);
    const trimmedValue = value?.trim();

    if (translationPath) {
      if (trimmedValue) {
        if (!localization.variations) {
          localization.variations = {};
        }
        this.updateVariationAtPath(
          localization.variations,
          translationPath.split("."),
          trimmedValue
        );
        delete localization.stringUnit;
      } else if (localization.variations) {
        const pathParts = translationPath.split(".");
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
          delete strings.strings[key].localizations[language];
        }
      }
    }

    await this.writeStrings(strings);
  }
}
