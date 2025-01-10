import { test, expect } from "@playwright/test";
test.setTimeout(15000);

const responsePerson = {
  id: "personId",
  firstName: "Test",
  lastName: "Person",
  bornLastName: "",
  title: "",
  gender: "",
  member: false,
  extern: false,
  current: true,
  former: false,
  roomNumber: "",
  emailWork: "test@example.com",
  phoneWork: "",
  certificate: false,
  rank: "",
  instituteId: "instituteId",
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
  retirement: null,
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
  calculatedEmploymentEnd: null,
  comment: "",
};

test("AddOnSelectionComponent: Create and save a new amount add-on", async ({
  page,
}) => {
  // Mock all necessary HTTP requests
  // Example:
  const responseAddOn = {
    id: "newAddonId",
    type: "Amount",
    subType: "increase",
    contractId: "contractId",
    start: new Date(),
    end: new Date(),
    applicationDate: new Date(),
    comment: "Test comment",
    vte: 10,
    overtimeHours: 0,
    durationReasonId: null,
    substituteReason: null,
    substitutePersonId: null,
    substituteContractId: null,
    substituteAddOn: null,
  };

  const responseContract = {
    id: "contractId",
    projectId: null,
    projectObjectOnlyAcronym: null,
    personId: "personId",
    start: new Date(),
    end: new Date(),
    vte: 100,
    description: "",
    comment: "",
    calculatedEnd: new Date(),
    calculatedVte: 100,
    supervisorIds: [],
    fundingType: "Land",
    applicationDate: new Date(),
    type: "SciAssCo",
    salaryScale: "",
    costCenter: "",
    limited: false,
    primaryTypeId: null,
    secondaryTypeId: null,
    researchFocusId: null,
  };

  const responseContracts = [
    {
      id: "contract1",
      type: "SciAssCo",
      calculatedEnd: new Date(),
      calculatedVte: 100,
      personId: "personId",
      projectId: null,
      projectObjectOnlyAcronym: null,
      start: new Date(),
      end: new Date(),
      vte: 100,
      description: "",
      comment: "",
      supervisorIds: [],
      fundingType: "Land",
      applicationDate: new Date(),
      salaryScale: "",
      costCenter: "",
      limited: false,
      primaryTypeId: null,
      secondaryTypeId: null,
      researchFocusId: null,
    },
    {
      id: "contract2",
      type: "Ats",
      calculatedEnd: new Date(),
      calculatedVte: 50,
      personId: "personId",
      projectId: null,
      projectObjectOnlyAcronym: null,
      start: new Date(),
      end: new Date(),
      vte: 50,
      description: "",
      comment: "",
      supervisorIds: [],
      fundingType: "Land",
      applicationDate: new Date(),
      salaryScale: "",
      costCenter: "",
      limited: false,
      primaryTypeId: null,
      secondaryTypeId: null,
      researchFocusId: null,
    },
  ];

  await page.route("http://localhost:3000/api/addOn*", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({ body: JSON.stringify(responseAddOn) });
    } else if (route.request().method() === "GET") {
      await route.fulfill({ body: JSON.stringify([responseAddOn]) });
    } else if (route.request().method() === "PUT") {
      await route.fulfill({ body: JSON.stringify(responseAddOn) });
    } else {
      await route.continue();
    }
  });

  await page.route(
    "http://localhost:3000/api/person/personId",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(responsePerson) });
    }
  );
  await page.route(
    "http://localhost:3000/api/contract/contractId",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(responseContract) });
    }
  );
  await page.route(
    "http://localhost:3000/api/contract?personId=personId&currentContracts=true&populateProjectAcronym=true",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(responseContracts) });
    }
  );

  // Add more mocks here as needed

  // Navigate to the page
  await page.goto("http://localhost:4200/persons/personId/contract/contractId");

  // Click the button to show add-on buttons
  await page.getByRole("button", { name: "+" }).click();

  // Click the button to create a new amount add-on
  await page.getByRole("button", { name: "+ Aufstockung" }).click();

  // Assertions
  await expect(page.getByText("Test comment").nth(0)).toBeVisible();
  await expect(page.getByText("Aufstockung").nth(0)).toBeVisible();
});

test("ContractsComponent: List contracts and assert their visibility", async ({
  page,
}) => {
  const responseContracts = [
    {
      id: "contract1",
      type: "SciAssCo",
      calculatedEnd: new Date(),
      calculatedVte: 100,
      personId: "personId",
      projectId: null,
      projectObjectOnlyAcronym: null,
      start: new Date(),
      end: new Date(),
      vte: 100,
      description: "",
      comment: "",
      supervisorIds: [],
      fundingType: "Land",
      applicationDate: new Date(),
      salaryScale: "",
      costCenter: "",
      limited: false,
      primaryTypeId: null,
      secondaryTypeId: null,
      researchFocusId: null,
    },
    {
      id: "contract2",
      type: "Ats",
      calculatedEnd: new Date(),
      calculatedVte: 50,
      personId: "personId",
      projectId: null,
      projectObjectOnlyAcronym: null,
      start: new Date(),
      end: new Date(),
      vte: 50,
      description: "",
      comment: "",
      supervisorIds: [],
      fundingType: "Land",
      applicationDate: new Date(),
      salaryScale: "",
      costCenter: "",
      limited: false,
      primaryTypeId: null,
      secondaryTypeId: null,
      researchFocusId: null,
    },
  ];

  await page.route("http://localhost:3000/api/contract*", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ body: JSON.stringify(responseContracts) });
    } else {
      await route.continue();
    }
  });
  await page.route(
    "http://localhost:3000/api/person/personId",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(responsePerson) });
    }
  );

  await page.goto("http://localhost:4200/persons/personId/contract");

  await expect(page.getByText("WiMi Land").nth(0)).toBeVisible();
  await expect(page.getByText("ATM").nth(0)).toBeVisible();
});

test("ContractsComponent: Add and save a new contract", async ({ page }) => {
  const responseNewContract = {
    id: "newContractId",
    personId: "personId",
    type: "SciAssCo",
    start: new Date(),
    end: new Date(),
    vte: 100,
    description: "New Contract Description",
  };

  await page.route("http://localhost:3000/api/contract*", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({ body: JSON.stringify(responseNewContract) });
    } else if (route.request().method() === "GET") {
      await route.fulfill({ body: JSON.stringify([]) }); // Return empty array for initial GET request
    } else if (route.request().method() === "PUT") {
      await route.fulfill({ body: JSON.stringify(responseNewContract) }); // Mock PUT request for saving
    } else {
      await route.continue();
    }
  });
  await page.route(
    "http://localhost:3000/api/person/personId",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(responsePerson) });
    }
  );
  await page.route(
    "http://localhost:3000/api/contract/newContractId",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(responseNewContract) });
    }
  );

  await page.goto("http://localhost:4200/persons/personId/contract");

  //Open Modal and select contract type
  await page.getByRole("button", { name: "Verträge" }).click();
  await page.getByRole("button", { name: "+" }).click();
  await page.getByPlaceholder("...").click();
  await page.getByText("WiMi Land").click();
  await page.getByRole("button", { name: "Erstellen" }).click();

  await expect(page.getByLabel("Alternative")).toHaveValue(
    "New Contract Description"
  );
});
