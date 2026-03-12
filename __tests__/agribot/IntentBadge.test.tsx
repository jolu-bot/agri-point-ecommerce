/**
 * Unit tests for the IntentBadge component.
 *
 * Verifies:
 *   - Correct label rendered for every known intent in both FR and EN
 *   - Unknown intent falls back to the 'conseil' configuration
 *   - The correct Tailwind colour classes are applied for each intent
 *   - The badge always has the rounded-full pill shape
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { IntentBadge } from '@/components/agribot/IntentBadge';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

// lucide-react icons are replaced with empty components so the tests focus on
// text content and class names rather than SVG rendering.
jest.mock('lucide-react', () => {
  const MockIcon = () => null;
  MockIcon.displayName = 'MockIcon';
  return {
    Leaf:          MockIcon,
    Package:       MockIcon,
    ShoppingCart:  MockIcon,
    UserCircle2:   MockIcon,
    AlertTriangle: MockIcon,
    Sparkles:      MockIcon,
    TrendingUp:    MockIcon,
    Map:           MockIcon,
    Phone:         MockIcon,
  };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the rendered <span> element for the given intent + locale. */
function renderBadge(intent: string, locale?: string): HTMLElement {
  const { container } = render(
    <IntentBadge intent={intent} locale={locale} />,
  );
  return container.firstElementChild as HTMLElement;
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('IntentBadge', () => {
  // ── French labels (default locale) ──────────────────────────────────────

  describe('French labels (locale="fr" / default)', () => {
    const FR_CASES: Array<[string, string]> = [
      ['conseil',    'Conseil'],
      ['produit',    'Produit'],
      ['commande',   'Commande'],
      ['compte',     'Mon compte'],
      ['urgence',    'Urgent'],
      ['culture',    'Culture'],
      ['campagne',   'Campagne'],
      ['roi',        'ROI'],
      ['navigation', 'Navigation'],
    ];

    it.each(FR_CASES)(
      'renders "%s" intent with French label "%s"',
      (intent, expectedLabel) => {
        renderBadge(intent, 'fr');
        expect(screen.getByText(expectedLabel)).toBeInTheDocument();
      },
    );

    it('uses French as the default when locale prop is omitted', () => {
      render(<IntentBadge intent="conseil" />);
      expect(screen.getByText('Conseil')).toBeInTheDocument();
    });
  });

  // ── English labels ───────────────────────────────────────────────────────

  describe('English labels (locale="en")', () => {
    const EN_CASES: Array<[string, string]> = [
      ['conseil',    'Advice'],
      ['produit',    'Product'],
      ['commande',   'Order'],
      ['compte',     'My account'],
      ['urgence',    'Urgent'],
      ['culture',    'Crop'],
      ['campagne',   'Campaign'],
      ['roi',        'ROI'],
      ['navigation', 'Navigation'],
    ];

    it.each(EN_CASES)(
      'renders "%s" intent with English label "%s"',
      (intent, expectedLabel) => {
        renderBadge(intent, 'en');
        expect(screen.getByText(expectedLabel)).toBeInTheDocument();
      },
    );
  });

  // ── Unknown intent fallback ──────────────────────────────────────────────

  describe('unknown intent', () => {
    it('falls back to the "conseil" config for an unrecognised intent key', () => {
      const badge = renderBadge('some_unknown_intent', 'fr');
      // The fallback config is conseil → green colour classes
      expect(badge.className).toContain('bg-green-100');
      expect(badge.className).toContain('text-green-700');
    });

    it('renders the raw intent string as the label when no i18n key exists', () => {
      renderBadge('totally_new_intent', 'fr');
      expect(screen.getByText('totally_new_intent')).toBeInTheDocument();
    });
  });

  // ── Colour classes ───────────────────────────────────────────────────────

  describe('colour classes', () => {
    const COLOUR_CASES: Array<[string, string, string]> = [
      ['conseil',    'bg-green-100',   'text-green-700'],
      ['produit',    'bg-blue-100',    'text-blue-700'],
      ['commande',   'bg-orange-100',  'text-orange-700'],
      ['compte',     'bg-purple-100',  'text-purple-700'],
      ['urgence',    'bg-red-100',     'text-red-700'],
      ['culture',    'bg-emerald-100', 'text-emerald-700'],
      ['campagne',   'bg-amber-100',   'text-amber-700'],
      ['roi',        'bg-teal-100',    'text-teal-700'],
      ['navigation', 'bg-indigo-100',  'text-indigo-700'],
    ];

    it.each(COLOUR_CASES)(
      '"%s" intent has background class %s and text class %s',
      (intent, bgClass, textClass) => {
        const badge = renderBadge(intent, 'fr');
        expect(badge.className).toContain(bgClass);
        expect(badge.className).toContain(textClass);
      },
    );
  });

  // ── Badge shape and structure ────────────────────────────────────────────

  describe('badge structure', () => {
    it('renders as a <span> element', () => {
      const badge = renderBadge('conseil', 'fr');
      expect(badge.tagName.toLowerCase()).toBe('span');
    });

    it('always has the rounded-full pill class', () => {
      const badge = renderBadge('urgence', 'en');
      expect(badge.className).toContain('rounded-full');
    });

    it('always has the inline-flex layout class', () => {
      const badge = renderBadge('produit', 'fr');
      expect(badge.className).toContain('inline-flex');
    });

    it('always has the font-medium typography class', () => {
      const badge = renderBadge('roi', 'en');
      expect(badge.className).toContain('font-medium');
    });
  });
});
