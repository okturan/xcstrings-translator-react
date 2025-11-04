/**
 * Standalone validation script to test xcstrings parsing robustness
 * Run with: npx tsx validate-parsing.ts
 */

import { FileManager } from "./src/utils/FileManager";
import { LocalizableStrings } from "./src/types";
import {
  validateXCStringsStructure,
  deepCompareXCStrings,
  testRoundTrip,
} from "./src/utils/validationUtils";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createTestData(): LocalizableStrings {
  return {
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
  };
}

function runTests() {
  const fileManager = new FileManager();
  let passedTests = 0;
  let failedTests = 0;

  log("\n🧪 XCStrings Parsing Validation Tests\n", "cyan");
  log("=" .repeat(60), "blue");

  // Test 1: Structure Validation
  log("\n📋 Test 1: Structure Validation", "blue");
  const testData = createTestData();
  const structureValidation = validateXCStringsStructure(testData);
  if (structureValidation.valid) {
    log("✓ PASS: Structure validation passed", "green");
    passedTests++;
  } else {
    log("✗ FAIL: Structure validation failed", "red");
    structureValidation.issues.forEach((issue) => {
      log(`  - ${issue.path}: ${issue.message}`, "yellow");
    });
    failedTests++;
  }

  // Test 2: Simple String Modification
  log("\n📝 Test 2: Simple String Modification", "blue");
  const modified1 = fileManager.updateTranslation(
    testData,
    "simple",
    "es",
    "Hola Mundo"
  );
  const exported1 = JSON.parse(JSON.stringify(modified1));
  const validation1 = validateXCStringsStructure(exported1);
  const valueCorrect1 =
    exported1.strings.simple.localizations.es.stringUnit?.value === "Hola Mundo";

  if (validation1.valid && valueCorrect1) {
    log("✓ PASS: Simple modification preserved correctly", "green");
    passedTests++;
  } else {
    log("✗ FAIL: Simple modification failed", "red");
    if (!validation1.valid) {
      validation1.issues.forEach((issue) => {
        log(`  - ${issue.path}: ${issue.message}`, "yellow");
      });
    }
    if (!valueCorrect1) {
      log("  - Value not correctly updated", "yellow");
    }
    failedTests++;
  }

  // Test 3: Plural Variation Modification
  log("\n🔢 Test 3: Plural Variation Modification", "blue");
  const modified2 = fileManager.updateTranslation(
    testData,
    "with_plural",
    "en",
    "%d elemento",
    "plural:one"
  );
  const exported2 = JSON.parse(JSON.stringify(modified2));
  const validation2 = validateXCStringsStructure(exported2);
  const valueCorrect2 =
    exported2.strings.with_plural.localizations.en.variations?.plural?.one
      ?.stringUnit?.value === "%d elemento";

  if (validation2.valid && valueCorrect2) {
    log("✓ PASS: Plural variation modified correctly", "green");
    passedTests++;
  } else {
    log("✗ FAIL: Plural variation modification failed", "red");
    if (!validation2.valid) {
      validation2.issues.forEach((issue) => {
        log(`  - ${issue.path}: ${issue.message}`, "yellow");
      });
    }
    if (!valueCorrect2) {
      log("  - Variation value not correctly updated", "yellow");
    }
    failedTests++;
  }

  // Test 4: Nested Variation Modification (device > plural)
  log("\n🌳 Test 4: Nested Variation Modification (device > plural)", "blue");
  const modified3 = fileManager.updateTranslation(
    testData,
    "nested_device_plural",
    "en",
    "%d artículo en carrito",
    "device:iphone.plural:one"
  );
  const exported3 = JSON.parse(JSON.stringify(modified3));
  const validation3 = validateXCStringsStructure(exported3);
  const valueCorrect3 =
    exported3.strings.nested_device_plural.localizations.en.variations?.device
      ?.iphone?.variations?.plural?.one?.stringUnit?.value ===
    "%d artículo en carrito";

  if (validation3.valid && valueCorrect3) {
    log("✓ PASS: Nested variation modified correctly", "green");
    passedTests++;
  } else {
    log("✗ FAIL: Nested variation modification failed", "red");
    if (!validation3.valid) {
      validation3.issues.forEach((issue) => {
        log(`  - ${issue.path}: ${issue.message}`, "yellow");
      });
    }
    if (!valueCorrect3) {
      log("  - Nested variation value not correctly updated", "yellow");
    }
    failedTests++;
  }

  // Test 5: Variation Deletion
  log("\n🗑️  Test 5: Variation Deletion", "blue");
  const modified4 = fileManager.updateTranslation(
    testData,
    "with_plural",
    "en",
    "",
    "plural:one"
  );
  const exported4 = JSON.parse(JSON.stringify(modified4));
  const validation4 = validateXCStringsStructure(exported4);
  const deletionCorrect =
    !exported4.strings.with_plural.localizations.en.variations?.plural?.one;

  if (validation4.valid && deletionCorrect) {
    log("✓ PASS: Variation deleted correctly", "green");
    passedTests++;
  } else {
    log("✗ FAIL: Variation deletion failed", "red");
    if (!validation4.valid) {
      validation4.issues.forEach((issue) => {
        log(`  - ${issue.path}: ${issue.message}`, "yellow");
      });
    }
    if (!deletionCorrect) {
      log("  - Variation was not deleted", "yellow");
    }
    failedTests++;
  }

  // Test 6: Round-Trip Test (Simple)
  log("\n🔄 Test 6: Round-Trip Test (Simple)", "blue");
  const roundTrip1 = testRoundTrip(
    testData,
    [{ key: "simple", language: "es", value: "Hola Mundo" }],
    (data, key, lang, value, path) =>
      fileManager.updateTranslation(data, key, lang, value, path)
  );

  if (roundTrip1.valid) {
    log("✓ PASS: Simple round-trip successful", "green");
    passedTests++;
  } else {
    log("✗ FAIL: Simple round-trip failed", "red");
    roundTrip1.issues.forEach((issue) => {
      log(`  - ${issue.path}: ${issue.message}`, "yellow");
    });
    failedTests++;
  }

  // Test 7: Round-Trip Test (Nested)
  log("\n🔄 Test 7: Round-Trip Test (Nested Variations)", "blue");
  const roundTrip2 = testRoundTrip(
    testData,
    [
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

  if (roundTrip2.valid) {
    log("✓ PASS: Nested round-trip successful", "green");
    passedTests++;
  } else {
    log("✗ FAIL: Nested round-trip failed", "red");
    roundTrip2.issues.forEach((issue) => {
      log(`  - ${issue.path}: ${issue.message}`, "yellow");
    });
    failedTests++;
  }

  // Test 8: Round-Trip Test (Multiple Modifications)
  log("\n🔄 Test 8: Round-Trip Test (Multiple Modifications)", "blue");
  const roundTrip3 = testRoundTrip(
    testData,
    [
      { key: "simple", language: "es", value: "Hola Mundo" },
      { key: "with_plural", language: "en", value: "%d elemento", path: "plural:one" },
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

  if (roundTrip3.valid) {
    log("✓ PASS: Multiple modifications round-trip successful", "green");
    passedTests++;
  } else {
    log("✗ FAIL: Multiple modifications round-trip failed", "red");
    roundTrip3.issues.forEach((issue) => {
      log(`  - ${issue.path}: ${issue.message}`, "yellow");
    });
    failedTests++;
  }

  // Test 9: Deep Comparison
  log("\n🔍 Test 9: Deep Comparison (Unchanged Data)", "blue");
  const data1 = createTestData();
  const data2 = JSON.parse(JSON.stringify(data1));
  const deepComparison = deepCompareXCStrings(data1, data2);

  if (deepComparison.valid && deepComparison.issues.length === 0) {
    log("✓ PASS: Deep comparison detected no differences", "green");
    passedTests++;
  } else {
    log("✗ FAIL: Deep comparison failed", "red");
    deepComparison.issues.forEach((issue) => {
      log(`  - ${issue.path}: ${issue.message}`, "yellow");
    });
    failedTests++;
  }

  // Test 10: Test with comprehensive test file if it exists
  const testFilePath = path.join(
    __dirname,
    "test-data",
    "comprehensive-test.xcstrings"
  );
  if (fs.existsSync(testFilePath)) {
    log("\n📂 Test 10: Comprehensive Test File Validation", "blue");
    try {
      const fileContent = fs.readFileSync(testFilePath, "utf-8");
      const parsedData = JSON.parse(fileContent) as LocalizableStrings;
      const validation = validateXCStringsStructure(parsedData);

      if (validation.valid) {
        log("✓ PASS: Comprehensive test file is valid", "green");
        passedTests++;
      } else {
        log("✗ FAIL: Comprehensive test file has issues", "red");
        validation.issues.forEach((issue) => {
          log(`  - ${issue.path}: ${issue.message}`, "yellow");
        });
        failedTests++;
      }
    } catch (error) {
      log(`✗ FAIL: Could not parse comprehensive test file: ${error}`, "red");
      failedTests++;
    }
  }

  // Summary
  log("\n" + "=".repeat(60), "blue");
  log("\n📊 Test Summary", "cyan");
  log(`Total tests: ${passedTests + failedTests}`, "blue");
  log(`✓ Passed: ${passedTests}`, "green");
  log(`✗ Failed: ${failedTests}`, "red");

  if (failedTests === 0) {
    log("\n🎉 All tests passed! Your parsing is robust.", "green");
    return 0;
  } else {
    log(
      `\n⚠️  ${failedTests} test(s) failed. Please review the issues above.`,
      "yellow"
    );
    return 1;
  }
}

// Run the tests
const exitCode = runTests();
process.exit(exitCode);
