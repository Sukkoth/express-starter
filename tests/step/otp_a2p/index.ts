import { Before, Given, Then, When } from '@cucumber/cucumber';
import {
  expect,
  request,
  APIRequestContext,
  APIResponse,
} from '@playwright/test';

let apiRequest: APIRequestContext; // Stores the request context
let response: APIResponse;


const TEST_JWT_KEY = process.env.JWT_FOR_TEST || 'hello';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
Before(async function () {
  apiRequest = await request.newContext();
});


Given('the server is running', async function () {
  response = await apiRequest.get(BASE_URL);
});

When(
  'I send a GET request to the root {string}',
  async function (endpoint: string) {
    response = await apiRequest.get(`${BASE_URL}${endpoint}`);
  },
);
Then('the response status code should be {int}', async function (expectedStatus: number) {
  expect(response.status()).toBe(expectedStatus);
});

Then('the response body should be {string}', async function (expectedText: string) {
  const responseBody = await response.text();
  expect(responseBody).toContain(expectedText);
});

When(
  'I send a POST request to {string} with valid JWT authorization',
  async function (endpoint: string) {
    response = await apiRequest.post(`${BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${TEST_JWT_KEY}`,
      },
    });
  },
);

Then('the a2p response status code should be {int}', function (statusCode: string) {
  expect(response.status()).toBe(statusCode);
});

Then('the otp verification response status code should be {int}', function (statusCode: string) {
  expect(response.status()).toBe(statusCode);
});

Then('the response body should contain {string} as {string}', async function (key:string,body: string) {
  const responseBody = await response.json();
  expect(responseBody[key]).toBe(body);
});


