import { test, expect } from "@playwright/test";
import {
  FinancialTypes,
  ProjectStatus,
} from "src/app/core/model/project/utils";

test.setTimeout(15000);

test("Navigate to project overview and check visibility", async ({ page }) => {
  const projectResponse = {
    id: "testId",
    acronym: "Test",
    title: "Test Project",
    responsibleNames: [{ firstName: "Test", lastName: "User" }],
    financialType: FinancialTypes.bmbf,
    financialPlansBMBF: [],
    financialPlansDFG: [],
    financialPlansConRes: [],
    financialPlansOther: [],
    flatRates: [],
    receiptsBMBF: [],
    receiptsDFG: [],
    receiptsConRes: [],
    receiptsOther: [],
    publications: [],
  };

  await page.route(
    "http://localhost:3000/api/project/testId",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(projectResponse) });
    }
  );
  await page.route("http://localhost:3000/api/project*", async (route) => {
    await route.fulfill({ body: JSON.stringify([projectResponse]) });
  });
  await page.goto("http://localhost:4200/projects/testId/overview");
  const overviewElement = await page.getByText("Projekttitel: Test Project");
  await expect(overviewElement).toBeVisible();
});

test("Add new financial plan table and check visibility", async ({ page }) => {
  await page.route(
    "http://localhost:3000/api/project/testId",
    async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          id: "testId",
          acronym: "Test",
          title: "Test Project",
          financialType: FinancialTypes.bmbf,
          financialPlansBMBF: [],
          financialPlansDFG: [],
          financialPlansConRes: [],
          financialPlansOther: [],
          flatRates: [],
          receiptsBMBF: [],
          receiptsDFG: [],
          receiptsConRes: [],
          receiptsOther: [],
          publications: [],
          personalCosts: 0,
          materialCosts: 0,
          projectCosts: 0,
          flatRateSum: 0,
          financialPlanSum: 0,
        }),
      });
    }
  );
  await page.route("http://localhost:3000/api/translate", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        "project.routes.routeFinPlan": "Finanzierungspläne",
      }),
    });
  });
  await page.goto("http://localhost:4200/projects/testId/fin-plan");
  const addButton = await page.getByRole("button", {
    name: "+",
  });
  await addButton.click();
  const newTable = await page.locator("app-p-editable-table div").nth(3);
  await expect(newTable).toBeVisible();
});

test("Save financial plan data and check success toast", async ({ page }) => {
  const projectResponse = {
    id: "testId",
    acronym: "Test",
    title: "Test Project",
    financialType: FinancialTypes.bmbf,
    financialPlansBMBF: [{ entries: [], sumColumn: { year: "Gesamt" } }],
    financialPlansDFG: [],
    financialPlansConRes: [],
    financialPlansOther: [],
    flatRates: [],
    receiptsBMBF: [],
    receiptsDFG: [],
    receiptsConRes: [],
    receiptsOther: [],
    publications: [],
    personalCosts: 0,
    materialCosts: 0,
    projectCosts: 0,
    flatRateSum: 0,
    financialPlanSum: 0,
  };

  await page.route(
    "http://localhost:3000/api/project/testId",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(projectResponse) });
    }
  );
  await page.route(
    "http://localhost:3000/api/project/testId*",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(projectResponse) });
    }
  );
  await page.route("http://localhost:3000/api/translate", async (route) => {
    await route.fulfill({ body: JSON.stringify({ "app.save": "Speichern" }) });
  });
  await page.goto("http://localhost:4200/projects/testId/fin-plan");
  const saveButton = await page.locator(".fa-save");
  await saveButton.click();
  const successToast = await page.getByText("Speichern erfolgreich");
  await expect(successToast).toBeVisible();
});

test("Create new project via modal and navigate to base data", async ({
  page,
}) => {
  await page.route("http://localhost:3000/api/person*", async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route("http://localhost:3000/api/project", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        id: "newProjectId",
        acronym: "New",
        title: "New Project",
        status: ProjectStatus.inProgress,
        responsibleNames: [{ firstName: "Test", lastName: "User" }],
        financialType: FinancialTypes.bmbf,
        financialPlansBMBF: [],
        financialPlansDFG: [],
        financialPlansConRes: [],
        financialPlansOther: [],
        flatRates: [],
        receiptsBMBF: [],
        receiptsDFG: [],
        receiptsConRes: [],
        receiptsOther: [],
        publications: [],
      }),
    });
  });
  await page.route("http://localhost:3000/api/project?*", async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          id: "newProjectId",
          acronym: "New",
          title: "New Project",
          status: ProjectStatus.inProgress,
          responsibleNames: [{ firstName: "Test", lastName: "User" }],
          financialType: FinancialTypes.bmbf,
          financialPlansBMBF: [],
          financialPlansDFG: [],
          financialPlansConRes: [],
          financialPlansOther: [],
          flatRates: [],
          receiptsBMBF: [],
          receiptsDFG: [],
          receiptsConRes: [],
          receiptsOther: [],
          publications: [],
        },
      ]),
    });
  });
  await page.route("http://localhost:3000/api/translate", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        "project.newProject": "Neues Projekt",
        "project.projectTitle": "Projekttitel",
        "project.acronym": "Akronym",
        "app.save": "Speichern",
        "app.dismiss": "Abbrechen",
        "project.solicitedFrom": "beantragt von",
      }),
    });
  });
  await page.goto("http://localhost:4200/projects");
  const newProjectButton = await page.getByRole("button", { name: "+" });
  await newProjectButton.click();
  const saveButton = await page.getByText("Speichern");
  await page
    .locator("app-p-field")
    .filter({ hasText: "Projekttitel" })
    .getByPlaceholder("...")
    .fill("New Project");
  await page
    .locator("app-p-field")
    .filter({ hasText: "Akronym" })
    .getByPlaceholder("...")
    .fill("New");
  await saveButton.click();
  const baseDataElement = await page.getByText("Stammdaten");
  await expect(baseDataElement).toBeVisible();
});

test("Filter projects by status and check results", async ({ page }) => {
  await page.route("http://localhost:3000/api/project?*", async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          id: "1",
          title: "Project A",
          status: ProjectStatus.inProgress,
          acronym: "A",
          responsibleNames: [{ firstName: "", lastName: "" }],
          financialType: FinancialTypes.bmbf,
          financialPlansBMBF: [],
          financialPlansDFG: [],
          financialPlansConRes: [],
          financialPlansOther: [],
          flatRates: [],
          receiptsBMBF: [],
          receiptsDFG: [],
          receiptsConRes: [],
          receiptsOther: [],
          publications: [],
        },
        {
          id: "2",
          title: "Project B",
          status: ProjectStatus.completed,
          acronym: "B",
          responsibleNames: [{ firstName: "", lastName: "" }],
          financialType: FinancialTypes.bmbf,
          financialPlansBMBF: [],
          financialPlansDFG: [],
          financialPlansConRes: [],
          financialPlansOther: [],
          flatRates: [],
          receiptsBMBF: [],
          receiptsDFG: [],
          receiptsConRes: [],
          receiptsOther: [],
          publications: [],
        },
        {
          id: "3",
          title: "Project C",
          status: ProjectStatus.inProgress,
          acronym: "C",
          responsibleNames: [{ firstName: "", lastName: "" }],
          financialType: FinancialTypes.bmbf,
          financialPlansBMBF: [],
          financialPlansDFG: [],
          financialPlansConRes: [],
          financialPlansOther: [],
          flatRates: [],
          receiptsBMBF: [],
          receiptsDFG: [],
          receiptsConRes: [],
          receiptsOther: [],
          publications: [],
        },
      ]),
    });
  });
  await page.route(
    "http://localhost:3000/api/project?projectStatus=inProgress",
    async (route) => {
      await route.fulfill({
        body: JSON.stringify([
          {
            id: "1",
            title: "Project A",
            status: ProjectStatus.inProgress,
            acronym: "A",
            responsibleNames: [{ firstName: "", lastName: "" }],
            financialType: FinancialTypes.bmbf,
            financialPlansBMBF: [],
            financialPlansDFG: [],
            financialPlansConRes: [],
            financialPlansOther: [],
            flatRates: [],
            receiptsBMBF: [],
            receiptsDFG: [],
            receiptsConRes: [],
            receiptsOther: [],
            publications: [],
          },
          {
            id: "3",
            title: "Project C",
            status: ProjectStatus.inProgress,
            acronym: "C",
            responsibleNames: [{ firstName: "", lastName: "" }],
            financialType: FinancialTypes.bmbf,
            financialPlansBMBF: [],
            financialPlansDFG: [],
            financialPlansConRes: [],
            financialPlansOther: [],
            flatRates: [],
            receiptsBMBF: [],
            receiptsDFG: [],
            receiptsConRes: [],
            receiptsOther: [],
            publications: [],
          },
        ]),
      });
    }
  );
  await page.route("http://localhost:3000/api/translate", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        "app.search": "Suche",
        "project.approved": "bewilligt",
        "project.notApproved": "nicht bewilligt",
        "project.planned": "geplant",
        "project.inProgress": "laufend",
        "project.completed": "beendet",
        "project.finished": "abgeschlossen",
        "settings.routes.project": "Projekt",
        "app.projects": "Projekte",
      }),
    });
  });
  await page.goto("http://localhost:4200/projects");
  const inProgressSwitch = await page
    .locator("app-p-switch")
    .filter({ hasText: "laufend" })
    .locator("label span");
  await inProgressSwitch.click();
  await page.waitForTimeout(500); //Allow time for filter to apply
  await expect(page.locator(`text=Project A`)).toBeVisible();
  await expect(page.locator(`text=Project C`)).toBeVisible();
  await expect(page.locator(`text=Project B`)).not.toBeVisible();
});
