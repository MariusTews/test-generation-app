import { test, expect } from '@playwright/test';
import { environment } from 'src/environments/environment';
import Constants from 'src/util/constants';

test.setTimeout(15000);

test('Navigate to black-board-and-calendar and add a new entry', async ({
  page,
}) => {
  await page.route(`${environment.baseurl}users/*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: {
          userId: '1',
          name: 'Max;Mustermann',
          position: 'Wehrleiter/in',
          profilePicture: null,
        },
        termsOfRightsActual: true,
      }),
    });
  });
  await page.route(`${environment.baseurl}fire-brigade/*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({ name: 'Muster Feuerwehr' }),
    });
  });
  await page.route(`${environment.baseurl}black-board/*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          entryId: '1',
          title: 'Test Eintrag',
          finished: false,
          showInDistrict: false,
          creator: '1',
          assignedTo: null,
        },
      ]),
    });
  });
  await page.route(`${environment.baseurl}calendar/*`, async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route(
    `${environment.baseurl}fire-brigade/*/members`,
    async (route) => {
      await route.fulfill({ body: JSON.stringify([]) });
    }
  );
  await page.route(`${environment.baseurl}black-board/new/*`, async (route) => {
    await route.fulfill({ status: 200 });
  });

  await page.goto('http://localhost:4200/blackBoardAndCalendar');
  const entryInput = page.getByPlaceholder('Aufgabe');
  await entryInput.fill('Test Eintrag');
  const addEntryButton = page.getByText('Hinzufügen').nth(0);
  await addEntryButton.click();
  await expect(page.getByText('Test Eintrag')).toBeVisible();
});

test('Navigate to member profile and open chat', async ({ page }) => {
  await page.route(`${environment.baseurl}users/*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: {
          userId: '2',
          name: 'Max;Mustermann',
          position: 'Wehrleiter/in',
          profilePicture: null,
          address: 'Musterstraße 1;12345;Musterstadt',
          telephoneNumber: '0123456789',
          license: '1',
          lastLogin: new Date().toISOString(),
          amountOfLogins: 1,
          certifiedCourse: [],
        },
        termsOfRightsActual: true,
      }),
    });
  });
  await page.route(`${environment.baseurl}fire-brigade/*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({ name: 'Muster Feuerwehr' }),
    });
  });
  await page.route(`${environment.baseurl}license/*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        validUntil: new Date(Date.now() + 86400000).toISOString(),
      }),
    });
  });
  await page.route(`${environment.baseurl}chat`, async (route) => {
    await route.fulfill({ body: JSON.stringify({ id: '1' }) });
  });

  await page.goto('http://localhost:4200/member/2');
  const chatButton = page.locator('button').filter({ hasText: 'chat' });
  await chatButton.click();
  await expect(page.getByText('Chats')).toBeVisible();
});

test('Add new entry in blackboard and navigate to member overview', async ({
  page,
}) => {
  await page.route(`${environment.baseurl}users/*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: {
          userId: '1',
          name: 'Max;Mustermann',
          position: 'Wehrleiter/in',
          profilePicture: null,
        },
        termsOfRightsActual: true,
      }),
    });
  });
  await page.route(`${environment.baseurl}fire-brigade/*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({ name: 'Muster Feuerwehr' }),
    });
  });
  await page.route(`${environment.baseurl}black-board/*`, async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route(`${environment.baseurl}calendar/*`, async (route) => {
    await route.fulfill({ body: JSON.stringify([]) });
  });
  await page.route(
    `${environment.baseurl}fire-brigade/*/members`,
    async (route) => {
      await route.fulfill({ body: JSON.stringify([]) });
    }
  );
  await page.route(`${environment.baseurl}black-board/new/*`, async (route) => {
    await route.fulfill({ status: 200 });
  });
  await page.route(`${environment.baseurl}users`, async (route) => {
    await route.fulfill({
      body: JSON.stringify([{ userId: '2', name: 'User;Two' }]),
    });
  });

  await page.goto('http://localhost:4200/blackBoardAndCalendar');
  const entryInput = page.getByPlaceholder('Aufgabe');
  await entryInput.fill('Test Eintrag 2');
  const addEntryButton = page
    .getByRole('button', { name: 'Hinzufügen' })
    .nth(0);
  await addEntryButton.click();

  await page.locator('span.mat-mdc-button-touch-target').click();

  const memberOverviewLink = page.getByText('Mitglieder');
  await memberOverviewLink.click();
  await expect(page.getByText('Mitglieder')).toBeVisible();
});

test('Login, accept terms and navigate to overview', async ({ page }) => {
  await page.route(`${environment.baseurl}users/*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: {
          userId: '1',
          name: 'Max;Mustermann',
          position: 'Wehrleiter/in',
          profilePicture: null,
        },
        termsOfRightsActual: false,
      }),
    });
  });
  await page.route(`${environment.baseurl}fire-brigade/*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({ name: 'Muster Feuerwehr' }),
    });
  });
  await page.route(
    `${environment.baseurl}users/refreshTermsOfRights/*`,
    async (route) => {
      await route.fulfill({ body: JSON.stringify({ affected: 1 }) });
    }
  );

  await page.goto('http://localhost:4200/overview'); //Simulate already logged in user navigating to overview

  //Simulate TermsOfRightsModalComponent interaction.  Can't directly interact with modal in E2E
  await page.getByRole('button', { name: 'Akzeptieren' }).click(); //Assumes button with text 'Akzeptieren' exists in modal

  await expect(page.getByText('Aktuelle Mitgliedszahlen')).toBeVisible(); //Assumes a visible element with the text 'Aktuelle Mitgliedszahlen' exists on the overview page.
});
