/**
 * Unit tests for the EscalationCard component.
 *
 * Verifies:
 *   - WhatsApp link points to the correct phone number
 *   - WhatsApp URL contains the (encoded) context text
 *   - HTML tags in context are stripped before encoding
 *   - Context is truncated to 200 characters
 *   - Phone call link has the tel: href
 *   - French and English locale strings are rendered correctly
 *   - Accessible role and aria-label attributes are present
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { EscalationCard } from '@/components/agribot/EscalationCard';
import { AGRIBOT_UI } from '@/lib/agribot-i18n';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

// framer-motion — replace motion.div with a plain <div> that forwards only
// the DOM-safe props so React does not warn about unknown attributes.
// NOTE: jest.mock factories are hoisted before imports, so React must be
// obtained via require() rather than using the top-level import.
jest.mock('framer-motion', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { forwardRef, createElement } = require('react') as typeof import('react');

  const MockMotionDiv = forwardRef(
    (
      props: {
        children?: React.ReactNode;
        className?: string;
        role?: string;
        'aria-label'?: string;
        [key: string]: unknown;
      },
      ref: React.Ref<HTMLDivElement>,
    ) => {
      const { children, className, role } = props;
      const ariaLabel = props['aria-label'];
      return createElement(
        'div',
        { ref, className, role, 'aria-label': ariaLabel },
        children,
      );
    },
  );
  MockMotionDiv.displayName = 'MockMotionDiv';

  return {
    motion: { div: MockMotionDiv },
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
  };
});

// lucide-react — only Phone and AlertTriangle are used in EscalationCard
jest.mock('lucide-react', () => {
  const MockIcon = () => null;
  return { Phone: MockIcon, AlertTriangle: MockIcon };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PHONE_NUMBER = '237657393939'; // without the leading +

function renderCard(context: string, locale?: string) {
  render(<EscalationCard context={context} locale={locale} />);
}

/** Escapes special regex characters so a raw i18n string can be used in new RegExp(). */
function escRx(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getWhatsAppLink(): HTMLAnchorElement {
  return screen.getByRole('link', {
    name: new RegExp(escRx(AGRIBOT_UI.fr.escalation.whatsapp), 'i'),
  }) as HTMLAnchorElement;
}

function getWhatsAppLinkEN(): HTMLAnchorElement {
  return screen.getByRole('link', {
    name: new RegExp(escRx(AGRIBOT_UI.en.escalation.whatsapp), 'i'),
  }) as HTMLAnchorElement;
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('EscalationCard', () => {
  // ── WhatsApp link ──────────────────────────────────────────────────────

  describe('WhatsApp link', () => {
    it('href starts with the wa.me URL containing the correct phone number', () => {
      renderCard('Test context', 'fr');
      const link = getWhatsAppLink();
      expect(link).toHaveAttribute(
        'href',
        expect.stringContaining(`wa.me/${PHONE_NUMBER}`),
      );
    });

    it('href contains the encoded context text', () => {
      renderCard('tomato disease', 'fr');
      const link = getWhatsAppLink();
      const decoded = decodeURIComponent(link.getAttribute('href') ?? '');
      expect(decoded).toContain('tomato disease');
    });

    it('strips HTML tags from the context before encoding', () => {
      renderCard('<strong>Urgent</strong> pest problem', 'fr');
      const link = getWhatsAppLink();
      const decoded = decodeURIComponent(link.getAttribute('href') ?? '');
      expect(decoded).toContain('Urgent pest problem');
      expect(decoded).not.toContain('<strong>');
    });

    it('truncates the context to at most 200 characters', () => {
      const longContext = 'x'.repeat(300);
      renderCard(longContext, 'fr');
      const link = getWhatsAppLink();
      const decoded = decodeURIComponent(link.getAttribute('href') ?? '');
      // The encoded portion of the context (after the waPrefix) must not
      // exceed 200 characters.
      const prefixFr = AGRIBOT_UI.fr.escalation.waPrefix;
      const bodyAfterPrefix = decoded.slice(decoded.indexOf(prefixFr) + prefixFr.length);
      expect(bodyAfterPrefix.length).toBeLessThanOrEqual(200);
    });

    it('prepends the French waPrefix to the context', () => {
      renderCard('My crop issue', 'fr');
      const link = getWhatsAppLink();
      const decoded = decodeURIComponent(link.getAttribute('href') ?? '');
      expect(decoded).toContain(AGRIBOT_UI.fr.escalation.waPrefix);
    });

    it('prepends the English waPrefix when locale="en"', () => {
      renderCard('My crop issue', 'en');
      const link = getWhatsAppLinkEN();
      const decoded = decodeURIComponent(link.getAttribute('href') ?? '');
      expect(decoded).toContain(AGRIBOT_UI.en.escalation.waPrefix);
    });

    it('opens in a new tab with noopener noreferrer', () => {
      renderCard('context', 'fr');
      const link = getWhatsAppLink();
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  // ── Phone call link ────────────────────────────────────────────────────

  describe('phone call link', () => {
    it('has href="tel:+237657393939"', () => {
      renderCard('context', 'fr');
      const phoneLink = screen.getByRole('link', {
        name: new RegExp(escRx(AGRIBOT_UI.fr.escalation.call), 'i'),
      });
      expect(phoneLink).toHaveAttribute('href', 'tel:+237657393939');
    });

    it('phone call link is present for locale="en" as well', () => {
      renderCard('context', 'en');
      const phoneLink = screen.getByRole('link', {
        name: new RegExp(escRx(AGRIBOT_UI.en.escalation.call), 'i'),
      });
      expect(phoneLink).toHaveAttribute('href', 'tel:+237657393939');
    });
  });

  // ── French locale strings ──────────────────────────────────────────────

  describe('locale="fr"', () => {
    beforeEach(() => renderCard('some context', 'fr'));

    it('displays the French title', () => {
      expect(
        screen.getByText(AGRIBOT_UI.fr.escalation.title),
      ).toBeInTheDocument();
    });

    it('displays the French description', () => {
      expect(
        screen.getByText(AGRIBOT_UI.fr.escalation.desc),
      ).toBeInTheDocument();
    });

    it('displays the French WhatsApp button label', () => {
      expect(
        screen.getByText(AGRIBOT_UI.fr.escalation.whatsapp),
      ).toBeInTheDocument();
    });

    it('displays the French call button label', () => {
      expect(
        screen.getByText(AGRIBOT_UI.fr.escalation.call),
      ).toBeInTheDocument();
    });

    it('uses French as the default when locale prop is omitted', () => {
      render(<EscalationCard context="ctx" />);
      expect(
        screen.getAllByText(AGRIBOT_UI.fr.escalation.title).length,
      ).toBeGreaterThanOrEqual(1);
    });
  });

  // ── English locale strings ─────────────────────────────────────────────

  describe('locale="en"', () => {
    beforeEach(() => renderCard('some context', 'en'));

    it('displays the English title', () => {
      expect(
        screen.getByText(AGRIBOT_UI.en.escalation.title),
      ).toBeInTheDocument();
    });

    it('displays the English description', () => {
      expect(
        screen.getByText(AGRIBOT_UI.en.escalation.desc),
      ).toBeInTheDocument();
    });

    it('displays the English WhatsApp button label', () => {
      expect(
        screen.getByText(AGRIBOT_UI.en.escalation.whatsapp),
      ).toBeInTheDocument();
    });

    it('displays the English call button label', () => {
      expect(
        screen.getByText(AGRIBOT_UI.en.escalation.call),
      ).toBeInTheDocument();
    });
  });

  // ── Accessibility ──────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('renders the card with role="complementary"', () => {
      renderCard('context', 'fr');
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('sets aria-label to the French escalation title by default', () => {
      renderCard('context', 'fr');
      const card = screen.getByRole('complementary');
      expect(card).toHaveAttribute(
        'aria-label',
        AGRIBOT_UI.fr.escalation.title,
      );
    });

    it('sets aria-label to the English escalation title for locale="en"', () => {
      renderCard('context', 'en');
      const card = screen.getByRole('complementary');
      expect(card).toHaveAttribute(
        'aria-label',
        AGRIBOT_UI.en.escalation.title,
      );
    });
  });
});
