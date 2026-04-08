import { test, expect } from '@playwright/test';

/**
 * CHECKOUT E2E SMOKE TESTS
 * Validate storefront and checkout contracts without UI timing dependencies.
 */

test.describe('Storefront Smoke', () => {
  test('/produits returns HTML', async ({ page }) => {
    const response = await page.request.get('/produits');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    expect((response.headers()['content-type'] || '')).toContain('text/html');
  });

  test('/panier returns HTML', async ({ page }) => {
    const response = await page.request.get('/panier');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    expect((response.headers()['content-type'] || '')).toContain('text/html');
  });

  test('/checkout is reachable or redirects to login', async ({ page }) => {
    const response = await page.request.get('/checkout', {
      maxRedirects: 0,
    });

    expect([200, 301, 302, 307, 308]).toContain(response.status());
  });

  test('/api/products returns a valid payload', async ({ page }) => {
    const response = await page.request.get('/api/products');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('products');
    expect(Array.isArray(data.products)).toBeTruthy();
  });
});
