import { describe, expect, it } from "vitest";

import { reconcileSelectedLanguage } from "../src/hooks/usePersistedLanguageState";

describe("persisted target-language reconciliation", () => {
  it("keeps a persisted language that exists in the imported catalog", () => {
    expect(reconcileSelectedLanguage("de", ["en", "de", "fr"], "en")).toBe("de");
  });

  it("replaces a stale language with the first available target", () => {
    expect(reconcileSelectedLanguage("es", ["en", "fr", "de"], "en")).toBe("fr");
  });

  it("falls back to the source when the catalog has no target language", () => {
    expect(reconcileSelectedLanguage("es", ["en"], "en")).toBe("en");
  });
});
