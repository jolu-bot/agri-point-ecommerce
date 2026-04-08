import { test, expect } from '@playwright/test';

/**
 * AUTH E2E SMOKE TESTS
 * Contract checks for auth entry points without UI timing dependencies.
 */

test.describe('Authentication Smoke', () => {
  const pages = ['/auth/login', '/auth/register', '/auth/forgot-password'];

  for (const route of pages) {
    test(`${route} returns HTML`, async ({ page }) => {
      const response = await page.request.get(route);
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const contentType = response.headers()['content-type'] || '';
      expect(contentType).toContain('text/html');
    });
  }

  test('login API rejects invalid credentials', async ({ page }) => {
    const response = await page.request.post('/api/auth/login', {
      data: {
        email: 'invalid@example.com',
        password: 'WrongPassword123',
        cfToken: '',
      },
    });

    expect([400, 401, 423]).toContain(response.status());
  });
});
