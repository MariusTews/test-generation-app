import { test, expect } from "@playwright/test";

test.setTimeout(15000);

test("Drittmittelprojekte report displays correctly", async ({ page }) => {
  await page.route(
    "http://localhost:3000/api/evalReport/thirdParty*",
    async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          reportName: "Ü_E_Drittmittelprojekte",
          reportFileName: "Ü_E_Drittmittelprojekte",
          reportHeading: "Übersicht Drittmittelprojekte",
          reportTable: {
            header: {
              cells: [
                { value: "Projektname" },
                { value: "Akronym" },
                { value: "Fördergeber" },
                { value: "Laufzeit [nur Jahre]" },
                { value: "Fördersumme" },
              ],
            },
            entries: [
              {
                cells: [
                  { value: "Projekt 1", rowSpan: 1 },
                  { value: "P1", rowSpan: 1 },
                  { value: "Förderer A", rowSpan: 1 },
                  { value: 2023, rowSpan: 1 },
                  { value: 100000, options: { format: "euro" }, rowSpan: 1 },
                ],
              },
              {
                cells: [
                  { value: "Projekt 2", rowSpan: 1 },
                  { value: "P2", rowSpan: 1 },
                  { value: "Förderer B", rowSpan: 1 },
                  { value: 2024, rowSpan: 1 },
                  { value: 200000, options: { format: "euro" }, rowSpan: 1 },
                ],
              },
              {
                cells: [
                  { value: "Projekt 3", rowSpan: 1 },
                  { value: "P3", rowSpan: 1 },
                  { value: "Förderer C", rowSpan: 1 },
                  { value: 2025, rowSpan: 1 },
                  { value: 150000, options: { format: "euro" }, rowSpan: 1 },
                ],
              },
            ],
            hasSumRow: false,
          },
        }),
      });
    }
  );
  await page.route(
    "http://localhost:3000/api/applicationSetting/",
    async (route) => {
      await route.fulfill({
        body: JSON.stringify([
          {
            id: "123",
            researchFocusId: "abc",
            timespans: [
              { begin: new Date("2023-01-01"), end: new Date("2024-12-31") },
            ],
          },
        ]),
      });
    }
  );
  await page.goto("http://localhost:4200/reports/evalReport");
  // Select Drittmittelprojekte report by clicking accordion
  await page.getByRole("button", { name: "Projekte und Drittmittel" }).click();
  await page.getByText("Übersicht Drittmittelprojekte").click();
  await page
    .locator("div")
    .filter({ hasText: /^Übersicht Drittmittelprojekte$/ })
    .getByRole("button")
    .click();

  // Set dates - this part is likely incorrect and needs adjustment based on your actual component structure.  See comments below.
  await page.locator("#datepicker").nth(0).fill("01.01.2023");
  await page.locator("#datepicker").nth(1).fill("31.12.2023");

  const getReportsButton = page.getByText("Abfragen starten");
  await getReportsButton.click();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByText("Projekt 1")).toBeVisible();
  await expect(page.getByText("Projekt 2")).toBeVisible();
  await expect(page.getByText("Projekt 3")).toBeVisible();
});

test("Gleichstellung report displays correctly", async ({ page }) => {
  await page.route(
    "http://localhost:3000/api/applicationSetting/",
    async (route) => {
      await route.fulfill({
        body: JSON.stringify([
          {
            id: "123",
            researchFocusId: "abc",
            timespans: [
              { begin: new Date("2023-01-01"), end: new Date("2024-12-31") },
            ],
          },
        ]),
      });
    }
  );
  await page.route(
    "http://localhost:3000/api/evalReport/gender",
    async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          reportName: "Gleichstellung",
          reportFileName: "Gleichstellung",
          reportHeading: "Gleichstellung",
          reportTable: {
            header: {
              cells: [
                { value: "Bereich" },
                { value: "Gesamt" },
                { value: "männlich" },
                { value: "weiblich" },
                { value: "divers" },
                { value: "Quote (m|w|d)" },
              ],
            },
            entries: [
              {
                cells: [
                  { value: "Bereich 1", rowSpan: 1 },
                  { value: 100, rowSpan: 1 },
                  { value: 60, rowSpan: 1 },
                  { value: 40, rowSpan: 1 },
                  { value: 0, rowSpan: 1 },
                  { value: "60|40|0", rowSpan: 1 },
                ],
              },
              {
                cells: [
                  { value: "Bereich 2", rowSpan: 1 },
                  { value: 50, rowSpan: 1 },
                  { value: 25, rowSpan: 1 },
                  { value: 25, rowSpan: 1 },
                  { value: 0, rowSpan: 1 },
                  { value: "50|50|0", rowSpan: 1 },
                ],
              },
              {
                cells: [
                  { value: "Bereich 3", rowSpan: 1 },
                  { value: 75, rowSpan: 1 },
                  { value: 30, rowSpan: 1 },
                  { value: 45, rowSpan: 1 },
                  { value: 0, rowSpan: 1 },
                  { value: "40|60|0", rowSpan: 1 },
                ],
              },
            ],
            hasSumRow: false,
          },
        }),
      });
    }
  );
  await page.goto("http://localhost:4200/reports/evalReport");
  await page.getByRole("button", { name: "Personalmanagement" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^Gleichstellung$/ })
    .getByRole("button")
    .click();
  const getReportsButton = page.getByText("Abfragen starten");
  await getReportsButton.click();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByText("Bereich 1")).toBeVisible();
  await expect(page.getByText("Bereich 2")).toBeVisible();
  await expect(page.getByText("Bereich 3")).toBeVisible();
});

test("Selecting and Downloading Drittmittelprojekte report", async ({
  page,
}) => {
  await page.route(
    "http://localhost:3000/api/applicationSetting/",
    async (route) => {
      await route.fulfill({
        body: JSON.stringify([
          {
            id: "123",
            researchFocusId: "abc",
            timespans: [
              { begin: new Date("2023-01-01"), end: new Date("2024-12-31") },
            ],
          },
        ]),
      });
    }
  );
  await page.route(
    "http://localhost:3000/api/evalReport/thirdParty*",
    async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          reportName: "Ü_E_Drittmittelprojekte",
          reportFileName: "Ü_E_Drittmittelprojekte",
          reportHeading: "Übersicht Drittmittelprojekte",
          reportTable: {
            header: {
              cells: [
                { value: "Projektname" },
                { value: "Akronym" },
                { value: "Fördergeber" },
                { value: "Laufzeit [nur Jahre]" },
                { value: "Fördersumme" },
              ],
            },
            entries: [
              {
                cells: [
                  { value: "Projekt 1", rowSpan: 1 },
                  { value: "P1", rowSpan: 1 },
                  { value: "Förderer A", rowSpan: 1 },
                  { value: 2023, rowSpan: 1 },
                  { value: 100000, options: { format: "euro" }, rowSpan: 1 },
                ],
              },
              {
                cells: [
                  { value: "Projekt 2", rowSpan: 1 },
                  { value: "P2", rowSpan: 1 },
                  { value: "Förderer B", rowSpan: 1 },
                  { value: 2024, rowSpan: 1 },
                  { value: 200000, options: { format: "euro" }, rowSpan: 1 },
                ],
              },
              {
                cells: [
                  { value: "Projekt 3", rowSpan: 1 },
                  { value: "P3", rowSpan: 1 },
                  { value: "Förderer C", rowSpan: 1 },
                  { value: 2025, rowSpan: 1 },
                  { value: 150000, options: { format: "euro" }, rowSpan: 1 },
                ],
              },
            ],
            hasSumRow: false,
          },
        }),
      });
    }
  );
  await page.route(
    "http://localhost:3000/api/evalReport/thirdParty*/download",
    async (route) => {
      await route.fulfill({ body: "mock excel file" }); // Mock the download response
    }
  );
  await page.goto("http://localhost:4200/reports/evalReport");
  // Select Drittmittelprojekte report by clicking accordion
  await page.getByRole("button", { name: "Projekte und Drittmittel" }).click();
  await page.getByText("Übersicht Drittmittelprojekte").click();
  await page
    .locator("div")
    .filter({ hasText: /^Übersicht Drittmittelprojekte$/ })
    .getByRole("button")
    .click();

  // Set dates -  This selector is highly likely to be incorrect.  It needs updating to match the actual id or other unique attribute of your date picker input field.
  await page.locator("#datepicker").nth(0).fill("01.01.2023");
  await page.locator("#datepicker").nth(1).fill("31.12.2023");

  const getReportsButton = page.getByText("Abfragen starten");
  await getReportsButton.click();
  const downloadButtonSelector = page.getByRole("button", {
    name: "Download Excel",
  });
  await downloadButtonSelector.click();

  // Assertion -  Difficult to directly assert download, alternative assertion could be added depending on application behavior after download
  await expect(page.getByText("Übersicht Drittmittelprojekte")).toBeVisible(); // Asserting report is still visible after download attempt.
  await expect(page.getByText("Projekt 1")).toBeVisible();
  await expect(page.getByText("Projekt 2")).toBeVisible();
  await expect(page.getByText("Projekt 3")).toBeVisible();
});

test("Navigating to Reports and then to Drittmittelprojekte report", async ({
  page,
}) => {
  await page.goto("http://localhost:4200/reports/evalReport");
  // Select Drittmittelprojekte report by clicking accordion
  await page.getByRole("button", { name: "Projekte und Drittmittel" }).click();
  await page.getByText("Übersicht Drittmittelprojekte").click();
  await page
    .locator("div")
    .filter({ hasText: /^Übersicht Drittmittelprojekte$/ })
    .getByRole("button")
    .click();
  await expect(page.getByText("Übersicht Drittmittelprojekte")).toBeVisible();
});

test("Complete workflow: Selecting a report, setting a date range, and viewing results", async ({
  page,
}) => {
  await page.route(
    "http://localhost:3000/api/applicationSetting/",
    async (route) => {
      await route.fulfill({
        body: JSON.stringify([
          {
            id: "123",
            researchFocusId: "abc",
            timespans: [
              { begin: new Date("2023-01-01"), end: new Date("2024-12-31") },
            ],
          },
        ]),
      });
    }
  );
  await page.route(
    "http://localhost:3000/api/evalReport/thirdParty*",
    async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          reportName: "Ü_E_Drittmittelprojekte",
          reportFileName: "Ü_E_Drittmittelprojekte",
          reportHeading: "Übersicht Drittmittelprojekte",
          reportTable: {
            header: {
              cells: [
                { value: "Projektname" },
                { value: "Akronym" },
                { value: "Fördergeber" },
                { value: "Laufzeit [nur Jahre]" },
                { value: "Fördersumme" },
              ],
            },
            entries: [
              {
                cells: [
                  { value: "Projekt 1", rowSpan: 1 },
                  { value: "P1", rowSpan: 1 },
                  { value: "Förderer A", rowSpan: 1 },
                  { value: 2023, rowSpan: 1 },
                  { value: 100000, options: { format: "euro" }, rowSpan: 1 },
                ],
              },
              {
                cells: [
                  { value: "Projekt 2", rowSpan: 1 },
                  { value: "P2", rowSpan: 1 },
                  { value: "Förderer B", rowSpan: 1 },
                  { value: 2024, rowSpan: 1 },
                  { value: 200000, options: { format: "euro" }, rowSpan: 1 },
                ],
              },
              {
                cells: [
                  { value: "Projekt 3", rowSpan: 1 },
                  { value: "P3", rowSpan: 1 },
                  { value: "Förderer C", rowSpan: 1 },
                  { value: 2025, rowSpan: 1 },
                  { value: 150000, options: { format: "euro" }, rowSpan: 1 },
                ],
              },
            ],
            hasSumRow: false,
          },
        }),
      });
    }
  );
  await page.goto("http://localhost:4200/reports/evalReport");
  // Select Drittmittelprojekte report by clicking accordion
  await page.getByRole("button", { name: "Projekte und Drittmittel" }).click();
  await page.getByText("Übersicht Drittmittelprojekte").click();
  await page
    .locator("div")
    .filter({ hasText: /^Übersicht Drittmittelprojekte$/ })
    .getByRole("button")
    .click();

  // Set dates - This selector is highly likely to be incorrect. It needs updating to match the actual id or other unique attribute of your date picker input field.
  await page.locator("#datepicker").nth(0).fill("01.01.2023");
  await page.locator("#datepicker").nth(1).fill("31.12.2023");

  const getReportsButton = page.getByText("Abfragen starten");
  await getReportsButton.click();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByText("Projekt 1")).toBeVisible();
  await expect(page.getByText("Projekt 2")).toBeVisible();
  await expect(page.getByText("Projekt 3")).toBeVisible();
});
