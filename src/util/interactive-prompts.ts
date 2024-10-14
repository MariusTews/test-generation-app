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
    'Return only this test code and use my further instructions to build and improve the test step by step. ' +
    'Here is my code: ';
}
