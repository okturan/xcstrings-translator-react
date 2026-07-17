import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { FileManager } from "../src/utils/FileManager";
import { assertPlaceholderParity, placeholderMismatch } from "../src/utils/placeholders";
import { getVariationValue, processVariationRows } from "../src/utils/variationUtils";
import { parseXCStrings, serializeXCStrings } from "../src/utils/xcstrings";

const readFixture = (name: string): string =>
  readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

const representativeFixture = () => parseXCStrings(readFixture("representative.xcstrings"));
const substitutionFixture = () => parseXCStrings(readFixture("substitutions.xcstrings"));

describe("XCStrings behavior-level round trips", () => {
  it("accepts equivalent positional placeholders and reordered arguments", () => {
    expect(() => assertPlaceholderParity("User %@ has %lld items", "%2$lld éléments pour %1$@"))
      .not.toThrow();
    expect(() => assertPlaceholderParity("Progress: 100%% for %1$@", "Progression : 100%% pour %@"))
      .not.toThrow();
  });

  it("reports missing, changed, repeated, and unexpected placeholders", () => {
    expect(placeholderMismatch("%@ %@ %lld", "%@ %ld %d")).toEqual({
      missing: ["%@", "%lld"],
      unexpected: ["%ld", "%d"],
    });
  });

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

  it("rejects a placeholder mismatch without mutating the catalog", () => {
    const original = representativeFixture();
    const originalSnapshot = structuredClone(original);

    expect(() =>
      new FileManager().updateTranslation(original, "welcome.user", "fr", "Bonjour !"),
    ).toThrow("Placeholder mismatch: missing %1$@.");
    expect(() =>
      new FileManager().updateTranslation(original, "configuration.example", "fr", "Configuration : {\"count\": %ld}"),
    ).toThrow("Placeholder mismatch: missing %lld; unexpected %ld.");
    expect(original).toEqual(originalSnapshot);
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
      isTerminal: true,
    });
    expect(rows.find((row) => row.path === "device:iphone")).toMatchObject({
      isTerminal: false,
    });
  });

  it.each(["", "Replacement parent value"])(
    "rejects parent variation saves without changing descendants (value %j)",
    (value) => {
      const original = representativeFixture();
      const originalSnapshot = structuredClone(original);

      expect(() =>
        new FileManager().updateTranslation(
          original,
          "device.cart",
          "fr",
          value,
          "device:iphone",
        ),
      ).toThrow("Variation path is not an editable source leaf: device:iphone");
      expect(original).toEqual(originalSnapshot);
      expect(
        getVariationValue(
          original.strings["device.cart"].localizations?.fr.variations,
          "device:iphone.plural:other",
        ),
      ).toBe("%lld articles sur iPhone");
    },
  );

  it.each([
    "plural:many",
    "plural:one.device:iphone",
    "device:watch.plural:other",
  ])("rejects source-absent or overlong variation path %s", (path) => {
    const original = representativeFixture();
    const originalSnapshot = structuredClone(original);

    expect(() =>
      new FileManager().updateTranslation(
        original,
        "cart.items",
        "fr",
        "unsafe update",
        path,
      ),
    ).toThrow(`Unsupported variation path: ${path}`);
    expect(original).toEqual(originalSnapshot);
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

  it("round-trips substitution-backed localizations without changing their structure", () => {
    const source = readFixture("substitutions.xcstrings");
    const parsed = parseXCStrings(source);
    const serialized = serializeXCStrings(parsed);

    expect(JSON.parse(serialized)).toEqual(JSON.parse(source));
    expect(parsed.strings["%d of %d left"].localizations?.fr.substitutions?.left).toEqual(
      JSON.parse(source).strings["%d of %d left"].localizations.fr.substitutions.left,
    );
  });

  it("updates a substitution-backed top stringUnit while preserving substitutions", () => {
    const original = substitutionFixture();
    const originalSubstitutions = structuredClone(
      original.strings["%d of %d left"].localizations?.fr.substitutions,
    );

    const updated = new FileManager().updateTranslation(
      original,
      "%d of %d left",
      "fr",
      "%d parmi %#@left@",
    );
    const target = parseXCStrings(serializeXCStrings(updated)).strings["%d of %d left"]
      .localizations?.fr;

    expect(target?.stringUnit).toEqual({
      state: "translated",
      value: "%d parmi %#@left@",
      comment: "Keep this top-level review note.",
    });
    expect(target?.substitutions).toEqual(originalSubstitutions);
  });

  it("preserves locale-specific named substitution markers during edits", () => {
    const original = substitutionFixture();
    const originalSnapshot = structuredClone(original);

    expect(() =>
      new FileManager().updateTranslation(original, "%d of %d left", "fr", "%d restant"),
    ).toThrow("Placeholder mismatch: missing %#@left@.");
    expect(original).toEqual(originalSnapshot);
  });

  it("fails closed when deleting a stringUnit required by substitutions", () => {
    const manager = new FileManager();
    const current = manager.updateTranslation(
      substitutionFixture(),
      "%d of %d left",
      "fr",
      "%d parmi %#@left@",
    );
    const currentSnapshot = structuredClone(current);

    expect(() =>
      manager.updateTranslation(current, "%d of %d left", "fr", "   "),
    ).toThrow("Cannot delete a stringUnit that is required by substitutions.");
    expect(current).toEqual(currentSnapshot);
    expect(manager.getCurrentFile()).toEqual(currentSnapshot);
    expect(parseXCStrings(serializeXCStrings(current))).toEqual(currentSnapshot);
  });

  it("rejects orphan substitutions without their required top stringUnit", () => {
    const orphan = substitutionFixture();
    delete orphan.strings["%d of %d left"].localizations?.fr.stringUnit;

    expect(() => serializeXCStrings(orphan)).toThrow(
      "Unsupported Localizable.xcstrings: strings.%d of %d left.localizations.fr.substitutions requires stringUnit.",
    );
  });
});
