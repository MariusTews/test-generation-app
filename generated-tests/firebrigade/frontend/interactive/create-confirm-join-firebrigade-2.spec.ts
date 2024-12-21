import { test, expect } from '@playwright/test';

test('Create Fire Brigade', async ({ page }) => {
  await page.route(
    'http://localhost:3000/fire-brigade/address/all',
    async (route) => {
      const response = { addresses: [] };
      await route.fulfill({ body: JSON.stringify(response) });
    }
  );
  await page.route('http://localhost:3000/fire-brigade', async (route) => {
    const response = [
      {
        id: 'mockFireBrigadeId',
        name: 'Test Fire Brigade',
        address: 'Teststraße 1, 12345 Testort',
        state: 'Baden-Württemberg',
        district: 'Alb-Donau-Kreis',
        created: true,
        voluntary: true,
        creator: 'mockUserId',
        deployments: 0,
        members: 0,
        confirmations: [],
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });
  await page.route('http://localhost:3000/users/[userId]', async (route) => {
    const response = {
      user: {
        userId: 'mockUserId',
        name: 'Test User;Test User2',
        position: 'Wehrleiter/in',
        profilePicture: null,
      },
      termsOfRightsActual: true,
    };
    await route.fulfill({ body: JSON.stringify(response) });
  });
  await page.route(
    'http://localhost:3000/fire-brigade/[fireBrigadeId]',
    async (route) => {
      const response = { name: 'Test Fire Brigade' };
      await route.fulfill({ body: JSON.stringify(response) });
    }
  );
  await page.goto('http://localhost:4200/searchFireBrigade');
  await page.getByRole('button', { name: 'Neue Feuerwehr erstellen' }).click();
  await page.getByPlaceholder('Name').fill('Test Fire Brigade');
  await page.getByRole('button', { name: 'Art' }).click();
  await page.getByText('Freiwillig').click();
  await page.getByPlaceholder('Straße').fill('Teststraße');
  await page.getByPlaceholder('Hausnummer').fill('1');
  await page.getByPlaceholder('Postleitzahl').fill('12345');
  await page.getByPlaceholder('Ort').fill('Testort');
  await page.getByRole('button', { name: 'Bundesland' }).click();
  await page.getByText('Baden-Württemberg').click();
  await page.getByRole('button', { name: 'Landkreis' }).click();
  await page.getByText('Alb-Donau-Kreis').click();

  await page.getByRole('button', { name: 'Neue Feuerwehr erstellen' }).click();
  await expect(page.getByText('Test Fire Brigade')).toBeVisible();
});

test('Search Fire Brigade', async ({ page }) => {
  await page.route('http://localhost:3000/fire-brigade', async (route) => {
    const response = [
      {
        id: '1',
        name: 'Test Fire Brigade',
        address: 'Test Address',
        state: 'Test State',
        district: 'Test District',
        created: false,
        voluntary: true,
        confirmations: [],
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });
  await page.route('http://localhost:3000/users/[userId]', async (route) => {
    const response = {
      user: {
        userId: 'mockUserId',
        name: 'Test User;Test User2',
        position: 'Wehrleiter/in',
        profilePicture: null,
      },
      termsOfRightsActual: true,
    };
    await route.fulfill({ body: JSON.stringify(response) });
  });
  await page.route(
    'http://localhost:3000/fire-brigade/[fireBrigadeId]',
    async (route) => {
      const response = { name: 'Test Fire Brigade' };
      await route.fulfill({ body: JSON.stringify(response) });
    }
  );
  await page.goto('http://localhost:4200/searchFireBrigade');
  await expect(page.getByText('Alle Feuerwehren')).toBeVisible();
});

test('Join Fire Brigade', async ({ page }) => {
  await page.route('http://localhost:3000/fire-brigade', async (route) => {
    const response = [
      {
        id: '1',
        name: 'Test Fire Brigade',
        address: 'Test Address',
        state: 'Test State',
        district: 'Test District',
        created: true,
        voluntary: true,
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });
  await page.route('http://localhost:3000/fire-brigade/join', async (route) => {
    await route.fulfill({ status: 200 });
  });
  await page.route('http://localhost:3000/users/[userId]', async (route) => {
    const response = {
      user: {
        userId: 'mockUserId',
        name: 'Test User;Test User2',
        position: 'Wehrleiter/in',
        profilePicture: null,
      },
      termsOfRightsActual: true,
    };
    await route.fulfill({ body: JSON.stringify(response) });
  });
  await page.route(
    'http://localhost:3000/fire-brigade/[fireBrigadeId]',
    async (route) => {
      const response = { name: 'Test Fire Brigade' };
      await route.fulfill({ body: JSON.stringify(response) });
    }
  );
  await page.goto('http://localhost:4200/searchFireBrigade');
  await page.getByText('Test Fire Brigade').click();
  await page.getByRole('button', { name: 'Beitreten' }).click();
  await expect(page.getByText('Beitrittsanfrage gestellt')).toBeVisible();
});

test('Confirm Fire Brigade', async ({ page }) => {
  let confirmations = ['mockUserId2'];
  await page.route('http://localhost:3000/fire-brigade', async (route) => {
    const response = [
      {
        id: '1',
        name: 'Test Fire Brigade',
        address: 'Test Address',
        state: 'Test State',
        district: 'Test District',
        created: false,
        voluntary: true,
        confirmations: confirmations,
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
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
  await page.route('http://localhost:3000/users/[userId]', async (route) => {
    const response = {
      user: {
        userId: 'mockUserId',
        name: 'Test User;Test User2',
        position: 'Wehrleiter/in',
        profilePicture: null,
      },
      termsOfRightsActual: true,
    };
    await route.fulfill({ body: JSON.stringify(response) });
  });
  await page.route(
    'http://localhost:3000/fire-brigade/[fireBrigadeId]',
    async (route) => {
      const response = { name: 'Test Fire Brigade' };
      await route.fulfill({ body: JSON.stringify(response) });
    }
  );
  await page.goto('http://localhost:4200/searchFireBrigade');
  await page.getByText('Test Fire Brigade').click();
  await page.getByRole('button', { name: 'Bestätigen 1/3' }).click();
  confirmations.push('mockUserId');
  await expect(page.getByText('Bestätigen 2/3')).toBeVisible();
});
