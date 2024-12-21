import { test, expect } from '@playwright/test';

test('Create fire brigade', async ({ page }) => {
  test.setTimeout(15000);

  // Mock HTTP requests
  await page.route(
    'http://localhost:3000/fire-brigade/address/all',
    async (route) => {
      await route.fulfill({ body: JSON.stringify({ addresses: [] }) });
    }
  );
  await page.route('http://localhost:3000/fire-brigade', async (route) => {
    const response = [
      {
        id: '1',
        name: 'Test Feuerwehr',
        address: 'Teststraße 1, 12345 Testort',
        state: 'Hessen',
        district: 'Schwalm-Eder-Kreis',
        created: true,
        voluntary: true,
        deployments: 0,
        members: 0,
        confirmations: [],
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });

  await page.goto('http://localhost:4200/searchFireBrigade');

  // Click on "Neue Feuerwehr erstellen" button
  await page.getByRole('button', { name: 'Neue Feuerwehr erstellen' }).click();

  // Fill in the form
  await page.getByPlaceholder('Name').fill('Test Feuerwehr');
  await page.getByRole('button', { name: 'Bundesland' }).click();
  await page.getByRole('menuitem', { name: 'Hessen' }).click();
  await page.getByPlaceholder('Straße').fill('Teststraße');
  await page.getByPlaceholder('Hausnummer').fill('1');
  await page.getByPlaceholder('Postleitzahl').fill('12345');
  await page.getByPlaceholder('Ort').fill('Testort');
  await page.getByRole('button', { name: 'Art' }).click();
  await page.getByRole('menuitem', { name: 'Freiwillig' }).click();
  await page.getByRole('button', { name: 'Landkreis' }).click();
  await page.getByRole('menuitem', { name: 'Schwalm-Eder-Kreis' }).click();

  // Click on "Neue Feuerwehr erstellen" button
  await page.getByRole('button', { name: 'Neue Feuerwehr erstellen' }).click();

  // Assertions
  await expect(page.getByText('Test Feuerwehr')).toBeVisible();
});

test('Search for fire brigade', async ({ page }) => {
  test.setTimeout(15000);
  await page.goto('http://localhost:4200/searchFireBrigade');
  await expect(page.getByText('Alle Feuerwehren')).toBeVisible();
});

test('Go to Overview', async ({ page }) => {
  test.setTimeout(15000);
  await page.goto('http://localhost:4200/overview');
  // Add assertions here based on what you expect to see on the overview page
  await expect(page.getByText('Willkommen zurück')).toBeVisible(); // Example assertion
});

test('Join fire brigade', async ({ page }) => {
  test.setTimeout(15000);
  // Mock necessary routes for joining a firebrigade.  This will depend on your backend implementation.
  await page.route('http://localhost:3000/fire-brigade', async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          id: '1',
          name: 'Test Feuerwehr',
          address: 'Teststraße 1, 12345 Testort',
          state: 'Hessen',
          district: 'Schwalm-Eder-Kreis',
          created: true,
          voluntary: true,
          deployments: 0,
          members: 0,
          confirmations: [],
        },
      ]),
    });
  });
  await page.route('http://localhost:3000/fire-brigade/join', async (route) => {
    await route.fulfill({ status: 200 });
  });

  await page.goto('http://localhost:4200/searchFireBrigade');
  await page.getByRole('cell', { name: 'Test Feuerwehr' }).click();
  await page.getByRole('button', { name: 'Beitreten' }).click();
  // Add assertions to check for successful join, e.g., a success message, redirection, etc.
  await expect(page.getByText('Beitrittsanfrage gestellt')).toBeVisible(); // Example assertion
});

test('Confirm fire brigade request', async ({ page }) => {
  test.setTimeout(15000);
  const confirmations = ['testuser'];
  // Mock necessary routes for confirming a fire brigade request.  Adjust URLs and responses as needed.
  await page.route('http://localhost:3000/fire-brigade', async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          id: '2',
          name: 'Another Fire Brigade',
          created: false,
          confirmations: confirmations,
        },
      ]),
    });
  });
  await page.route(
    'http://localhost:3000/fire-brigade/confirm',
    async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ joined: false }),
      });
    }
  );

  await page.goto('http://localhost:4200/searchFireBrigade');
  await page.getByRole('cell', { name: 'Another Fire Brigade' }).click();
  await page.getByRole('button', { name: 'Bestätigen 1/3' }).click();
  confirmations.push('anothertestuser');
  // Add assertions to verify the confirmation, e.g., updated confirmation count, success message
  await expect(page.getByText('Bestätigen 2/3')).toBeVisible(); // Example assertion - check updated count
});
