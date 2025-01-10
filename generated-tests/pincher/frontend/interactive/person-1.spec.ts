import { test, expect } from "@playwright/test";
import { Arrangement } from "src/app/core/model/arrangement";
import { CommitteeEntry } from "src/app/core/model/committee/committee-entry";
import { Contract } from "src/app/core/model/contract";
import { ContractType } from "src/app/core/model/contract/contract-type";
import { Institute } from "src/app/core/model/institute";
import { Membership } from "src/app/core/model/membership";
import { Person } from "src/app/core/model/person";
import { Relationship } from "src/app/core/model/relationship";
import { Tag } from "src/app/core/model/tag";
import { Workdays } from "src/app/core/model/contract/workday.enum";
import { Triplet } from "src/app/core/model/utils/triplet";

test.setTimeout(15000);

test("End-to-End Test for Person Overview", async ({ page }) => {
  // Mock all necessary HTTP requests
  const personResponse: Person = {
    id: "123",
    firstName: "Max",
    lastName: "Mustermann",
    title: "Dr.",
    gender: "männlich",
    member: true,
    extern: false,
    current: true,
    roomNumber: "123",
    emailWork: "max.mustermann@example.com",
    phoneWork: "123456789",
    calculatedVteSum: 100,
    calculatedEmploymentEnd: new Date(),
    instituteId: "456",
    subInstituteId: "789",
    teamIds: ["101"],
    workdays: [
      Workdays.monday,
      Workdays.tuesday,
      Workdays.wednesday,
      Workdays.thursday,
      Workdays.friday,
    ],
    qualification: ["Promotion"],
    sciTimeVGs: [],
    comment: "Testperson",
    thesis: null,
    habilitation: null,
    professorship: null,
  };
  await page.route("*/api/persons/123", async (route) => {
    await route.fulfill({ body: JSON.stringify(personResponse) });
  });

  const instituteResponse: Institute = {
    id: "456",
    name: "Example Institute",
    street: "Example Street",
    streetNo: "1",
    additional: "Building A",
    plz: "12345",
    town: "Example City",
    country: "Germany",
    parentId: undefined,
    phone: "987654321",
    email: "institute@example.com",
    costCenter: 1234,
    website: "https://example.com",
    comment: "Example Institute comment",
  };
  await page.route("http://localhost:3000/api/institute/456", async (route) => {
    await route.fulfill({ body: JSON.stringify(instituteResponse) });
  });

  const subInstituteResponse: Institute = {
    id: "789",
    name: "Example Subinstitute",
    parentId: "456",
    street: "Substreet",
    town: "Subcity",
    country: "Germany",
  };
  await page.route("*/api/institutes/789", async (route) => {
    await route.fulfill({ body: JSON.stringify(subInstituteResponse) });
  });

  // ... other mock routes ...

  await page.route("http://localhost:3000/api/person/123", async (route) => {
    await route.fulfill({ body: JSON.stringify(personResponse) });
  });

  // Navigate to the person overview page
  await page.goto("http://localhost:4200/persons/123/overview");

  // Assertions
  await expect(page.getByText("Max Mustermann").nth(0)).toBeVisible();
  await expect(page.getByText("Dr. Max Mustermann (m)").nth(0)).toBeVisible();
  await expect(page.getByText("Adresse").nth(0)).toBeVisible();
  await expect(page.getByText("Example Institute").nth(0)).toBeVisible();
  await expect(page.getByText("Example Street").nth(0)).toBeVisible();
  await expect(page.getByText("Example City").nth(0)).toBeVisible();
  await expect(page.getByText("Bemerkung").nth(0)).toBeVisible();
  await expect(page.getByText("Testperson").nth(0)).toBeVisible();
});

test("End-to-End Test for Persons List", async ({ page }) => {
  const personsResponse: Person[] = [
    {
      id: "1",
      firstName: "Max",
      lastName: "Mustermann",
      title: "Dr.",
      gender: "männlich",
      member: true,
      extern: false,
      current: true,
      roomNumber: "123",
      emailWork: "max.mustermann@example.com",
      phoneWork: "123456789",
      calculatedVteSum: 100,
      calculatedEmploymentEnd: new Date(),
      instituteId: "456",
      subInstituteId: "789",
      teamIds: ["101"],
      workdays: [
        Workdays.monday,
        Workdays.tuesday,
        Workdays.wednesday,
        Workdays.thursday,
        Workdays.friday,
      ],
      qualification: ["Promotion"],
      sciTimeVGs: [],
      comment: "Testperson",
      thesis: null,
      habilitation: null,
      professorship: null,
    },
    {
      id: "2",
      firstName: "Jane",
      lastName: "Doe",
      title: "Dr.",
      gender: "weiblich",
      member: true,
      extern: false,
      current: true,
      roomNumber: "123",
      emailWork: "jane.doe@example.com",
      phoneWork: "987654321",
      calculatedVteSum: 100,
      calculatedEmploymentEnd: new Date(),
      instituteId: "456",
      subInstituteId: "789",
      teamIds: ["101"],
      workdays: [
        Workdays.monday,
        Workdays.tuesday,
        Workdays.wednesday,
        Workdays.thursday,
        Workdays.friday,
      ],
      qualification: ["Promotion"],
      sciTimeVGs: [],
      comment: "Testperson",
      thesis: null,
      habilitation: null,
      professorship: null,
    },
  ];
  const committeePairs: Triplet[] = [
    { id: "1", short: "Committee A" },
    { id: "2", short: "Committee B" },
  ];
  const countResponse = 2;

  await page.route("http://localhost:3000/api/person?*", async (route) => {
    await route.fulfill({ body: JSON.stringify(personsResponse) });
  });
  await page.route("*/api/committees", async (route) => {
    await route.fulfill({ body: JSON.stringify(committeePairs) });
  });
  await page.route("http://localhost:3000/api/person/count*", async (route) => {
    await route.fulfill({ body: JSON.stringify(countResponse) });
  });

  await page.goto("http://localhost:4200/persons");

  await expect(page.getByText("2 Personen").nth(0)).toBeVisible();
  await expect(page.getByText("Mustermann").nth(0)).toBeVisible();
  await expect(page.getByText("Doe").nth(0)).toBeVisible();
});

test("End-to-End Test for Person Base", async ({ page }) => {
  const personResponse: Person = {
    id: "123",
    firstName: "Max",
    lastName: "Mustermann",
    title: "Dr.",
    gender: "männlich",
    member: true,
    extern: false,
    current: true,
    roomNumber: "123",
    emailWork: "max.mustermann@example.com",
    phoneWork: "123456789",
    calculatedVteSum: 100,
    calculatedEmploymentEnd: new Date(),
    instituteId: "456",
    subInstituteId: "789",
    teamIds: ["101"],
    workdays: [
      Workdays.monday,
      Workdays.tuesday,
      Workdays.wednesday,
      Workdays.thursday,
      Workdays.friday,
    ],
    qualification: ["Promotion"],
    sciTimeVGs: [],
    comment: "Testperson",
    thesis: null,
    habilitation: null,
    professorship: null,
  };

  await page.route("http://localhost:3000/api/person/123", async (route) => {
    await route.fulfill({ body: JSON.stringify(personResponse) });
  });
  await page.goto("http://localhost:4200/persons/123/base");
  await expect(page.getByLabel("Titel").nth(0)).toBeVisible();
  await expect(page.getByLabel("Vorname").nth(0)).toBeVisible();
  await expect(page.getByLabel("Name").nth(0)).toBeVisible();
  await expect(page.getByLabel("Geburtsname").nth(0)).toBeVisible();
});

test("Add Person and Save", async ({ page }) => {
  const newPersonResponse: Person = {
    id: "456",
    firstName: "New",
    lastName: "Person",
    title: "Mr.",
    gender: "male",
    member: false,
    extern: false,
    current: false,
    roomNumber: "",
    emailWork: "new.person@example.com",
    phoneWork: "",
    calculatedVteSum: 0,
    calculatedEmploymentEnd: undefined,
    instituteId: null,
    subInstituteId: null,
    teamIds: [],
    workdays: [],
    qualification: [],
    sciTimeVGs: [],
    comment: "",
    thesis: null,
    habilitation: null,
    professorship: null,
  };
  const countResponse = 3;

  await page.route("http://localhost:3000/api/person?*", async (route) => {
    await route.fulfill({ body: JSON.stringify([newPersonResponse]) });
  });
  await page.route("http://localhost:3000/api/person/456", async (route) => {
    await route.fulfill({ body: JSON.stringify(newPersonResponse) });
  });
  await page.route("http://localhost:3000/api/person/count*", async (route) => {
    await route.fulfill({ body: JSON.stringify(countResponse) });
  });
  await page.route("http://localhost:3000/api/person", async (route) => {
    await route.fulfill({ body: JSON.stringify(newPersonResponse) });
  }); //added

  await page.goto("http://localhost:4200/persons");
  await page.getByRole("button", { name: "+" }).click();
  await page
    .locator("app-p-switch")
    .filter({ hasText: "Männlich" })
    .locator("label span")
    .click();
  await page.getByPlaceholder(/z\.B\. Maxi/i).fill("New");
  await page.getByPlaceholder(/z\.B\. Mustermann/i).fill("Person");
  await page.getByRole("button", { name: "Neue Person" }).click();
  await page.getByRole("button", { name: /Speichern/i }).click();
  await expect(page.getByText("New Person")).toBeVisible();

  //check if new person is saved

  await expect(page.getByLabel("Titel")).toHaveValue("Mr.");
  await expect(page.getByPlaceholder(/z\.B\. Maxi/i)).toHaveValue("New");
  await expect(page.getByPlaceholder(/z\.B\. Mustermann/i)).toHaveValue(
    "Person"
  );
});
