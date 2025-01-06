import { test, expect } from '@playwright/test';
import Appointment from 'src/model/appointment';
import BlackBoardEntry from 'src/model/blackBoardEntry';
import { environment } from 'src/environments/environment';
import Constants from 'src/util/constants';
import User from 'src/model/user';

test.setTimeout(15000);

test('overview page displays deployments', async ({ page }) => {
  const mockDeployments = [
    {
      deploymentId: '1',
      date: new Date().toISOString(),
      deploymentTitle: 'Einsatz 1',
    },
    {
      deploymentId: '2',
      date: new Date().toISOString(),
      deploymentTitle: 'Einsatz 2',
    },
  ];
  await page.route(environment.baseurl + 'deployments', async (route) => {
    await route.fulfill({ body: JSON.stringify(mockDeployments) });
  });
  await page.route(environment.baseurl + 'users/*', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: {
          fireBrigade: {
            address: 'Musterstraße 1, 12345 Musterstadt',
            name: 'Muster Feuerwehr',
          },
        },
      }),
    });
  });
  await page.goto('http://localhost:4200/overview');
  const deploymentsTable = page.locator('#deployments-list');
  await expect(deploymentsTable).toBeVisible();
  const firstDeployment = deploymentsTable
    .locator('tbody tr:nth-child(1) td:nth-child(2)')
    .getByText('Einsatz 1');
  await expect(firstDeployment).toBeVisible();
});

test('calendar displays appointments', async ({ page }) => {
  const mockAppointments = [new Appointment()];
  await page.route(environment.baseurl + 'calendar/*', async (route) => {
    await route.fulfill({ body: JSON.stringify(mockAppointments) });
  });
  await page.goto('http://localhost:4200/overview');
  const calendar = page.locator('#calendar').nth(0);
  await expect(calendar).toBeVisible();
  const header = calendar.getByText('Deine Termine diese Woche');
  await expect(header).toBeVisible();
});

test('tasks component displays tasks', async ({ page }) => {
  const mockEntries = [new BlackBoardEntry()];
  await page.route(environment.baseurl + 'black-board/*', async (route) => {
    await route.fulfill({ body: JSON.stringify(mockEntries) });
  });
  await page.goto('http://localhost:4200/overview');
  const tasks = page.locator('#notes');
  await expect(tasks).toBeVisible();
  const header = tasks.getByText('Meine Tasks');
  await expect(header).toBeVisible();
});

test('navigate from overview to deployment details', async ({ page }) => {
  const mockDeployments = [
    {
      deploymentId: '123',
      date: new Date().toISOString(),
      deploymentTitle: 'Test Deployment',
    },
  ];
  await page.route(environment.baseurl + 'deployments', async (route) => {
    await route.fulfill({ body: JSON.stringify(mockDeployments) });
  });
  await page.route(environment.baseurl + 'users/*', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: {
          fireBrigade: {
            address: 'Musterstraße 1, 12345 Musterstadt',
            name: 'Muster Feuerwehr',
          },
        },
      }),
    });
  });
  await page.goto('http://localhost:4200/overview');

  const deploymentButton = page
    .locator('#deployments-list')
    .locator('tbody tr:nth-child(1)')
    .getByRole('cell', { name: 'Test Deployment' })
    .locator('mat-icon');
  await deploymentButton.click();

  await expect(page.getByText('Beschreibung des Einsatzes:')).toBeVisible();
});

test('navigate from overview to add deployment', async ({ page }) => {
  await page.route(environment.baseurl + 'users/*', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: {
          fireBrigade: {
            address: 'Musterstraße 1, 12345 Musterstadt',
            name: 'Muster Feuerwehr',
          },
        },
      }),
    });
  });
  await page.goto('http://localhost:4200/overview');
  const addDeploymentButton = page.getByRole('button', { name: 'Hinzufügen' });
  await addDeploymentButton.click();
  await expect(
    page.getByRole('heading', { name: 'Neuer Einsatzbericht' })
  ).toBeVisible();
});

test('overview page shows member count', async ({ page }) => {
  const mockUsers = [{ fireBrigade: '1' }, { fireBrigade: '1' }];
  await page.route(environment.baseurl + 'users', async (route) => {
    await route.fulfill({ body: JSON.stringify(mockUsers) });
  });
  await page.route(environment.baseurl + 'users/*', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: {
          fireBrigade: {
            address: 'Musterstraße 1, 12345 Musterstadt',
            name: 'Muster Feuerwehr',
          },
        },
      }),
    });
  });
  await page.goto('http://localhost:4200/overview');

  const memberCount = page.locator('.amount-of-users-container').getByText('2');
  await expect(memberCount).toBeVisible();
});

test('navigate from overview to member overview', async ({ page }) => {
  await page.route(environment.baseurl + 'users/*', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: {
          fireBrigade: {
            address: 'Musterstraße 1, 12345 Musterstadt',
            name: 'Muster Feuerwehr',
          },
        },
      }),
    });
  });
  await page.goto('http://localhost:4200/overview');
  const showMemberButton = page.getByRole('button', {
    name: 'Mitglieder anzeigen',
  });
  await showMemberButton.click();
  const nameElement = page.getByText('Name');
  await expect(nameElement).toBeVisible();
  const positionElement = page.getByText('Position');
  await expect(positionElement).toBeVisible();
});
