import { test, expect } from '@playwright/test';
import { environment } from 'src/environments/environment';

test('Add deployment', async ({ page }) => {
  await page.route(`${environment.baseurl}users`, async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        { userId: '1', name: 'Max Mustermann;Max', fireBrigade: '1' },
        { userId: '2', name: 'Anna Beispiel;Anna', fireBrigade: '1' },
      ]),
    });
  });

  await page.route(
    `${environment.baseurl}deployments/add-deployment`,
    async (route) => {
      await route.fulfill({ body: JSON.stringify({ deploymentId: '1' }) });
    }
  );

  await page.route(
    `${environment.baseurl}deployments/1/picture*`,
    async (route) => {
      await route.fulfill({ body: JSON.stringify({}) });
    }
  );
  await page.route(`${environment.baseurl}deployments`, async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          deploymentId: '1',
          deploymentTitle: 'Test Deployment',
          date: '2024-03-01T12:00:00.000Z',
        },
      ]),
    });
  });
  await page.route(`${environment.baseurl}users/1`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: { fireBrigade: { address: 'Test Address' } },
      }),
    });
  });

  await page.goto('http://localhost:4200/overview');

  const addDeploymentButton = page.getByRole('button', { name: 'Hinzufügen' });
  await addDeploymentButton.click();

  const shortTitleInput = page.getByPlaceholder('Kurztitel');
  await shortTitleInput.fill('Test');
  const dateInput = page.locator('input[type="datetime-local"]');
  await dateInput.fill('2024-03-10T10:00');
  const streetInput = page.getByPlaceholder('Straße');
  await streetInput.fill('Teststraße');
  const houseNumberInput = page.getByPlaceholder('Hausnummer');
  await houseNumberInput.fill('1');
  const postalCodeInput = page.getByPlaceholder('Postleitzahl');
  await postalCodeInput.fill('12345');
  const cityInput = page.getByPlaceholder('Ort');
  await cityInput.fill('Teststadt');
  const userSelectionButton = page.getByRole('button', {
    name: 'Keine Benutzer ausgewählt',
  });
  await userSelectionButton.click();
  const maxMustermann = page
    .getByRole('menuitem', { name: 'Max Mustermann' })
    .nth(0);
  await maxMustermann.click();
  const deploymentDescriptionInput = page.getByPlaceholder(
    'Einsatzbeschreibung (max. 2000 Zeichen)'
  );
  await deploymentDescriptionInput.fill('Testbeschreibung');
  await page.locator('.cdk-overlay-backdrop').click();
  const submitButton = page.getByRole('button', {
    name: 'Einsatzbericht erstellen',
  });
  await submitButton.click();

  await expect(page.getByText('Test Deployment')).toBeVisible();
});

test('View deployment', async ({ page }) => {
  await page.route(`${environment.baseurl}deployments/1`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        deploymentId: '1',
        deploymentTitle: 'Test',
        location: 'Teststraße;1;12345;Teststadt',
        description: 'Testbeschreibung',
        date: '2024-03-10T10:00:00.000Z',
        involvedUsers: [{ name: 'Max Mustermann;Max' }],
      }),
    });
  });
  await page.route(
    `${environment.baseurl}deployments/1/pictures`,
    async (route) => {
      await route.fulfill({ body: JSON.stringify([]) });
    }
  );

  await page.goto('http://localhost:4200/deployment/1');

  await expect(page.getByText('Test', { exact: true })).toBeVisible();
});

test('Overview to Deployment to Overview', async ({ page }) => {
  // Mock Overview requests
  await page.route(`${environment.baseurl}deployments`, async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          deploymentId: '1',
          deploymentTitle: 'Test Deployment',
          date: '2024-03-01T12:00:00.000Z',
        },
      ]),
    });
  });
  await page.route(`${environment.baseurl}users`, async (route) => {
    await route.fulfill({
      body: JSON.stringify([{ userId: '1', fireBrigade: '1' }]),
    });
  });
  await page.route(`${environment.baseurl}users/1`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: { fireBrigade: { address: 'Test Address' } },
      }),
    });
  });

  // Mock Deployment requests
  await page.route(`${environment.baseurl}deployments/1`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        deploymentId: '1',
        deploymentTitle: 'Test Deployment',
        location: 'Teststraße;1;12345;Teststadt',
        description: 'Testbeschreibung',
        date: '2024-03-10T10:00:00.000Z',
        involvedUsers: [{ name: 'Max Mustermann;Max' }],
      }),
    });
  });
  await page.route(
    `${environment.baseurl}deployments/1/pictures`,
    async (route) => {
      await route.fulfill({ body: JSON.stringify([]) });
    }
  );

  await page.goto('http://localhost:4200/overview');

  // Click on the deployment link
  const deploymentLink = page.getByRole('cell', { name: 'Test Deployment' });
  await deploymentLink.click();

  //Assert that the deployment page is loaded.
  await expect(page.getByText('Test Deployment')).toBeVisible();

  // Navigate back to overview (simulated by going back to overview url)
  await page.goto('http://localhost:4200/overview');

  // Assert that the overview page is loaded.
  await expect(page.getByText('Einsätze der letzten 2 Wochen')).toBeVisible();
});
