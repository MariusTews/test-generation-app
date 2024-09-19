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
    'Mock every single HTTP request which is called during the test run with a fitting data response. ' +
    'Also mock all HTTP requests which are called inside of the "ngOnInit()" method of a component. ' +
    'Use the following syntax for this: "await page.route("[url]", async route => {await route.fulfill({body: JSON.stringify([response])})})". ' +
    'Make sure that the first parameter of the route method always contains the corresponding url of the HTTP request which should be mocked. ' +
    'Do not use if-statements to mock multiple HTTP requests. ' +
    'If the same HTTP request is called multiple times, then mock it multiple times. ' +
    'Use page.goto("http://localhost:4200/[parameters]") to navigate to a fitting starting page for the test. ' +
    'To find the fitting route parameters, use the app routing module, if it is provided to you. ' +
    'Add meaningful assertions at the end of each test. ' +
    'Use locators that are resilient to changes in the DOM. ' +
    'Use locators such as getByText, getByRole or getByPlaceholder. ' +
    'Do not locate an element using an aria-label. ' +
    'When using a fill or click call, then first create a separate variable for the selector. ' +
    'There is no "await" needed in front of such a variable declaration. ' +
    'To select a button inside of a menu, use the "menuitem" role. ' +
    'If there are multiple elements which correspond to the locator, then use the "nth()" method to choose only one element. ' +
    'If you search by a name, label or a text which is taken from a constants file, then use the value from the constant variable. ' +
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
    'Try to find at least one test case for each endpoint method. ' +
    'Make sure to mock everything that needs to be mocked. ' +
    'If the same function needs to be mocked multiple times, then use "mockReturnValueOnce" multiple times on the same "jest.spyOn" statement. ' +
    'At the end of each test, add senseful assertions that either test whether the return value is correct, or whether important funtions have been called correctly. ' +
    'If you import other files from the src folder, then do it like this: "import ExampleEntity from "../example/example.entity";". ' +
    'Do not import other files which are not used in the tests. ' +
    'If you need additional information or code to generate a good test, then prompt me for it. ' +
    'If your answer is the final test code, return only the code. ' +
    'Here is my code:\n';

  static readonly UNIT_PROMPT_FOLLOWUP =
    'Try to find more test cases for the endpoints I provided. ' +
    'Add one test for each test case and return the new test code with all previous tests and potential new tests. ' +
    'Make sure that all tests follow the rules which I provided to you in the last prompt.';

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
    'If the initial code was already changed due to an error, then use the new code, in which this error was fixed, as new original code. ' +
    'Return only the code, do not add any other text or explanation. ' +
    'Here is some additional information about the error:\n';
}
