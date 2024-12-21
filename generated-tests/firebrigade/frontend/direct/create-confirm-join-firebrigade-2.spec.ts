import { test, expect } from '@playwright/test';
import Constants from 'src/util/constants';

test.setTimeout(15000);

test('CreateFireBrigade: Successful fire brigade creation', async ({
  page,
}) => {
  const baseUrl = 'http://localhost:3000/';

  await page.route(`${baseUrl}users/*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: {
          userId: 'testUserId',
          name: 'Test User;Test Nachname',
          position: 'Wehrleiter/in',
          profilePicture: null,
        },
        termsOfRightsActual: true,
      }),
    });
  });

  await page.route(`${baseUrl}fire-brigade/address/all`, async (route) => {
    await route.fulfill({ body: JSON.stringify({ addresses: [] }) });
  });

  await page.route(`${baseUrl}fire-brigade`, async (route) => {
    await route.fulfill({ body: JSON.stringify({ affected: 1 }) });
  });

  await page.goto(`http://localhost:4200/createFireBrigade`);

  const nameInput = page.getByPlaceholder('Name');
  await nameInput.fill('Test Feuerwehr');

  const typeDropdown = page.getByRole('button', {
    name: Constants.TYPE_STRING,
  });
  await typeDropdown.click();
  const typeMenuItem = page.getByRole('menuitem', {
    name: Constants.VOLUNTARY_STRING,
  });
  await typeMenuItem.click();

  const streetInput = page.getByPlaceholder('Straße');
  await streetInput.fill('Teststraße');

  const houseNumberInput = page.getByPlaceholder('Hausnummer');
  await houseNumberInput.fill('1');

  const postalCodeInput = page.getByPlaceholder('Postleitzahl');
  await postalCodeInput.fill('12345');

  const placeInput = page.getByPlaceholder('Ort');
  await placeInput.fill('Testort');

  const stateDropdown = page.getByRole('button', {
    name: Constants.STATE_STRING,
  });
  await stateDropdown.click();
  const stateMenuItem = page.getByRole('menuitem', { name: 'Hessen' }).nth(0);
  await stateMenuItem.click();

  const districtDropdown = page.getByRole('button', { name: 'Landkreis' });
  await districtDropdown.click();
  const districtMenuItem = page
    .getByRole('menuitem', { name: 'Schwalm-Eder-Kreis' })
    .nth(0);
  await districtMenuItem.click();

  const createButton = page.getByRole('button', {
    name: 'Neue Feuerwehr erstellen',
  });
  await createButton.click();

  await expect(
    page.getByRole('button', { name: 'Neue Feuerwehr erstellen' }).nth(0)
  ).toBeVisible();
});

test('SearchFireBrigade: Successful fire brigade search', async ({ page }) => {
  const baseUrl = 'http://localhost:3000/';

  await page.route(`${baseUrl}users/*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: {
          userId: 'testUserId',
          name: 'Test User;Test Nachname',
          position: 'Feuerwehrmann/frau',
          profilePicture: null,
        },
        termsOfRightsActual: true,
      }),
    });
  });
  await page.route(`${baseUrl}fire-brigade`, async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          id: 'testFireBrigadeId',
          name: 'Test Feuerwehr',
          address: 'Teststraße 1, 12345 Testort',
          state: 'Hessen',
          district: 'Schwalm-Eder-Kreis',
          created: true,
          voluntary: true,
          deployments: 10,
          members: 20,
        },
      ]),
    });
  });

  await page.goto(`http://localhost:4200/searchFireBrigade`);

  const firstFireBrigade = page
    .getByText('Test Feuerwehr, Teststraße 1, 12345 Testort')
    .nth(0);
  await firstFireBrigade.click();

  await expect(page.locator('#name-label')).toContainText('Test Feuerwehr');
});

test('CreateFireBrigadeToSearchFireBrigade: Create and then search', async ({
  page,
}) => {
  const baseUrl = 'http://localhost:3000/';

  // Mock user info request
  await page.route(`${baseUrl}users/*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: {
          userId: 'testUserId',
          name: 'Test User;Test Nachname',
          position: 'Wehrleiter/in',
          profilePicture: null,
        },
        termsOfRightsActual: true,
      }),
    });
  });

  // Mock address check request
  await page.route(`${baseUrl}fire-brigade/address/all`, async (route) => {
    await route.fulfill({ body: JSON.stringify({ addresses: [] }) });
  });

  // Mock create fire brigade request
  await page.route(`${baseUrl}fire-brigade`, async (route) => {
    await route.fulfill({ body: JSON.stringify({ affected: 1 }) });
  });

  // Mock fire brigade list request for SearchFireBrigadeComponent
  await page.route(`${baseUrl}fire-brigade`, async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          id: 'newlyCreatedFireBrigade',
          name: 'Test Feuerwehr',
          address: 'Teststraße 1, 12345 Testort',
          state: 'Hessen',
          district: 'Schwalm-Eder-Kreis',
          created: true,
          voluntary: true,
          deployments: 0,
          members: 0,
        },
      ]),
    });
  });

  // Navigate to CreateFireBrigadeComponent and fill the form (similar to the first test)
  await page.goto(`http://localhost:4200/createFireBrigade`);
  const nameInput = page.getByPlaceholder('Name');
  await nameInput.fill('Test Feuerwehr');

  const typeDropdown = page.getByRole('button', {
    name: Constants.TYPE_STRING,
  });
  await typeDropdown.click();
  const typeMenuItem = page.getByRole('menuitem', {
    name: Constants.VOLUNTARY_STRING,
  });
  await typeMenuItem.click();

  const streetInput = page.getByPlaceholder('Straße');
  await streetInput.fill('Teststraße');

  const houseNumberInput = page.getByPlaceholder('Hausnummer');
  await houseNumberInput.fill('1');

  const postalCodeInput = page.getByPlaceholder('Postleitzahl');
  await postalCodeInput.fill('12345');

  const placeInput = page.getByPlaceholder('Ort');
  await placeInput.fill('Testort');

  const stateDropdown = page.getByRole('button', {
    name: Constants.STATE_STRING,
  });
  await stateDropdown.click();
  const stateMenuItem = page.getByRole('menuitem', { name: 'Hessen' }).nth(0);
  await stateMenuItem.click();

  const districtDropdown = page.getByRole('button', { name: 'Landkreis' });
  await districtDropdown.click();
  const districtMenuItem = page
    .getByRole('menuitem', { name: 'Schwalm-Eder-Kreis' })
    .nth(0);
  await districtMenuItem.click();

  const createButton = page.getByRole('button', {
    name: 'Neue Feuerwehr erstellen',
  });
  await createButton.click();

  // Assert that we are now on the SearchFireBrigadeComponent
  await expect(page.getByText('Neue Feuerwehr erstellen').nth(0)).toBeVisible();

  // Assert that the newly created fire brigade is present in the list
  await expect(
    page.getByText('Test Feuerwehr, Teststraße 1, 12345 Testort')
  ).toBeVisible();
});

test('SearchFireBrigadeToJoinFireBrigade: Join a fire brigade', async ({
  page,
}) => {
  const baseUrl = 'http://localhost:3000/';

  // Mock user info and fire brigade requests (similar to previous tests, adjust as needed)
  await page.route(`${baseUrl}users/*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: {
          userId: 'testUserId',
          name: 'Test User;Test Nachname',
          position: 'Feuerwehrmann/frau',
          profilePicture: null,
        },
        termsOfRightsActual: true,
      }),
    });
  });
  await page.route(`${baseUrl}fire-brigade`, async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          id: 'existingFireBrigade',
          name: 'Existing Fire Brigade',
          address: 'Existing Address',
          state: 'Hessen',
          district: 'Schwalm-Eder-Kreis',
          created: true,
          voluntary: true,
          deployments: 10,
          members: 20,
        },
      ]),
    });
  });

  await page.route(`${baseUrl}fire-brigade/join`, async (route) => {
    await route.fulfill({ status: 200 }); // Simulate successful join request
  });

  await page.goto(`http://localhost:4200/searchFireBrigade`);

  // Select a fire brigade and click the "Join" button
  const firstFireBrigade = page
    .getByText('Existing Fire Brigade, Existing Address')
    .nth(0);
  await firstFireBrigade.click();
  const joinButton = page.getByRole('button', { name: Constants.JOIN_STRING });
  await joinButton.click();

  // Assert that the button text has changed to "Beitrittsanfrage gestellt"
  await expect(page.getByText(Constants.REQUEST_SENT_STRING)).toBeVisible();
});
