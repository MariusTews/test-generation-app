import { test, expect } from "@playwright/test";
import { ContractFundingTypes } from "src/app/core/model/contract";
test.setTimeout(15000);

test("AddOnSelection: Create and save a new amount add-on", async ({
  page,
}) => {
  // Mock HTTP requests for addOns, continuedEmploymentReasons, continuedEmploymentReasonsArchived, and person data
  const responseAddOns = [
    {
      id: "651a7e699e2596a580f5338f",
      type: "Amount",
      subType: "increase",
      contractId: "651a7e699e2596a580f5338e",
      start: new Date("2024-03-15T00:00:00.000Z"),
      end: new Date("2024-03-22T00:00:00.000Z"),
      applicationDate: new Date("2024-03-08T00:00:00.000Z"),
      comment: null,
      vte: 10,
      overtimeHours: 0,
      durationReasonId: null,
      substituteReason: null,
      substitutePersonId: null,
      substitutePersonName: null,
      substituteContractId: null,
      substituteAddOn: null,
    },
  ];
  await page.route("**/api/addOn", async (route) => {
    await route.fulfill({ body: JSON.stringify(responseAddOns) });
  });
  const responseContinuedEmploymentReasons: any = [];
  await page.route(
    "**/api/tag?type=continuedEmploymentReason",
    async (route) => {
      await route.fulfill({
        body: JSON.stringify(responseContinuedEmploymentReasons),
      });
    }
  );
  const responseContinuedEmploymentReasonsArchived: any = [];
  await page.route(
    "**/api/tag?type=continuedEmploymentReason&deleted=true",
    async (route) => {
      await route.fulfill({
        body: JSON.stringify(responseContinuedEmploymentReasonsArchived),
      });
    }
  );
  const responsePerson = {
    id: "somePersonId",
    firstName: "John",
    lastName: "Doe",
    bornLastName: "",
    title: "",
    gender: "",
    member: false,
    extern: false,
    current: true,
    former: false,
    roomNumber: "",
    emailWork: "john.doe@example.com",
    phoneWork: "",
    certificate: false,
    rank: "",
    instituteId: null,
    subInstituteId: null,
    subInstitute: "",
    company: "",
    street: "",
    streetNo: "",
    additional: "",
    plz: "",
    town: "",
    country: "",
    candidature: false,
    firstApplication: "",
    sciTimeVGs: [],
    retirement: new Date(),
    timeUsedUp: false,
    teamIds: [],
    workdays: [],
    qualification: [],
    thesis: null,
    habilitation: null,
    professorship: null,
    loanIT: false,
    device: "",
    inventoryNumber: "",
    loanEnd: null,
    emailExtension: false,
    emailExtensionEnd: null,
    newsletter: false,
    calculatedVteSum: 0,
    calculatedEmploymentEnd: new Date(),
    comment: "",
  };
  await page.route("**/api/person/somePersonId", async (route) => {
    await route.fulfill({ body: JSON.stringify(responsePerson) });
  });
  // Mock contract
  const responseContract = {
    id: "651a7e699e2596a580f5338e",
    projectId: "someProjectId",
    personId: "somePersonId",
    start: new Date(),
    end: new Date(),
    vte: 100,
    description: "Test Contract",
    comment: "Some comment",
    calculatedEnd: new Date(),
    calculatedVte: 100,
    supervisorIds: [],
    fundingType: ContractFundingTypes.land,
    applicationDate: new Date(),
    type: "SciAssCo",
    salaryScale: "E13",
    costCenter: "12345",
    limited: false,
    primaryTypeId: "somePrimaryTypeId",
    secondaryTypeId: "someSecondaryTypeId",
    researchFocusId: null,
  };
  await page.route("**/api/contract/contractId", async (route) => {
    await route.fulfill({ body: JSON.stringify(responseContract) });
  });
  await page.route(
    "**/api/addOn?contractId=651a7e699e2596a580f5338e&populateSubstitutePersonName=true",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(responseAddOns) });
    }
  );

  // Navigate to the contract page
  await page.goto(
    "http://localhost:4200/persons/somePersonId/contract/contractId"
  );

  // Click the button to show add-on buttons
  await page.getByRole("button", { name: "+" }).click();

  // Click the "Amount" button
  await page.getByRole("button", { name: "+ Aufstockung" }).click();

  // Fill in the required fields for the new add-on (applicationDate, vte, start, end)
  // Example:
  await page.getByLabel("Datum der Beantragung").fill("2024-03-08");
  await page.getByLabel("VZÄ (in %)").fill("10");
  await page.getByLabel("Beginn").fill("2024-03-15");
  await page.getByLabel("Ende").fill("2024-03-22");

  //Save changes
  await page.locator(".fa-save").click();

  // Assertions
  await expect(page.locator("app-p-card").getByPlaceholder("...")).toHaveValue(
    "10"
  );
  await expect(
    page
      .locator("app-p-card app-p-date-picker")
      .filter({ hasText: "Beginn" })
      .getByPlaceholder("dd.mm.yyyy")
  ).toHaveValue("15.03.2024");
  await expect(
    page
      .locator("app-p-card app-p-date-picker")
      .filter({ hasText: "Ende" })
      .getByPlaceholder("dd.mm.yyyy")
  ).toHaveValue("22.03.2024");
});

test("ContractsComponent: List contracts", async ({ page }) => {
  const responseContracts = [
    {
      id: "651a7e699e2596a580f5338e",
      personId: "somePersonId",
      start: new Date(),
      end: new Date(),
      vte: 100,
      description: "Test Contract 1",
      type: "SciAssCo",
    },
    {
      id: "651a7e699e2596a580f5338f",
      personId: "somePersonId",
      start: new Date(),
      end: new Date(),
      vte: 50,
      description: "Test Contract 2",
      type: "SciAssThFu",
    },
  ];
  const responseContractTypes = [
    {
      id: "somePrimaryTypeId",
      long: "Some Long Type",
      short: "Some Short Type",
    },
    {
      id: "someSecondaryTypeId",
      long: "Another Long Type",
      short: "Another Short Type",
    },
  ];

  await page.route(
    "**/api/contract?personId=somePersonId&futureContracts=true&populateProjectAcronym=true",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(responseContracts) });
    }
  );
  await page.route(
    "**/api/contract?personId=somePersonId&currentContracts=true&populateProjectAcronym=true",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(responseContracts) });
    }
  );
  await page.route(
    "**/api/contract?personId=somePersonId&pastContracts=true&populateProjectAcronym=true",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(responseContracts) });
    }
  );
  await page.route(
    "**/api/contract?personId=somePersonId&incompleteContracts=true&populateProjectAcronym=true",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(responseContracts) });
    }
  );
  await page.route("**/api/contractType?type=SciAssCoType", async (route) => {
    await route.fulfill({ body: JSON.stringify(responseContractTypes) });
  });
  await page.route("**/api/contractType?type=SciAssThFuType", async (route) => {
    await route.fulfill({ body: JSON.stringify(responseContractTypes) });
  });

  await page.goto("http://localhost:4200/persons/somePersonId/contract");

  // Assertions -  adapt selectors to match your application's structure
  await expect(page.locator("app-p-card")).toHaveCount(8); // Check if two contracts are displayed
  await expect(page.getByText("WiMi Land").nth(0)).toBeVisible();
  await expect(page.getByText("WiMi Projekt").nth(0)).toBeVisible();
});

test("ContractsComponent: Add and save a new contract", async ({ page }) => {
  const newContract = {
    personId: "somePersonId",
    type: "SciAssCo",
    vte: 100,
    start: new Date("2024-04-01"),
    end: new Date("2024-09-30"),
    description: "New Test Contract",
  };
  const responseNewContract = {
    ...newContract,
    id: "newContractId",
  };
  const responsePerson = {
    id: "somePersonId",
    firstName: "John",
    lastName: "Doe",
    bornLastName: "",
    title: "",
    gender: "",
    member: false,
    extern: false,
    current: true,
    former: false,
    roomNumber: "",
    emailWork: "john.doe@example.com",
    phoneWork: "",
    certificate: false,
    rank: "",
    instituteId: null,
    subInstituteId: null,
    subInstitute: "",
    company: "",
    street: "",
    streetNo: "",
    additional: "",
    plz: "",
    town: "",
    country: "",
    candidature: false,
    firstApplication: "",
    sciTimeVGs: [],
    retirement: new Date(),
    timeUsedUp: false,
    teamIds: [],
    workdays: [],
    qualification: [],
    thesis: null,
    habilitation: null,
    professorship: null,
    loanIT: false,
    device: "",
    inventoryNumber: "",
    loanEnd: null,
    emailExtension: false,
    emailExtensionEnd: null,
    newsletter: false,
    calculatedVteSum: 0,
    calculatedEmploymentEnd: new Date(),
    comment: "",
  };
  const responseContracts = [
    {
      id: "651a7e699e2596a580f5338e",
      personId: "somePersonId",
      start: new Date(),
      end: new Date(),
      vte: 100,
      description: "Test Contract 1",
      type: "SciAssCo",
    },
    {
      id: "651a7e699e2596a580f5338f",
      personId: "somePersonId",
      start: new Date(),
      end: new Date(),
      vte: 50,
      description: "Test Contract 2",
      type: "SciAssThFu",
    },
  ];
  const responseContractTypes = [
    {
      id: "somePrimaryTypeId",
      long: "Some Long Type",
      short: "Some Short Type",
    },
    {
      id: "someSecondaryTypeId",
      long: "Another Long Type",
      short: "Another Short Type",
    },
  ];

  await page.route("**/api/person/somePersonId", async (route) => {
    await route.fulfill({ body: JSON.stringify(responsePerson) });
  });
  await page.route("**/api/contract", async (route) => {
    await route.fulfill({ body: JSON.stringify(responseNewContract) });
  });
  await page.route("**/api/contract/newContractId", async (route) => {
    await route.fulfill({ body: JSON.stringify(responseNewContract) });
  });
  await page.route(
    "**/api/contract?personId=somePersonId&currentContracts=true&populateProjectAcronym=true",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(responseContracts) });
    }
  );
  await page.route(
    "**/api/contract?personId=somePersonId&futureContracts=true&populateProjectAcronym=true",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(responseContracts) });
    }
  );
  await page.route(
    "**/api/contract?personId=somePersonId&pastContracts=true&populateProjectAcronym=true",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(responseContracts) });
    }
  );
  await page.route(
    "**/api/contract?personId=somePersonId&incompleteContracts=true&populateProjectAcronym=true",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(responseContracts) });
    }
  );
  await page.route("**/api/contractType?type=SciAssCoType", async (route) => {
    await route.fulfill({ body: JSON.stringify(responseContractTypes) });
  });
  await page.route("**/api/contractType?type=SciAssThFuType", async (route) => {
    await route.fulfill({ body: JSON.stringify(responseContractTypes) });
  });

  await page.goto("http://localhost:4200/persons/somePersonId/contract");
  await page.getByRole("button", { name: "+" }).click();
  await page.getByText("Neuer Vertrag").click();

  await page.getByPlaceholder("...").click();
  await page.getByRole("button", { name: "WiMi Land" }).click();

  await page.getByText("Erstellen").click();
  await page.getByLabel("VZÄ (in %)").fill("100");
  await page.getByLabel("Beginn").fill("2024-04-01");
  await page.getByLabel("Ende").fill("2024-09-30");
  await page
    .getByLabel("Alternative Vertragsbezeichnung")
    .fill("New Test Contract");

  await expect(page.getByLabel("Alternative Vertragsbezeichnung")).toHaveValue(
    "New Test Contract"
  );
});
