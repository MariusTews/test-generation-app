import { test, expect } from "@playwright/test";
test.setTimeout(15000);

test("Drittmittelprojekte report", async ({ page }) => {
  // Mock HTTP requests for application settings
  const applicationSettingsResponse = {
    id: "mockApplicationSettingId",
    researchFocusId: "mockResearchFocusId",
    timespans: [
      { begin: new Date("2023-01-01"), end: new Date("2023-12-31") },
      { begin: new Date("2024-01-01"), end: new Date("2024-12-31") },
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

  // Mock HTTP requests for Drittmittelprojekte report
  const drittmittelprojekteResponse = {
    reportName: "Drittmittelprojekte",
    reportFileName: "drittmittelprojekte",
    reportHeading: "Drittmittelprojekte Report",
    reportTable: {
      header: {
        cells: [
          {
            value: "Projektname",
            options: { alignHorizontal: "left" },
            rowSpan: 1,
          },
          {
            value: "Akronym",
            options: { alignHorizontal: "left" },
            rowSpan: 1,
          },
          {
            value: "Fördergeber",
            options: { alignHorizontal: "left" },
            rowSpan: 1,
          },
          {
            value: "Laufzeit [nur Jahre]",
            options: { alignHorizontal: "left" },
            rowSpan: 1,
          },
          {
            value: "Fördersumme",
            options: { alignHorizontal: "right", format: "euro" },
            rowSpan: 1,
          },
        ],
      },
      entries: [
        {
          cells: [
            {
              value: "Project A",
              options: { alignHorizontal: "left" },
              rowSpan: 1,
            },
            { value: "PA", options: { alignHorizontal: "left" }, rowSpan: 1 },
            {
              value: "Sponsor A",
              options: { alignHorizontal: "left" },
              rowSpan: 1,
            },
            { value: "2023", options: { alignHorizontal: "left" }, rowSpan: 1 },
            {
              value: 1000,
              options: { alignHorizontal: "right", format: "euro" },
              rowSpan: 1,
            },
          ],
        },
        {
          cells: [
            {
              value: "Project B",
              options: { alignHorizontal: "left" },
              rowSpan: 1,
            },
            { value: "PB", options: { alignHorizontal: "left" }, rowSpan: 1 },
            {
              value: "Sponsor B",
              options: { alignHorizontal: "left" },
              rowSpan: 1,
            },
            {
              value: "2023-2024",
              options: { alignHorizontal: "left" },
              rowSpan: 1,
            },
            {
              value: 2000,
              options: { alignHorizontal: "right", format: "euro" },
              rowSpan: 1,
            },
          ],
        },
        {
          cells: [
            {
              value: "Project C",
              options: { alignHorizontal: "left" },
              rowSpan: 1,
            },
            { value: "PC", options: { alignHorizontal: "left" }, rowSpan: 1 },
            {
              value: "Sponsor C",
              options: { alignHorizontal: "left" },
              rowSpan: 1,
            },
            { value: "2024", options: { alignHorizontal: "left" }, rowSpan: 1 },
            {
              value: 1500,
              options: { alignHorizontal: "right", format: "euro" },
              rowSpan: 1,
            },
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
  await page.locator("#datepicker").nth(1).fill("31.12.2023");

  // Click the "getReports" button
  await page.getByText("Abfragen starten").click();

  // Assertions
  await expect(page.getByText("Project A")).toBeVisible();
  await expect(page.getByText("1.000,00 €")).toBeVisible();
  await expect(page.getByText("Project B")).toBeVisible();
  await expect(page.getByText("2.000,00 €")).toBeVisible();
  await expect(page.getByText("Project C")).toBeVisible();
  await expect(page.getByText("1.500,00 €")).toBeVisible();
});

test("Gleichstellung report", async ({ page }) => {
  // Mock HTTP requests for application settings
  const applicationSettingsResponse = {
    id: "mockApplicationSettingId",
    researchFocusId: "mockResearchFocusId",
    timespans: [
      { begin: new Date("2023-01-01"), end: new Date("2023-12-31") },
      { begin: new Date("2024-01-01"), end: new Date("2024-12-31") },
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

  // Mock HTTP requests for Gleichstellung report
  const gleichstellungResponse = {
    reportName: "Gleichstellung",
    reportFileName: "gleichstellung",
    reportHeading: "Gleichstellung Report",
    reportTable: {
      header: {
        cells: [
          {
            value: "Bereich",
            options: { alignHorizontal: "left" },
            rowSpan: 1,
          },
          {
            value: "Gesamt",
            options: { alignHorizontal: "right" },
            rowSpan: 1,
          },
          {
            value: "männlich",
            options: { alignHorizontal: "right" },
            rowSpan: 1,
          },
          {
            value: "weiblich",
            options: { alignHorizontal: "right" },
            rowSpan: 1,
          },
          {
            value: "divers",
            options: { alignHorizontal: "right" },
            rowSpan: 1,
          },
          {
            value: "Quote (m|w|d)",
            options: { alignHorizontal: "right" },
            rowSpan: 1,
          },
        ],
      },
      entries: [
        {
          cells: [
            {
              value: "Gesamt",
              options: { alignHorizontal: "left" },
              rowSpan: 1,
            },
            { value: 102, options: { alignHorizontal: "right" }, rowSpan: 1 },
            { value: 50, options: { alignHorizontal: "right" }, rowSpan: 1 },
            { value: 50, options: { alignHorizontal: "right" }, rowSpan: 1 },
            { value: 2, options: { alignHorizontal: "right" }, rowSpan: 1 },
            {
              value: "49|49|2",
              options: { alignHorizontal: "right" },
              rowSpan: 1,
            },
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

  // Navigate to the reports page
  await page.goto("http://localhost:4200/reports/evalReport");

  // Select Gleichstellung report by clicking accordion
  await page.getByRole("button", { name: "Personalmanagement" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^Gleichstellung$/ })
    .getByRole("button")
    .click();

  // Click the "getReports" button
  await page.getByText("Abfragen starten").click();

  // Assertions
  await expect(page.getByText("Bereich")).toBeVisible();
  await expect(page.getByText("männlich")).toBeVisible();
  await expect(page.getByText("weiblich")).toBeVisible();
  await expect(page.getByText("divers")).toBeVisible();
  await expect(page.getByText("Quote (m|w|d)")).toBeVisible();
  await expect(page.getByText("102")).toBeVisible();
  await expect(page.getByText("50").nth(0)).toBeVisible();
  await expect(page.getByText("50").nth(1)).toBeVisible();
  await expect(page.getByText("2").nth(0)).toBeVisible();
  await expect(page.getByText("49|49|2")).toBeVisible();
});
