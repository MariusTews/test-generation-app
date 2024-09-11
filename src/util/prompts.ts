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
    'Mock every HTTP request of any type with an appropriate data response by using the route method of the page object at appropriate places in each test. ' +
    'Only use a "*" inside of the url of a route method call to replace the first part of the string. ' +
    'Do not use a "*" to replace the part after the first url parameter, instead use the real url part here. ' +
    'Do not use if-statements inside of such a route method call. ' +
    'If the same HTTP request is called multiple times, then mock it once, but change the return value before it is called again during the test run if necessary. ' +
    'Assume that the application is running on http://localhost:4200/. ' +
    'Use the goto method of the page object to navigate to a fitting starting page for the test. ' +
    'To find a fitting route, use the app routing module, if it is provided to you. ' +
    'If data is fetched when loading the page, then call the goto method after the corresponding HTTP requests are mocked. ' +
    'Use locators that are resilient to changes in the DOM. ' +
    'Use locators such as getByLabel, getByText, getByRole or getByPlaceholder. ' +
    'If you use the getByRole locator, then use it in this way: page.getByRole("role").filter({ hasText: "text" });. ' +
    'Do not locate an element using an aria-label. ' +
    'When using a fill or click call, then first create a separate variable for the selector. ' +
    'There is no "await" needed in front of such a variable declaration. ' +
    'To select a button inside of a menu, use the "menuitem" role. ' +
    'If you search by a name, label or a text which is taken from a Constants file, then use the value from the constant variable. ' +
    'If you create an object inside the test, use this syntax: "const object: Type = {data: 0} as Type". ' +
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
    'Before returning, make sure once again that all requirements from the previous prompt are met. ' +
    'If necessary, rewrite parts of the tests to meet the requirements.';

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
    'Do not add any explanation regarding the error. ' +
    'If the error occurs because an element can not be located, then try to use this locator syntax to fix the error: page.getByRole("role").filter({ hasText: "text" });. ' +
    'Here is some additional information about the error:\n';
}
