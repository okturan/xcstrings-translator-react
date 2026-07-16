import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getStoredApiKey,
  removeStoredApiKey,
  setStoredApiKey,
} from "../src/utils/apiKeyUtils";

describe("OpenRouter API-key persistence", () => {
  const storedValues = new Map<string, string>();

  beforeEach(() => {
    storedValues.clear();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storedValues.get(key) ?? null,
      setItem: (key: string, value: string) => storedValues.set(key, value),
      removeItem: (key: string) => storedValues.delete(key),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stores and retrieves the key under the documented browser-local key", () => {
    setStoredApiKey("sk-or-test");

    expect(storedValues.get("openrouter_api_key")).toBe("sk-or-test");
    expect(getStoredApiKey()).toBe("sk-or-test");
  });

  it("removes the persisted key", () => {
    setStoredApiKey("sk-or-test");
    removeStoredApiKey();

    expect(getStoredApiKey()).toBeNull();
    expect(storedValues.has("openrouter_api_key")).toBe(false);
  });
});
