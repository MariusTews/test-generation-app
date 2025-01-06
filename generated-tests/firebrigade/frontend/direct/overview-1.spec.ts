import { test, expect } from '@playwright/test';
import Appointment from 'src/model/appointment';
import OverviewDeploymentsListItem from 'src/util/OverviewDeploymentsListItem';
import BlackBoardEntry from 'src/model/blackBoardEntry';
import User from 'src/model/user';

test.setTimeout(15000);

test('Overview page displays appointments', async ({ page }) => {
  const appointments: Appointment[] = [
    {
      appointmentId: '1',
      date: '2024-12-28T10:00',
      description: 'Meeting',
      showInDistrict: false,
      calendar: '',
    },
  ];
  await page.route('http://localhost:3000/calendar/*', async (route) => {
    await route.fulfill({ body: JSON.stringify(appointments) });
  });
  await page.goto('http://localhost:4200/overview');
  const calendarHeader = page.getByText('Deine Termine diese Woche');
  await expect(calendarHeader).toBeVisible();
  const appointmentDescription = page.getByText('Meeting');
  await expect(appointmentDescription).toBeVisible();
});

test('Overview page displays deployments', async ({ page }) => {
  const deployments = [
    {
      deploymentId: '1',
      date: '2024-12-28T10:00',
      deploymentTitle: 'Deployment 1',
    },
  ];
  await page.route('http://localhost:3000/deployments', async (route) => {
    await route.fulfill({ body: JSON.stringify(deployments) });
  });
  await page.route('http://localhost:3000/users/*', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: {
          fireBrigade: {
            address: 'Musterstraße 1, 12345 Musterstadt',
            name: 'Musterwehr',
          },
        },
      }),
    });
  });
  await page.goto('http://localhost:4200/overview');
  const deploymentsHeader = page.getByText('Einsätze der letzten 2 Wochen:');
  await expect(deploymentsHeader).toBeVisible();
  const deploymentTitle = page.getByText('Deployment 1');
  await expect(deploymentTitle).toBeVisible();
});

test('Overview page displays tasks', async ({ page }) => {
  const entries: BlackBoardEntry[] = [
    {
      entryId: '1',
      title: 'Task 1',
      finished: false,
      showInDistrict: false,
      board: '',
      creator: '',
      assignedTo: {
        userId: '1',
        username: '',
        name: '',
        address: '',
        telephoneNumber: '',
        rank: '',
        position: '',
        profilePicture: '',
        lastLogin: '',
        amountOfLogins: 0,
        license: '',
        fireBrigade: '',
        chats: [],
        blackBoardEntries: [],
        blackBoardAssignments: [],
        workTime: [],
        certifiedCourses: [],
      },
    },
  ];
  await page.route('http://localhost:3000/black-board/*', async (route) => {
    await route.fulfill({ body: JSON.stringify(entries) });
  });
  await page.goto('http://localhost:4200/overview');
  const tasksHeader = page.getByText('Meine Tasks');
  await expect(tasksHeader).toBeVisible();
  const taskTitle = page.getByText('Task 1');
  await expect(taskTitle).toBeVisible();
});

test('Overview page displays member count', async ({ page }) => {
  await page.route('http://localhost:3000/users', async (route) => {
    await route.fulfill({ body: JSON.stringify([{ fireBrigade: '1' }]) });
  });
  await page.goto('http://localhost:4200/overview');
  const membersHeader = page.getByText('Aktuelle Mitgliedszahlen');
  await expect(membersHeader).toBeVisible();
  const memberCount = page.getByText('1');
  await expect(memberCount).toBeVisible();
});

test('Navigate from overview to add deployment and back', async ({ page }) => {
  await page.goto('http://localhost:4200/overview');
  const addDeploymentButton = page.getByRole('button', { name: 'Hinzufügen' });
  await addDeploymentButton.click();
  const addDeploymentHeader = page.getByText('Neuer Einsatzbericht');
  await expect(addDeploymentHeader).toBeVisible();
  await page.goBack();
  const overviewHeader = page.getByText('Einsätze der letzten 2 Wochen:');
  await expect(overviewHeader).toBeVisible();
});

test('Navigate from overview to member overview', async ({ page }) => {
  await page.goto('http://localhost:4200/overview');
  const showMembersButton = page.getByRole('button', {
    name: 'Mitglieder anzeigen',
  });
  await showMembersButton.click();
  const nameElement = page.getByText('Name');
  await expect(nameElement).toBeVisible();
  const positionElement = page.getByText('Position');
  await expect(positionElement).toBeVisible();
});

test('Clicking deployment in overview navigates to deployment details', async ({
  page,
}) => {
  const deployments = [
    {
      deploymentId: '1',
      date: '2024-12-28T10:00',
      deploymentTitle: 'Deployment 1',
    },
  ];
  await page.route('http://localhost:3000/deployments', async (route) => {
    await route.fulfill({ body: JSON.stringify(deployments) });
  });
  await page.route('http://localhost:3000/users/*', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: {
          fireBrigade: {
            address: 'Musterstraße 1, 12345 Musterstadt',
            name: 'Musterwehr',
          },
        },
      }),
    });
  });
  await page.goto('http://localhost:4200/overview');
  const deploymentIcon = page.getByText('info');
  await deploymentIcon.click();
  const deploymentDetailsHeader = page.getByText('Beschreibung des Einsatzes:');
  await expect(deploymentDetailsHeader).toBeVisible();
});
