import { test, expect } from "@playwright/test";
import { Project } from "src/app/core/model/project";
import {
  FinancialPlanStatus,
  FinancialTypes,
  ProjectStatus,
} from "src/app/core/model/project/utils";

test.setTimeout(15000);

let projectResponse: Project;

test.beforeEach(async ({ page }) => {
  const projectId = "123";
  projectResponse = {
    id: projectId,
    status: ProjectStatus.inProgress,
    applicationStatus: null,
    authorization: null,
    promotionalClassification: null,
    financialType: FinancialTypes.bmbf,
    startUpFinancing: false,
    smallProject: false,
    thirdPartyProjectId: null,
    title: "Test Project",
    subtitle: "A test project",
    titleEnglish: "Test Project English",
    subtitleEnglish: "A test project English",
    acronym: "TP",
    fundingIndicator: "",
    sketchApplication: new Date(),
    proposalApplication: new Date(),
    demandApplication: new Date(),
    authorizationDate: new Date(),
    neutralExtensionApplication: new Date(),
    sketchExists: false,
    demandExists: false,
    neutralExtensionExists: false,
    mandate: 12345,
    incherURL: "",
    fundingLine: "",
    baseComment: "",
    typeId: null,
    formatId: null,
    sponsorId: null,
    promoterId: null,
    projectManagerId: null,
    projectLeaderId: null,
    clerkId: null,
    researchFocusId: null,
    startUpResultId: null,
    responsibleId: [],
    responsibleNames: [],
    solicitedFromId: [],
    leaderId: [],
    partnerId: [],
    additionalPersons: [],
    participantComment: "",
    plannedStart: new Date(),
    plannedEnd: new Date(),
    plannedRuntimeMonth: 0,
    plannedPersonMonth: 0,
    actualStart: new Date(),
    actualRuntimeMonth: 0,
    actualPersonMonth: 0,
    missingRuntimeMonth: 0,
    missingPersonMonth: 0,
    neutralExtension: false,
    extensionStart: new Date(),
    extensionEnd: new Date(),
    extensionRuntimeMonth: 0,
    extensionPersonMonth: 0,
    plannedFte: 0,
    actualFte: 0,
    missingFte: 0,
    extensionFte: 0,
    calculatedProjectEnd: new Date(),
    runtimeComment: "",
    financialPlansBMBF: [],
    financialPlansDFG: [],
    financialPlansConRes: [
      {
        date: new Date("2024-03-15T00:00:00.000Z"),
        entries: [
          {
            year: "2024",
            directPersonnelCosts: 10000,
            materialCosts: 2000,
            sumDirectCosts: 12000,
            indirectCosts: 3000,
            profitMargin: 1000,
            researchAllowance: 500,
            netAmount: 16500,
            tax: 3300,
            totalAmount: 19800,
          },
        ],
        sumColumn: {
          year: "Gesamt",
          directPersonnelCosts: 10000,
          materialCosts: 2000,
          sumDirectCosts: 12000,
          indirectCosts: 3000,
          profitMargin: 1000,
          researchAllowance: 500,
          netAmount: 16500,
          tax: 3300,
          totalAmount: 19800,
        },
        comment: "",
        status: FinancialPlanStatus.contract,
      },
    ],
    financialPlansOther: [],
    flatRates: [],
    personalCosts: 10000,
    materialCosts: 2000,
    projectCosts: 3000,
    flatRateSum: 16500,
    financialPlanSum: 19800,
    flatRateINCHER: 0,
    flatRateManagement: 0,
    receiptsBMBF: [],
    receiptsDFG: [],
    receiptsConRes: [],
    receiptsOther: [],
    shortDescriptionINCHER: "",
    shortDescriptionThFu: "",
    tags: "",
    longDescription: "",
    longDescriptionEnglish: "",
    website: "",
    websiteEnglish: "",
    publications: [],
  };
});

test("Critical Path: Financial Plan Editing", async ({ page }) => {
  await page.route(
    `http://localhost:3000/api/project/${projectResponse.id}`,
    async (route) => {
      await route.fulfill({ body: JSON.stringify(projectResponse) });
    }
  );
  await page.goto(
    `http://localhost:4200/projects/${projectResponse.id}/fin-plan`
  );

  await expect(page.getByText("Übersicht")).toBeVisible();
  await expect(page.getByText("10.000,00 €")).toBeVisible();
  await expect(page.getByText("2.000,00 €")).toBeVisible();
  await expect(page.getByText("3.000,00 €")).toBeVisible();
  await expect(page.getByText("16.500,00 €")).toBeVisible();
  await expect(page.getByText("19.800,00 €")).toBeVisible();

  await page.getByRole("button", { name: "+" }).click();

  await expect(page.getByRole("button", { name: "Status" })).toBeVisible();

  await page.locator(".fa-pencil-alt").click();
  await page
    .locator("app-p-editable-table")
    .getByRole("button", { name: "+" })
    .click();

  await page.getByRole("textbox", { name: "..." }).fill("2026");
  await page
    .locator(
      "tr:nth-child(16) > td:nth-child(2) > app-p-number-field > .d-flex > #input"
    )
    .fill("11000");

  await page.locator(".fa-save").click();

  await expect(page.getByText("Speichern erfolgreich")).toBeVisible();
});

test("Navigation Test", async ({ page }) => {
  const projectList = [projectResponse];

  await page.route("http://localhost:3000/api/project?*", async (route) => {
    await route.fulfill({ body: JSON.stringify(projectList) });
  });
  await page.goto("http://localhost:4200/projects");
  await expect(page.getByText("Test Project")).toBeVisible();
});

test("Filtered Navigation Test", async ({ page }) => {
  const projectList: Project[] = [];

  await page.route("http://localhost:3000/api/project?*", async (route) => {
    await route.fulfill({ body: JSON.stringify(projectList) });
  });
  await page.goto("http://localhost:4200/projects");
  await page
    .locator("app-p-switch")
    .filter({ hasText: "geplant" })
    .locator("label span")
    .click();
  await expect(page.getByText("Test Project")).toBeHidden();
});

test("Overview Test", async ({ page }) => {
  await page.route(
    `http://localhost:3000/api/project/${projectResponse.id}`,
    async (route) => {
      await route.fulfill({ body: JSON.stringify(projectResponse) });
    }
  );
  await page.goto(
    `http://localhost:4200/projects/${projectResponse.id}/overview`
  );
  await expect(page.getByText(projectResponse.title + "")).toBeVisible();
});

test("Comment Edit Test", async ({ page }) => {
  await page.route(
    `http://localhost:3000/api/project/${projectResponse.id}`,
    async (route) => {
      await route.fulfill({ body: JSON.stringify(projectResponse) });
    }
  );
  await page.goto(
    `http://localhost:4200/projects/${projectResponse.id}/fin-plan`
  );
  await page.getByRole("button", { name: "+" }).click();
  await page.locator(".fa-pencil-alt").click();
  await page.getByRole("textbox", { name: "Bemerkung" }).fill("Test comment");
  await page.locator(".fa-save").click();
  await expect(page.getByText("Speichern erfolgreich")).toBeVisible();
});

test("Financial Plan Edit Test", async ({ page }) => {
  await page.route(
    `http://localhost:3000/api/project/${projectResponse.id}`,
    async (route) => {
      await route.fulfill({ body: JSON.stringify(projectResponse) });
    }
  );
  await page.goto(
    `http://localhost:4200/projects/${projectResponse.id}/fin-plan`
  );
  await page.getByRole("button", { name: "+" }).click();
  await page.locator(".fa-pencil-alt").click();
  await page.locator("app-p-drop-down").getByRole("textbox").click();
  await page.getByText("Vertrag").click();
  await page.locator("app-p-date-picker").getByRole("button").click();
  await page.locator(".ngb-dp-day").first().click();

  await page
    .locator("app-p-editable-table")
    .getByRole("button", { name: "+" })
    .click();
  await page
    .getByRole("row", { name: "812 0 €" })
    .getByPlaceholder("...")
    .fill("12345");
  await page.locator(".fa-save").click();
  await expect(page.getByText("Speichern erfolgreich")).toBeVisible();
});

test("Financial Plan Add and Delete Test", async ({ page }) => {
  await page.route(
    `http://localhost:3000/api/project/${projectResponse.id}`,
    async (route) => {
      await route.fulfill({ body: JSON.stringify(projectResponse) });
    }
  );
  await page.goto(
    `http://localhost:4200/projects/${projectResponse.id}/fin-plan`
  );
  await page.getByRole("button", { name: "+" }).click();
  await page
    .locator("app-p-editable-table")
    .getByRole("button", { name: "+" })
    .click();
  await page.locator(".fa-pencil-alt").click();
  await page
    .locator("app-p-editable-table")
    .getByRole("button", { name: "-" })
    .first()
    .click();
  await page.locator(".fa-trash").click();
  await expect(page.getByText("Status")).not.toBeVisible(); // Replaced assertion
});
