import { test, expect, Page } from "@playwright/test";
import { strictEqual } from "assert";

test.setTimeout(15000);

test("should navigate to person overview and display person information", async ({
  page,
}) => {
  const personResponse = {
    id: "123",
    firstName: "Max",
    lastName: "Mustermann",
    emailWork: "max.mustermann@example.com",
    phoneWork: "123456789",
    roomNumber: "123",
    bornLastName: "Musterfrau",
    gender: "male",
    current: true,
    member: true,
    extern: false,
    company: "Example Company",
    street: "Example Street",
    streetNo: "1",
    additional: "Example Addition",
    plz: "12345",
    town: "Example City",
    country: "Germany",
    calculatedEmploymentEnd: new Date(),
    comment: "Example Comment",
    instituteId: "1",
    subInstituteId: "2",
    qualification: [],
    sciTimeVGs: [],
    retirement: null,
    timeUsedUp: false,
    teamIds: [],
    workdays: [],
    candidature: false,
    firstApplication: null,
    loanIT: false,
    device: null,
    inventoryNumber: null,
    loanEnd: null,
    emailExtension: false,
    emailExtensionEnd: null,
    newsletter: false,
    calculatedVteSum: 100,
    thesis: null,
    habilitation: null,
    professorship: null,
  };
  const instituteResponse = {
    id: "1",
    name: "Example Institute",
    acronym: "EI",
  };
  const subInstituteResponse = {
    id: "2",
    name: "Example SubInstitute",
    acronym: "ESI",
  };
  await page.route("**/person/123", async (route) => {
    await route.fulfill({ body: JSON.stringify(personResponse) });
  });
  await page.route("**/institutes/*", async (route) => {
    await route.fulfill({ body: JSON.stringify(instituteResponse) });
  });
  await page.route("**/institutes/*", async (route) => {
    await route.fulfill({ body: JSON.stringify(subInstituteResponse) });
  });
  await page.goto("http://localhost:4200/persons/123/overview");
  const fullName = await page.getByText("Max Mustermann").nth(0);
  await expect(fullName).toBeVisible();
  const roomNumber = await page.getByText("123").nth(0);
  await expect(roomNumber).toBeVisible();
  const email = await page.getByText("max.mustermann@example.com").nth(0);
  await expect(email).toBeVisible();
  const phone = await page.getByText("123456789").nth(0);
  await expect(phone).toBeVisible();
  const company = await page.getByText("Example Company").nth(0);
  await expect(company).toBeVisible();
  const street = await page.getByText("Example Street").nth(0);
  await expect(street).toBeVisible();
});

test("should save changes and display success message", async ({ page }) => {
  const personResponse = {
    id: "123",
    firstName: "Max",
    lastName: "Mustermann",
    emailWork: "max.mustermann@example.com",
    phoneWork: "123456789",
    roomNumber: "123",
    bornLastName: "Musterfrau",
    gender: "male",
    current: true,
    member: true,
    extern: false,
    company: "Example Company",
    street: "Example Street",
    streetNo: "1",
    additional: "Example Addition",
    plz: "12345",
    town: "Example City",
    country: "Germany",
    calculatedEmploymentEnd: new Date(),
    comment: "Example Comment",
    instituteId: "1",
    subInstituteId: "2",
    qualification: [],
    sciTimeVGs: [],
    retirement: null,
    timeUsedUp: false,
    teamIds: [],
    workdays: [],
    candidature: false,
    firstApplication: null,
    loanIT: false,
    device: null,
    inventoryNumber: null,
    loanEnd: null,
    emailExtension: false,
    emailExtensionEnd: null,
    newsletter: false,
    calculatedVteSum: 100,
    thesis: null,
    habilitation: null,
    professorship: null,
  };
  const updatedPersonResponse = {
    id: "123",
    firstName: "Max",
    lastName: "Mustermann",
    emailWork: "max.mustermann@example.com",
    phoneWork: "123456789",
    roomNumber: "456",
    bornLastName: "Musterfrau",
    gender: "male",
    current: true,
    member: true,
    extern: false,
    company: "Example Company",
    street: "Example Street",
    streetNo: "1",
    additional: "Example Addition",
    plz: "12345",
    town: "Example City",
    country: "Germany",
    calculatedEmploymentEnd: new Date(),
    comment: "Example Comment",
    instituteId: "1",
    subInstituteId: "2",
    qualification: [],
    sciTimeVGs: [],
    retirement: null,
    timeUsedUp: false,
    teamIds: [],
    workdays: [],
    candidature: false,
    firstApplication: null,
    loanIT: false,
    device: null,
    inventoryNumber: null,
    loanEnd: null,
    emailExtension: false,
    emailExtensionEnd: null,
    newsletter: false,
    calculatedVteSum: 100,
    thesis: null,
    habilitation: null,
    professorship: null,
  };
  await page.route("**/api/person", async (route) => {
    await route.fulfill({ body: JSON.stringify(personResponse) });
  });
  await page.route("**/api/person/123", async (route) => {
    await route.fulfill({ body: JSON.stringify(updatedPersonResponse) });
  });
  await page.goto("http://localhost:4200/persons/123/base");
  const roomNumberInput = await page
    .locator("app-p-field")
    .filter({ hasText: "Raumnummer" })
    .getByPlaceholder("...");
  await roomNumberInput.fill("456");
  const saveButton = await page.locator(".fa-save");
  await saveButton.click();
  const successMessage = await page.getByText("Speichern erfolgreich");
  await expect(successMessage).toBeVisible();
});

test("should delete person and navigate to persons list", async ({ page }) => {
  const personResponse = {
    id: "123",
    firstName: "Max",
    lastName: "Mustermann",
    emailWork: "max.mustermann@example.com",
    phoneWork: "123456789",
    roomNumber: "123",
    bornLastName: "Musterfrau",
    gender: "male",
    current: true,
    member: true,
    extern: false,
    company: "Example Company",
    street: "Example Street",
    streetNo: "1",
    additional: "Example Addition",
    plz: "12345",
    town: "Example City",
    country: "Germany",
    calculatedEmploymentEnd: new Date(),
    comment: "Example Comment",
    instituteId: "1",
    subInstituteId: "2",
    qualification: [],
    sciTimeVGs: [],
    retirement: null,
    timeUsedUp: false,
    teamIds: [],
    workdays: [],
    candidature: false,
    firstApplication: null,
    loanIT: false,
    device: null,
    inventoryNumber: null,
    loanEnd: null,
    emailExtension: false,
    emailExtensionEnd: null,
    newsletter: false,
    calculatedVteSum: 100,
    thesis: null,
    habilitation: null,
    professorship: null,
  };
  await page.route("**/api/person/123", async (route) => {
    await route.fulfill({ body: JSON.stringify(personResponse) });
  });
  await page.goto("http://localhost:4200/persons/123/overview");
  const deleteButton = await page.locator(".fa-trash");
  await deleteButton.click();
  const deleteModalButton = await page.getByRole("button", { name: "Löschen" });
  await deleteModalButton.click();
  const personsList = await page.getByText("Personen").nth(0);
  await expect(personsList).toBeVisible();
});

test("should create a new person and navigate to the new person's base view", async ({
  page,
}) => {
  const newPersonResponse = {
    id: "456",
    firstName: "New",
    lastName: "Person",
    gender: "male",
    bornLastName: "",
    title: "",
    member: false,
    extern: false,
    current: false,
    former: false,
    roomNumber: "",
    emailWork: "",
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
  const committeeResponse = [{ id: "1", name: "Example Committee" }];
  await page.route("**/api/person", async (route) => {
    await route.fulfill({ body: JSON.stringify(newPersonResponse) });
  });
  await page.route("**/api/persons", async (route) => {
    await route.fulfill({ body: JSON.stringify([newPersonResponse]) });
  });
  await page.route("**/api/person/456", async (route) => {
    await route.fulfill({ body: JSON.stringify(newPersonResponse) });
  });
  await page.route("**/api/committees", async (route) => {
    await route.fulfill({ body: JSON.stringify(committeeResponse) });
  });
  await page.goto("http://localhost:4200/persons");
  const newPersonButton = await page.getByRole("button", {
    name: "+",
  });
  await newPersonButton.click();
  const lastNameInput = await page.getByPlaceholder("z.B. Mustermann");
  await lastNameInput.fill("Person");
  await page.getByRole("button", { name: "Neue Person" }).click();
  const saveButton = await page.getByRole("button", { name: "Speichern" });
  await saveButton.click();
  await page.waitForTimeout(1000); // Added a small wait to allow navigation
  const baseViewHeading = await page.getByText("Stammdaten");
  await expect(baseViewHeading).toBeVisible();
});

test("should filter persons and display filtered list", async ({ page }) => {
  const personsResponse = [
    { id: "123", firstName: "Max", lastName: "Mustermann" },
    { id: "456", firstName: "Jane", lastName: "Doe" },
  ];
  const committeesResponse = [{ id: "1", name: "Example Committee" }];
  await page.route("**/api/persons*", async (route) => {
    await route.fulfill({ body: JSON.stringify(personsResponse) });
  });
  await page.route("**/api/committees", async (route) => {
    await route.fulfill({ body: JSON.stringify(committeesResponse) });
  });
  await page.route("**/api/person/count*", async (route) => {
    await route.fulfill({ body: JSON.stringify(2) });
  });
  await page.route("**/api/person?page=0", async (route) => {
    await route.fulfill({ body: JSON.stringify(personsResponse) });
  });
  await page.goto("http://localhost:4200/persons");
  const searchInput = await page.getByLabel("Suche");
  await searchInput.fill("Max");
  await page.waitForTimeout(1000); //Added a small wait to allow filtering
  const maxMustermann = await page.getByText("Mustermann");
  await expect(maxMustermann).toBeVisible();
  const janeDoe = await page.getByText("Doe");
  await expect(janeDoe).not.toBeVisible();
});

test("should navigate from persons list to person overview, then to base view", async ({
  page,
}) => {
  const personOverviewResponse = {
    id: "123",
    firstName: "Max",
    lastName: "Mustermann",
    emailWork: "max.mustermann@example.com",
    phoneWork: "123456789",
    roomNumber: "123",
    bornLastName: "Musterfrau",
    gender: "male",
    current: true,
    member: true,
    extern: false,
    company: "Example Company",
    street: "Example Street",
    streetNo: "1",
    additional: "Example Addition",
    plz: "12345",
    town: "Example City",
    country: "Germany",
    calculatedEmploymentEnd: new Date(),
    comment: "Example Comment",
    instituteId: "1",
    subInstituteId: "2",
    qualification: [],
    sciTimeVGs: [],
    retirement: null,
    timeUsedUp: false,
    teamIds: [],
    workdays: [],
    candidature: false,
    firstApplication: null,
    loanIT: false,
    device: null,
    inventoryNumber: null,
    loanEnd: null,
    emailExtension: false,
    emailExtensionEnd: null,
    newsletter: false,
    calculatedVteSum: 100,
    thesis: null,
    habilitation: null,
    professorship: null,
  };
  const personBaseResponse = {
    id: "123",
    firstName: "Max",
    lastName: "Mustermann",
    emailWork: "max.mustermann@example.com",
    phoneWork: "123456789",
    roomNumber: "123",
    bornLastName: "Musterfrau",
    gender: "male",
    current: true,
    member: true,
    extern: false,
    company: "Example Company",
    street: "Example Street",
    streetNo: "1",
    additional: "Example Addition",
    plz: "12345",
    town: "Example City",
    country: "Germany",
    calculatedEmploymentEnd: new Date(),
    comment: "Example Comment",
    instituteId: "1",
    subInstituteId: "2",
    qualification: [],
    sciTimeVGs: [],
    retirement: null,
    timeUsedUp: false,
    teamIds: [],
    workdays: [],
    candidature: false,
    firstApplication: null,
    loanIT: false,
    device: null,
    inventoryNumber: null,
    loanEnd: null,
    emailExtension: false,
    emailExtensionEnd: null,
    newsletter: false,
    calculatedVteSum: 100,
    thesis: null,
    habilitation: null,
    professorship: null,
  };
  const personsResponse = [
    { id: "123", firstName: "Max", lastName: "Mustermann" },
    { id: "456", firstName: "Jane", lastName: "Doe" },
  ];
  await page.route("**/api/person/123", async (route) => {
    await route.fulfill({ body: JSON.stringify(personOverviewResponse) });
  });
  await page.route("**/api/person/123", async (route) => {
    await route.fulfill({ body: JSON.stringify(personBaseResponse) });
  });
  await page.route("**/api/person?page=0", async (route) => {
    await route.fulfill({ body: JSON.stringify(personsResponse) });
  });
  await page.route("**/api/person/count?page=0", async (route) => {
    await route.fulfill({ body: JSON.stringify(2) });
  });
  await page.goto("http://localhost:4200/persons");
  const personLink = await page
    .getByRole("row", { name: "Mustermann Max" })
    .getByRole("link");
  await personLink.click();
  const overviewHeading = await page.getByText("Max Mustermann").nth(0);
  await expect(overviewHeading).toBeVisible();
  const baseViewButton = await page.getByText("Stammdaten");
  await baseViewButton.click();
  const baseViewHeading = await page.getByText("Stammdaten");
  await expect(baseViewHeading).toBeVisible();
});
