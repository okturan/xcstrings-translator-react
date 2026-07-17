import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const fixturePath = (name: string) =>
  fileURLToPath(new URL(`../tests/fixtures/${name}`, import.meta.url));

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "No File Loaded" })).toBeVisible();
});

test("imports, edits, and exports a catalog through the production UI", async ({ page }) => {
  await page.getByLabel("Choose XCStrings file").setInputFiles(
    fixturePath("representative.xcstrings"),
  );
  await page.getByRole("button", { name: "fr", exact: true }).click();

  const welcomeRow = page.getByRole("row").filter({
    has: page.getByText("welcome.user", { exact: true }),
  });
  await expect(welcomeRow).toHaveCount(1);
  await expect(welcomeRow).toContainText("Bienvenue, %1$@ !");
  await expect(welcomeRow).toContainText(
    "Greeting on the signed-in home screen. Keep the positional placeholder.",
  );

  await welcomeRow.getByTitle("Edit manually").click();
  const editor = welcomeRow.locator("textarea");
  await expect(editor).toHaveCount(1);
  await editor.fill("Salut, %1$@ !");
  await welcomeRow.getByRole("button", { name: "Save", exact: true }).click();
  await expect(welcomeRow).toContainText("Salut, %1$@ !");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Translations" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("Localizable.xcstrings");

  const exportedPath = await download.path();
  expect(exportedPath).not.toBeNull();
  const exported = JSON.parse(readFileSync(exportedPath as string, "utf8"));

  expect(exported.strings["welcome.user"].localizations.fr.stringUnit).toMatchObject({
    value: "Salut, %1$@ !",
    state: "translated",
    comment: "Preserve this reviewer note",
  });
  expect(exported.strings["welcome.user"]).toMatchObject({
    comment: "Greeting on the signed-in home screen. Keep the positional placeholder.",
    extractionState: "manual",
    developerMetadata: {
      screen: "home",
      ticket: "LOC-42",
    },
  });
});

test("rejects malformed input without leaving the empty state", async ({ page }) => {
  await page.getByLabel("Choose XCStrings file").setInputFiles(
    fixturePath("malformed.xcstrings"),
  );

  await expect(
    page.getByText("Invalid JSON: unable to parse Localizable.xcstrings.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "No File Loaded" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Export Translations" })).toHaveCount(0);
});
