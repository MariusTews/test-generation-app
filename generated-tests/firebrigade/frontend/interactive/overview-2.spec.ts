import { test, expect } from '@playwright/test';

test('Overview page displays correctly', async ({ page }) => {
  page.setDefaultTimeout(15000);

  await page.route('http://localhost:3000/calendar/*', async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route('http://localhost:3000/deployments', async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route('http://localhost:3000/users', async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route('http://localhost:3000/users/*', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: { fireBrigade: { address: 'Musterstraße 1, 12345 Musterstadt' } },
      }),
    });
  });
  await page.route('http://localhost:3000/black-board/*', async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });

  await page.goto('http://localhost:4200/overview');

  await expect(page.getByText('Einsätze der letzten 2 Wochen:')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Einsatz hinzufügen' })
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Hinzufügen' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Aktuelle Mitgliedszahlen' })
  ).toBeVisible();
  await expect(page.getByText('Meine Tasks')).toBeVisible();
  await expect(page.getByText('Deine Termine diese Woche')).toBeVisible();
});

test('Task is visible', async ({ page }) => {
  page.setDefaultTimeout(15000);
  await page.route('http://localhost:3000/calendar/*', async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route('http://localhost:3000/deployments', async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route('http://localhost:3000/users', async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route('http://localhost:3000/users/*', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: { fireBrigade: { address: 'Musterstraße 1, 12345 Musterstadt' } },
      }),
    });
  });
  await page.route('http://localhost:3000/black-board/*', async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          entryId: '1',
          title: 'Test Task',
          finished: false,
          assignedTo: { userId: '1', name: 'Max;Mustermann' },
        },
      ]),
    });
  });

  await page.goto('http://localhost:4200/overview');

  await expect(page.getByText('Test Task')).toBeVisible();
  await expect(page.getByText('Max Mustermann')).toBeVisible();
});

test('Calendar appointment is visible', async ({ page }) => {
  page.setDefaultTimeout(15000);
  await page.route('http://localhost:3000/calendar/*', async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          appointmentId: '1',
          date: '2025-01-05T10:00',
          description: 'Test Appointment',
        },
      ]),
    });
  });
  await page.route('http://localhost:3000/deployments', async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route('http://localhost:3000/users', async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route('http://localhost:3000/users/*', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: { fireBrigade: { address: 'Musterstraße 1, 12345 Musterstadt' } },
      }),
    });
  });
  await page.route('http://localhost:3000/black-board/*', async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });

  await page.goto('http://localhost:4200/overview');

  await expect(page.getByText('Test Appointment')).toBeVisible();
  await expect(page.getByText('05.01.2025, 10:00 Uhr')).toBeVisible();
});

test('Deployment is visible', async ({ page }) => {
  page.setDefaultTimeout(15000);
  await page.route('http://localhost:3000/calendar/*', async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route('http://localhost:3000/deployments', async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          deploymentId: '1',
          date: '2025-01-05',
          deploymentTitle: 'Test Deployment',
        },
      ]),
    });
  });
  await page.route('http://localhost:3000/users', async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route('http://localhost:3000/users/*', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: { fireBrigade: { address: 'Musterstraße 1, 12345 Musterstadt' } },
      }),
    });
  });
  await page.route('http://localhost:3000/black-board/*', async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });

  await page.goto('http://localhost:4200/overview');

  await expect(page.getByText('Test Deployment')).toBeVisible();
  await expect(page.getByText('01/05/2025')).toBeVisible();
});

test('Member count is visible', async ({ page }) => {
  page.setDefaultTimeout(15000);
  await page.route('http://localhost:3000/calendar/*', async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route('http://localhost:3000/deployments', async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route('http://localhost:3000/users', async (route) => {
    await route.fulfill({ body: JSON.stringify([{ fireBrigade: '1' }]) });
  });
  await page.route('http://localhost:3000/users/*', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: { fireBrigade: { address: 'Musterstraße 1, 12345 Musterstadt' } },
      }),
    });
  });
  await page.route('http://localhost:3000/black-board/*', async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });

  await page.goto('http://localhost:4200/overview');
  await expect(page.getByText('1', { exact: true })).toBeVisible();
});
