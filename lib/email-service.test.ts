/**
 * Tests pour le service email
 */

import { sendOrderConfirmation, sendFollowUpEmail, sendAdminNotification } from '@/lib/email-service';
import nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('Email Service', () => {
  const mockSendMail = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
      verify: jest.fn().mockResolvedValue(true),
    });
  });

  const mockOrder = {
    _id: 'order-123',
    orderNumber: 'ORD-001',
    user: {
      _id: 'user-123',
      email: 'client@example.com',
      name: 'Jean Dupont',
    },
    items: [
      {
        product: 'prod-1',
        productName: 'Semences maïs',
        productImage: '/img/seeds.jpg',
        quantity: 2,
        price: 5000,
        total: 10000,
      },
    ],
    subtotal: 10000,
    discount: 0,
    shipping: 2000,
    tax: 1200,
    total: 13200,
    shippingAddress: {
      name: 'Jean Dupont',
      phone: '+237 6XX XXX XXX',
      street: 'Rue Cameroun',
      city: 'Yaoundé',
      region: 'Centre',
      country: 'Cameroun',
    },
    paymentMethod: 'campost' as const,
    paymentStatus: 'pending' as const,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  } as any;

  describe('sendOrderConfirmation', () => {
    it('devrait envoyer un email de confirmation de commande', async () => {
      await sendOrderConfirmation(mockOrder);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'client@example.com',
          subject: expect.stringContaining('ORD-001'),
        })
      );
    });

    it('devrait gérer les erreurs gracieusement', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('SMTP Error'));

      const result = await sendOrderConfirmation(mockOrder);

      expect(result).toBe(false);
    });

    it('devrait retourner false si l\'email client est manquant', async () => {
      const invalidOrder = { ...mockOrder, user: { ...mockOrder.user, email: '' } };

      const result = await sendOrderConfirmation(invalidOrder);

      expect(result).toBe(false);
    });
  });

  describe('sendFollowUpEmail', () => {
    it('devrait envoyer un email de suivi', async () => {
      await sendFollowUpEmail(mockOrder, 'Client a demandé des conseils sur le maïs');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'client@example.com',
          subject: expect.stringContaining('Suivi'),
        })
      );
    });

    it('devrait inclure le résumé de la conversation si fourni', async () => {
      await sendFollowUpEmail(mockOrder, 'Conversation résumée');

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('Conversation résumée');
    });
  });

  describe('sendAdminNotification', () => {
    it('devrait envoyer une notification admin', async () => {
      process.env.ADMIN_EMAIL = 'admin@agri-ps.com';

      await sendAdminNotification(mockOrder, 'new_order');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'admin@agri-ps.com',
        })
      );
    });

    it('devrait inclure le type d\'événement dans le sujet', async () => {
      process.env.ADMIN_EMAIL = 'admin@agri-ps.com';

      await sendAdminNotification(mockOrder, 'payment_received');

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.subject).toContain('ADMIN');
    });
  });
});
