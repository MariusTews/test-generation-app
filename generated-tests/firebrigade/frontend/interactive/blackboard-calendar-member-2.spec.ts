import { test, expect } from '@playwright/test';
test.setTimeout(15000);

test('End-to-End Test: Black Board and Calendar Overview', async ({ page }) => {
  // Mock HTTP requests for user info
  await page.route('http://localhost:3000/users/*', async (route) => {
    const userId = route.request().url().split('/').pop();
    const response = {
      user: {
        userId: userId!,
        name: 'Max;Mustermann',
        position: 'Wehrleiter/in',
        profilePicture: null,
      },
      termsOfRightsActual: true,
    };
    await route.fulfill({ body: JSON.stringify(response) });
  });

  //Mock HTTP request for fire brigade info
  await page.route('http://localhost:3000/fire-brigade/*', async (route) => {
    const fireBrigadeId = route.request().url().split('/').pop();
    const response = {
      fireBrigadeId: fireBrigadeId!,
      name: 'Musterfeuerwehr',
    };
    await route.fulfill({ body: JSON.stringify(response) });
  });

  // Mock HTTP requests for black board entries
  await page.route('http://localhost:3000/black-board/*', async (route) => {
    const response = [
      {
        entryId: 1,
        title: 'Test Eintrag 1',
        finished: false,
        showInDistrict: false,
        creator: '123',
        assignedTo: { userId: '456', name: 'User;Test' },
      },
      {
        entryId: 2,
        title: 'Test Eintrag 2',
        finished: true,
        showInDistrict: true,
        creator: '123',
        assignedTo: null,
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });

  // Mock HTTP requests for calendar entries
  await page.route('http://localhost:3000/calendar/*', async (route) => {
    const response = [
      {
        appointmentId: 1,
        date: '2024-03-15T10:00',
        description: 'Test Termin 1',
        showInDistrict: false,
      },
      {
        appointmentId: 2,
        date: '2023-12-24T14:30',
        description: 'Test Termin 2',
        showInDistrict: true,
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });

  // Mock HTTP requests for users
  await page.route(
    'http://localhost:3000/fire-brigade/*/members',
    async (route) => {
      const response = [{ userId: '456', name: 'User;Test' }];
      await route.fulfill({ body: JSON.stringify(response) });
    }
  );

  // Navigate to the page
  await page.goto('http://localhost:4200/blackBoardAndCalendar');

  // Assertions
  await expect(page.getByText('Schwarzes Brett').nth(1)).toBeVisible();
  await expect(page.getByText('Test Eintrag 1')).toBeVisible();
  await expect(page.getByText('Test Eintrag 2')).toBeVisible();
  await expect(page.getByText('Veranstaltungen')).toBeVisible();
  await expect(page.getByText('Test Termin 1')).toBeVisible();
  await expect(page.getByText('Test Termin 2')).toBeVisible();
  await expect(page.getByPlaceholder('Aufgabe')).toBeVisible();
  await expect(page.getByPlaceholder('Termin')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Hinzufügen' }).nth(0)
  ).toBeVisible();
});

test('End-to-End Test: Add Black Board Entry', async ({ page }) => {
  // Mock HTTP requests for user info
  await page.route('http://localhost:3000/users/*', async (route) => {
    const userId = route.request().url().split('/').pop();
    const response = {
      user: {
        userId: userId!,
        name: 'Max;Mustermann',
        position: 'Wehrleiter/in',
        profilePicture: null,
      },
      termsOfRightsActual: true,
    };
    await route.fulfill({ body: JSON.stringify(response) });
  });

  //Mock HTTP request for fire brigade info
  await page.route('http://localhost:3000/fire-brigade/*', async (route) => {
    const fireBrigadeId = route.request().url().split('/').pop();
    const response = {
      fireBrigadeId: fireBrigadeId!,
      name: 'Musterfeuerwehr',
    };
    await route.fulfill({ body: JSON.stringify(response) });
  });

  // Mock HTTP requests for black board entries
  await page.route('http://localhost:3000/black-board/*', async (route) => {
    const response = [
      {
        entryId: 1,
        title: 'Test Eintrag 1',
        finished: false,
        showInDistrict: false,
        creator: '123',
        assignedTo: { userId: '456', name: 'User;Test' },
      },
      {
        entryId: 2,
        title: 'Test Eintrag 2',
        finished: true,
        showInDistrict: true,
        creator: '123',
        assignedTo: null,
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });

  // Mock HTTP requests for calendar entries
  await page.route('http://localhost:3000/calendar/*', async (route) => {
    const response = [
      {
        appointmentId: 1,
        date: '2024-03-15T10:00',
        description: 'Test Termin 1',
        showInDistrict: false,
      },
      {
        appointmentId: 2,
        date: '2023-12-24T14:30',
        description: 'Test Termin 2',
        showInDistrict: true,
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });

  // Mock HTTP requests for users
  await page.route(
    'http://localhost:3000/fire-brigade/*/members',
    async (route) => {
      const response = [{ userId: '456', name: 'User;Test' }];
      await route.fulfill({ body: JSON.stringify(response) });
    }
  );

  await page.route('http://localhost:3000/black-board/new/*', async (route) => {
    const fireBrigadeId = route.request().url().split('/').pop();
    const response = {
      message: 'Black board entry created successfully',
      boardId: fireBrigadeId,
      entryId: 3,
      title: 'Test Eintrag 1',
    };
    await route.fulfill({ body: JSON.stringify(response) });
  });

  await page.goto('http://localhost:4200/blackBoardAndCalendar');
  await page.getByPlaceholder('Aufgabe').fill('Test Eintrag 1');
  await page.getByRole('button', { name: 'Hinzufügen' }).nth(0).click();
  //Assertion - check if new entry is visible (requires additional mocks and adjustments based on your implementation)
  await expect(page.getByText('Test Eintrag 1')).toBeVisible();
});

test('End-to-End Test: Add Calendar Appointment', async ({ page }) => {
  // Mock HTTP requests for user info
  await page.route('http://localhost:3000/users/*', async (route) => {
    const userId = route.request().url().split('/').pop();
    const response = {
      user: {
        userId: userId!,
        name: 'Max;Mustermann',
        position: 'Wehrleiter/in',
        profilePicture: null,
      },
      termsOfRightsActual: true,
    };
    await route.fulfill({ body: JSON.stringify(response) });
  });

  //Mock HTTP request for fire brigade info
  await page.route('http://localhost:3000/fire-brigade/*', async (route) => {
    const fireBrigadeId = route.request().url().split('/').pop();
    const response = {
      fireBrigadeId: fireBrigadeId!,
      name: 'Musterfeuerwehr',
    };
    await route.fulfill({ body: JSON.stringify(response) });
  });

  await page.route('http://localhost:3000/calendar/*', async (route) => {
    const response = [
      {
        appointmentId: 1,
        date: '2024-03-15T10:00',
        description: 'Test Termin 1',
        showInDistrict: false,
      },
      {
        appointmentId: 2,
        date: '2023-12-24T14:30',
        description: 'Test Termin 2',
        showInDistrict: true,
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });

  await page.route('http://localhost:3000/calendar/123', async (route) => {
    //Replace 123 with the correct FireBrigadeId
    const response = {
      appointmentId: 3,
      date: '2024-04-20T14:00',
      description: 'Test Termin 1',
    };
    await route.fulfill({ body: JSON.stringify(response) });
  });

  await page.goto('http://localhost:4200/blackBoardAndCalendar');
  await page.getByPlaceholder('Termin').fill('Test Termin 1');
  await page.getByPlaceholder('Datum, Uhrzeit').fill('2024-04-20T14:00');
  await page.getByRole('button', { name: 'Hinzufügen' }).nth(1).click();
  await expect(page.getByText('Test Termin 1')).toBeVisible();
});

test('End-to-End Test: Finish Black Board Entry', async ({ page }) => {
  // Mock HTTP requests for user info
  await page.route('http://localhost:3000/users/*', async (route) => {
    const userId = route.request().url().split('/').pop();
    const response = {
      user: {
        userId: userId!,
        name: 'Max;Mustermann',
        position: 'Feuerwehrmann/frau',
        profilePicture: null,
      },
      termsOfRightsActual: true,
    };
    await route.fulfill({ body: JSON.stringify(response) });
  });

  //Mock HTTP request for fire brigade info
  await page.route('http://localhost:3000/fire-brigade/*', async (route) => {
    const fireBrigadeId = route.request().url().split('/').pop();
    const response = {
      fireBrigadeId: fireBrigadeId!,
      name: 'Musterfeuerwehr',
    };
    await route.fulfill({ body: JSON.stringify(response) });
  });

  let finished = false;
  // Mock HTTP requests for black board entries
  await page.route('http://localhost:3000/black-board/*', async (route) => {
    const response = [
      {
        entryId: 1,
        title: 'Test Eintrag 1',
        finished: finished,
        showInDistrict: false,
        creator: '123',
        assignedTo: { userId: '1', name: 'User;Test' },
      },
      {
        entryId: 2,
        title: 'Test Eintrag 2',
        finished: true,
        showInDistrict: true,
        creator: '123',
        assignedTo: null,
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });

  await page.route(
    'http://localhost:3000/black-board/finish/1',
    async (route) => {
      const response = [
        {
          entryId: 1,
          title: 'Test Eintrag 1',
          finished: true,
          showInDistrict: false,
          creator: '1',
          assignedTo: { userId: '1', name: 'Max;Mustermann' },
        },
        {
          entryId: 2,
          title: 'Test Eintrag 2',
          finished: true,
          showInDistrict: true,
          creator: '123',
          assignedTo: null,
        },
      ];
      await route.fulfill({ body: JSON.stringify(response) });
    }
  );

  // Mock HTTP requests for calendar entries
  await page.route('http://localhost:3000/calendar/*', async (route) => {
    const response = [
      {
        appointmentId: 1,
        date: '2024-03-15T10:00',
        description: 'Test Termin 1',
        showInDistrict: false,
      },
      {
        appointmentId: 2,
        date: '2023-12-24T14:30',
        description: 'Test Termin 2',
        showInDistrict: true,
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });

  // Mock HTTP requests for users
  await page.route(
    'http://localhost:3000/fire-brigade/*/members',
    async (route) => {
      const response = [{ userId: '456', name: 'User;Test' }];
      await route.fulfill({ body: JSON.stringify(response) });
    }
  );

  await page.goto('http://localhost:4200/blackBoardAndCalendar');
  await expect(page.getByText('Test Eintrag 1')).toBeVisible();
  await page.getByText('done').click();
  finished = true;
  await expect(page.getByText('Test Eintrag 1')).toHaveCSS(
    'text-decoration',
    'line-through solid rgba(0, 0, 0, 0.87)'
  );
});

test('End-to-End Test: Assign Black Board Entry', async ({ page }) => {
  // Mock HTTP requests for user info
  await page.route('http://localhost:3000/users/*', async (route) => {
    const userId = route.request().url().split('/').pop();
    const response = {
      user: {
        userId: userId!,
        name: 'Max;Mustermann',
        position: 'Feuerwehrmann/frau',
        profilePicture: null,
      },
      termsOfRightsActual: true,
    };
    await route.fulfill({ body: JSON.stringify(response) });
  });

  //Mock HTTP request for fire brigade info
  await page.route('http://localhost:3000/fire-brigade/*', async (route) => {
    const fireBrigadeId = route.request().url().split('/').pop();
    const response = {
      fireBrigadeId: fireBrigadeId!,
      name: 'Musterfeuerwehr',
    };
    await route.fulfill({ body: JSON.stringify(response) });
  });

  let assignedTo: any = null;
  // Mock HTTP requests for black board entries
  await page.route('http://localhost:3000/black-board/*', async (route) => {
    const response = [
      {
        entryId: 1,
        title: 'Test Eintrag 1',
        finished: false,
        showInDistrict: false,
        creator: '123',
        assignedTo: assignedTo,
      },
      {
        entryId: 2,
        title: 'Test Eintrag 2',
        finished: true,
        showInDistrict: true,
        creator: '123',
        assignedTo: null,
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });

  await page.route(
    'http://localhost:3000/black-board/assign',
    async (route) => {
      const requestBody = JSON.parse(route.request().postData()!);
      assignedTo = { userId: '1', name: 'Max;Mustermann' };
      const response = [
        {
          entryId: requestBody.entryId,
          title: 'Test Eintrag 1',
          finished: false,
          showInDistrict: false,
          creator: '123',
          assignedTo: assignedTo,
        },
        {
          entryId: 2,
          title: 'Test Eintrag 2',
          finished: true,
          showInDistrict: true,
          creator: '123',
          assignedTo: null,
        },
      ];
      await route.fulfill({ body: JSON.stringify(response) });
    }
  );

  // Mock HTTP requests for calendar entries
  await page.route('http://localhost:3000/calendar/*', async (route) => {
    const response = [
      {
        appointmentId: 1,
        date: '2024-03-15T10:00',
        description: 'Test Termin 1',
        showInDistrict: false,
      },
      {
        appointmentId: 2,
        date: '2023-12-24T14:30',
        description: 'Test Termin 2',
        showInDistrict: true,
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });

  // Mock HTTP requests for users
  await page.route(
    'http://localhost:3000/fire-brigade/*/members',
    async (route) => {
      const response = [{ userId: '1', name: 'Max;Mustermann' }];
      await route.fulfill({ body: JSON.stringify(response) });
    }
  );

  await page.goto('http://localhost:4200/blackBoardAndCalendar');
  await expect(page.getByText('Test Eintrag 1')).toBeVisible();
  await page.getByRole('button', { name: 'Übernehmen' }).click();
  assignedTo = { userId: '1', name: 'Max;Mustermann' };
  await expect(page.getByText('Max Mustermann')).toBeVisible();
});

test('End-to-End Test: Assign Black Board Entry as Leader', async ({
  page,
}) => {
  // Mock HTTP requests for user info
  await page.route('http://localhost:3000/users/*', async (route) => {
    const userId = route.request().url().split('/').pop();
    const response = {
      user: {
        userId: userId!,
        name: 'Max;Mustermann',
        position: 'Wehrleiter/in',
        profilePicture: null,
      },
      termsOfRightsActual: true,
    };
    await route.fulfill({ body: JSON.stringify(response) });
  });

  //Mock HTTP request for fire brigade info
  await page.route('http://localhost:3000/fire-brigade/*', async (route) => {
    const fireBrigadeId = route.request().url().split('/').pop();
    const response = {
      fireBrigadeId: fireBrigadeId!,
      name: 'Musterfeuerwehr',
    };
    await route.fulfill({ body: JSON.stringify(response) });
  });

  let assignedTo: any = null;
  // Mock HTTP requests for black board entries
  await page.route('http://localhost:3000/black-board/*', async (route) => {
    const response = [
      {
        entryId: 1,
        title: 'Test Eintrag 1',
        finished: false,
        showInDistrict: false,
        creator: '123',
        assignedTo: assignedTo,
      },
      {
        entryId: 2,
        title: 'Test Eintrag 2',
        finished: true,
        showInDistrict: true,
        creator: '123',
        assignedTo: null,
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });

  await page.route(
    'http://localhost:3000/black-board/assign',
    async (route) => {
      const requestBody = JSON.parse(route.request().postData()!);
      assignedTo = { userId: '1', name: 'Max;Mustermann' };
      const response = [
        {
          entryId: requestBody.entryId,
          title: 'Test Eintrag 1',
          finished: false,
          showInDistrict: false,
          creator: '123',
          assignedTo: assignedTo,
        },
        {
          entryId: 2,
          title: 'Test Eintrag 2',
          finished: true,
          showInDistrict: true,
          creator: '123',
          assignedTo: null,
        },
      ];
      await route.fulfill({ body: JSON.stringify(response) });
    }
  );

  // Mock HTTP requests for calendar entries
  await page.route('http://localhost:3000/calendar/*', async (route) => {
    const response = [
      {
        appointmentId: 1,
        date: '2024-03-15T10:00',
        description: 'Test Termin 1',
        showInDistrict: false,
      },
      {
        appointmentId: 2,
        date: '2023-12-24T14:30',
        description: 'Test Termin 2',
        showInDistrict: true,
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });

  // Mock HTTP requests for users
  await page.route(
    'http://localhost:3000/fire-brigade/*/members',
    async (route) => {
      const response = [
        { userId: '1', name: 'Max;Mustermann' },
        { userId: '456', name: 'User;Test' },
      ];
      await route.fulfill({ body: JSON.stringify(response) });
    }
  );

  await page.goto('http://localhost:4200/blackBoardAndCalendar');
  await expect(page.getByText('Test Eintrag 1')).toBeVisible();
  await page.getByRole('button', { name: 'Zuweisen' }).click();
  await page.getByText('Max Mustermann').click();
  assignedTo = { userId: '1', name: 'Max;Mustermann' };
  await expect(page.getByText('Max Mustermann')).toBeVisible();
});

test('End-to-End Test: Navigate to Member Profile', async ({ page }) => {
  // Mock HTTP requests for user info
  await page.route('http://localhost:3000/users/*', async (route) => {
    const userId = route.request().url().split('/').pop();
    const response = {
      user: {
        userId: userId!,
        name: 'Max;Mustermann',
        position: 'Feuerwehrmann/frau',
        profilePicture: null,
        address: 'Musterstraße;1;12345;Musterstadt',
        telephoneNumber: '0123456789',
        license: '123',
        lastLogin: '2024-01-01T10:00:00.000Z',
        amountOfLogins: 5,
        certifiedCourse: [
          {
            name: 'Test Course',
            acquiredAt: '2023-12-31',
            file: 'test',
          },
        ],
      },
    };
    await route.fulfill({ body: JSON.stringify(response) });
  });

  await page.route('http://localhost:3000/license/*', async (route) => {
    const licenseId = route.request().url().split('/').pop();
    const response = {
      licenseId: licenseId!,
      validUntil: '2025-01-01',
    };
    await route.fulfill({ body: JSON.stringify(response) });
  });
  await page.route('http://localhost:3000/fire-brigade/*', async (route) => {
    const fireBrigadeId = route.request().url().split('/').pop();
    const response = {
      fireBrigadeId: fireBrigadeId!,
      name: 'Musterfeuerwehr',
    };
    await route.fulfill({ body: JSON.stringify(response) });
  });
  await page.route('http://localhost:3000/black-board/*', async (route) => {
    const response = [
      {
        entryId: 1,
        title: 'Test Eintrag 1',
        finished: false,
        showInDistrict: false,
        creator: '123',
        assignedTo: { userId: '456', name: 'User;Test' },
      },
      {
        entryId: 2,
        title: 'Test Eintrag 2',
        finished: true,
        showInDistrict: true,
        creator: '123',
        assignedTo: null,
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });

  await page.route('http://localhost:3000/calendar/*', async (route) => {
    const response = [
      {
        appointmentId: 1,
        date: '2024-03-15T10:00',
        description: 'Test Termin 1',
        showInDistrict: false,
      },
      {
        appointmentId: 2,
        date: '2023-12-24T14:30',
        description: 'Test Termin 2',
        showInDistrict: true,
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });

  await page.route(
    'http://localhost:3000/fire-brigade/*/members',
    async (route) => {
      const response = [{ userId: '456', name: 'User;Test' }];
      await route.fulfill({ body: JSON.stringify(response) });
    }
  );

  await page.goto('http://localhost:4200/blackBoardAndCalendar');
  await expect(page.getByText('Test Eintrag 1')).toBeVisible();
  await page.getByText('User Test').click();
  await expect(page.getByText('Max Mustermann')).toBeVisible();
  await expect(page.getByText('Musterstraße 1')).toBeVisible();
  await expect(page.getByText('12345 Musterstadt')).toBeVisible();
  await expect(page.getByText('0123456789')).toBeVisible();
  await expect(page.getByText('Feuerwehrmann/frau').nth(1)).toBeVisible();
  await expect(page.getByText('abgelaufen')).toBeVisible();
  await expect(page.getByText('5', { exact: true })).toBeVisible();
  await expect(page.getByText('1/1/2024')).toBeVisible();
  await expect(page.getByText('Test Course')).toBeVisible();
});
