import { test, expect } from '@playwright/test';

test('Overview page displays correctly', async ({ page }) => {
  test.setTimeout(15000);

  // Mock HTTP requests for OverviewComponent
  await page.route('http://localhost:3000/users', async (route) => {
    const response = [
      {
        userId: '1',
        username: 'testuser',
        name: 'Test User',
        address: 'Test Address',
        telephoneNumber: '1234567890',
        rank: 'Wehrleiter/in',
        position: 'Leader',
        profilePicture: '',
        lastLogin: '2023-10-27T10:00:00Z',
        amountOfLogins: 1,
        license: null,
        fireBrigade: '1',
        chats: [],
        blackBoardEntries: [],
        blackBoardAssignments: [],
        workTime: [],
        certifiedCourses: [],
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });
  await page.route('http://localhost:3000/deployments', async (route) => {
    const response = [
      {
        deploymentId: '1',
        location: 'Test Location',
        description: 'Test Description',
        date: '2023-10-26T10:00:00Z',
        time: '10:00',
        pictures: [],
        storage: null,
        involvedUsers: [],
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });
  await page.route('http://localhost:3000/calendar/1', async (route) => {
    const response = [
      {
        appointmentId: '1',
        date: '2023-10-27T10:00:00Z',
        description: 'Test Appointment',
        showInDistrict: true,
        calendar: null,
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });
  await page.route('http://localhost:3000/black-board/1', async (route) => {
    const response = [
      {
        entryId: '1',
        title: 'Test Task',
        finished: false,
        showInDistrict: true,
        board: null,
        creator: '1',
        assignedTo: {
          userId: '1',
          username: 'testuser',
          name: 'Test User',
          address: 'Test Address',
          telephoneNumber: '1234567890',
          rank: 'Wehrleiter/in',
          position: 'Leader',
          profilePicture: '',
          lastLogin: '2023-10-27T10:00:00Z',
          amountOfLogins: 1,
          license: null,
          fireBrigade: '1',
          chats: [],
          blackBoardEntries: [],
          blackBoardAssignments: [],
          workTime: [],
          certifiedCourses: [],
        },
      },
    ];
    await route.fulfill({ body: JSON.stringify(response) });
  });

  // Navigate to the overview page
  await page.goto('http://localhost:4200/overview');

  // Assertions for OverviewComponent
  await expect(page.getByText('Einsätze der letzten 2 Wochen:')).toBeVisible();
  await expect(page.locator('#deployments-list')).toBeVisible();
  await expect(page.getByRole('table').nth(0)).toBeVisible();
  await expect(page.getByText('Datum').nth(0)).toBeVisible();
  await expect(page.getByText('Titel')).toBeVisible();
  await expect(page.getByText('Meine Tasks')).toBeVisible();
  await expect(page.getByText('Meine Tasks')).toBeVisible();
  await expect(page.getByText('Zuweisung')).toBeVisible();
  await expect(page.getByText('Zu erledigen')).toBeVisible();
  await expect(page.getByText('Deine Termine diese Woche')).toBeVisible();
  await expect(page.getByText('Deine Termine diese Woche')).toBeVisible();
  await expect(page.getByText('Datum').nth(1)).toBeVisible();
  await expect(page.getByText('Termin', { exact: true })).toBeVisible();
});
