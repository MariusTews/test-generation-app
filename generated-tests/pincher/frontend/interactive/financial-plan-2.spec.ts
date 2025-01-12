import { test, expect } from "@playwright/test";
import { FinancialTypes } from "src/app/core/model/project/utils";
test.setTimeout(15000);

let projectResponse: any;

test.beforeEach(async () => {
  projectResponse = {
    id: "123",
    status: "inProgress",
    applicationStatus: "accepted",
    authorization: "granted",
    promotionalClassification: "publiclyFunded",
    financialType: FinancialTypes.bmbf,
    thirdPartyProjectId: null,
    startUpFinancing: false,
    smallProject: false,
    title: "Project Title",
    subtitle: "Project Subtitle",
    titleEnglish: "Project Title English",
    subtitleEnglish: "Project Subtitle English",
    acronym: "PT",
    fundingIndicator: "123456",
    sketchApplication: "2023-10-26T10:00:00.000Z",
    proposalApplication: "2023-11-26T10:00:00.000Z",
    demandApplication: null,
    authorizationDate: "2024-01-26T10:00:00.000Z",
    neutralExtensionApplication: null,
    sketchExists: true,
    demandExists: false,
    neutralExtensionExists: false,
    mandate: 12345,
    incherURL: "https://www.example.com",
    fundingLine: "Funding Line",
    baseComment: "Base Comment",
    typeId: "type1",
    formatId: "format1",
    sponsorId: "sponsor1",
    promoterId: "promoter1",
    projectManagerId: "manager1",
    projectLeaderId: ["leader1"],
    clerkId: "clerk1",
    researchFocusId: "focus1",
    startUpResultId: null,
    responsibleId: ["leader1"],
    responsibleNames: [{ firstName: "Leader", lastName: "One" }],
    solicitedFromId: ["solicitor1"],
    leaderId: [],
    partnerId: [],
    additionalPersons: [],
    participantComment: "Participant Comment",
    plannedStart: "2024-02-26T10:00:00.000Z",
    plannedEnd: "2026-02-26T10:00:00.000Z",
    plannedRuntimeMonth: 24,
    plannedPersonMonth: 120,
    actualStart: "2024-03-26T10:00:00.000Z",
    actualRuntimeMonth: 23,
    actualPersonMonth: 115,
    missingRuntimeMonth: 1,
    missingPersonMonth: 5,
    neutralExtension: false,
    extensionStart: null,
    extensionEnd: null,
    extensionRuntimeMonth: 0,
    extensionPersonMonth: 0,
    plannedFte: 5,
    actualFte: 4.79,
    missingFte: 0.21,
    extensionFte: 0,
    calculatedProjectEnd: "2026-02-26T10:00:00.000Z",
    runtimeComment: "Runtime Comment",
    financialPlansBMBF: [
      {
        date: "2024-03-15T10:00:00.000Z",
        comment: "",
        entries: [],
        sumColumn: {},
      },
    ],
    financialPlansDFG: [],
    financialPlansConRes: [],
    financialPlansOther: [],
    flatRates: [],
    personalCosts: 100000,
    materialCosts: 50000,
    projectCosts: 20000,
    flatRateSum: 10000,
    financialPlanSum: 180000,
    flatRateINCHER: 6000,
    flatRateManagement: 4000,
    receiptsBMBF: [],
    receiptsDFG: [],
    receiptsConRes: [],
    receiptsOther: [],
    shortDescriptionINCHER: "Short Description INCHER",
    shortDescriptionThFu: "Short Description ThFu",
    tags: "Tags",
    longDescription: "Long Description",
    longDescriptionEnglish: "Long Description English",
    website: "Website",
    websiteEnglish: "Website English",
    publications: [],
  };
});

test("Critical Path: Financial Plan", async ({ page }) => {
  await page.route("http://localhost:3000/api/project/123", async (route) => {
    await route.fulfill({ body: JSON.stringify(projectResponse) });
  });
  await page.goto("http://localhost:4200/projects/123/fin-plan");

  await expect(page.getByText("Übersicht")).toBeVisible();
  await expect(page.getByText("100.000,00 €")).toBeVisible();
  await expect(page.getByText("50.000,00 €")).toBeVisible();
  await expect(page.getByText("20.000,00 €")).toBeVisible();
  await expect(page.getByText("10.000,00 €")).toBeVisible();
  await expect(page.getByText("180.000,00 €")).toBeVisible();
});

test("Projects: List and Filter", async ({ page }) => {
  const projectsResponse = [
    { ...projectResponse, title: "Sample Project 1", acronym: "SP1" },
    { ...projectResponse, title: "Another Sample Project", acronym: "ASP" },
  ];
  await page.route("http://localhost:3000/api/project?*", async (route) => {
    await route.fulfill({ body: JSON.stringify(projectsResponse) });
  });
  await page.goto("http://localhost:4200/projects");

  await expect(page.locator("tbody tr")).toHaveCount(2);

  projectsResponse.pop();
  await page.getByPlaceholder("Suche...").fill("Sample Project 1");

  await expect(page.locator("tbody tr")).toHaveCount(1);
});

test("Add Financial Plan", async ({ page }) => {
  await page.route("http://localhost:3000/api/project/123", async (route) => {
    await route.fulfill({ body: JSON.stringify(projectResponse) });
  });
  await page.goto("http://localhost:4200/projects/123/fin-plan");

  await page.locator(".fa-pencil-alt").click();
  // Select Finanzplan status and date (this part will require specific locators based on your dropdown and datepicker implementation)
  await page.getByRole("textbox", { name: "Finanzierungsplan aus:" }).click();
  await page.getByText("Antrag").click();

  await page.getByLabel("Datum").click();
  //await page.getByRole('button', { name: 'Select date' }).click(); // You might need to adjust this locator depending on your datepicker library
  await page
    .locator("app-p-editable-table")
    .getByRole("button", { name: "+" })
    .click();
  await page
    .getByRole("row", { name: "812 0 €" })
    .getByPlaceholder("...")
    .fill("26");

  await page.getByLabel("Bemerkung").fill("Test Bemerkung");

  await page.locator(".fa-save").click();
  await expect(page.getByText("Speichern erfolgreich")).toBeVisible();

  await page
    .locator("app-p-editable-table")
    .getByRole("button", { name: "+" })
    .click();
  await page.locator(".fa-pencil-alt").click();
  await page.getByRole("button", { name: "-" }).click();
  await page.locator(".fa-trash").click();
  await expect(page.getByText("Speichern erfolgreich")).toBeVisible();
});
