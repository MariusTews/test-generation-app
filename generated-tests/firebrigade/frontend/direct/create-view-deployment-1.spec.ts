import { test, expect } from '@playwright/test';

test.setTimeout(15000);

test.describe('Add Deployment', () => {
  test('Add a new deployment', async ({ page }) => {
    await page.route('http://localhost:3000/users/*', async (route) => {
      await route.fulfill({
        body: JSON.stringify([
          {
            userId: '1',
            username: 'testuser',
            name: 'Test User;Test User',
            address: 'Teststreet 1;12345;Testcity',
            telephoneNumber: '0123456789',
            rank: 'Feuerwehrmann/frau',
            position: 'Feuerwehrmann',
            profilePicture: null,
            lastLogin: '2023-10-26T10:00:00',
            amountOfLogins: 1,
            license: null,
            fireBrigade: '1',
            chats: [],
            blackBoardEntries: [],
            blackBoardAssignments: [],
            workTime: [],
            certifiedCourses: [],
          },
        ]),
      });
    });
    await page.route('http://localhost:3000/fire-brigade/1', async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          fireBrigadeId: '1',
          name: 'Test Fire Brigade',
          address: 'Fire Brigade Street 12, 67890 Fire Brigade City',
          state: 'Hessen',
          district: 'Main-Kinzig-Kreis',
          voluntary: true,
          stationPictures: [],
          deploymentStorage: null,
          chat: null,
          blackBoard: null,
          calendar: null,
          members: [],
          vehicles: [],
          workTime: [],
        }),
      });
    });
    await page.route('http://localhost:3000/users', async (route) => {
      await route.fulfill({
        body: JSON.stringify([
          { userId: '1', name: 'User 1;Test', fireBrigade: '1' },
          { userId: '2', name: 'User 2;Test', fireBrigade: '1' },
        ]),
      });
    });
    await page.route(
      'http://localhost:3000/deployments/add-deployment',
      async (route) => {
        await route.fulfill({ body: JSON.stringify({ deploymentId: '1' }) });
      }
    );
    await page.route('http://localhost:3000/deployments', async (route) => {
      await route.fulfill({
        body: JSON.stringify([
          {
            deploymentId: '1',
            date: '2024-03-15T10:00:00.000Z',
            deploymentTitle: 'Test Deployment 1',
          },
        ]),
      });
    });

    const shortTitle = page.getByPlaceholder('Kurztitel');
    const datePicker = page.locator('input[type="datetime-local"]');
    const street = page.getByPlaceholder('Straße');
    const houseNumber = page.getByPlaceholder('Hausnummer');
    const postalCode = page.getByPlaceholder('Postleitzahl');
    const city = page.getByPlaceholder('Ort');
    const userSelection = page.getByText('Keine Benutzer ausgewählt');
    const description = page.getByPlaceholder(
      'Einsatzbeschreibung (max. 2000 Zeichen)'
    );
    const submitButton = page.getByRole('button', {
      name: 'Einsatzbericht erstellen',
    });

    await page.goto('http://localhost:4200/addDeployment');
    await shortTitle.fill('Test Deployment');
    await datePicker.fill('2024-03-15T10:00');
    await street.fill('Teststreet');
    await houseNumber.fill('1');
    await postalCode.fill('12345');
    await city.fill('Testcity');
    await userSelection.click();
    await page.getByRole('menuitem', { name: 'User 1 Test' }).click();
    await page.locator('.cdk-overlay-backdrop').click();
    await description.fill('Test description');
    await submitButton.click();

    await expect(page.getByText('Test Deployment 1')).toBeVisible();
  });
});

test.describe('Deployment Overview to Detail View', () => {
  test('Navigate from overview to deployment detail view and back', async ({
    page,
  }) => {
    await page.route('http://localhost:3000/users/*', async (route) => {
      await route.fulfill({
        body: JSON.stringify([
          {
            userId: '1',
            username: 'testuser',
            name: 'Test User;Test User',
            address: 'Teststreet 1;12345;Testcity',
            telephoneNumber: '0123456789',
            rank: 'Feuerwehrmann/frau',
            position: 'Feuerwehrmann',
            profilePicture: null,
            lastLogin: '2023-10-26T10:00:00',
            amountOfLogins: 1,
            license: null,
            fireBrigade: '1',
            chats: [],
            blackBoardEntries: [],
            blackBoardAssignments: [],
            workTime: [],
            certifiedCourses: [],
          },
        ]),
      });
    });
    await page.route('http://localhost:3000/fire-brigade/1', async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          fireBrigadeId: '1',
          name: 'Test Fire Brigade',
          address: 'Fire Brigade Street 12, 67890 Fire Brigade City',
          state: 'Hessen',
          district: 'Main-Kinzig-Kreis',
          voluntary: true,
          stationPictures: [],
          deploymentStorage: null,
          chat: null,
          blackBoard: null,
          calendar: null,
          members: [],
          vehicles: [],
          workTime: [],
        }),
      });
    });
    await page.route('http://localhost:3000/users', async (route) => {
      await route.fulfill({
        body: JSON.stringify([
          { userId: '1', name: 'Test User;Test User', fireBrigade: '1' },
        ]),
      });
    });
    await page.route('http://localhost:3000/deployments', async (route) => {
      await route.fulfill({
        body: JSON.stringify([
          {
            deploymentId: '1',
            deploymentTitle: 'Test Deployment 1',
            location: 'Teststreet 1;1;12345;Testcity',
            description: 'Test Description 1',
            date: '2024-03-15T10:00:00.000Z',
            user: ['1'],
            fireBrigadeId: '1',
            involvedUsers: [{ userId: '1', name: 'Test User;Test User' }],
          },
        ]),
      });
    });
    await page.route('http://localhost:3000/deployments/1', async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          deploymentId: '1',
          deploymentTitle: 'Test Deployment 1',
          location: 'Teststreet 1;1;12345;Testcity',
          description: 'Test Description 1',
          date: '2024-03-15T10:00:00.000Z',
          user: ['1'],
          fireBrigadeId: '1',
          involvedUsers: [{ userId: '1', name: 'Test User;Test User' }],
        }),
      });
    });
    await page.route(
      'http://localhost:3000/deployments/1/pictures',
      async (route) => {
        await route.fulfill({ body: JSON.stringify([]) });
      }
    );
    await page.route('http://localhost:3000/deployments', async (route) => {
      await route.fulfill({
        body: JSON.stringify([
          {
            deploymentId: '1',
            date: '2024-03-15T10:00:00.000Z',
            deploymentTitle: 'Test Deployment 1',
          },
        ]),
      });
    });

    await page.goto('http://localhost:4200/overview');
    await expect(page.getByText('Test Deployment 1')).toBeVisible();
    await page.getByText('info').click();
    await expect(page.getByText('Test Deployment 1')).toBeVisible(); // Asserting visibility in detail view
    await page.goBack();
    await expect(page.getByText('Test Deployment 1')).toBeVisible(); // Asserting visibility back in overview
  });
});
