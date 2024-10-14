import Constants from './constants';

export default class InteractivePrompts {
  static readonly E2E_PROMPT_INIT =
    'This is the start of a new, isolated conversation. ' +
    'Use the value ' +
    Constants.TEMPERATURE +
    ' for the temperature parameter. ' +
    'The goal of this conversation is to produce an end-to-end test for an Angular application using the Playwright test framework. ' +
    'At first, generate such a test which only contains the general test structure. ' +
    'Then, try to find critical paths in the scope of the components I provided. ' +
    'Add one test for the most important critical path which you found. ' +
    'Follow these instructions for this test: ' +
    'Assume that you are an authorized, already logged in user of the application. ' +
    'Mock every HTTP request in this way: "await page.route("[url]", async route => {await route.fulfill({body: JSON.stringify([response])})})". ' +
    'Use page.goto("http://localhost:4200/[parameters]") to navigate to a fitting starting page for the test after you have mocked all HTTP requests. ' +
    'Use locators such as getByText, getByRole or getByPlaceholder. ' +
    'Add meaningful assertions by using "await expect..." statements at the end of the test. ' +
    'Set the test timeout limit to 15 seconds by using the setTimeout method. ' +
    'Return only this test code and use my further instructions to build and improve the test step by step. ' +
    'Do not add any other explanation or text, only return the test code. ' +
    'Use code comments as placeholders to mark places where additional code needs to be inserted. ' +
    'Here is my code:\n';

  static readonly UNIT_PROMPT_INIT =
    'This is the start of a new, isolated conversation. ' +
    'Use the value ' +
    Constants.TEMPERATURE +
    ' for the temperature parameter. ' +
    'The goal of this conversation is to produce a unit test for a NestJS backend using the Jest test framework. ' +
    'At first, generate such a test which only contains the general test structure. ' +
    'Then, add one test for the first service method of the provided endpoint.' +
    'Follow these instructions for this test: ' +
    'Mock every database access using "jest.spyOn". ' +
    'Add senseful assertions at the end of the test. ' +
    'Return only this test code and use my further instructions to build and improve the test step by step. ' +
    'Do not add any other explanation or text, only return the test code. ' +
    'Use code comments as placeholders to mark places where additional code needs to be inserted. ' +
    'Here is my code:\n';

  static readonly PROMPT_INSTRUCTION_INIT =
    'Apply this instruction to the test code and return only the new test code:\n';
}
