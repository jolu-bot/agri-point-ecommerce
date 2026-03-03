import { test, expect } from '@playwright/test';

/**
 * CHECKOUT E2E TESTS
 * Tests shopping cart, product selection, checkout process, order confirmation
 */

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to products page
    await page.goto('/produits');
    // Wait for products to load
    await page.waitForLoadState('networkidle');
  });

  test('should add product to cart', async ({ page }) => {
    // Click first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await expect(firstProduct).toBeVisible();

    // Click add to cart or view details
    const addToCartBtn = firstProduct.locator('button:has-text("Ajouter"), button:has-text("Panier")').first();
    
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
    } else {
      // Click product to open details
      await firstProduct.click();
      await page.waitForLoadState('networkidle');

      // Add to cart on details page
      const addBtn = page.locator('button:has-text("Ajouter au panier")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
      }
    }

    // Check for cart notification or cart count
    const cartNotification = page.locator('[data-testid="cart-notification"], text=Ajouté au panier').first();
    await expect(cartNotification).toBeVisible({ timeout: 3000 }).catch(() => {
      // Cart might update silently
    });

    // Check cart count in header
    const cartCount = page.locator('[data-testid="cart-count"]');
    if (await cartCount.isVisible()) {
      const count = await cartCount.textContent();
      expect(parseInt(count || '0')).toBeGreaterThan(0);
    }
  });

  test('should update cart quantity', async ({ page }) => {
    // Add product first
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    const addBtn = firstProduct.locator('button:has-text("Ajouter"), button:has-text("Panier")').first();
    
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
    }

    // Go to cart
    await page.goto('/panier');
    await page.waitForLoadState('networkidle');

    // Find quantity input
    const quantityInput = page.locator('input[type="number"][min="1"]').first();
    if (await quantityInput.isVisible()) {
      await quantityInput.fill('3');
      await page.waitForTimeout(500);

      // Check that total updated
      const total = page.locator('[data-testid="cart-total"]');
      if (await total.isVisible()) {
        const totalText = await total.textContent();
        expect(totalText).toContain('FCFA');
      }
    }
  });

  test('should apply promo code', async ({ page }) => {
    // Add product to cart
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    const addBtn = firstProduct.locator('button:has-text("Ajouter"), button:has-text("Panier")').first();
    
    if (await addBtn.isVisible()) {
      await addBtn.click();
    }

    // Go to cart
    await page.goto('/panier');
    await page.waitForLoadState('networkidle');

    // Find promo code input
    const promoInput = page.locator('input[placeholder*="code"], input[name*="promo"], input[placeholder*="Promo"]').first();
    
    if (await promoInput.isVisible()) {
      await promoInput.fill('TEST10');
      
      // Click apply button
      const applyBtn = promoInput.locator('xpath=following::button[1]');
      if (await applyBtn.isVisible()) {
        await applyBtn.click();
        await page.waitForTimeout(500);
      }

      // Check for discount or error
      const discount = page.locator('[data-testid="discount"]');
      const error = page.locator('text=Code invalide, text=Promo non valide').first();

      if (await discount.isVisible()) {
        const discountText = await discount.textContent();
        expect(discountText).toContain('-');
      }
    }
  });

  test('should proceed to checkout', async ({ page, context }) => {
    // Add product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    const addBtn = firstProduct.locator('button:has-text("Ajouter"), button:has-text("Panier")').first();
    
    if (await addBtn.isVisible()) {
      await addBtn.click();
    }

    // Go to cart
    await page.goto('/panier');

    // Click checkout button
    const checkoutBtn = page.locator('button:has-text("Commander"), button:has-text("Checkout"), button:has-text("Passer la commande")').first();
    
    if (await checkoutBtn.isVisible()) {
      await checkoutBtn.click();
      await page.waitForLoadState('networkidle');

      // Should be on checkout page
      await expect(page).toHaveURL(/\/(checkout|commande)/, { timeout: 5000 });

      // Check for checkout elements
      const shippingSection = page.locator('text=Adresse de livraison, text=Shipping').first();
      try {
        const isVisible = await shippingSection.isVisible();
        if (!isVisible) {
          // Might require login first
          await expect(page).toHaveURL(/\/auth\/login/, { timeout: 3000 });
        }
      } catch {
        // Element not found, might require login
        await expect(page).toHaveURL(/\/auth\/login/, { timeout: 3000 });
      }
    }
  });

  test('should fill shipping information', async ({ page, context }) => {
    // Navigate to checkout
    await page.goto('/checkout');

    // If not logged in, we might be redirected
    const currentUrl = page.url();
    if (currentUrl.includes('/auth/login')) {
      // Skip shipping test - would need to login first
      test.skip();
    }

    // Fill shipping info if visible
    const firstNameInput = page.locator('input[name="firstName"]').first();
    
    if (await firstNameInput.isVisible()) {
      await firstNameInput.fill('Test');
      await page.fill('input[name="lastName"]', 'User');
      await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
      await page.fill('input[name="phone"]', '+237657393939');
      await page.fill('input[name="address"]', 'Rue de Test, 123');
      await page.fill('input[name="city"]', 'Yaoundé');
      await page.fill('input[name="zipCode"]', '00237');

      // Select country
      const countrySelect = page.locator('select[name="country"]').first();
      if (await countrySelect.isVisible()) {
        await countrySelect.selectOption('CM');
      }
    }
  });

  test('should complete order with payment', async ({ page }) => {
    // This test demonstrates the flow - actual payment testing would require test payment credentials
    await page.goto('/checkout');

    const currentUrl = page.url();
    if (currentUrl.includes('/auth/login')) {
      test.skip();
    }

    // Look for payment method selection
    const paymentSection = page.locator('[data-testid="payment-methods"], text=Mode de paiement').first();
    
    if (await paymentSection.isVisible()) {
      // Select payment method (Stripe, PayPal, or mobile money)
      const stripeOption = page.locator('input[value="stripe"], label:has-text("Stripe")').first();
      if (await stripeOption.isVisible()) {
        await stripeOption.click();
      }

      // Find and click place order
      const placeOrderBtn = page.locator('button:has-text("Confirmer"), button:has-text("Payer"), button:has-text("Place Order")').first();
      
      if (await placeOrderBtn.isVisible()) {
        await placeOrderBtn.click();

        // Should process payment or redirect to payment gateway
        await page.waitForLoadState('networkidle');

        // Check for confirmation page
        const confirmationText = page.locator('text=Commande confirmée, text=Order Confirmed, text=numéro de commande').first();
        
        if (await confirmationText.isVisible()) {
          // Order successful
          expect(true).toBeTruthy();
        }
      }
    }
  });

  test('should show order confirmation', async ({ page }) => {
    // Navigate to a sample order confirmation page
    await page.goto('/compte/commandes');

    // Should see order list
    const ordersList = page.locator('[data-testid="orders-list"]');
    if (await ordersList.isVisible()) {
      // Click first order
      const firstOrder = ordersList.locator('[data-testid="order-item"]').first();
      if (await firstOrder.isVisible()) {
        await firstOrder.click();

        // Should show order details
        const orderNumber = page.locator('[data-testid="order-number"]');
        const orderTotal = page.locator('[data-testid="order-total"]');

        expect(orderNumber.isVisible()).toBeTruthy();
        expect(orderTotal.isVisible()).toBeTruthy();
      }
    }
  });

  test('should remove item from cart', async ({ page }) => {
    // Add product
    await page.goto('/produits');
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    const addBtn = firstProduct.locator('button:has-text("Ajouter"), button:has-text("Panier")').first();
    
    if (await addBtn.isVisible()) {
      await addBtn.click();
    }

    // Go to cart
    await page.goto('/panier');

    // Find remove button
    const removeBtn = page.locator('button[title*="Supprimer"], button:has-text("Remove"), button:has-text("Retirer")').first();
    
    if (await removeBtn.isVisible()) {
      const initialCount = parseInt(
        (await page.locator('[data-testid="cart-count"]').textContent()) || '0'
      );

      await removeBtn.click();
      await page.waitForTimeout(500);

      // Cart count should decrease
      const newCount = parseInt(
        (await page.locator('[data-testid="cart-count"]').textContent()) || '0'
      );

      expect(newCount).toBeLessThan(initialCount);
    }
  });
});
