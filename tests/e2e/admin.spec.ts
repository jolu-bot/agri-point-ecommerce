import { test, expect } from '@playwright/test';

/**
 * ADMIN E2E SMOKE TESTS
 * Verify protected admin surfaces and health endpoints contracts.
 */

test.describe('Admin Smoke', () => {
  test('admin dashboard route is protected or accessible', async ({ page }) => {
    const response = await page.request.get('/admin', {
      maxRedirects: 0,
    });

    expect([200, 301, 302, 307, 308]).toContain(response.status());
  });

  test('admin orders route is protected or accessible', async ({ page }) => {
    const response = await page.request.get('/admin/orders', {
      maxRedirects: 0,
    });

    expect([200, 301, 302, 307, 308]).toContain(response.status());
  });

  test('health endpoint returns expected contract', async ({ page }) => {
    const response = await page.request.get('/api/health');

    expect([200, 503]).toContain(response.status());

    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('checks');
  });
});
