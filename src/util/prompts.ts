import Constants from './constants';

export default class Prompts {
  static readonly E2E_PROMPT_INIT =
    'This is the start of a new, isolated conversation. ' +
    'Use the value ' +
    Constants.TEMPERATURE +
    ' for the temperature parameter. ' +
    'Write an end-to-end test for an Angular application using the Playwright test framework. ' +
    'Try to find at least three critical paths in the scope of the components I provided. ' +
    'Write one test for each critical path. ' +
    'Assume that you are an authorized, already logged in user of the application. ' +
    'Mock every HTTP request of any type which is used during the test run with an appropriate data response at the beginning of each test. ' +
    'Use the following syntax for this: "await page.route("**/parameter", async route => {await route.fulfill({})})". ' +
    'Do not use if-statements to mock multiple HTTP requests. ' +
    'If the same HTTP request is called multiple times, then mock it once, but change the return value before it is called again during the test run. ' +
    'Use page.goto("http://localhost:4200/[parameters]") to navigate to a fitting starting page for the test after you have mocked all HTTP requests. ' +
    'To find the fitting route parameters, use the app routing module, if it is provided to you. ' +
    'Add meaningful assertions at the end of each test. ' +
    'Use locators that are resilient to changes in the DOM. ' +
    'Use locators such as getByText, getByRole or getByPlaceholder. ' +
    'Do not locate an element using an aria-label. ' +
    'When using a fill or click call, then first create a separate variable for the selector. ' +
    'There is no "await" needed in front of such a variable declaration. ' +
    'To select a button inside of a menu, use the "menuitem" role. ' +
    'If you search by a name, label or a text which is taken from a constants file, then use the value from the constant variable. ' +
    'If you create an object inside the test, use this syntax: "const object = {data: 0} as Type". ' +
    'Do not explicitly wait for elements to be loaded. ' +
    'Do not create custom page objects. ' +
    'Do not import other files which are not used in the tests. ' +
    'Assume that all paths for imports from the source files can start with src and that they can be imported without "{}". ' +
    'Set the test timeout limit to 15 seconds by using the setTimeout method. ' +
    'If you need additional information or code to generate a good test, then prompt me for it. ' +
    'If your answer is the final test code, return only the code. ' +
    'Here is my code:\n';

  static readonly E2E_PROMPT_FOLLOWUP =
    'Try to find more critical paths in the scope of the components I provided. ' +
    'Add one test for each critical path and return the new test code with all previous tests and potential new tests. ' +
    'Make sure that all tests follow the rules which I provided to you in the last prompt.';

  static readonly UNIT_PROMPT_INIT =
    'This is the start of a new, isolated conversation. ' +
    'Use the value ' +
    Constants.TEMPERATURE +
    ' for the temperature parameter. ' +
    'Write a unit test for a NestJS backend using the Jest test framework. ' +
    'Make sure to mock everything that needs to be mocked. ' +
    'Do not import other files which are not used in the tests. ' +
    'If you need additional information or code to generate a good test, then prompt me for it. ' +
    'If your answer is the final test code, return only the code. ' +
    'Here is my code:\n';

  static readonly UNIT_PROMPT_FOLLOWUP =
    'Make sure once again that all requirements from the previous prompt are met. ' +
    'If necessary, rewrite parts of the tests to meet the requirements. ' +
    'Finally, return the overhauled test code.';

  // static readonly ERROR_PROMPT_INIT =
  //   'When I run the test, it results in an error. ' +
  //   'Please try to fix the error by changing the code line or segment which causes the error. ' +
  //   'Return two alternative code lines or segments which could fix the error. ' +
  //   'Return only the code lines/segments. ' +
  //   'An example answer would be:\n' +
  //   '(1) value = 0\n' +
  //   '(2) value = 1\n' +
  //   'Here is some additional information about the error:\n';

  static readonly ERROR_PROMPT_INIT =
    'When I run the test, it results in an error. ' +
    'Please try to fix the error by changing the code line or segment which causes the error. ' +
    'Return the same test code as before, but now with the changes made to fix the error. ' +
    'Return only the code, do not add any other text or explanation. ' +
    'Here is some additional information about the error:\n';
}
