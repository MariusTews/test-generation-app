import { test, expect } from "@playwright/test";
import { AddOnTypes } from "src/app/core/model/add-on/add-on-types.enum";
import {
  ContractTypes,
  ContractFundingTypes,
} from "src/app/core/model/contract";

test.setTimeout(15000);

test("Add new AddOn of type Amount", async ({ page }) => {
  const person = {
    id: "testPersonId",
    lastName: "Testperson",
    firstName: "Max",
  };
  const addOn = {
    id: "654654654654",
    type: "Amount",
    subType: "increase",
    contractId: "1234567890",
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
  const contract = {
    id: "testContractId",
    personId: "testPersonId",
    type: ContractTypes.ats,
    vte: 100,
    calculatedVte: 100,
    limited: false,
    start: new Date(),
    end: new Date(),
    description: "",
    comment: "",
    calculatedEnd: new Date(),
    supervisorIds: [],
    fundingType: ContractFundingTypes.land,
    applicationDate: new Date(),
    salaryScale: "",
    costCenter: "",
    primaryTypeId: null,
    secondaryTypeId: null,
    researchFocusId: null,
  };
  const contractTypes = [
    {
      id: "someContractTypeId",
      type: "someContractType",
      long: "Some Contract Type",
      short: "SCT",
    },
  ];

  await page.route("http://localhost:3000/api/addOn", async (route) => {
    await route.fulfill({ body: JSON.stringify(addOn) });
  });
  await page.route("http://localhost:3000/api/addOn?*", async (route) => {
    await route.fulfill({ body: JSON.stringify([addOn]) });
  });
  await page.route(
    "http://localhost:3000/api/person/testPersonId",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(person) });
    }
  );
  await page.route(
    "http://localhost:3000/api/contract/testContractId",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(contract) });
    }
  );
  await page.route(
    "http://localhost:3000/api/contractType?*",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(contractTypes) });
    }
  );

  await page.goto(
    "http://localhost:4200/persons/testPersonId/contract/testContractId"
  );

  const showAddonButton = page.getByRole("button", { name: "+", exact: true });
  await showAddonButton.click();
  const addAmountButton = page
    .getByRole("button", { name: "Aufstockung" })
    .nth(0);
  await addAmountButton.click();

  await expect(page.getByText("Aufstockung").nth(1)).toBeVisible();
});

test("Add new AddOn of type Duration", async ({ page }) => {
  const person = {
    id: "testPersonId",
    lastName: "Testperson",
    firstName: "Max",
  };
  const addOn = {
    id: "654654654655",
    type: "Duration",
    subType: "extension",
    contractId: "1234567890",
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
  const contract = {
    id: "testContractId",
    personId: "testPersonId",
    type: ContractTypes.ats,
    vte: 100,
    calculatedVte: 100,
    limited: false,
    start: new Date(),
    end: new Date(),
    description: "",
    comment: "",
    calculatedEnd: new Date(),
    supervisorIds: [],
    fundingType: ContractFundingTypes.land,
    applicationDate: new Date(),
    salaryScale: "",
    costCenter: "",
    primaryTypeId: null,
    secondaryTypeId: null,
    researchFocusId: null,
  };
  const contractTypes = [
    {
      id: "someContractTypeId",
      type: "someContractType",
      long: "Some Contract Type",
      short: "SCT",
    },
  ];

  await page.route("http://localhost:3000/api/addOn", async (route) => {
    await route.fulfill({ body: JSON.stringify(addOn) });
  });
  await page.route("http://localhost:3000/api/addOn?*", async (route) => {
    await route.fulfill({ body: JSON.stringify([addOn]) });
  });
  await page.route(
    "http://localhost:3000/api/person/testPersonId",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(person) });
    }
  );
  await page.route(
    "http://localhost:3000/api/contract/testContractId",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(contract) });
    }
  );
  await page.route(
    "http://localhost:3000/api/contractType?*",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(contractTypes) });
    }
  );
  await page.goto(
    "http://localhost:4200/persons/testPersonId/contract/testContractId"
  );

  const showAddonButton = page.getByRole("button", { name: "+", exact: true });
  await showAddonButton.click();
  const addDurationButton = page
    .getByRole("button", { name: "Weiterbeschäftigung" })
    .nth(0);
  await addDurationButton.click();

  await expect(page.getByText("Weiterbeschäftigung").nth(1)).toBeVisible();
});

test("Add new AddOn of type Overtime", async ({ page }) => {
  const person = {
    id: "testPersonId",
    lastName: "Testperson",
    firstName: "Max",
  };
  const addOn = {
    id: "654654654656",
    type: "Overtime",
    subType: "overtime",
    contractId: "1234567890",
    start: new Date(),
    end: new Date(),
    applicationDate: new Date(),
    vte: 0,
    overtimeHours: 10,
    durationReasonId: null,
    substituteReason: null,
    substitutePersonId: null,
    substituteContractId: null,
    substituteAddOn: null,
  };
  const contract = {
    id: "testContractId",
    personId: "testPersonId",
    type: ContractTypes.ats,
    vte: 100,
    calculatedVte: 100,
    limited: false,
    start: new Date(),
    end: new Date(),
    description: "",
    comment: "",
    calculatedEnd: new Date(),
    supervisorIds: [],
    fundingType: ContractFundingTypes.land,
    applicationDate: new Date(),
    salaryScale: "",
    costCenter: "",
    primaryTypeId: null,
    secondaryTypeId: null,
    researchFocusId: null,
  };
  const contractTypes = [
    {
      id: "someContractTypeId",
      type: "someContractType",
      long: "Some Contract Type",
      short: "SCT",
    },
  ];

  await page.route("http://localhost:3000/api/addOn", async (route) => {
    await route.fulfill({ body: JSON.stringify(addOn) });
  });
  await page.route("http://localhost:3000/api/addOn?*", async (route) => {
    await route.fulfill({ body: JSON.stringify([addOn]) });
  });
  await page.route(
    "http://localhost:3000/api/person/testPersonId",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(person) });
    }
  );
  await page.route(
    "http://localhost:3000/api/contract/testContractId",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(contract) });
    }
  );
  await page.route(
    "http://localhost:3000/api/contractType?*",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(contractTypes) });
    }
  );
  await page.goto(
    "http://localhost:4200/persons/testPersonId/contract/testContractId"
  );

  const showAddonButton = page.getByRole("button", { name: "+", exact: true });
  await showAddonButton.click();
  const addOvertimeButton = page
    .getByRole("button", { name: "Mehrarbeit" })
    .nth(0);
  await addOvertimeButton.click();

  await expect(page.getByText("Mehrarbeit").nth(1)).toBeVisible();
});

test("Add new AddOn of type Substitute", async ({ page }) => {
  const person = {
    id: "testPersonId",
    lastName: "Testperson",
    firstName: "Max",
  };
  const addOn = {
    id: "654654654657",
    type: "Substitute",
    subType: "leaveOfAbsence",
    contractId: "1234567890",
    start: new Date(),
    end: new Date(),
    applicationDate: new Date(),
    vte: 0,
    overtimeHours: 0,
    durationReasonId: null,
    substituteReason: "Elternzeit",
    substitutePersonId: null,
    substituteContractId: null,
    substituteAddOn: null,
  };
  const contract = {
    id: "testContractId",
    personId: "testPersonId",
    type: ContractTypes.ats,
    vte: 100,
    calculatedVte: 100,
    limited: false,
    start: new Date(),
    end: new Date(),
    description: "",
    comment: "",
    calculatedEnd: new Date(),
    supervisorIds: [],
    fundingType: ContractFundingTypes.land,
    applicationDate: new Date(),
    salaryScale: "",
    costCenter: "",
    primaryTypeId: null,
    secondaryTypeId: null,
    researchFocusId: null,
  };
  const contractTypes = [
    {
      id: "someContractTypeId",
      type: "someContractType",
      long: "Some Contract Type",
      short: "SCT",
    },
  ];

  await page.route("http://localhost:3000/api/addOn", async (route) => {
    await route.fulfill({ body: JSON.stringify(addOn) });
  });
  await page.route("http://localhost:3000/api/addOn?*", async (route) => {
    await route.fulfill({ body: JSON.stringify([addOn]) });
  });
  await page.route(
    "http://localhost:3000/api/person/testPersonId",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(person) });
    }
  );
  await page.route(
    "http://localhost:3000/api/contract/testContractId",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(contract) });
    }
  );
  await page.route(
    "http://localhost:3000/api/contractType?*",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(contractTypes) });
    }
  );
  await page.goto(
    "http://localhost:4200/persons/testPersonId/contract/testContractId"
  );

  const showAddonButton = page.getByRole("button", { name: "+", exact: true });
  await showAddonButton.click();
  const addSubstituteButton = page
    .getByRole("button", { name: "Beurlaubung" })
    .nth(0);
  await addSubstituteButton.click();

  await expect(page.getByText("Beurlaubung").nth(1)).toBeVisible();
});

test("Add new AddOn of type Resolution", async ({ page }) => {
  const person = {
    id: "testPersonId",
    lastName: "Testperson",
    firstName: "Max",
  };
  const addOn = {
    id: "654654654658",
    type: "Resolution",
    subType: "resolution",
    contractId: "1234567890",
    start: null,
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
  const contract = {
    id: "testContractId",
    personId: "testPersonId",
    type: ContractTypes.ats,
    vte: 100,
    calculatedVte: 100,
    limited: false,
    start: new Date(),
    end: new Date(),
    description: "",
    comment: "",
    calculatedEnd: new Date(),
    supervisorIds: [],
    fundingType: ContractFundingTypes.land,
    applicationDate: new Date(),
    salaryScale: "",
    costCenter: "",
    primaryTypeId: null,
    secondaryTypeId: null,
    researchFocusId: null,
  };
  const contractTypes = [
    {
      id: "someContractTypeId",
      type: "someContractType",
      long: "Some Contract Type",
      short: "SCT",
    },
  ];

  await page.route("http://localhost:3000/api/addOn", async (route) => {
    await route.fulfill({ body: JSON.stringify(addOn) });
  });
  await page.route("http://localhost:3000/api/addOn?*", async (route) => {
    await route.fulfill({ body: JSON.stringify([addOn]) });
  });
  await page.route(
    "http://localhost:3000/api/person/testPersonId",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(person) });
    }
  );
  await page.route(
    "http://localhost:3000/api/contract/testContractId",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(contract) });
    }
  );
  await page.route(
    "http://localhost:3000/api/contractType?*",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(contractTypes) });
    }
  );
  await page.goto(
    "http://localhost:4200/persons/testPersonId/contract/testContractId"
  );

  const showAddonButton = page.getByRole("button", { name: "+", exact: true });
  await showAddonButton.click();
  const addResolutionButton = page
    .getByRole("button", { name: "Verkürzung/Vertragsauflösung" })
    .nth(0);
  await addResolutionButton.click();

  await expect(
    page.getByText("Verkürzung/Vertragsauflösung").nth(1)
  ).toBeVisible();
});

test("Create new Contract from ContractsList and navigate to it", async ({
  page,
}) => {
  const newContract = {
    id: "newContractId",
    personId: "testPersonId",
    type: ContractTypes.ats,
    vte: 100,
    calculatedVte: 100,
    limited: false,
    start: new Date(),
    end: new Date(),
    description: "",
    comment: "",
    calculatedEnd: new Date(),
    supervisorIds: [],
    fundingType: ContractFundingTypes.land,
    applicationDate: new Date(),
    salaryScale: "",
    costCenter: "",
    primaryTypeId: null,
    secondaryTypeId: null,
    researchFocusId: null,
  };
  const person = {
    id: "testPersonId",
    lastName: "Testperson",
    firstName: "Max",
  };

  await page.route("http://localhost:3000/api/contract?*", async (route) => {
    await route.fulfill({ body: JSON.stringify(newContract) });
  });
  await page.route(
    "http://localhost:3000/api/person/testPersonId",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(person) });
    }
  );

  await page.goto("http://localhost:4200/persons/testPersonId/contract");

  const newContractButton = page.getByRole("button", { name: "Neuer Vertrag" });
  await newContractButton.click();

  const contractTypeDropdown = page.getByRole("combobox", { name: "Vertrag" });
  const atsOption = page.getByRole("option", { name: "ATM" });
  await contractTypeDropdown.click();
  await atsOption.click();

  const createButton = page.getByRole("button", { name: "Erstellen" });
  await createButton.click();

  await expect(page.getByText("ATM")).toBeVisible();
});

test("Delete an AddOn", async ({ page }) => {
  const addOns = [
    {
      id: "addOnToDelete",
      type: "Amount",
      subType: "increase",
      contractId: "1234567890",
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
    },
  ];
  const person = {
    id: "testPersonId",
    lastName: "Testperson",
    firstName: "Max",
  };
  const contract = {
    id: "testContractId",
    personId: "testPersonId",
    type: ContractTypes.ats,
    vte: 100,
    calculatedVte: 100,
    limited: false,
    start: new Date(),
    end: new Date(),
    description: "",
    comment: "",
    calculatedEnd: new Date(),
    supervisorIds: [],
    fundingType: ContractFundingTypes.land,
    applicationDate: new Date(),
    salaryScale: "",
    costCenter: "",
    primaryTypeId: null,
    secondaryTypeId: null,
    researchFocusId: null,
  };
  const contractTypes = [
    {
      id: "someContractTypeId",
      type: "someContractType",
      long: "Some Contract Type",
      short: "SCT",
    },
  ];

  await page.route("http://localhost:3000/api/addOn*", async (route) => {
    await route.fulfill({ body: JSON.stringify(addOns) });
  });
  await page.route(
    "http://localhost:3000/api/addOn/addOnToDelete",
    async (route) => {
      await route.fulfill({ status: 200 });
    }
  );
  await page.route(
    "http://localhost:3000/api/person/testPersonId",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(person) });
    }
  );
  await page.route(
    "http://localhost:3000/api/contract/testContractId",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(contract) });
    }
  );
  await page.route(
    "http://localhost:3000/api/contractType?*",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(contractTypes) });
    }
  );
  await page.goto(
    "http://localhost:4200/persons/testPersonId/contract/testContractId"
  );

  const deleteButton = page.locator("app-p-card").locator(".fa-trash");
  await deleteButton.click();

  await expect(page.getByText("diese Vertragsänderung")).toBeVisible();
  const confirmDeleteButton = page.getByRole("button", { name: "Löschen" });
  await confirmDeleteButton.click();
  // Assertion to check if AddOn is deleted -  this requires more DOM inspection depending on your application's visual feedback
  await expect(page.getByText("Aufstockung").nth(0)).not.toBeVisible();
});
