import { Given, Then, Before } from '@cucumber/cucumber';
import { expect, request, APIRequestContext, APIResponse } from '@playwright/test';

let apiRequest: APIRequestContext; // Stores the request context
let response: APIResponse;

Before(async function () {
  apiRequest = await request.newContext();
});

Given('I navigate to the {string}', async function (endpoint: string) {
  response = await apiRequest.get(`http://localhost:3000${endpoint}`);
});

Then('the response status should be {int}', async function (expectedStatus: number) {
  expect(response.status()).toBe(expectedStatus);
});

Then('I should see message containing {string}', async function (expectedText: string) {
  const responseBody = await response.text();
  expect(responseBody).toContain(expectedText);
});
