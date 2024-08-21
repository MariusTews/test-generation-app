export default class Prompts {
  static readonly e2ePromptInit =
    'This is the start of a new, isolated conversation. ' +
    'Write an end-to-end test for an Angular application using the Playwright test framework. ' +
    'Try to find critical paths in the scope of the components I provided. ' +
    'Write one test for each critical path. ' +
    'Assume that the application is running on http://localhost:4200/. ' +
    'Assume that you are an authorized, already logged in user of the application. ' +
    'Mock every HTTP request of any type with an appropriate data response. ' +
    'Use locators that are resilient to changes in the DOM. ' +
    'If possible, every locator should find the corresponding element by its role and text or placeholder. ' +
    'Use locators such as getByLabel, getByText, getByRole or getByPlaceholder. ' +
    'If you use the getByRole locator, make sure that it searches for the correct role. ' +
    'If you search by a name, label or a text which is taken from a Constants file, then use the value from the constant variable. ' +
    'Do not explicitly wait for elements to be loaded. ' +
    'Do not create custom page objects. ' +
    'Do not import other files which are not used in the tests. ' +
    'Assume that all paths for imports from the source files can start with src. ' +
    'Set the test timeout limit to 15 seconds by using the setTimeout method. ' +
    'If you need additional information or code to generate a good test, then prompt me for it. ' +
    'Start your answer with #nocode, if your answer is not the final test code. ' +
    'If your answer is the final test code, return only the code and start your answer with #code. ' +
    'Here is my code:\n';

  static readonly unitPromptInit =
    'This is the start of a new, isolated conversation. ' +
    'Write a unit test for a NestJS backend using the Jest test framework. ' +
    'Make sure to mock everything that needs to be mocked. ' +
    'Do not import other files which are not used in the tests. ' +
    'If you need additional information or code to generate a good test, then prompt me for it. ' +
    'Start your answer with #nocode, if your answer is not the final test code. ' +
    'If your answer is the final test code, return only the code and start your answer with #code. ' +
    'Here is my code:\n';

  static readonly errorPromptInit =
    'When I run the test, it results in an error. ' +
    'Please try to fix the error by changing the code line which causes the error. ' +
    'Return only the code line or segment which needs to be changed to fix the error and start your answer with #code. ' +
    'Here is some additional information about the error:\n';
}
