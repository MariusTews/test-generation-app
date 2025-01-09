import { test, expect, chromium } from "@playwright/test";
import { getFullName, Person } from "../src/app/core/model/person";
import { PERSON_QUERY_PARAMS } from "../src/app/core/utils/init-query-params";
import { MongoId } from "../src/app/core/utils/mongoId";
import { Triplet } from "../src/app/core/model/utils/triplet";
import { Institute } from "../src/app/core/model/institute";
import { Workdays } from "../src/app/core/model/contract/workday.enum";

test.setTimeout(15000);
const BASE_URL = "http://localhost:4200";

test("should update person data", async ({ page }) => {
  const person: Person = {
    id: "123",
    firstName: "John",
    lastName: "Doe",
    title: "",
    gender: "",
    member: false,
    extern: false,
    current: true,
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
    retirement: undefined,
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
    loanEnd: undefined,
    emailExtension: false,
    emailExtensionEnd: undefined,
    newsletter: false,
    calculatedVteSum: 0,
    calculatedEmploymentEnd: undefined,
    comment: "",
  };
  const updatedPerson: Person = {
    id: "123",
    firstName: "Jane",
    lastName: "Doe",
    title: "",
    gender: "",
    member: false,
    extern: false,
    current: true,
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
    retirement: undefined,
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
    loanEnd: undefined,
    emailExtension: false,
    emailExtensionEnd: undefined,
    newsletter: false,
    calculatedVteSum: 0,
    calculatedEmploymentEnd: undefined,
    comment: "",
  };

  await page.route("**/persons/*", async (route) => {
    await route.fulfill({ body: JSON.stringify(person) });
  });
  await page.route("**/persons/123", async (route) => {
    await route.fulfill({ body: JSON.stringify(updatedPerson) });
  });
  await page.route("http://localhost:3000/api/person/123", async (route) => {
    await route.fulfill({ body: JSON.stringify(person) });
  });
  await page.goto(`${BASE_URL}/persons/123/base`);

  const firstNameInput = page.getByLabel("Vorname").nth(0);
  await firstNameInput.fill("Jane");

  const saveButton = page.locator(".fa-save");
  await saveButton.click();

  await expect(page.getByText(getFullName(updatedPerson))).toBeVisible();
});

test("should delete a person", async ({ page }) => {
  const person: Person = {
    id: "123",
    firstName: "John",
    lastName: "Doe",
    title: "",
    gender: "",
    member: false,
    extern: false,
    current: true,
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
    retirement: undefined,
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
    loanEnd: undefined,
    emailExtension: false,
    emailExtensionEnd: undefined,
    newsletter: false,
    calculatedVteSum: 0,
    calculatedEmploymentEnd: undefined,
    comment: "",
  };

  await page.route("**/persons/*", async (route) => {
    await route.fulfill({ body: JSON.stringify(person) });
  });
  await page.route("**/persons/123", async (route) => {
    await route.fulfill({ body: JSON.stringify({}) });
  });
  await page.route("http://localhost:3000/api/person/123", async (route) => {
    await route.fulfill({ body: JSON.stringify(person) });
  });
  await page.goto(`${BASE_URL}/persons/123/overview`);

  const deleteButton = page.locator(".fa-trash");
  await deleteButton.click();

  const deleteModalButton = page.getByRole("button", { name: "Löschen" });
  await deleteModalButton.click();

  await expect(page.getByText("Personen").nth(0)).toBeVisible();
});

test("should add a person from persons overview and navigate to the new person", async ({
  page,
}) => {
  const newPerson: Person = {
    id: "456",
    firstName: "New",
    lastName: "Person",
    title: "",
    gender: "",
    member: false,
    extern: false,
    current: true,
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
    retirement: undefined,
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
    loanEnd: undefined,
    emailExtension: false,
    emailExtensionEnd: undefined,
    newsletter: false,
    calculatedVteSum: 0,
    calculatedEmploymentEnd: undefined,
    comment: "",
  };

  await page.route(`${BASE_URL}/persons/count`, async (route) => {
    await route.fulfill({ body: JSON.stringify(0) });
  });
  await page.route(
    `${BASE_URL}/persons?current=true&select=true`,
    async (route) => {
      await route.fulfill({ body: JSON.stringify([]) });
    }
  );
  await page.route(
    `${BASE_URL}/persons?current=true&select=true`,
    async (route) => {
      await route.fulfill({ body: JSON.stringify([newPerson]) });
    }
  );
  await page.route("http://localhost:3000/api/person", async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route("http://localhost:3000/api/institute", async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route("http://localhost:3000/api/person/count", async (route) => {
    await route.fulfill({ body: JSON.stringify(0) });
  });
  await page.goto(`${BASE_URL}/persons`);

  const addPersonButton = page.getByRole("button", {
    name: "Neue Person hinzufügen",
  });
  await addPersonButton.click();

  const lastNameInput = page.getByLabel("Name (erforderlich)");
  await lastNameInput.fill(newPerson.lastName);

  const saveButton = page.getByRole("button", { name: "Speichern" });
  await saveButton.click();

  await expect(page.getByText(getFullName(newPerson))).toBeVisible();
});

test("should add an institute from the institute card and update the person", async ({
  page,
}) => {
  const person: Person = {
    id: "123",
    firstName: "John",
    lastName: "Doe",
    title: "",
    gender: "",
    member: false,
    extern: false,
    current: true,
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
    retirement: undefined,
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
    loanEnd: undefined,
    emailExtension: false,
    emailExtensionEnd: undefined,
    newsletter: false,
    calculatedVteSum: 0,
    calculatedEmploymentEnd: undefined,
    comment: "",
  };
  const updatedPerson: Person = {
    id: "123",
    firstName: "John",
    lastName: "Doe",
    title: "",
    gender: "",
    member: false,
    extern: false,
    current: true,
    former: false,
    roomNumber: "",
    emailWork: "",
    phoneWork: "",
    certificate: false,
    rank: "",
    instituteId: "789",
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
    retirement: undefined,
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
    loanEnd: undefined,
    emailExtension: false,
    emailExtensionEnd: undefined,
    newsletter: false,
    calculatedVteSum: 0,
    calculatedEmploymentEnd: undefined,
    comment: "",
  };
  const institute: Institute = {
    id: "789",
    name: "New Institute",
    acronym: "",
    street: "",
    streetNo: "",
    additional: "",
    plz: "",
    town: "",
    country: "",
    parentId: undefined,
    phone: "",
    email: "",
    costCenter: undefined,
    website: "",
    comment: "",
  };
  const instituteTriplet: Triplet = { id: "789", long: "New Institute" };

  await page.route("**/persons/*", async (route) => {
    await route.fulfill({ body: JSON.stringify(person) });
  });
  await page.route("**/persons/123", async (route) => {
    await route.fulfill({ body: JSON.stringify(updatedPerson) });
  });
  await page.route("**/institutes*", async (route) => {
    await route.fulfill({ body: JSON.stringify([institute]) });
  });
  await page.route("**/institutes/789", async (route) => {
    await route.fulfill({ body: JSON.stringify(institute) });
  });
  await page.route("http://localhost:3000/api/person/123", async (route) => {
    await route.fulfill({ body: JSON.stringify(person) });
  });
  await page.route("http://localhost:3000/api/person", async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route("http://localhost:3000/api/institute", async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.goto(`${BASE_URL}/persons/123/base`);

  const instituteDropdown = page.getByRole("combobox", {
    name: "Organisation",
  });
  await instituteDropdown.click();
  await page.getByRole("option", { name: "New Institute" }).click();

  const saveButton = page.getByRole("button", { name: "Speichern" });
  await saveButton.click();

  await expect(page.getByText(getFullName(updatedPerson))).toBeVisible();
});
