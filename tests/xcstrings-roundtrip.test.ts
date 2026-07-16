import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { FileManager } from "../src/utils/FileManager";
import { getVariationValue, processVariationRows } from "../src/utils/variationUtils";
import { parseXCStrings, serializeXCStrings } from "../src/utils/xcstrings";

const readFixture = (name: string): string =>
  readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

const representativeFixture = () => parseXCStrings(readFixture("representative.xcstrings"));

describe("XCStrings behavior-level round trips", () => {
  it("round-trips placeholders, comments, metadata, localizations, and variations semantically", () => {
    const source = readFixture("representative.xcstrings");
    const parsed = parseXCStrings(source);
    const serialized = serializeXCStrings(parsed);

    expect(JSON.parse(serialized)).toEqual(JSON.parse(source));
    expect(serialized.endsWith("\n")).toBe(true);
    expect(serialized).toContain("Welcome, %1$@!");
    expect(serialized).toContain("Configuration: {\\\"count\\\": %lld}");
  });

  it("updates a simple translation without trimming content or losing context metadata", () => {
    const original = representativeFixture();
    const originalSnapshot = structuredClone(original);

    const updated = new FileManager().updateTranslation(
      original,
      "welcome.user",
      "fr",
      "  Bonjour, %1$@ !  ",
    );
    const roundTripped = parseXCStrings(serializeXCStrings(updated));

    expect(original).toEqual(originalSnapshot);
    expect(roundTripped.strings["welcome.user"]).toMatchObject({
      comment: "Greeting on the signed-in home screen. Keep the positional placeholder.",
      extractionState: "manual",
      shouldTranslate: true,
      developerMetadata: {
        screen: "home",
        ticket: "LOC-42",
      },
    });
    expect(roundTripped.strings["welcome.user"].localizations?.fr.stringUnit).toEqual({
      state: "translated",
      value: "  Bonjour, %1$@ !  ",
      comment: "Preserve this reviewer note",
    });
    expect(roundTripped.strings["welcome.user"].localizations?.en).toEqual(
      originalSnapshot.strings["welcome.user"].localizations?.en,
    );
    expect(roundTripped.strings["welcome.user"].localizations?.de).toEqual(
      originalSnapshot.strings["welcome.user"].localizations?.de,
    );
  });

  it("updates a nested device/plural leaf while preserving its note and every sibling", () => {
    const original = representativeFixture();
    const originalSnapshot = structuredClone(original);

    const updated = new FileManager().updateTranslation(
      original,
      "device.cart",
      "fr",
      "%lld éléments sur iPhone",
      "device:iphone.plural:other",
    );
    const roundTripped = parseXCStrings(serializeXCStrings(updated));
    const targetVariations = roundTripped.strings["device.cart"].localizations?.fr.variations;

    expect(getVariationValue(targetVariations, "device:iphone.plural:other")).toBe(
      "%lld éléments sur iPhone",
    );
    expect(
      targetVariations?.device.iphone.variations?.plural.other.stringUnit?.comment,
    ).toBe("Preserve this variation review note");
    expect(targetVariations?.device.iphone.variations?.plural.one).toEqual(
      originalSnapshot.strings["device.cart"].localizations?.fr.variations?.device.iphone
        .variations?.plural.one,
    );
    expect(targetVariations?.device.ipad).toEqual(
      originalSnapshot.strings["device.cart"].localizations?.fr.variations?.device.ipad,
    );
    expect(roundTripped.strings["device.cart"].localizations?.en).toEqual(
      originalSnapshot.strings["device.cart"].localizations?.en,
    );
  });

  it("exposes deterministic nested variation paths used by the editor", () => {
    const fixture = representativeFixture();
    const entry = fixture.strings["device.cart"];
    const rows = processVariationRows(entry.localizations?.en, entry.localizations?.fr);

    expect(rows.map((row) => row.path)).toEqual([
      "device:iphone",
      "device:iphone.plural:one",
      "device:iphone.plural:other",
      "device:ipad",
      "device:ipad.plural:one",
      "device:ipad.plural:other",
    ]);
    expect(rows.find((row) => row.path === "device:iphone.plural:other")).toMatchObject({
      sourceValue: "%lld items on iPhone",
      targetValue: "%lld articles sur iPhone",
      targetState: "needs_review",
    });
  });

  it("adds a translation to a valid source-only entry", () => {
    const updated = new FileManager().updateTranslation(
      representativeFixture(),
      "source.only %@",
      "es",
      "solo fuente %@",
    );
    const roundTripped = parseXCStrings(serializeXCStrings(updated));

    expect(roundTripped.strings["source.only %@"].localizations?.es.stringUnit).toEqual({
      state: "translated",
      value: "solo fuente %@",
    });
    expect(roundTripped.strings["source.only %@"].comment).toBe(
      "This source entry intentionally has no localizations object.",
    );
  });

  it("prunes empty nested variation shells after the last target leaf is deleted", () => {
    const manager = new FileManager();
    const path = "device:iphone.plural:one";
    const withSpanishLeaf = manager.updateTranslation(
      representativeFixture(),
      "device.cart",
      "es",
      "%lld artículo en iPhone",
      path,
    );
    const withoutSpanishLeaf = manager.updateTranslation(
      withSpanishLeaf,
      "device.cart",
      "es",
      "",
      path,
    );

    expect(withoutSpanishLeaf.strings["device.cart"].localizations?.es).toBeUndefined();
    expect(() => parseXCStrings(serializeXCStrings(withoutSpanishLeaf))).not.toThrow();
  });

  it("rejects malformed JSON with a stable parse error", () => {
    expect(() => parseXCStrings(readFixture("malformed.xcstrings"))).toThrow(
      "Invalid JSON: unable to parse Localizable.xcstrings.",
    );
  });

  it("rejects unsupported versions and structural shapes explicitly", () => {
    expect(() => parseXCStrings(readFixture("unsupported-version.xcstrings"))).toThrow(
      'Unsupported Localizable.xcstrings: version must be "1.0".',
    );
    expect(() => parseXCStrings(readFixture("unsupported-shape.xcstrings"))).toThrow(
      "Unsupported Localizable.xcstrings: strings.invalid.localizations must be an object.",
    );
  });

  it("rejects variation paths that the editor cannot represent", () => {
    expect(() =>
      new FileManager().updateTranslation(
        representativeFixture(),
        "cart.items",
        "fr",
        "%lld article",
        "plural",
      ),
    ).toThrow("Unsupported variation path: plural");
  });
});
