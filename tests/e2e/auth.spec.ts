import { test, expect } from '@playwright/test';

/**
 * AUTHENTICATION E2E TESTS
 * Tests user registration, login, JWT refresh, logout flows
 */

const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!@#',
  phone: '+237657393939',
  firstName: 'Test',
  lastName: 'User',
};

test.describe('Authentication Flow', () => {
  test('should register a new user', async ({ page }) => {
    await page.goto('/auth/register');

    // Check page loaded
    await expect(page.locator('text=Créer un compte')).toBeVisible();

    // Fill registration form
    await page.fill('input[name="firstName"]', TEST_USER.firstName);
    await page.fill('input[name="lastName"]', TEST_USER.lastName);
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="phone"]', TEST_USER.phone);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.fill('input[name="confirmPassword"]', TEST_USER.password);

    // Accept terms
    await page.check('input[type="checkbox"]');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Should redirect to login or show success
    await expect(page).toHaveURL(/\/(auth\/login|compte)/, { timeout: 5000 });
  });

  test('should login with valid credentials', async ({ page, context }) => {
    // Use existing user or register first
    await page.goto('/auth/login');

    // Check page loaded
    await expect(page.locator('text=Connexion')).toBeVisible();

    // Fill login form
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);

    // Submit
    await page.locator('button[type="submit"]').click();

    // Should redirect to dashboard or home
    await expect(page).toHaveURL(/\/(compte|admin|dashboard)/, { timeout: 5000 });

    // Check that auth token is stored
    const cookies = await context.cookies();
    const accessToken = cookies.find(c => c.name === 'accessToken');
    expect(accessToken).toBeDefined();
    expect(accessToken?.value).toBeTruthy();
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'WrongPassword123');

    await page.locator('button[type="submit"]').click();

    // Should show error message
    await expect(page.locator('text=Email ou mot de passe incorrect')).toBeVisible({
      timeout: 3000,
    });

    // Should stay on login page
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should logout user', async ({ page, context }) => {
    // Login first
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.locator('button[type="submit"]').click();

    // Wait for redirect
    await expect(page).toHaveURL(/\/(compte|admin)/, { timeout: 5000 });

    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Déconnexion"), [role="button"]:has-text("Logout")').first();
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // Try dropdown menu
      await page.locator('[role="button"]:has-text("Menu")').first().click();
      await page.locator('text=Déconnexion').click();
    }

    // Should redirect to home or login
    await expect(page).toHaveURL(/(\/$|\/auth\/login)/, { timeout: 3000 });

    // Auth token should be cleared
    const cookies = await context.cookies();
    const accessToken = cookies.find(c => c.name === 'accessToken');
    expect(!accessToken || !accessToken.value).toBeTruthy();
  });

  test('should handle forgot password flow', async ({ page }) => {
    await page.goto('/auth/forgot-password');

    await expect(page.locator('text=Mot de passe oublié')).toBeVisible();

    // Enter email
    await page.fill('input[name="email"]', TEST_USER.email);

    // Submit
    await page.locator('button[type="submit"]').click();

    // Should show success message
    await expect(page.locator('text=Vérifiez votre')).toBeVisible({
      timeout: 3000,
    });
  });

  test('should persist login across page reloads', async ({ page, context }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.locator('button[type="submit"]').click();

    // Wait to be authenticated
    await expect(page).toHaveURL(/\/(compte|admin)/, { timeout: 5000 });

    // Get token
    let cookies = await context.cookies();
    const tokenBefore = cookies.find(c => c.name === 'accessToken')?.value;

    // Reload page
    await page.reload();

    // Should still be authenticated
    cookies = await context.cookies();
    const tokenAfter = cookies.find(c => c.name === 'accessToken')?.value;

    expect(tokenAfter).toBeTruthy();
    // Token might be refreshed, but should exist
  });
});
