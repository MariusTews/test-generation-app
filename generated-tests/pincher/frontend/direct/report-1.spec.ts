import { test, expect } from "@playwright/test";
import { Triplet } from "src/app/core/model/utils/triplet";
import { Report } from "src/app/core/model/report";
import { ReportType } from "src/app/core/model/report";
import { UniversalReportData } from "src/app/core/model/report/universal-report-data";

const url = "http://localhost:3000/api";

test("Drittmittelprojekte Report", async ({ page }) => {
  await page.route(`${url}/evalReport/thirdParty*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        reportName: "Ü_E_Drittmittelprojekte",
        reportFileName: "Ü_E_Drittmittelprojekte",
        reportHeading: "Übersicht Drittmittelprojekte",
        reportTable: {
          header: {
            cells: [
              { value: "Projektname", rowSpan: 1 },
              { value: "Akronym", rowSpan: 1 },
              { value: "Fördergeber", rowSpan: 1 },
              { value: "Laufzeit [nur Jahre]", rowSpan: 1 },
              { value: "Fördersumme", rowSpan: 1, options: { format: "euro" } },
            ],
          },
          entries: [
            {
              cells: [
                { value: "Projekt A", rowSpan: 1 },
                { value: "PA", rowSpan: 1 },
                { value: "Förderer X", rowSpan: 1 },
                { value: 2, rowSpan: 1 },
                { value: 100000, rowSpan: 1, options: { format: "euro" } },
              ],
            },
            {
              cells: [
                { value: "Projekt B", rowSpan: 1 },
                { value: "PB", rowSpan: 1 },
                { value: "Förderer Y", rowSpan: 1 },
                { value: 3, rowSpan: 1 },
                { value: 200000, rowSpan: 1, options: { format: "euro" } },
              ],
            },
          ],
          hasSumRow: false,
        },
      }),
    });
  });
  await page.route(`${url}/applicationSetting/`, async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          id: "123",
          researchFocusId: "456",
          timespans: [
            { begin: new Date("2022-01-01"), end: new Date("2023-12-31") },
          ],
        },
      ]),
    });
  });
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
  const getReportsButton = page.getByRole("button", {
    name: "Abfragen starten",
  });
  await getReportsButton.click();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByText("Projekt A")).toBeVisible();
  await expect(page.getByText("Projekt B")).toBeVisible();
});

test("Gleichstellung Report", async ({ page }) => {
  await page.route(`${url}/evalReport/gender`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
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
                { value: "Bereich A", rowSpan: 1 },
                { value: 100, rowSpan: 1 },
                { value: 60, rowSpan: 1 },
                { value: 30, rowSpan: 1 },
                { value: 10, rowSpan: 1 },
                { value: "60|30|10", rowSpan: 1 },
              ],
            },
            {
              cells: [
                { value: "Bereich B", rowSpan: 1 },
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
      }),
    });
  });
  await page.route(`${url}/applicationSetting/`, async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          id: "123",
          researchFocusId: "456",
          timespans: [
            { begin: new Date("2022-01-01"), end: new Date("2023-12-31") },
          ],
        },
      ]),
    });
  });
  await page.goto("http://localhost:4200/reports/evalReport");
  // Select Gleichstellungreport by clicking accordion
  await page.getByRole("button", { name: "Personalmanagement" }).click();
  await page.getByText("Gleichstellung").click();
  await page
    .locator("div")
    .filter({ hasText: /^Gleichstellung$/ })
    .getByRole("button")
    .click();
  const getReportsButton = page.getByRole("button", {
    name: "Abfragen starten",
  });
  await getReportsButton.click();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByText("Bereich A")).toBeVisible();
  await expect(page.getByText("Bereich B")).toBeVisible();
});

test("Download Drittmittelprojekte Report", async ({ page }) => {
  await page.route(`${url}/evalReport/thirdParty*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        reportName: "Ü_E_Drittmittelprojekte",
        reportFileName: "Ü_E_Drittmittelprojekte",
        reportHeading: "Übersicht Drittmittelprojekte",
        reportTable: {
          header: { cells: [] },
          entries: [
            {
              cells: [
                { value: "Projekt A", rowSpan: 1 },
                { value: "PA", rowSpan: 1 },
                { value: "Förderer X", rowSpan: 1 },
                { value: 2, rowSpan: 1 },
                { value: 100000, rowSpan: 1, options: { format: "euro" } },
              ],
            },
            {
              cells: [
                { value: "Projekt B", rowSpan: 1 },
                { value: "PB", rowSpan: 1 },
                { value: "Förderer Y", rowSpan: 1 },
                { value: 3, rowSpan: 1 },
                { value: 200000, rowSpan: 1, options: { format: "euro" } },
              ],
            },
          ],
          hasSumRow: false,
        },
      }),
    });
  });
  await page.route(`${url}/evalReport/thirdParty/download*`, async (route) => {
    await route.fulfill({
      body: "mock excel file",
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  });
  await page.route(`${url}/applicationSetting/`, async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          id: "123",
          researchFocusId: "456",
          timespans: [
            { begin: new Date("2022-01-01"), end: new Date("2023-12-31") },
          ],
        },
      ]),
    });
  });
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
  const getReportsButton = page.getByRole("button", {
    name: "Abfragen starten",
  });
  await getReportsButton.click();
  const downloadButton = page
    .getByRole("button", { name: "Download Excel" })
    .first();
  await downloadButton.click();
});

test("Select Timespan and Generate Gleichstellung Report", async ({ page }) => {
  const mockTimespanPairs: Triplet[] = [{ id: "0", long: "2022 - 2023" }];
  const applicationSettingResponse = {
    id: "123",
    researchFocusId: "456",
    timespans: [{ begin: new Date("2022-01-01"), end: new Date("2023-12-31") }],
  };
  await page.route(`${url}/evalReport/gender*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        reportName: "Gleichstellung",
        reportFileName: "Gleichstellung",
        reportHeading: "Gleichstellung",
        reportTable: {
          header: { cells: [] },
          entries: [
            {
              cells: [
                { value: "Bereich A", rowSpan: 1 },
                { value: 100, rowSpan: 1 },
                { value: 60, rowSpan: 1 },
                { value: 30, rowSpan: 1 },
                { value: 10, rowSpan: 1 },
                { value: "60|30|10", rowSpan: 1 },
              ],
            },
            {
              cells: [
                { value: "Bereich B", rowSpan: 1 },
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
      }),
    });
  });
  await page.route(`${url}/applicationSetting/`, async (route) => {
    await route.fulfill({ body: JSON.stringify([applicationSettingResponse]) });
  });
  await page.goto("http://localhost:4200/reports/evalReport");

  const timespanDropdown = page.getByPlaceholder("...");
  await timespanDropdown.click();
  const timespanOption = page.getByText("2022");
  await timespanOption.click();
  // Select Gleichstellungreport by clicking accordion
  await page.getByRole("button", { name: "Personalmanagement" }).click();
  await page.getByText("Gleichstellung").click();
  await page
    .locator("div")
    .filter({ hasText: /^Gleichstellung$/ })
    .getByRole("button")
    .click();
  const getReportsButton = page.getByRole("button", {
    name: "Abfragen starten",
  });
  await getReportsButton.click();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByText("Bereich A")).toBeVisible();
  await expect(page.getByText("Bereich B")).toBeVisible();
});
