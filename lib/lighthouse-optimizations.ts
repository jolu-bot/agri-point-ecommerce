/**
 * Accessibility & SEO Enhancements
 * Script to fix common Lighthouse issues
 */

// ── ACCESSIBILITY FIXES ────────────────────────────────────────────────────

// 1. Add label to buttons missing descriptions
export const addAriaLabels = () => {
  if (typeof document === 'undefined') return;

  const buttons = document.querySelectorAll('button:not([aria-label])');
  buttons.forEach((btn) => {
    if (!btn.getAttribute('aria-label') && !btn.textContent?.trim()) {
      const icon = btn.querySelector('svg, img, i');
      if (icon) {
        const ariaLabel = icon.getAttribute('data-label') || 'Button';
        btn.setAttribute('aria-label', ariaLabel);
      }
    }
  });

  // Add role="navigation" to nav elements
  const navs = document.querySelectorAll('nav:not([role])');
  navs.forEach((nav) => nav.setAttribute('role', 'navigation'));

  // Add aria-label to links without visible text
  const links = document.querySelectorAll('a:not([aria-label])');
  links.forEach((link) => {
    if (!link.textContent?.trim() && !link.getAttribute('aria-label')) {
      const title = link.getAttribute('title');
      if (title) link.setAttribute('aria-label', title);
    }
  });

  // Ensure form inputs have labels
  const inputs = document.querySelectorAll('input:not([aria-label])');
  inputs.forEach((input) => {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (!label && !input.getAttribute('aria-label')) {
      input.setAttribute('aria-label', input.getAttribute('placeholder') || 'Input field');
    }
  });
};

// ── SEO ENHANCEMENTS ───────────────────────────────────────────────────────

// 2. Add structured data for better SEO
export const addStructuredData = () => {
  if (typeof document === 'undefined') return;

  // Check if already added
  if (document.querySelector('script[type="application/ld+json"]')) return;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AGRI POINT SERVICE',
    url: 'https://agri-ps.com',
    logo: 'https://agri-ps.com/images/logo.png',
    description: 'Distributeur de biofertilisants au Cameroun',
    sameAs: [
      'https://www.facebook.com/agripoint',
      'https://www.twitter.com/agripoint',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'contact@agri-ps.com',
    },
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
};

// ── IMAGE OPTIMIZATION ─────────────────────────────────────────────────────

// 3. Lazy load images properly
export const optimizeImages = () => {
  if (typeof document === 'undefined') return;

  const images = document.querySelectorAll<HTMLImageElement>('img:not([loading="lazy"])');
  images.forEach((img) => {
    // Skip critical images (above the fold)
    if (!img.closest('[data-critical]')) {
      img.loading = 'lazy';
    }

    // Ensure srcset for responsive images
    if (!img.srcset && img.src) {
      img.srcset = img.src;
    }
  });

  // Use Intersection Observer for advanced lazy loading
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      }
    });
  });

  document.querySelectorAll<HTMLImageElement>('img[data-src]').forEach((img) => observer.observe(img));
};

// ── Web Vitals Monitoring ──────────────────────────────────────────────────

// 4. Monitor Core Web Vitals
export const monitorWebVitals = () => {
  if (typeof window === 'undefined') return;

  // LCP - Largest Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries() as any[];
        const lastEntry = entries.pop();
        if (lastEntry) {
          console.debug('LCP:', lastEntry.renderTime || lastEntry.loadTime);
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Polyfill not available
    }
  }

  // FID - First Input Delay
  if ('PerformanceEventTiming' in window) {
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries() as any[];
        for (const evt of entries) {
          if (evt.processingDuration > 0) {
            console.debug('FID:', evt.processingDuration);
          }
        }
      }).observe({ entryTypes: ['first-input'], durationThreshold: 0 } as any);
    } catch (e) {
      // Not supported
    }
  }

  // CLS - Cumulative Layout Shift
  try {
    new PerformanceObserver((entryList) => {
      let clsValue = 0;
      const entries = entryList.getEntries() as any[];
      for (const evt of entries) {
        if (!evt.hadRecentInput) {
          clsValue += evt.value;
        }
      }
      console.debug('CLS:', clsValue);
    }).observe({ entryTypes: ['layout-shift'], durationThreshold: 0 } as any);
  } catch (e) {
    // Not supported
  }
};

// ── Initialize all optimizations ───────────────────────────────────────────

export const initializeOptimizations = () => {
  if (typeof window === 'undefined') return;

  // Run after DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      addAriaLabels();
      addStructuredData();
      optimizeImages();
      monitorWebVitals();
    });
  } else {
    addAriaLabels();
    addStructuredData();
    optimizeImages();
    monitorWebVitals();
  }
};
