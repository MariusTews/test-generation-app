import { test, expect } from "@playwright/test";
test.setTimeout(15000);

test("Drittmittelprojekte report", async ({ page }) => {
  // Mock HTTP requests for application settings
  const applicationSettingsResponse = {
    id: "someId",
    researchFocusId: "someResearchFocusId",
    timespans: [
      {
        begin: "2023-01-01T00:00:00.000Z",
        end: "2023-12-31T00:00:00.000Z",
      },
    ],
  };
  await page.route(
    "http://localhost:3000/api/applicationSetting/",
    async (route) => {
      await route.fulfill({
        body: JSON.stringify([applicationSettingsResponse]),
      });
    }
  );

  // Mock HTTP requests for Drittmittelprojekte report data
  const drittmittelprojekteResponse = {
    reportName: "Übersicht Drittmittelprojekte",
    reportFileName: "Ü_E_Drittmittelprojekte",
    reportHeading: "Übersicht Drittmittelprojekte",
    reportTable: {
      header: {
        cells: [
          { value: "Projektname", rowSpan: 1 },
          { value: "Akronym", rowSpan: 1 },
          { value: "Fördergeber", rowSpan: 1 },
          { value: "Laufzeit [nur Jahre]", rowSpan: 1 },
          { value: "Fördersumme", options: { format: "euro" }, rowSpan: 1 },
        ],
      },
      entries: [
        {
          cells: [
            { value: "Projekt A", rowSpan: 1 },
            { value: "PA", rowSpan: 1 },
            { value: "Förderer X", rowSpan: 1 },
            { value: 2023, rowSpan: 1 },
            { value: 100000, options: { format: "euro" }, rowSpan: 1 },
          ],
        },
        {
          cells: [
            { value: "Projekt B", rowSpan: 1 },
            { value: "PB", rowSpan: 1 },
            { value: "Förderer Y", rowSpan: 1 },
            { value: 2024, rowSpan: 1 },
            { value: 200000, options: { format: "euro" }, rowSpan: 1 },
          ],
        },
        {
          cells: [
            { value: "Projekt C", rowSpan: 1 },
            { value: "PC", rowSpan: 1 },
            { value: "Förderer Z", rowSpan: 1 },
            { value: 2025, rowSpan: 1 },
            { value: 300000, options: { format: "euro" }, rowSpan: 1 },
          ],
        },
        {
          cells: [
            { value: "Projekt D", rowSpan: 1 },
            { value: "PD", rowSpan: 1 },
            { value: "Förderer X", rowSpan: 1 },
            { value: 2026, rowSpan: 1 },
            { value: 150000, options: { format: "euro" }, rowSpan: 1 },
          ],
        },
      ],
      hasSumRow: false,
    },
  };
  await page.route(
    "http://localhost:3000/api/evalReport/thirdParty*",
    async (route) => {
      await route.fulfill({
        body: JSON.stringify(drittmittelprojekteResponse),
      });
    }
  );

  // Navigate to the reports page
  await page.goto("http://localhost:4200/reports/evalReport");

  // Select Drittmittelprojekte report by clicking accordion
  await page.getByRole("button", { name: "Projekte und Drittmittel" }).click();
  await page.getByText("Übersicht Drittmittelprojekte").click();
  await page
    .locator("div")
    .filter({ hasText: /^Übersicht Drittmittelprojekte$/ })
    .getByRole("button")
    .click();

  // Set dates
  await page.locator("#datepicker").nth(0).fill("01.01.2023");
  await page.locator("#datepicker").nth(1).fill("31.12.2026");

  // Click the "Abfragen starten" button
  await page.getByText("Abfragen starten").click();

  // Assertions
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByText("Projekt A")).toBeVisible();
  await expect(page.getByText("Projekt B")).toBeVisible();
  await expect(page.getByText("100.000,00 €")).toBeVisible();
  await expect(page.getByText("200.000,00 €")).toBeVisible();
  await expect(page.getByText("Projekt C")).toBeVisible();
  await expect(page.getByText("300.000,00 €")).toBeVisible();
  await expect(page.getByText("Projekt D")).toBeVisible();
  await expect(page.getByText("150.000,00 €")).toBeVisible();
});

test("Gleichstellung report", async ({ page }) => {
  // Mock HTTP requests for application settings (same as before)
  const applicationSettingsResponse = {
    id: "someId",
    researchFocusId: "someResearchFocusId",
    timespans: [
      {
        begin: "2023-01-01T00:00:00.000Z",
        end: "2023-12-31T00:00:00.000Z",
      },
    ],
  };
  await page.route(
    "http://localhost:3000/api/applicationSetting/",
    async (route) => {
      await route.fulfill({
        body: JSON.stringify([applicationSettingsResponse]),
      });
    }
  );

  // Mock HTTP requests for Gleichstellung report data
  const gleichstellungResponse = {
    reportName: "Gleichstellung",
    reportFileName: "Gleichstellung",
    reportHeading: "Gleichstellung",
    reportTable: {
      header: {
        cells: [
          { value: "Bereich", rowSpan: 1 },
          { value: "Gesamt", rowSpan: 1 },
          { value: "männlich", rowSpan: 1 },
          { value: "weiblich", rowSpan: 1 },
          { value: "divers", rowSpan: 1 },
          { value: "Quote (m|w|d)", rowSpan: 1 },
        ],
      },
      entries: [
        {
          cells: [
            { value: "Wissenschaftliches Personal", rowSpan: 1 },
            { value: 100, rowSpan: 1 },
            { value: 60, rowSpan: 1 },
            { value: 30, rowSpan: 1 },
            { value: 10, rowSpan: 1 },
            { value: "60|30|10", rowSpan: 1 },
          ],
        },
        {
          cells: [
            { value: "Administratives Personal", rowSpan: 1 },
            { value: 50, rowSpan: 1 },
            { value: 20, rowSpan: 1 },
            { value: 25, rowSpan: 1 },
            { value: 5, rowSpan: 1 },
            { value: "40|50|10", rowSpan: 1 },
          ],
        },
      ],
      hasSumRow: false,
    },
  };
  await page.route(
    "http://localhost:3000/api/evalReport/gender",
    async (route) => {
      await route.fulfill({
        body: JSON.stringify(gleichstellungResponse),
      });
    }
  );

  await page.goto("http://localhost:4200/reports/evalReport");

  // Select Gleichstellung report
  await page.getByRole("button", { name: "Personalmanagement" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^Gleichstellung$/ })
    .getByRole("button")
    .click();

  // Click the "Abfragen starten" button (no date picker for this report)
  await page.getByText("Abfragen starten").click();

  // Assertions
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByText("Wissenschaftliches Personal")).toBeVisible();
  await expect(page.getByText("Administratives Personal")).toBeVisible();
  await expect(page.getByText("60", { exact: true })).toBeVisible();
  await expect(page.getByText("30", { exact: true })).toBeVisible();
  await expect(page.getByText("10", { exact: true })).toBeVisible();
  await expect(page.getByText("20", { exact: true })).toBeVisible();
  await expect(page.getByText("25", { exact: true })).toBeVisible();
  await expect(page.getByText("5", { exact: true })).toBeVisible();
  await expect(page.getByText("60|30|10")).toBeVisible();
  await expect(page.getByText("40|50|10")).toBeVisible();
});
