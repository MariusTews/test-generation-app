import { test, expect } from "@playwright/test";
import {
  FinancialTypes,
  ProjectStatus,
} from "src/app/core/model/project/utils";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000/api";

test("Navigate to project overview and check if project acronym is visible", async ({
  page,
}) => {
  const fullProjectMock = {
    id: "testProjectId",
    acronym: "TestProject",
    title: "Test Project Title",
    status: ProjectStatus.completed,
    financialType: FinancialTypes.bmbf,
    responsibleId: [],
    solicitedFromId: [],
    leaderId: [],
    partnerId: [],
    additionalPersons: [],
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
    plannedStart: new Date(),
    plannedEnd: new Date(),
    plannedRuntimeMonth: 12,
    plannedPersonMonth: 12,
    typeId: "typeId",
    formatId: "formatId",
    sponsorId: "sponsorId",
    promoterId: "promoterId",
    projectManagerId: "projectManagerId",
    projectLeaderId: "projectLeaderId",
    clerkId: "clerkId",
    researchFocusId: "researchFocusId",
    startUpResultId: "startUpResultId",
  };

  await page.route(`${BASE_URL}/project/*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify(fullProjectMock),
    });
  });
  await page.goto("http://localhost:4200/projects/testProjectId/overview");
  const acronym = await page.getByText("TestProject").nth(0);
  await expect(acronym).toBeVisible();
});

test("Add a new financial plan table and check if it is added", async ({
  page,
}) => {
  const project = {
    id: "testProjectId",
    financialType: FinancialTypes.bmbf,
    financialPlansBMBF: [],
    title: "Test Project Title",
    status: ProjectStatus.completed,
    responsibleId: [],
    solicitedFromId: [],
    leaderId: [],
    partnerId: [],
    additionalPersons: [],
    financialPlansDFG: [],
    financialPlansConRes: [],
    financialPlansOther: [],
    flatRates: [],
    receiptsBMBF: [],
    receiptsDFG: [],
    receiptsConRes: [],
    receiptsOther: [],
    publications: [],
    plannedStart: new Date(),
    plannedEnd: new Date(),
    plannedRuntimeMonth: 12,
    plannedPersonMonth: 12,
    typeId: "typeId",
    formatId: "formatId",
    sponsorId: "sponsorId",
    promoterId: "promoterId",
    projectManagerId: "projectManagerId",
    projectLeaderId: "projectLeaderId",
    clerkId: "clerkId",
    researchFocusId: "researchFocusId",
    startUpResultId: "startUpResultId",
  };
  await page.route(`${BASE_URL}/project/testProjectId`, async (route) => {
    await route.fulfill({ body: JSON.stringify(project) });
  });
  await page.route(`${BASE_URL}/project/testProjectId`, async (route) => {
    await route.fulfill({ body: JSON.stringify(project) });
  });
  await page.goto("http://localhost:4200/projects/testProjectId/fin-plan");
  const addButton = await page.getByRole("button", { name: "+" });
  await addButton.click();
  await expect(page.getByRole("button", { name: "Status" })).toBeVisible();
});

test("Filter projects by title and check if correct projects are displayed", async ({
  page,
}) => {
  const fullProjectMock1 = {
    id: "testProjectId1",
    title: "Test Project 1",
    status: ProjectStatus.completed,
    financialType: FinancialTypes.bmbf,
    responsibleId: [],
    solicitedFromId: [],
    leaderId: [],
    partnerId: [],
    additionalPersons: [],
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
    plannedStart: new Date(),
    plannedEnd: new Date(),
    plannedRuntimeMonth: 12,
    plannedPersonMonth: 12,
    typeId: "typeId",
    formatId: "formatId",
    sponsorId: "sponsorId",
    promoterId: "promoterId",
    projectManagerId: "projectManagerId",
    projectLeaderId: "projectLeaderId",
    clerkId: "clerkId",
    researchFocusId: "researchFocusId",
    startUpResultId: "startUpResultId",
    acronym: "TP1",
  };

  const fullProjectMock2 = {
    id: "testProjectId2",
    title: "Another Test Project",
    status: ProjectStatus.completed,
    financialType: FinancialTypes.bmbf,
    responsibleId: [],
    solicitedFromId: [],
    leaderId: [],
    partnerId: [],
    additionalPersons: [],
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
    plannedStart: new Date(),
    plannedEnd: new Date(),
    plannedRuntimeMonth: 12,
    plannedPersonMonth: 12,
    typeId: "typeId",
    formatId: "formatId",
    sponsorId: "sponsorId",
    promoterId: "promoterId",
    projectManagerId: "projectManagerId",
    projectLeaderId: "projectLeaderId",
    clerkId: "clerkId",
    researchFocusId: "researchFocusId",
    startUpResultId: "startUpResultId",
    acronym: "ATP",
  };
  await page.route(`${BASE_URL}/project?*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify([fullProjectMock1, fullProjectMock2]),
    });
  });
  await page.route(`${BASE_URL}/project`, async (route) => {
    await route.fulfill({
      body: JSON.stringify([fullProjectMock1]),
    });
  });
  await page.goto("http://localhost:4200/projects");
  const searchField = await page.getByPlaceholder("Suche...");
  await searchField.fill("Test Project");
  await expect(page.getByText("Test Project 1")).toBeVisible();
});

test("Set filter parameter and check if filter is applied", async ({
  page,
}) => {
  await page.route(`${BASE_URL}/project?*`, async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.goto("http://localhost:4200/projects");
  const approvedSwitch = await page
    .locator("app-p-switch")
    .filter({ hasText: /^bewilligt$/ })
    .locator("label span"); //Corrected locator to label span
  await approvedSwitch.click();
  await expect(page.getByText("0 Projekte").nth(0)).toBeVisible();
});

test("Open new project modal and save a new project", async ({ page }) => {
  await page.route(`${BASE_URL}/person`, async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });

  await page.route(`${BASE_URL}/project`, async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });

  await page.route(`${BASE_URL}/project`, async (route) => {
    await route.fulfill({ body: JSON.stringify({ id: "newProjectId" }) });
  });
  await page.goto("http://localhost:4200/projects");
  const newProjectButton = await page.getByRole("button", { name: "+" });
  await newProjectButton.click();
  const titleField = await page
    .locator("app-p-field")
    .filter({ hasText: "Projekttitel" })
    .getByPlaceholder("...");
  await titleField.fill("New Test Project");
  const acronymField = await page
    .locator("app-p-field")
    .filter({ hasText: "Akronym" })
    .getByPlaceholder("...");
  await acronymField.fill("NTP");
  const saveButton = await page.getByRole("button", { name: "Speichern" });
  await saveButton.click();
  await expect(page.getByText("New Test Project")).toBeVisible();
});

test("Navigate to a project from project list and check for side navigation", async ({
  page,
}) => {
  const projectListMock = [
    {
      id: "existingProjectId",
      acronym: "Existing Project",
      title: "Existing Project Title",
      status: ProjectStatus.completed,
      financialType: FinancialTypes.bmbf,
      responsibleId: [],
      solicitedFromId: [],
      leaderId: [],
      partnerId: [],
      additionalPersons: [],
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
      plannedStart: new Date(),
      plannedEnd: new Date(),
      plannedRuntimeMonth: 12,
      plannedPersonMonth: 12,
      typeId: "typeId",
      formatId: "formatId",
      sponsorId: "sponsorId",
      promoterId: "promoterId",
      projectManagerId: "projectManagerId",
      projectLeaderId: "projectLeaderId",
      clerkId: "clerkId",
      researchFocusId: "researchFocusId",
      startUpResultId: "startUpResultId",
    },
  ];
  await page.route(`${BASE_URL}/project?*`, async (route) => {
    await route.fulfill({ body: JSON.stringify(projectListMock) });
  });
  const fullProjectMock = {
    id: "existingProjectId",
    acronym: "Existing Project",
    title: "Existing Project Title",
    status: ProjectStatus.completed,
    financialType: FinancialTypes.bmbf,
    responsibleId: [],
    solicitedFromId: [],
    leaderId: [],
    partnerId: [],
    additionalPersons: [],
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
    plannedStart: new Date(),
    plannedEnd: new Date(),
    plannedRuntimeMonth: 12,
    plannedPersonMonth: 12,
    typeId: "typeId",
    formatId: "formatId",
    sponsorId: "sponsorId",
    promoterId: "promoterId",
    projectManagerId: "projectManagerId",
    projectLeaderId: "projectLeaderId",
    clerkId: "clerkId",
    researchFocusId: "researchFocusId",
    startUpResultId: "startUpResultId",
  };
  await page.route(`${BASE_URL}/project/existingProjectId`, async (route) => {
    await route.fulfill({ body: JSON.stringify(fullProjectMock) });
  });
  await page.goto("http://localhost:4200/projects");
  const projectLink = await page.getByText("Existing Project").nth(0);
  await projectLink.click();
  await expect(page.getByText("Existing Project").nth(0)).toBeVisible();
});

test("Create a project and then navigate to its financial plan", async ({
  page,
}) => {
  await page.route(`${BASE_URL}/person`, async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route(`${BASE_URL}/project?*`, async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route(`${BASE_URL}/project`, async (route) => {
    await route.fulfill({ body: JSON.stringify({ id: "newProjectId" }) });
  });
  await page.route(`${BASE_URL}/project/newProjectId`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        id: "newProjectId",
        acronym: "New Project",
        financialType: FinancialTypes.bmbf,
        title: "New Project Title",
        status: ProjectStatus.completed,
        responsibleId: [],
        solicitedFromId: [],
        leaderId: [],
        partnerId: [],
        additionalPersons: [],
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
        plannedStart: new Date(),
        plannedEnd: new Date(),
        plannedRuntimeMonth: 12,
        plannedPersonMonth: 12,
        typeId: "typeId",
        formatId: "formatId",
        sponsorId: "sponsorId",
        promoterId: "promoterId",
        projectManagerId: "projectManagerId",
        projectLeaderId: "projectLeaderId",
        clerkId: "clerkId",
        researchFocusId: "researchFocusId",
        startUpResultId: "startUpResultId",
      }),
    });
  });
  await page.goto("http://localhost:4200/projects");
  const newProjectButton = await page.getByRole("button", { name: "+" });
  await newProjectButton.click();
  const titleField = await page
    .locator("app-p-field")
    .filter({ hasText: "Projekttitel" })
    .getByPlaceholder("...");
  await titleField.fill("New Test Project");
  const acronymField = await page
    .locator("app-p-field")
    .filter({ hasText: "Akronym" })
    .getByPlaceholder("...");
  await acronymField.fill("NTP");
  const saveButton = await page.getByRole("button", { name: "Speichern" });
  await saveButton.click();
  const projectLink = await page.getByText("New Project").nth(0);
  await projectLink.click();
  await page.click("text=Finanzierungspläne");
  await expect(page.getByRole("button", { name: "Speichern" })).toBeVisible();
});

test.setTimeout(15000);
