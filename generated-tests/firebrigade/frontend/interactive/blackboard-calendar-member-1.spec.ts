import { test, expect } from '@playwright/test';

test.setTimeout(15000);

test('End-to-end test for Black Board and Calendar', async ({ page }) => {
  // Mock all necessary HTTP requests
  const blackBoardEntriesResponse = [
    {
      entryId: '1',
      title: 'Test Eintrag 1',
      finished: false,
      showInDistrict: false,
      creator: 'mockUserId',
      assignedTo: {
        userId: 'mockUserId2',
        name: 'Max;Mustermann',
        profilePicture: null,
      },
    },
    {
      entryId: '2',
      title: 'Test Eintrag 2',
      finished: true,
      showInDistrict: true,
      creator: 'mockUserId3',
      assignedTo: null,
    },
  ];
  await page.route('http://localhost:3000/black-board/1', async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        ...blackBoardEntriesResponse,
        {
          entryId: '3',
          title: 'New Blackboard Entry',
          finished: false,
          showInDistrict: false,
          creator: 'mockUserId',
        },
      ]),
    });
  });

  const calendarEntriesResponse = [
    {
      appointmentId: '1',
      date: '2024-03-15T10:00',
      description: 'Test Termin 1',
      showInDistrict: false,
      calendar: 'mockCalendarId',
    },
    {
      appointmentId: '2',
      date: '2023-12-24T14:30',
      description: 'Test Termin 2',
      showInDistrict: true,
      calendar: 'mockCalendarId',
    },
  ];
  await page.route('http://localhost:3000/calendar/1', async (route) => {
    await route.fulfill({ body: JSON.stringify(calendarEntriesResponse) });
  });

  const usersResponse = [
    {
      userId: 'mockUserId2',
      name: 'Max;Mustermann',
      profilePicture: null,
    },
    {
      userId: 'mockUserId4',
      name: 'Anna;Musterfrau',
      profilePicture: null,
    },
  ];
  await page.route(
    'http://localhost:3000/firebrigade/1/members',
    async (route) => {
      await route.fulfill({ body: JSON.stringify(usersResponse) });
    }
  );

  // Navigate to the BlackBoardAndCalendar component
  await page.goto('http://localhost:4200/blackBoardAndCalendar');

  // Assertions
  await expect(page.getByText('Schwarzes Brett').nth(1)).toBeVisible();
  await expect(page.getByText('Veranstaltungen')).toBeVisible();
  await expect(page.getByText('Test Eintrag 1')).toBeVisible();
  await expect(page.getByText('Test Eintrag 2')).toBeVisible();
  await expect(page.getByText('Test Termin 1')).toBeVisible();
  await expect(page.getByText('Test Termin 2')).toBeVisible();
  await expect(
    page.locator('.title-list-cell:has-text("Test Eintrag 2")')
  ).toHaveText('Test Eintrag 2');
  await expect(
    page.locator('.description-list-cell:has-text("Test Termin 2")')
  ).toHaveText('Test Termin 2');

  //check if the strikethrough is applied to finished entries
  await expect(page.locator(`text=Test Eintrag 2`).first()).toHaveCSS(
    'text-decoration',
    'line-through solid rgba(0, 0, 0, 0.87)'
  );

  //check if the strikethrough is applied to old appointments
  await expect(page.locator(`text=Test Termin 2`).first()).toHaveCSS(
    'text-decoration',
    'line-through solid rgba(0, 0, 0, 0.87)'
  );
});

test('Adding a new calendar entry', async ({ page }) => {
  // Mock necessary HTTP requests (similar to the previous test)
  await page.route('http://localhost:3000/calendar/1', async (route) => {
    await route.fulfill({ body: JSON.stringify([]) }); //empty array to check if a new entry gets added
  });
  await page.route('http://localhost:3000/calendar/1', async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          appointmentId: '3',
          date: '2024-04-20T12:00',
          description: 'New Appointment',
          showInDistrict: false,
        },
      ]),
    });
  });

  await page.goto('http://localhost:4200/blackBoardAndCalendar');

  await page.getByPlaceholder('Termin').fill('New Appointment');
  await page.getByPlaceholder('Datum, Uhrzeit').fill('2024-04-20T12:00');
  await page.getByRole('button', { name: 'Hinzufügen' }).nth(1).click();

  // Assertion: Check if the new entry is displayed.  This will require a more sophisticated locator
  // Consider using a more robust locator strategy, perhaps based on the newly added appointment ID.
  await expect(page.getByText('New Appointment')).toBeVisible();
});

test('Adding a new blackboard entry', async ({ page }) => {
  // Mock necessary HTTP requests
  await page.route('http://localhost:3000/black-board/1', async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          entryId: '3',
          title: 'New Blackboard Entry',
          finished: false,
          showInDistrict: false,
          creator: 'mockUserId',
        },
      ]),
    });
  });

  await page.goto('http://localhost:4200/blackBoardAndCalendar');

  await page.getByPlaceholder('Aufgabe').fill('New Blackboard Entry');
  await page
    .getByRole('checkbox', { name: 'Auf Landkreisebene veröffentlichen' })
    .nth(0)
    .uncheck();

  await page.getByRole('button', { name: 'Hinzufügen' }).nth(0).click();

  await expect(page.getByText('New Blackboard Entry')).toBeVisible();
});

test('Finish an entry', async ({ page }) => {
  // Mock necessary HTTP requests
  await page.route('http://localhost:3000/black-board/1', async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          entryId: '1',
          title: 'Test Eintrag 1',
          finished: false,
          showInDistrict: false,
          creator: 'mockUserId',
          assignedTo: null,
        },
        {
          entryId: '2',
          title: 'Test Eintrag 2',
          finished: false,
          showInDistrict: true,
          creator: 'mockUserId3',
          assignedTo: null,
        },
      ]),
    });
  });
  await page.route(
    'http://localhost:3000/black-board/finish/1',
    async (route) => {
      await route.fulfill({ body: JSON.stringify({}) });
    }
  );
  await page.route('http://localhost:3000/black-board/1', async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          entryId: '1',
          title: 'Test Eintrag 1',
          finished: true,
          showInDistrict: false,
          creator: 'mockUserId',
          assignedTo: null,
        },
        {
          entryId: '2',
          title: 'Test Eintrag 2',
          finished: false,
          showInDistrict: true,
          creator: 'mockUserId3',
          assignedTo: null,
        },
      ]),
    });
  });

  await page.goto('http://localhost:4200/blackBoardAndCalendar');

  await page.getByRole('button', { name: 'Übernehmen' }).click();

  await expect(page.getByText('Test Eintrag 1').nth(0)).toHaveCSS(
    'text-decoration',
    'line-through solid rgba(0, 0, 0, 0.87)'
  );
});

test('Assign an entry', async ({ page }) => {
  let assignedTo: any = null;
  await page.route('http://localhost:3000/black-board/1', async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          entryId: '1',
          title: 'Test Eintrag 1',
          finished: false,
          showInDistrict: false,
          creator: 'mockUserId',
          assignedTo: assignedTo,
        },
      ]),
    });
  });
  await page.route(
    'http://localhost:3000/black-board/assign',
    async (route) => {
      await route.fulfill({ body: JSON.stringify({}) });
    }
  );

  await page.goto('http://localhost:4200/blackBoardAndCalendar');

  await page.getByRole('button', { name: 'Übernehmen' }).click();

  assignedTo = {
    userId: 'mockUserId2',
    name: 'Max;Mustermann',
    profilePicture: null,
  };

  await expect(page.getByText('Max Mustermann')).toBeVisible();
});

test('Check initial state', async ({ page }) => {
  await page.route('http://localhost:3000/black-board/1', async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          entryId: '1',
          title: 'Test Eintrag 1',
          finished: false,
          showInDistrict: false,
          creator: 'mockUserId',
          assignedTo: null,
        },
        {
          entryId: '2',
          title: 'Test Eintrag 2',
          finished: true,
          showInDistrict: true,
          creator: 'mockUserId3',
          assignedTo: null,
        },
      ]),
    });
  });
  await page.goto('http://localhost:4200/blackBoardAndCalendar');
  await expect(page.getByText('Test Eintrag 1').nth(0)).not.toHaveCSS(
    'text-decoration',
    'line-through'
  );
  await expect(page.getByText('Test Eintrag 2').nth(0)).toHaveCSS(
    'text-decoration',
    'line-through solid rgba(0, 0, 0, 0.87)'
  );
});

test('Member Profile Display', async ({ page }) => {
  const mockUser = {
    userId: 'mockUserId2',
    name: 'Max;Mustermann',
    address: 'Musterstraße 1;12345;Musterstadt',
    telephoneNumber: '0123456789',
    position: 'Feuerwehrmann',
    license: 'mockLicenseId',
    lastLogin: '2024-02-20T10:00',
    amountOfLogins: 5,
    certifiedCourse: [
      { name: 'Test Course', acquiredAt: '2024-01-15', file: 'mockPdfData' },
    ],
  };

  await page.route('http://localhost:3000/users/mockUserId2', async (route) => {
    await route.fulfill({ body: JSON.stringify({ user: mockUser }) });
  });
  await page.route(
    'http://localhost:3000/license/mockLicenseId',
    async (route) => {
      await route.fulfill({
        body: JSON.stringify({ validUntil: '2025-02-20' }),
      });
    }
  );
  await page.goto('http://localhost:4200/member/mockUserId2');

  await expect(page.getByText('Max Mustermann')).toBeVisible();
  await expect(page.getByText('Musterstraße 1 12345')).toBeVisible();
  await expect(page.getByText('0123456789')).toBeVisible();
  await expect(page.getByText('Feuerwehrmann')).toBeVisible();
  await expect(page.getByText('Test Course')).toBeVisible();
});

test('Chat Button Visibility', async ({ page }) => {
  await page.route('http://localhost:3000/users/mockUserId3', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: {
          userId: 'mockUserId3',
          name: 'Anna;Musterfrau',
          address: 'Musterstraße 1;12345;Musterstadt',
          telephoneNumber: '0123456789',
          position: 'Feuerwehrmann',
          license: 'mockLicenseId',
          lastLogin: '2024-02-20T10:00',
          amountOfLogins: 5,
          certifiedCourse: [
            {
              name: 'Test Course',
              acquiredAt: '2024-01-15',
              file: 'mockPdfData',
            },
          ],
        },
      }),
    });
  });
  await page.goto('http://localhost:4200/member/mockUserId3');
  await expect(
    page.locator('button').filter({ hasText: 'chat' })
  ).toBeVisible();
});

test('Profile Picture Display', async ({ page }) => {
  const mockUser = {
    userId: 'mockUserId2',
    name: 'Max;Mustermann',
    profilePicture: 'mockImageData',
  };
  await page.route('http://localhost:3000/users/mockUserId2', async (route) => {
    await route.fulfill({ body: JSON.stringify({ user: mockUser }) });
  });
  await page.goto('http://localhost:4200/member/mockUserId2');
  await expect(page.locator('#profile-picture')).toBeVisible();
});

test('Navigate to Member from Blackboard', async ({ page }) => {
  const blackBoardEntriesResponse = [
    {
      entryId: '1',
      title: 'Test Eintrag 1',
      finished: false,
      showInDistrict: false,
      creator: 'mockUserId',
      assignedTo: {
        userId: 'mockUserId2',
        name: 'Max;Mustermann',
        profilePicture: null,
      },
    },
  ];

  await page.route('http://localhost:3000/black-board/1', async (route) => {
    await route.fulfill({ body: JSON.stringify(blackBoardEntriesResponse) });
  });
  await page.route('http://localhost:3000/users/mockUserId2', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: {
          userId: 'mockUserId2',
          name: 'Max;Mustermann',
          address: 'Musterstraße 1;12345;Musterstadt',
          telephoneNumber: '0123456789',
          position: 'Feuerwehrmann',
          license: 'mockLicenseId',
          lastLogin: '2024-02-20T10:00',
          amountOfLogins: 5,
          certifiedCourse: [
            {
              name: 'Test Course',
              acquiredAt: '2024-01-15',
              file: 'mockPdfData',
            },
          ],
        },
      }),
    });
  });

  await page.goto('http://localhost:4200/blackBoardAndCalendar');

  await page.locator('.assignment-list-cell').first().click();

  await expect(page.getByText('Max Mustermann')).toBeVisible();
});

test('Create Blackboard Entry in District', async ({ page }) => {
  await page.route('http://localhost:3000/black-board/*', async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          entryId: '4',
          title: 'District Entry',
          finished: false,
          showInDistrict: true,
          creator: 'mockUserId',
        },
      ]),
    });
  });
  await page.goto('http://localhost:4200/blackBoardAndCalendar');
  await page.getByPlaceholder('Aufgabe').fill('District Entry');
  await page
    .getByRole('checkbox', { name: 'Auf Landkreisebene veröffentlichen' })
    .nth(0)
    .check();
  await page.getByRole('button', { name: 'Hinzufügen' }).nth(0).click();
  await expect(page.getByText('District Entry')).toBeVisible();
});

test('Create Calendar Appointment in District', async ({ page }) => {
  await page.route('http://localhost:3000/calendar/1', async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          appointmentId: '4',
          date: '2024-05-01T14:00',
          description: 'District Appointment',
          showInDistrict: true,
        },
      ]),
    });
  });
  await page.goto('http://localhost:4200/blackBoardAndCalendar');
  await page.getByPlaceholder('Termin').fill('District Appointment');
  await page.getByPlaceholder('Datum, Uhrzeit').fill('2024-05-01T14:00');
  await page
    .getByRole('checkbox', { name: 'Auf Landkreisebene veröffentlichen' })
    .nth(1)
    .check();
  await page.getByRole('button', { name: 'Hinzufügen' }).nth(1).click();
  await expect(page.getByText('District Appointment')).toBeVisible();
});

test('Assign Entry via Dropdown', async ({ page }) => {
  let assignedTo: any = null;
  const usersResponse = [
    {
      userId: 'mockUserId2',
      name: 'Max;Mustermann',
      profilePicture: null,
    },
    {
      userId: '1',
      name: 'Anna;Musterfrau',
      profilePicture: null,
    },
  ];

  await page.route('http://localhost:3000/black-board/1', async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          entryId: '4',
          title: 'Entry to Assign',
          finished: false,
          showInDistrict: false,
          creator: 'mockUserId',
          assignedTo: assignedTo,
        },
      ]),
    });
  });
  await page.route(
    'http://localhost:3000/fire-brigade/1/members',
    async (route) => {
      await route.fulfill({ body: JSON.stringify(usersResponse) });
    }
  );
  await page.route(
    'http://localhost:3000/black-board/assign',
    async (route) => {
      await route.fulfill({ body: JSON.stringify({}) });
    }
  );
  await page.route('http://localhost:3000/users/1', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: {
          userId: '1',
          name: 'Anna;Musterfrau',
          address: 'Musterstraße 1;12345;Musterstadt',
          telephoneNumber: '0123456789',
          position: 'Wehrleiter/in',
          license: 'mockLicenseId',
          lastLogin: '2024-02-20T10:00',
          amountOfLogins: 5,
          certifiedCourse: [
            {
              name: 'Test Course',
              acquiredAt: '2024-01-15',
              file: 'mockPdfData',
            },
          ],
        },
      }),
    });
  });

  await page.goto('http://localhost:4200/blackBoardAndCalendar');

  await page.locator('.red-dropdown').first().click();
  await page.getByText('Anna Musterfrau').click();

  assignedTo = { userId: '1', name: 'Anna;Musterfrau', profilePicture: null };
  await expect(page.getByText('Anna Musterfrau')).toBeVisible();
});
