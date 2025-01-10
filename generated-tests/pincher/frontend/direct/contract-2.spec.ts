import { test, expect, chromium } from "@playwright/test";
import { ContractTypes } from "src/app/core/model/contract";

test.setTimeout(15000);
test.use({
  browserName: "chromium",
  headless: true,
});

const person = {
  id: "123",
  firstName: "Test",
  lastName: "Person",
  gender: "male",
  member: true,
  extern: false,
  current: true,
  former: false,
  instituteId: "456",
  subInstituteId: "789",
  sciTimeVGs: [],
  retirement: null,
  timeUsedUp: false,
  teamIds: [],
  workdays: [],
  qualification: [],
  thesis: null,
  habilitation: null,
  professorship: null,
  loanIT: false,
  device: null,
  inventoryNumber: null,
  loanEnd: null,
  emailExtension: false,
  emailExtensionEnd: null,
  newsletter: false,
  calculatedVteSum: 0,
  calculatedEmploymentEnd: null,
  comment: null,
};

const contract = {
  id: "456",
  personId: "123",
  type: ContractTypes.ats,
  start: new Date(),
  end: new Date(),
  vte: 100,
  calculatedVte: 100,
  limited: false,
  projectId: null,
  projectObjectOnlyAcronym: null,
  description: null,
  comment: null,
  calculatedEnd: null,
  supervisorIds: [],
  fundingType: null,
  applicationDate: null,
  salaryScale: null,
  costCenter: null,
  primaryTypeId: null,
  secondaryTypeId: null,
  researchFocusId: null,
};

const addOn = {
  id: "654654655",
  type: "Duration",
  subType: "extension",
  contractId: "456",
  start: new Date(),
  end: new Date(),
  applicationDate: new Date(),
  vte: 0,
  overtimeHours: 0,
  durationReasonId: null,
  substituteReason: null,
  substitutePersonId: null,
  substituteContractId: null,
  substituteAddOn: null,
};

test("Add a new Amount add-on", async ({ page }) => {
  const addOnAmount = {
    id: "654654654",
    type: "Amount",
    subType: "increase",
    contractId: "456",
    start: new Date(),
    end: new Date(),
    applicationDate: new Date(),
    vte: 10,
    overtimeHours: 0,
    durationReasonId: null,
    substituteReason: null,
    substitutePersonId: null,
    substituteContractId: null,
    substituteAddOn: null,
  };
  await page.route("http://localhost:3000/api/addOn*", async (route) => {
    await route.fulfill({ body: JSON.stringify([addOnAmount]) });
  });
  await page.route(
    "http://localhost:3000/api/tag?type=continuedEmploymentReason",
    async (route) => {
      await route.fulfill({ body: JSON.stringify([]) });
    }
  );
  await page.route(
    "http://localhost:3000/api/tag?type=continuedEmploymentReason&deleted=true",
    async (route) => {
      await route.fulfill({ body: JSON.stringify([]) });
    }
  );
  await page.route("http://localhost:3000/api/person/123", async (route) => {
    await route.fulfill({ body: JSON.stringify(person) });
  });
  await page.route("http://localhost:3000/api/contract/456", async (route) => {
    await route.fulfill({ body: JSON.stringify(contract) });
  });
  await page.goto("http://localhost:4200/persons/123/contract/456");
  const addAmountButton = await page.getByRole("button", {
    name: "Aufstockung",
  });
  await addAmountButton.click();
  await expect(page.getByText("Aufstockung")).toBeVisible();
});

test("Add a new Duration add-on", async ({ page }) => {
  await page.route("http://localhost:3000/api/addOn*", async (route) => {
    await route.fulfill({ body: JSON.stringify([addOn]) });
  });
  await page.route(
    "http://localhost:3000/api/tag?type=continuedEmploymentReason",
    async (route) => {
      await route.fulfill({ body: JSON.stringify([]) });
    }
  );
  await page.route(
    "http://localhost:3000/api/tag?type=continuedEmploymentReason&deleted=true",
    async (route) => {
      await route.fulfill({ body: JSON.stringify([]) });
    }
  );
  await page.route("http://localhost:3000/api/person/123", async (route) => {
    await route.fulfill({ body: JSON.stringify(person) });
  });
  await page.route("http://localhost:3000/api/contract/456", async (route) => {
    await route.fulfill({ body: JSON.stringify(contract) });
  });
  await page.goto("http://localhost:4200/persons/123/contract/456");
  const addDurationButton = await page.getByRole("button", {
    name: "Weiterbeschäftigung",
  });
  await addDurationButton.click();
  await expect(page.getByText("Weiterbeschäftigung")).toBeVisible();
});

test("Delete an existing add-on", async ({ page }) => {
  await page.route(
    "http://localhost:3000/api/addOn/654654655",
    async (route) => {
      await route.fulfill({ body: JSON.stringify({}) });
    }
  );
  await page.route("http://localhost:3000/api/person/123", async (route) => {
    await route.fulfill({ body: JSON.stringify(person) });
  });
  await page.route("http://localhost:3000/api/contract/456", async (route) => {
    await route.fulfill({ body: JSON.stringify(contract) });
  });
  await page.route("http://localhost:3000/api/addOn*", async (route) => {
    await route.fulfill({ body: JSON.stringify([addOn]) });
  });
  await page.goto("http://localhost:4200/persons/123/contract/456");
  const deleteButton = await page.locator("app-p-card").locator(".fa-trash");
  await deleteButton.click();
  const deleteModalButton = await page.getByRole("button", { name: "Löschen" });
  await deleteModalButton.click();
  await page.waitForTimeout(1000);
  await expect(page.getByText("Weiterbeschäftigung")).not.toBeVisible();
});

test("Create a new contract from the contracts overview", async ({ page }) => {
  const newContract = {
    id: "789",
    personId: "123",
    type: ContractTypes.ats,
    vte: 100,
    calculatedVte: 100,
    limited: false,
    projectId: null,
    projectObjectOnlyAcronym: null,
    description: null,
    comment: null,
    calculatedEnd: null,
    supervisorIds: [],
    fundingType: null,
    applicationDate: null,
    salaryScale: null,
    costCenter: null,
    primaryTypeId: null,
    secondaryTypeId: null,
    researchFocusId: null,
  };
  await page.route("http://localhost:3000/api/contract*", async (route) => {
    await route.fulfill({ body: JSON.stringify([newContract]) });
  });
  await page.route("http://localhost:3000/api/contractType*", async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route("http://localhost:3000/api/project", async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route("http://localhost:3000/api/person/123", async (route) => {
    await route.fulfill({ body: JSON.stringify(person) });
  });
  await page.goto("http://localhost:4200/persons/123/contract");
  const createContractButton = await page.getByRole("button", { name: "+" });
  await createContractButton.click();
  const atsOption = (await page.getByRole("menuitem", { name: "ATM" })).nth(0);
  await atsOption.click();
  const createButton = await page.getByRole("button", { name: "Erstellen" });
  await createButton.click();
  await expect(page.getByText("ATM")).toBeVisible();
});

test("Navigate to an existing contract from the contracts overview", async ({
  page,
}) => {
  const contract = {
    id: "456",
    personId: "123",
    type: ContractTypes.ats,
    start: new Date(),
    end: new Date(),
    vte: 100,
    calculatedVte: 100,
    limited: false,
    projectId: null,
    projectObjectOnlyAcronym: null,
    description: null,
    comment: null,
    calculatedEnd: null,
    supervisorIds: [],
    fundingType: null,
    applicationDate: null,
    salaryScale: null,
    costCenter: null,
    primaryTypeId: null,
    secondaryTypeId: null,
    researchFocusId: null,
  };
  await page.route("http://localhost:3000/api/contract*", async (route) => {
    await route.fulfill({ body: JSON.stringify([contract]) });
  });
  await page.route("http://localhost:3000/api/contractType*", async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route("http://localhost:3000/api/project", async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route("http://localhost:3000/api/person/123", async (route) => {
    await route.fulfill({ body: JSON.stringify(person) });
  });

  await page.goto("http://localhost:4200/persons/123/contract");
  const contractCard = (await page.getByText("ATM")).nth(0);
  await contractCard.click();
  await expect(page.getByText("ATM")).toBeVisible();
});
