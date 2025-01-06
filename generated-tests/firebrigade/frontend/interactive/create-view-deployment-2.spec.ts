import { test, expect } from '@playwright/test';
test.setTimeout(15000);

test('Add deployment', async ({ page }) => {
  await page.route('http://localhost:3000/users', async (route) => {
    const response = [
      { userId: '1', name: 'Max Mustermann;Max', fireBrigade: '1' },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });

  await page.route(
    'http://localhost:3000/deployments/add-deployment',
    async (route) => {
      const response = { deploymentId: '1' };
      await route.fulfill({ body: JSON.stringify(response) });
    }
  );

  await page.route('http://localhost:3000/deployments', async (route) => {
    const response = [
      {
        deploymentId: '1',
        date: new Date(),
        deploymentTitle: 'Test Deployment',
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });

  //Go to add deployment page
  await page.goto('http://localhost:4200/addDeployment');

  //Fill in form
  await page.getByPlaceholder('Kurztitel').fill('Test');
  await page.locator('input[type="datetime-local"]').fill('2024-03-10T10:30');
  await page.getByPlaceholder('Straße').fill('Musterstraße');
  await page.getByPlaceholder('Hausnummer').fill('1');
  await page.getByPlaceholder('Postleitzahl').fill('12345');
  await page.getByPlaceholder('Ort').fill('Musterstadt');
  await page.getByRole('button', { name: 'Keine Benutzer ausgewählt' }).click();
  //Select user from dropdown (needs adjustment based on your dropdown implementation)

  await page.locator('button:has-text("Max Mustermann")').click();
  await page.locator('.cdk-overlay-backdrop').click();

  await page
    .getByPlaceholder('Einsatzbeschreibung (max. 2000 Zeichen)')
    .fill('Testbeschreibung');

  //Submit form
  await page.getByRole('button', { name: 'Einsatzbericht erstellen' }).click();

  // Assertions
  await expect(page.getByText('Test Deployment')).toBeVisible(); // Adjusted assertion
});

test('View deployment', async ({ page }) => {
  await page.route('http://localhost:3000/deployments/1', async (route) => {
    const response = {
      deploymentId: '1',
      deploymentTitle: 'Test Deployment',
      date: new Date(),
      description: 'Test Description',
      location: 'Musterstraße 1, 12345 Musterstadt',
      involvedUsers: [{ name: 'Max Mustermann;Max' }],
    };
    await route.fulfill({ body: JSON.stringify(response) });
  });
  await page.goto('http://localhost:4200/deployment/1');
  await expect(page.getByText('Test Deployment')).toBeVisible();
});

test('Overview page', async ({ page }) => {
  await page.route('http://localhost:3000/deployments', async (route) => {
    const response = [
      {
        deploymentId: '1',
        date: new Date(),
        deploymentTitle: 'Test Deployment 1',
      },
      {
        deploymentId: '2',
        date: new Date(),
        deploymentTitle: 'Test Deployment 2',
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });
  await page.goto('http://localhost:4200/overview');
  await expect(page.getByText('Test Deployment 1')).toBeVisible();
  await expect(page.getByText('Test Deployment 2')).toBeVisible();
});
