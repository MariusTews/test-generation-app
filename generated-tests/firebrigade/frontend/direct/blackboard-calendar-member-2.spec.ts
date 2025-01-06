import { test, expect } from '@playwright/test';
import { environment } from 'src/environments/environment';
import Constants from 'src/util/constants';

test.setTimeout(15000);

test('navigate to member profile and check details', async ({ page }) => {
  await page.route(`${environment.baseurl}users/*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: {
          userId: 'testUserId',
          username: 'testuser',
          name: 'Test;User',
          address: 'Teststreet 1;12345;Testcity;Germany',
          telephoneNumber: '0123456789',
          rank: 'Feuerwehrmann/frau',
          position: 'Feuerwehrmann/frau',
          profilePicture: 'dGVzdCBpbWFnZQ==',
          lastLogin: '2024-03-08T10:00:00.000Z',
          amountOfLogins: 5,
          license: 'testLicenseId',
          fireBrigade: 'testFireBrigadeId',
          chats: [],
          blackBoardEntries: [],
          blackBoardAssignments: [],
          workTime: [],
          certifiedCourse: [
            {
              name: 'Test Course',
              acquiredAt: '2024-03-08',
              file: 'dGVzdCBwZGY=',
            },
          ],
        },
        termsOfRightsActual: true,
      }),
    });
  });
  await page.route(`${environment.baseurl}license/*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({ validUntil: '2025-03-08T10:00:00.000Z' }),
    });
  });
  await page.goto(`http://localhost:4200/member/testUserId`);
  const userName = page.getByText('Test User');
  await expect(userName).toBeVisible();
  const userPosition = page.getByText('Feuerwehrmann/frau').nth(1);
  await expect(userPosition).toBeVisible();
  const userAddress1 = page.getByText('Teststreet 1 12345');
  await expect(userAddress1).toBeVisible();
  const userAddress2 = page.getByText('Testcity Germany');
  await expect(userAddress2).toBeVisible();
  const userPhone = page.getByText('0123456789');
  await expect(userPhone).toBeVisible();
  const userLicense = page.getByText('Ja (bis 3/8/2025)');
  await expect(userLicense).toBeVisible();
  const userLastLogin = page.getByText('3/8/2024');
  await expect(userLastLogin).toBeVisible();
  const userAmountOfLogins = page.getByText('5', { exact: true });
  await expect(userAmountOfLogins).toBeVisible();
  const courseName = page.getByText('Test Course bei 2024-03-08');
  await expect(courseName).toBeVisible();
});

test('add new black board entry', async ({ page }) => {
  await page.route(`${environment.baseurl}black-board/new/*`, async (route) => {
    await route.fulfill({ status: 200 });
  });
  await page.route(`${environment.baseurl}black-board/*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          entryId: 'newEntryId',
          title: 'Test entry',
          finished: false,
          showInDistrict: false,
          board: 'testBoardId',
          creator: 'testCreatorId',
          assignedTo: null,
        },
      ]),
    });
  });
  await page.goto('http://localhost:4200/blackBoardAndCalendar');
  const entryInput = page.getByPlaceholder('Aufgabe');
  await entryInput.fill('Test entry');
  const addEntryButton = page.getByText('Hinzufügen').nth(0);
  await addEntryButton.click();
  await expect(page.getByText('Test entry')).toBeVisible();
});

test('add new appointment', async ({ page }) => {
  await page.route(`${environment.baseurl}calendar/*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          appointmentId: 'newAppointmentId',
          date: '2024-03-15T10:00',
          description: 'Test appointment',
          showInDistrict: false,
          calendar: 'testCalendarId',
        },
      ]),
    });
  });
  await page.route(`${environment.baseurl}calendar/*/new`, async (route) => {
    await route.fulfill({ status: 200 });
  });
  await page.goto('http://localhost:4200/blackBoardAndCalendar');
  const appointmentInput = page.getByPlaceholder('Termin');
  await appointmentInput.fill('Test appointment');
  const dateInput = page.getByPlaceholder('Datum, Uhrzeit');
  await dateInput.fill('2024-03-15T10:00');
  const addAppointmentButton = page.getByText('Hinzufügen').nth(1);
  await addAppointmentButton.click();
  await expect(page.getByText('Test appointment')).toBeVisible();
});

test('Blackboard entry assignment from overview to member profile', async ({
  page,
}) => {
  // Mock necessary API calls
  await page.route(`${environment.baseurl}black-board/*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          entryId: 'testEntryId',
          title: 'Test Entry',
          finished: false,
          showInDistrict: false,
          board: 'testBoardId',
          creator: 'testCreatorId',
          assignedTo: null,
        },
      ]),
    });
  });
  await page.route(
    `${environment.baseurl}black-board/assign`,
    async (route) => {
      await route.fulfill({ status: 200 });
    }
  );
  await page.route(`${environment.baseurl}users/*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: {
          userId: 'testUserId',
          username: 'testuser',
          name: 'Test;User',
          address: 'Teststreet 1;12345;Testcity;Germany',
          telephoneNumber: '0123456789',
          rank: 'Feuerwehrmann/frau',
          position: 'Feuerwehrmann/frau',
          profilePicture: null,
          lastLogin: '2024-03-08T10:00:00.000Z',
          amountOfLogins: 5,
          license: 'testLicenseId',
          fireBrigade: 'testFireBrigadeId',
          chats: [],
          blackBoardEntries: [],
          blackBoardAssignments: [],
          workTime: [],
          certifiedCourses: [],
        },
        termsOfRightsActual: true,
      }),
    });
  });

  await page.goto('http://localhost:4200/blackBoardAndCalendar');

  // Locate and click the "Übernehmen" button (assuming it's the first entry)
  const uebernehmenButton = page.getByRole('button', { name: 'Übernehmen' });
  await uebernehmenButton.click();

  // Assert navigation to member profile
  await expect(page.url()).toContain('/member/');
});

test('Start Chat from Member Overview', async ({ page }) => {
  await page.route(`${environment.baseurl}users`, async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          userId: 'testUserId',
          username: 'testuser',
          name: 'Test;User',
          address: 'Teststreet 1;12345;Testcity;Germany',
          telephoneNumber: '0123456789',
          rank: 'Feuerwehrmann/frau',
          position: 'Feuerwehrmann/frau',
          profilePicture: null,
          lastLogin: '2024-03-08T10:00:00.000Z',
          amountOfLogins: 5,
          license: 'testLicenseId',
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
  await page.route(`${environment.baseurl}chat`, async (route) => {
    await route.fulfill({ body: JSON.stringify({ id: 'testChatId' }) });
  });
  await page.goto('http://localhost:4200/memberOverview');
  const chatButton = page.locator('#memberList').getByText('chat');
  await chatButton.click();
  await expect(page.getByText('Chats')).toBeVisible();
});
