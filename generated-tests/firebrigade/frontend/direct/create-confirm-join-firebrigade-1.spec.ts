import { test, expect } from '@playwright/test';
import Constants from 'src/util/constants';

test.setTimeout(15000);

test('Create fire brigade', async ({ page }) => {
  await page.route('http://localhost:3000/users/*', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: {
          userId: 'testuser',
          name: 'Test User;Test',
          position: 'Wehrleiter/in',
          profilePicture: null,
        },
        termsOfRightsActual: true,
      }),
    });
  });
  await page.route('http://localhost:3000/fire-brigade/*', async (route) => {
    await route.fulfill({
      body: JSON.stringify({ name: 'Test Fire Brigade' }),
    });
  });
  await page.route(
    'http://localhost:3000/fire-brigade/address/all',
    async (route) => {
      await route.fulfill({ body: JSON.stringify({ addresses: [] }) });
    }
  );
  await page.route('http://localhost:3000/fire-brigade', async (route) => {
    await route.fulfill({ body: JSON.stringify({}) });
  });

  await page.goto('http://localhost:4200/createFireBrigade');

  const nameInput = page.getByPlaceholder('Name');
  await nameInput.fill('Test Fire Brigade');

  const typeDropdown = page.getByRole('button', { name: 'Art' });
  await typeDropdown.click();
  const typeMenuItem = page.getByRole('menuitem', {
    name: Constants.VOLUNTARY_STRING,
  });
  await typeMenuItem.click();

  const streetInput = page.getByPlaceholder('Straße');
  await streetInput.fill('Test Street');

  const houseNumberInput = page.getByPlaceholder('Hausnummer');
  await houseNumberInput.fill('1');

  const postalCodeInput = page.getByPlaceholder('Postleitzahl');
  await postalCodeInput.fill('12345');

  const placeInput = page.getByPlaceholder('Ort');
  await placeInput.fill('Test City');

  const stateDropdown = page.getByRole('button', {
    name: Constants.STATE_STRING,
  });
  await stateDropdown.click();
  const stateMenuItem = page.getByRole('menuitem', { name: 'Hessen' });
  await stateMenuItem.click();

  const districtDropdown = page.getByRole('button', { name: 'Landkreis' });
  await districtDropdown.click();
  const districtMenuItem = page.getByRole('menuitem', {
    name: 'Schwalm-Eder-Kreis',
  });
  await districtMenuItem.click();

  const createButton = page.getByRole('button', {
    name: 'Neue Feuerwehr erstellen',
  });
  await createButton.click();

  await expect(
    page.getByRole('button', { name: 'Neue Feuerwehr erstellen' })
  ).toBeVisible();
});

test('Join fire brigade', async ({ page }) => {
  await page.route('http://localhost:3000/users/*', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: {
          userId: 'testuser',
          name: 'Test User;Test',
          position: 'Feuerwehrmann/frau',
          profilePicture: null,
        },
        termsOfRightsActual: true,
      }),
    });
  });
  await page.route('http://localhost:3000/fire-brigade', async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          id: 'testfirebrigade',
          name: 'Test Fire Brigade',
          address: 'Test Address',
          state: 'Hessen',
          district: 'Schwalm-Eder-Kreis',
          created: true,
          voluntary: true,
          members: 10,
          deployments: 5,
        },
      ]),
    });
  });
  await page.route(
    'http://localhost:3000/fire-brigade/confirm',
    async (route) => {
      await route.fulfill({ body: JSON.stringify({ joined: false }) });
    }
  );
  await page.route('http://localhost:3000/fire-brigade/join', async (route) => {
    await route.fulfill({ body: JSON.stringify({}) });
  });

  await page.goto('http://localhost:4200/searchFireBrigade');

  const listItem = page.getByText('Test Fire Brigade, Test Address').nth(0);
  await listItem.click();

  const joinButton = page.getByRole('button', { name: Constants.JOIN_STRING });
  await joinButton.click();

  await expect(
    page.getByRole('button', { name: 'Beitrittsanfrage gestellt' })
  ).toBeVisible();
});

test('Create and confirm fire brigade', async ({ page }) => {
  await page.route('http://localhost:3000/users/*', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: {
          userId: 'testuser',
          name: 'Test User;Test',
          position: 'Wehrleiter/in',
          profilePicture: null,
        },
        termsOfRightsActual: true,
      }),
    });
  });
  await page.route(
    'http://localhost:3000/fire-brigade/address/all',
    async (route) => {
      await route.fulfill({ body: JSON.stringify({ addresses: [] }) });
    }
  );
  await page.route('http://localhost:3000/fire-brigade', async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route(
    'http://localhost:3000/fire-brigade/confirm',
    async (route) => {
      await route.fulfill({ body: JSON.stringify({ joined: true }) });
    }
  );
  await page.route('http://localhost:3000/fire-brigade', async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          id: 'testfirebrigade',
          name: 'Test Fire Brigade',
          address: 'Test Address',
          state: 'Hessen',
          district: 'Schwalm-Eder-Kreis',
          created: false,
          voluntary: true,
          confirmations: [],
          creator: 'testuser',
        },
      ]),
    });
  });

  await page.goto('http://localhost:4200/createFireBrigade');

  //Fill out the form (same as in the 'Create fire brigade' test)
  const nameInput = page.getByPlaceholder('Name');
  await nameInput.fill('Test Fire Brigade');

  const typeDropdown = page.getByRole('button', { name: 'Art' });
  await typeDropdown.click();
  const typeMenuItem = page.getByRole('menuitem', {
    name: Constants.VOLUNTARY_STRING,
  });
  await typeMenuItem.click();

  const streetInput = page.getByPlaceholder('Straße');
  await streetInput.fill('Test Street');

  const houseNumberInput = page.getByPlaceholder('Hausnummer');
  await houseNumberInput.fill('1');

  const postalCodeInput = page.getByPlaceholder('Postleitzahl');
  await postalCodeInput.fill('12345');

  const placeInput = page.getByPlaceholder('Ort');
  await placeInput.fill('Test City');

  const stateDropdown = page.getByRole('button', {
    name: Constants.STATE_STRING,
  });
  await stateDropdown.click();
  const stateMenuItem = page.getByRole('menuitem', { name: 'Hessen' });
  await stateMenuItem.click();

  const districtDropdown = page.getByRole('button', { name: 'Landkreis' });
  await districtDropdown.click();
  const districtMenuItem = page.getByRole('menuitem', {
    name: 'Schwalm-Eder-Kreis',
  });
  await districtMenuItem.click();

  const createButton = page.getByRole('button', {
    name: 'Neue Feuerwehr erstellen',
  });
  await createButton.click();

  await expect(
    page.getByRole('button', { name: 'Neue Feuerwehr erstellen' })
  ).toBeVisible();

  const listItem = page.getByText('Test Fire Brigade, Test Address').nth(0);
  await listItem.click();

  const confirmButton = page.getByRole('button', { name: `Bestätigen 0/3` });
  await confirmButton.click();

  await expect(page.getByText('Aktuelle Mitgliedszahlen')).toBeVisible();
});
