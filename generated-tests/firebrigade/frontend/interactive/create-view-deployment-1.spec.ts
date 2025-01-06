import { test, expect } from '@playwright/test';
test.setTimeout(15000);

test('Add deployment test', async ({ page }) => {
  await page.route('http://localhost:3000/users', async (route) => {
    const response = [
      { userId: '1', name: 'Test User;Test User', fireBrigade: '1' },
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
        deploymentTitle: 'Test Deployment',
        date: new Date().toISOString(),
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });

  await page.goto('http://localhost:4200/addDeployment');

  await page.fill('input[placeholder="Kurztitel"]', 'Test Deployment');
  await page.fill('input[type="datetime-local"]', '2024-03-10T10:30');
  await page.fill('input[placeholder="Straße"]', 'Test Street');
  await page.fill('input[placeholder="Hausnummer"]', '1');
  await page.fill('input[placeholder="Postleitzahl"]', '12345');
  await page.fill('input[placeholder="Ort"]', 'Test City');

  // Select user from dropdown
  await page.getByRole('button', { name: 'Keine Benutzer ausgewählt' }).click();
  const userButton = page.locator('button:has-text("Test User")');
  await userButton.click();
  await page.locator('.cdk-overlay-backdrop').click();

  await page
    .getByPlaceholder('Einsatzbeschreibung (max.')
    .fill('Test Description');

  await page.click('button:has-text("Einsatzbericht erstellen")');

  // Add assertions to verify successful deployment creation.  For example:
  await expect(page.getByText('Test Deployment')).toBeVisible();
});

test('View deployment test', async ({ page }) => {
  await page.route('http://localhost:3000/deployments/1', async (route) => {
    const response = {
      deploymentId: '1',
      deploymentTitle: 'Test Deployment',
      date: new Date().toISOString(),
      location: 'Test Street;1;12345;Test City',
      description: 'Test Description',
      involvedUsers: [{ name: 'Test User;Test User' }],
    };
    await route.fulfill({ body: JSON.stringify(response) });
  });
  await page.goto('http://localhost:4200/deployment/1');
  await expect(page.getByText('Test Deployment')).toBeVisible();
});

test('Overview test', async ({ page }) => {
  await page.route('http://localhost:3000/deployments', async (route) => {
    const response = [
      {
        deploymentId: '1',
        deploymentTitle: 'Test Deployment',
        date: new Date().toISOString(),
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });
  await page.goto('http://localhost:4200/overview');
  await expect(page.getByText('Test Deployment')).toBeVisible();
});
