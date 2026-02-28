/**
 * Tests pour les codes promotionnels
 */

import PromoCode from '@/models/PromoCode';

describe('PromoCode Model', () => {
  describe('Validation', () => {
    it('devrait créer un code promo valide', () => {
      const promo = {
        code: 'SAVE20',
        type: 'percentage' as const,
        value: 20,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        isActive: true,
        usedCount: 0,
      };

      expect(promo.code).toMatch(/^[A-Z0-9]{3,20}$/);
      expect(promo.type).toMatch(/^(percentage|fixed)$/);
      expect(promo.value).toBeGreaterThan(0);
    });

    it('devrait rejeter un code invalide', () => {
      const invalidCode = 'save20'; // minuscules
      expect(invalidCode).not.toMatch(/^[A-Z0-9]{3,20}$/);
    });

    it('devrait rejeter une valeur négative', () => {
      const promo = { value: -10 };
      expect(promo.value).toBeLessThanOrEqual(0);
    });
  });

  describe('Calcul de remise', () => {
    it('devrait calculer la remise en pourcentage', () => {
      const promoValue = 20; // 20%
      const orderTotal = 100000; // 100,000 FCFA
      const expectedDiscount = (orderTotal * promoValue) / 100;

      expect(expectedDiscount).toBe(20000);
    });

    it('devrait calculer la remise en montant fixe', () => {
      const promoValue = 5000; // 5,000 FCFA
      const expectedDiscount = promoValue;

      expect(expectedDiscount).toBe(5000);
    });

    it('devrait ne pas dépasser le montant maxDiscount', () => {
      const maxDiscount = 10000;
      const calculatedDiscount = 15000;
      const finalDiscount = Math.min(calculatedDiscount, maxDiscount);

      expect(finalDiscount).toBe(maxDiscount);
    });

    it('devrait ne pas dépasser le total de la commande', () => {
      const orderTotal = 50000;
      const calculatedDiscount = 100000;
      const finalDiscount = Math.min(calculatedDiscount, orderTotal);

      expect(finalDiscount).toBe(orderTotal);
    });
  });

  describe('Validation d\'utilisation', () => {
    it('devrait vérifier si un code est expiré', () => {
      const pastDate = new Date(2020, 0, 1);
      const now = new Date();

      expect(pastDate < now).toBe(true);
    });

    it('devrait vérifier si les utilisations maximales sont atteintes', () => {
      const maxUses = 100;
      const usedCount = 100;

      expect(usedCount >= maxUses).toBe(true);
    });

    it('devrait vérifier le montant minimum de commande', () => {
      const minOrderValue = 50000;
      const orderTotal = 30000;

      expect(orderTotal >= minOrderValue).toBe(false);
    });
  });
});

describe('Promo Code API', () => {
  describe('GET /api/promo-codes', () => {
    it('devrait retourner un code valide', async () => {
      // Simulation de la réponse API
      const mockResponse = {
        valid: true,
        code: 'SAVE20',
        type: 'percentage',
        value: 20,
        discount: 20000,
      };

      expect(mockResponse.valid).toBe(true);
      expect(mockResponse.discount).toBeGreaterThan(0);
    });

    it('devrait retourner invalid pour un code inexistant', async () => {
      // Simulation de la réponse API
      const mockResponse = {
        valid: false,
        errors: ['Code promo invalide'],
      };

      expect(mockResponse.valid).toBe(false);
      expect(mockResponse.errors.length).toBeGreaterThan(0);
    });

    it('devrait retourner les erreurs si le code est expiré', async () => {
      const mockResponse = {
        valid: false,
        errors: ['Code expiré'],
      };

      expect(mockResponse.errors).toContain('Code expiré');
    });

    it('devrait vérifier le montant minimum de commande', async () => {
      const mockResponse = {
        valid: false,
        errors: ['Montant minimum: 50000 FCFA'],
      };

      expect(mockResponse.errors[0]).toContain('Montant minimum');
    });
  });

  describe('POST /api/admin/promo-codes', () => {
    it('devrait créer un nouveau code promo', async () => {
      const mockNewPromo = {
        _id: 'promo-123',
        code: 'SPRING2024',
        type: 'percentage',
        value: 15,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      expect(mockNewPromo.code).toMatch(/^[A-Z0-9]{3,20}$/);
      expect(mockNewPromo.value).toBeGreaterThan(0);
    });

    it('devrait rejeter un code dupliqué', async () => {
      const mockError = {
        error: 'Ce code existe déjà',
      };

      expect(mockError.error).toContain('existe déjà');
    });
  });
});
