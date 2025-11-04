import { FileManager } from "../FileManager";
import { LocalizableStrings } from "../../types";
import {
  validateXCStringsStructure,
  deepCompareXCStrings,
  testRoundTrip,
  ValidationResult,
} from "../validationUtils";

describe("XCStrings Round-Trip Tests", () => {
  let fileManager: FileManager;

  beforeEach(() => {
    fileManager = new FileManager();
  });

  const createTestData = (): LocalizableStrings => ({
    version: "1.0",
    sourceLanguage: "en",
    strings: {
      simple: {
        localizations: {
          en: {
            stringUnit: {
              state: "translated",
              value: "Hello",
            },
          },
          es: {
            stringUnit: {
              state: "translated",
              value: "Hola",
            },
          },
        },
      },
      with_plural: {
        localizations: {
          en: {
            variations: {
              plural: {
                one: {
                  stringUnit: {
                    state: "translated",
                    value: "%d item",
                  },
                },
                other: {
                  stringUnit: {
                    state: "translated",
                    value: "%d items",
                  },
                },
              },
            },
          },
        },
      },
      nested_device_plural: {
        localizations: {
          en: {
            variations: {
              device: {
                iphone: {
                  variations: {
                    plural: {
                      one: {
                        stringUnit: {
                          state: "translated",
                          value: "%d item in cart",
                        },
                      },
                      other: {
                        stringUnit: {
                          state: "translated",
                          value: "%d items in cart",
                        },
                      },
                    },
                  },
                },
                ipad: {
                  variations: {
                    plural: {
                      one: {
                        stringUnit: {
                          state: "translated",
                          value: "%d product",
                        },
                      },
                      other: {
                        stringUnit: {
                          state: "translated",
                          value: "%d products",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  describe("Structure Validation", () => {
    test("should validate correct xcstrings structure", () => {
      const data = createTestData();
      const result = validateXCStringsStructure(data);

      expect(result.valid).toBe(true);
      expect(result.issues.filter((i) => i.severity === "error")).toHaveLength(0);
    });

    test("should detect missing version", () => {
      const data: any = createTestData();
      delete data.version;

      const result = validateXCStringsStructure(data);

      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.path === "version")).toBe(true);
    });

    test("should detect missing sourceLanguage", () => {
      const data: any = createTestData();
      delete data.sourceLanguage;

      const result = validateXCStringsStructure(data);

      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.path === "sourceLanguage")).toBe(true);
    });

    test("should detect invalid stringUnit structure", () => {
      const data: any = createTestData();
      data.strings.simple.localizations.en.stringUnit = "invalid";

      const result = validateXCStringsStructure(data);

      expect(result.valid).toBe(false);
    });

    test("should validate nested variations structure", () => {
      const data = createTestData();
      const result = validateXCStringsStructure(data);

      expect(result.valid).toBe(true);
    });
  });

  describe("Simple String Modifications", () => {
    test("should preserve structure after updating simple string", () => {
      const original = createTestData();
      const modified = fileManager.updateTranslation(
        original,
        "simple",
        "es",
        "Hola Mundo"
      );

      // Re-parse to simulate export/import
      const exported = JSON.parse(JSON.stringify(modified));
      const validation = validateXCStringsStructure(exported);

      expect(validation.valid).toBe(true);
      expect(exported.strings.simple.localizations.es.stringUnit?.value).toBe("Hola Mundo");
    });

    test("should handle empty string update", () => {
      const original = createTestData();
      const modified = fileManager.updateTranslation(original, "simple", "es", "");

      const exported = JSON.parse(JSON.stringify(modified));
      const validation = validateXCStringsStructure(exported);

      expect(validation.valid).toBe(true);
      expect(exported.strings.simple.localizations.es.stringUnit).toBeUndefined();
    });
  });

  describe("Variation Modifications", () => {
    test("should preserve structure after updating plural variation", () => {
      const original = createTestData();
      const modified = fileManager.updateTranslation(
        original,
        "with_plural",
        "en",
        "%d elemento",
        "plural:one"
      );

      const exported = JSON.parse(JSON.stringify(modified));
      const validation = validateXCStringsStructure(exported);

      expect(validation.valid).toBe(true);
      expect(
        exported.strings.with_plural.localizations.en.variations?.plural?.one
          ?.stringUnit?.value
      ).toBe("%d elemento");
    });

    test("should preserve structure after updating nested variation (device > plural)", () => {
      const original = createTestData();
      const modified = fileManager.updateTranslation(
        original,
        "nested_device_plural",
        "en",
        "%d artículo en carrito",
        "device:iphone.plural:one"
      );

      const exported = JSON.parse(JSON.stringify(modified));
      const validation = validateXCStringsStructure(exported);

      expect(validation.valid).toBe(true);
      expect(
        exported.strings.nested_device_plural.localizations.en.variations?.device
          ?.iphone?.variations?.plural?.one?.stringUnit?.value
      ).toBe("%d artículo en carrito");
    });

    test("should handle deleting a variation", () => {
      const original = createTestData();
      const modified = fileManager.updateTranslation(
        original,
        "with_plural",
        "en",
        "",
        "plural:one"
      );

      const exported = JSON.parse(JSON.stringify(modified));
      const validation = validateXCStringsStructure(exported);

      expect(validation.valid).toBe(true);
      expect(
        exported.strings.with_plural.localizations.en.variations?.plural?.one
      ).toBeUndefined();
    });
  });

  describe("Round-Trip Tests", () => {
    test("should pass round-trip test for simple modification", () => {
      const original = createTestData();
      const result = testRoundTrip(
        original,
        [{ key: "simple", language: "es", value: "Hola Mundo" }],
        (data, key, lang, value, path) =>
          fileManager.updateTranslation(data, key, lang, value, path)
      );

      if (!result.valid) {
        console.log("Round-trip issues:", result.issues);
      }

      expect(result.valid).toBe(true);
    });

    test("should pass round-trip test for variation modification", () => {
      const original = createTestData();
      const result = testRoundTrip(
        original,
        [
          {
            key: "with_plural",
            language: "en",
            value: "%d elemento",
            path: "plural:one",
          },
        ],
        (data, key, lang, value, path) =>
          fileManager.updateTranslation(data, key, lang, value, path)
      );

      if (!result.valid) {
        console.log("Round-trip issues:", result.issues);
      }

      expect(result.valid).toBe(true);
    });

    test("should pass round-trip test for nested variation modification", () => {
      const original = createTestData();
      const result = testRoundTrip(
        original,
        [
          {
            key: "nested_device_plural",
            language: "en",
            value: "%d thing",
            path: "device:iphone.plural:one",
          },
        ],
        (data, key, lang, value, path) =>
          fileManager.updateTranslation(data, key, lang, value, path)
      );

      if (!result.valid) {
        console.log("Round-trip issues:", result.issues);
      }

      expect(result.valid).toBe(true);
    });

    test("should pass round-trip test for multiple modifications", () => {
      const original = createTestData();
      const result = testRoundTrip(
        original,
        [
          { key: "simple", language: "es", value: "Hola Mundo" },
          {
            key: "with_plural",
            language: "en",
            value: "%d elemento",
            path: "plural:one",
          },
          {
            key: "nested_device_plural",
            language: "en",
            value: "%d cosa",
            path: "device:ipad.plural:one",
          },
        ],
        (data, key, lang, value, path) =>
          fileManager.updateTranslation(data, key, lang, value, path)
      );

      if (!result.valid) {
        console.log("Round-trip issues:", result.issues);
      }

      expect(result.valid).toBe(true);
    });
  });

  describe("Deep Comparison", () => {
    test("should detect no differences when comparing identical objects", () => {
      const data1 = createTestData();
      const data2 = JSON.parse(JSON.stringify(data1));

      const result = deepCompareXCStrings(data1, data2);

      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    test("should detect value differences", () => {
      const data1 = createTestData();
      const data2 = JSON.parse(JSON.stringify(data1));
      data2.strings.simple.localizations.es.stringUnit!.value = "Changed";

      const result = deepCompareXCStrings(data1, data2);

      expect(result.valid).toBe(false);
      expect(
        result.issues.some((i) =>
          i.path.includes("simple.localizations.es.stringUnit.value")
        )
      ).toBe(true);
    });

    test("should detect missing keys", () => {
      const data1 = createTestData();
      const data2 = JSON.parse(JSON.stringify(data1));
      delete data2.strings.simple;

      const result = deepCompareXCStrings(data1, data2);

      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.path.includes("simple"))).toBe(true);
    });

    test("should detect variation structure changes", () => {
      const data1 = createTestData();
      const data2 = JSON.parse(JSON.stringify(data1));
      delete data2.strings.with_plural.localizations.en.variations?.plural?.one;

      const result = deepCompareXCStrings(data1, data2);

      expect(result.valid).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    test("should handle string with no variations being converted to variations", () => {
      const original = createTestData();
      // Add a new language with variations to a simple string
      const modified = fileManager.updateTranslation(
        original,
        "simple",
        "fr",
        "un élément",
        "plural:one"
      );

      const exported = JSON.parse(JSON.stringify(modified));
      const validation = validateXCStringsStructure(exported);

      expect(validation.valid).toBe(true);
      expect(
        exported.strings.simple.localizations.fr.variations?.plural?.one?.stringUnit
          ?.value
      ).toBe("un élément");
    });

    test("should handle converting variations back to simple string", () => {
      const original = createTestData();
      // Replace variations with simple stringUnit
      const modified = fileManager.updateTranslation(
        original,
        "with_plural",
        "en",
        "Simple value"
      );

      const exported = JSON.parse(JSON.stringify(modified));
      const validation = validateXCStringsStructure(exported);

      expect(validation.valid).toBe(true);
      expect(exported.strings.with_plural.localizations.en.stringUnit?.value).toBe(
        "Simple value"
      );
      expect(exported.strings.with_plural.localizations.en.variations).toBeUndefined();
    });

    test("should preserve unmodified nested variations", () => {
      const original = createTestData();
      // Modify only one path in nested structure
      const modified = fileManager.updateTranslation(
        original,
        "nested_device_plural",
        "en",
        "MODIFIED",
        "device:iphone.plural:one"
      );

      const exported = JSON.parse(JSON.stringify(modified));

      // Check that other paths are preserved
      expect(
        exported.strings.nested_device_plural.localizations.en.variations?.device
          ?.iphone?.variations?.plural?.other?.stringUnit?.value
      ).toBe("%d items in cart");
      expect(
        exported.strings.nested_device_plural.localizations.en.variations?.device
          ?.ipad?.variations?.plural?.one?.stringUnit?.value
      ).toBe("%d product");
    });
  });

  describe("Real-World Scenarios", () => {
    test("should handle adding a new language with all variations", () => {
      const original = createTestData();

      // Add Spanish translations for nested structure
      let modified = original;
      modified = fileManager.updateTranslation(
        modified,
        "nested_device_plural",
        "es",
        "%d artículo en carrito",
        "device:iphone.plural:one"
      );
      modified = fileManager.updateTranslation(
        modified,
        "nested_device_plural",
        "es",
        "%d artículos en carrito",
        "device:iphone.plural:other"
      );
      modified = fileManager.updateTranslation(
        modified,
        "nested_device_plural",
        "es",
        "%d producto",
        "device:ipad.plural:one"
      );
      modified = fileManager.updateTranslation(
        modified,
        "nested_device_plural",
        "es",
        "%d productos",
        "device:ipad.plural:other"
      );

      const exported = JSON.parse(JSON.stringify(modified));
      const validation = validateXCStringsStructure(exported);

      expect(validation.valid).toBe(true);
      expect(
        exported.strings.nested_device_plural.localizations.es.variations?.device
          ?.iphone?.variations?.plural?.one?.stringUnit?.value
      ).toBe("%d artículo en carrito");
    });

    test("should handle partial translation (some variations missing)", () => {
      const original = createTestData();

      // Add only one variation in Spanish
      const modified = fileManager.updateTranslation(
        original,
        "with_plural",
        "es",
        "%d artículo",
        "plural:one"
      );
      // Note: plural:other is not translated

      const exported = JSON.parse(JSON.stringify(modified));
      const validation = validateXCStringsStructure(exported);

      expect(validation.valid).toBe(true);
      expect(
        exported.strings.with_plural.localizations.es.variations?.plural?.one
          ?.stringUnit?.value
      ).toBe("%d artículo");
      expect(
        exported.strings.with_plural.localizations.es.variations?.plural?.other
      ).toBeUndefined();
    });
  });
});
