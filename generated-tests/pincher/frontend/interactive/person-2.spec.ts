import { test, expect } from "@playwright/test";
import { Workdays } from "src/app/core/model/contract/workday.enum";
import { Person, PersonFilterDto } from "src/app/core/model/person";
import { Triplet } from "src/app/core/model/utils/triplet";

test.setTimeout(15000);

test("Display Person Data", async ({ page }) => {
  const personResponse: Person = {
    id: "123",
    firstName: "Max",
    lastName: "Mustermann",
    title: "Dr.",
    gender: "male",
    member: true,
    extern: false,
    current: true,
    former: false,
    roomNumber: "123",
    emailWork: "max.mustermann@example.com",
    phoneWork: "123456789",
    certificate: false,
    rank: "Professor",
    instituteId: "sampleInstituteId",
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
    workdays: [
      Workdays.monday,
      Workdays.tuesday,
      Workdays.wednesday,
      Workdays.thursday,
      Workdays.friday,
    ],
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
    calculatedVteSum: 100,
    calculatedEmploymentEnd: new Date(),
    comment: "",
  };

  await page.route("**/api/person/123/overview", async (route) => {
    await route.fulfill({ body: JSON.stringify(personResponse) });
  });
  await page.route("**/api/person/123", async (route) => {
    await route.fulfill({ body: JSON.stringify(personResponse) });
  });
  await page.route("**/api/person/123/base", async (route) => {
    await route.fulfill({ body: JSON.stringify(personResponse) });
  });

  await page.goto("http://localhost:4200/persons/123/overview");

  await expect(page.getByText("Dr. Max Mustermann (d)")).toBeVisible();
  await expect(page.getByText("123", { exact: true })).toBeVisible();
  await expect(page.getByText("max.mustermann@example.com")).toBeVisible();
  await expect(page.getByText("123456789")).toBeVisible();
});

test("Showing Persons", async ({ page }) => {
  const person1: Person = {
    id: "456",
    firstName: "Jane",
    lastName: "Doe",
    emailWork: "jane.doe@example.com",
    member: true,
    extern: false,
    current: true,
    former: false,
    calculatedVteSum: 100,
    calculatedEmploymentEnd: new Date(),
    comment: "",
    title: "",
    gender: "",
    roomNumber: "",
    certificate: false,
    rank: "",
    instituteId: "",
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
    phoneWork: "",
  };
  const person2: Person = {
    id: "789",
    firstName: "John",
    lastName: "Smith",
    emailWork: "john.smith@example.com",
    current: false,
    member: true,
    extern: false,
    former: false,
    calculatedVteSum: 100,
    calculatedEmploymentEnd: new Date(),
    comment: "",
    title: "",
    gender: "",
    roomNumber: "",
    certificate: false,
    rank: "",
    instituteId: "",
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
    phoneWork: "",
  };
  const personsResponse: Person[] = [person1, person2];

  const committeeResponse: Triplet[] = [
    { id: "committeeId", short: "Committee Name" },
  ];

  const url = "http://localhost:4200/persons?current=true";

  await page.route("**/api/person/count*", async (route) => {
    await route.fulfill({ body: JSON.stringify(2) });
  });

  await page.route("**/api/person*", async (route) => {
    await route.fulfill({ body: JSON.stringify(personsResponse) });
  });

  await page.route("**/api/committee", async (route) => {
    await route.fulfill({ body: JSON.stringify(committeeResponse) });
  });

  await page.goto(url);

  await expect(page.getByText("jane.doe@example.com")).toBeVisible();
  await expect(page.getByText("john.smith@example.com")).toBeVisible();
});

test("Add and Save Person", async ({ page }) => {
  const newPerson: Person = {
    id: "newPersonId",
    firstName: "New",
    lastName: "Person",
    emailWork: "new.person@example.com",
    member: true,
    extern: false,
    current: true,
    former: false,
    calculatedVteSum: 100,
    calculatedEmploymentEnd: new Date(),
    comment: "",
    title: "",
    gender: "",
    roomNumber: "",
    certificate: false,
    rank: "",
    instituteId: "",
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
    workdays: [Workdays.monday],
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
    phoneWork: "",
  };

  await page.route("**/api/person/count*", async (route) => {
    await route.fulfill({ body: JSON.stringify(2) });
  });

  await page.route("**/api/person", async (route) => {
    await route.fulfill({
      body: JSON.stringify(newPerson),
    });
  });
  await page.route("**/api/person?*", async (route) => {
    await route.fulfill({
      body: JSON.stringify([newPerson]),
    });
  });
  await page.route(
    "http://localhost:3000/api/person/newPersonId",
    async (route) => {
      await route.fulfill({ body: JSON.stringify(newPerson) });
    }
  );

  await page.goto("http://localhost:4200/persons");

  await page.getByRole("button", { name: "+" }).click();

  await page.getByPlaceholder("z.B. Maxi").fill(newPerson.firstName + "");
  await page.getByPlaceholder("z.B. Mustermann").fill(newPerson.lastName);

  await page.getByRole("button", { name: "Neue Person" }).click();

  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(page.getByText(newPerson.firstName + "").nth(0)).toBeVisible();
  await expect(page.getByText(newPerson.lastName).nth(0)).toBeVisible();
});
