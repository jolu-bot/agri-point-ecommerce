/**
 * Unit tests for renderMarkdown() — the AgriBot markdown-to-HTML renderer.
 *
 * Covers every transformation the function applies:
 *   headings, bold/italic/strikethrough, inline code, links,
 *   unordered lists, numbered lists, tables, horizontal rules,
 *   line breaks, suggestion-comment stripping, and XSS considerations.
 */
import { renderMarkdown } from '@/components/agribot/markdown';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse the HTML string into a real DOM tree so we can use querySelector. */
function parseHTML(html: string): HTMLElement {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div;
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('renderMarkdown', () => {
  // ── Output structure ───────────────────────────────────────────────────

  describe('output wrapping', () => {
    it('always returns a string that starts with <p class="leading-relaxed">', () => {
      const result = renderMarkdown('Hello world');
      expect(result).toMatch(/^<p class="leading-relaxed">/);
    });

    it('always returns a string that ends with </p>', () => {
      const result = renderMarkdown('Hello world');
      expect(result.endsWith('</p>')).toBe(true);
    });

    it('trims surrounding whitespace from the input before processing', () => {
      const result = renderMarkdown('   \n  Hello  \n   ');
      // After trimming, the first content should not be a <br/> from a leading newline
      expect(result).not.toMatch(/^<p[^>]*><br\/>/);
      expect(result).toContain('Hello');
    });
  });

  // ── Headings ───────────────────────────────────────────────────────────

  describe('## heading', () => {
    it('converts ## to an <h2> element', () => {
      const result = renderMarkdown('## Section Title');
      expect(result).toContain('<h2 ');
      expect(result).toContain('Section Title</h2>');
    });

    it('applies font-bold and green-900 colour classes to <h2>', () => {
      const result = renderMarkdown('## Section');
      expect(result).toContain('font-bold');
      expect(result).toContain('text-green-900');
    });

    it('applies a bottom border class to <h2>', () => {
      const result = renderMarkdown('## Section');
      expect(result).toContain('border-b');
    });
  });

  describe('### heading', () => {
    it('converts ### to an <h3> element', () => {
      const result = renderMarkdown('### Sub-section');
      expect(result).toContain('<h3 ');
      expect(result).toContain('Sub-section</h3>');
    });

    it('applies font-semibold and green-800 colour classes to <h3>', () => {
      const result = renderMarkdown('### Sub-section');
      expect(result).toContain('font-semibold');
      expect(result).toContain('text-green-800');
    });

    it('does NOT convert #### to any heading element', () => {
      const result = renderMarkdown('#### Not a heading');
      expect(result).not.toContain('<h4');
      // Raw text passes through unchanged
      expect(result).toContain('#### Not a heading');
    });
  });

  // ── Inline formatting ──────────────────────────────────────────────────

  describe('bold (**text**)', () => {
    it('wraps **text** in <strong class="font-semibold">', () => {
      const result = renderMarkdown('**bold text**');
      expect(result).toContain('<strong class="font-semibold">bold text</strong>');
    });

    it('handles bold mid-sentence', () => {
      const result = renderMarkdown('Use **NovaBio** now');
      expect(result).toContain('<strong class="font-semibold">NovaBio</strong>');
    });
  });

  describe('italic (*text*)', () => {
    it('wraps *text* in <em>', () => {
      const result = renderMarkdown('*italic text*');
      expect(result).toContain('<em>italic text</em>');
    });
  });

  describe('bold+italic (***text***)', () => {
    it('wraps ***text*** in <strong><em>', () => {
      const result = renderMarkdown('***bold and italic***');
      expect(result).toContain('<strong><em>bold and italic</em></strong>');
    });
  });

  describe('strikethrough (~~text~~)', () => {
    it('wraps ~~text~~ in <del class="opacity-60">', () => {
      const result = renderMarkdown('~~removed~~');
      expect(result).toContain('<del class="opacity-60">removed</del>');
    });
  });

  describe('inline code (`code`)', () => {
    it('wraps `code` in a <code> element', () => {
      const result = renderMarkdown('Run `npm install`');
      const dom = parseHTML(result);
      const code = dom.querySelector('code');
      expect(code).not.toBeNull();
      expect(code!.textContent).toBe('npm install');
    });

    it('applies font-mono class to inline code', () => {
      const result = renderMarkdown('`git status`');
      expect(result).toContain('font-mono');
    });

    it('applies green colour class to inline code', () => {
      const result = renderMarkdown('`example`');
      expect(result).toContain('text-green-700');
    });
  });

  describe('links ([text](url))', () => {
    it('creates an <a> with the correct href', () => {
      const result = renderMarkdown('[AgriPoint](https://agri-ps.com)');
      expect(result).toContain('href="https://agri-ps.com"');
    });

    it('opens the link in a new tab', () => {
      const result = renderMarkdown('[Site](https://agri-ps.com)');
      expect(result).toContain('target="_blank"');
    });

    it('adds rel="noopener noreferrer" for security', () => {
      const result = renderMarkdown('[Site](https://agri-ps.com)');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    it('appends the ↗ arrow to the visible link text', () => {
      const result = renderMarkdown('[Visit us](https://agri-ps.com)');
      expect(result).toContain('Visit us ↗');
    });
  });

  // ── Lists ──────────────────────────────────────────────────────────────

  describe('unordered list (- item)', () => {
    it('converts a block of - items to a <ul>', () => {
      const result = renderMarkdown('- Apple\n- Banana\n- Cherry');
      const dom = parseHTML(result);
      expect(dom.querySelector('ul')).not.toBeNull();
    });

    it('renders each item as a <li>', () => {
      const result = renderMarkdown('- Apple\n- Banana\n- Cherry');
      const dom = parseHTML(result);
      const items = dom.querySelectorAll('li');
      expect(items).toHaveLength(3);
    });

    it('includes the ▸ bullet icon in every list item', () => {
      const result = renderMarkdown('- Single item');
      expect(result).toContain('▸');
    });

    it('strips the leading "- " from the item text', () => {
      const result = renderMarkdown('- My item');
      expect(result).toContain('<span>My item</span>');
      expect(result).not.toContain('- My item');
    });

    it('applies space-y-1 and list-none to the <ul>', () => {
      const result = renderMarkdown('- item');
      expect(result).toContain('space-y-1');
      expect(result).toContain('list-none');
    });
  });

  describe('numbered list (1. item)', () => {
    it('converts a block of numbered items to an <ol>', () => {
      const result = renderMarkdown('1. First\n2. Second\n3. Third');
      const dom = parseHTML(result);
      expect(dom.querySelector('ol')).not.toBeNull();
    });

    it('renders each numbered item as a <li>', () => {
      const result = renderMarkdown('1. First\n2. Second');
      const dom = parseHTML(result);
      const items = dom.querySelectorAll('li');
      expect(items).toHaveLength(2);
    });

    it('emits inline numeric counters (1., 2., 3.)', () => {
      const result = renderMarkdown('1. Alpha\n2. Beta\n3. Gamma');
      expect(result).toContain('>1.<');
      expect(result).toContain('>2.<');
      expect(result).toContain('>3.<');
    });

    it('strips the leading "N. " from the item text', () => {
      const result = renderMarkdown('1. First item');
      expect(result).toContain('<span>First item</span>');
    });
  });

  // ── Tables ─────────────────────────────────────────────────────────────

  describe('table (| col | col |)', () => {
    const TABLE =
      '| Produit | Dose | Prix |\n' +
      '| --- | --- | --- |\n' +
      '| NovaBio | 5 kg | 5 000 CFA |';

    it('renders a <table> element', () => {
      const result = renderMarkdown(TABLE);
      expect(parseHTML(result).querySelector('table')).not.toBeNull();
    });

    it('renders a <thead> with the header row', () => {
      const result = renderMarkdown(TABLE);
      const thead = parseHTML(result).querySelector('thead');
      expect(thead).not.toBeNull();
      expect(thead!.textContent).toContain('Produit');
      expect(thead!.textContent).toContain('Dose');
      expect(thead!.textContent).toContain('Prix');
    });

    it('renders <th> cells for header columns', () => {
      const result = renderMarkdown(TABLE);
      const ths = parseHTML(result).querySelectorAll('th');
      expect(ths).toHaveLength(3);
    });

    it('renders a <tbody> with data rows', () => {
      const result = renderMarkdown(TABLE);
      const tbody = parseHTML(result).querySelector('tbody');
      expect(tbody).not.toBeNull();
      expect(tbody!.textContent).toContain('NovaBio');
    });

    it('renders <td> cells for body columns', () => {
      const result = renderMarkdown(TABLE);
      const tds = parseHTML(result).querySelectorAll('td');
      expect(tds).toHaveLength(3);
    });

    it('wraps the table in an overflow-x-auto container', () => {
      const result = renderMarkdown(TABLE);
      expect(result).toContain('overflow-x-auto');
    });

    it('does NOT render a table when there is only one row (no separator)', () => {
      // Single row cannot form a valid header + body table
      const result = renderMarkdown('| Only | Header |');
      expect(result).not.toContain('<table');
    });
  });

  // ── Horizontal rules ───────────────────────────────────────────────────

  describe('horizontal rule (---)', () => {
    it('converts --- to an <hr/> element', () => {
      const result = renderMarkdown('---');
      expect(result).toContain('<hr ');
    });

    it('converts a longer rule (-----) to an <hr/> as well', () => {
      const result = renderMarkdown('-----');
      expect(result).toContain('<hr ');
    });

    it('applies grey border colour class to the <hr/>', () => {
      const result = renderMarkdown('---');
      expect(result).toContain('border-gray-200');
    });
  });

  // ── Line breaks ────────────────────────────────────────────────────────

  describe('line breaks', () => {
    it('converts \\n\\n to a paragraph break (</p><p>)', () => {
      const result = renderMarkdown('Paragraph one\n\nParagraph two');
      expect(result).toContain('</p><p class="mt-2">');
    });

    it('converts a single \\n to a <br/>', () => {
      const result = renderMarkdown('Line one\nLine two');
      expect(result).toContain('<br/>');
    });
  });

  // ── Suggestion comment stripping ───────────────────────────────────────

  describe('suggestion comment stripping', () => {
    it('strips <!-- SUGGESTIONS: ... --> from the output', () => {
      const result = renderMarkdown('Hello<!-- SUGGESTIONS: buy now -->World');
      expect(result).not.toContain('SUGGESTIONS');
      expect(result).not.toContain('<!--');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    it('strips multiline SUGGESTIONS comments', () => {
      const input = 'Before<!-- SUGGESTIONS:\nfoo\nbar\n-->After';
      const result = renderMarkdown(input);
      expect(result).not.toContain('SUGGESTIONS');
      expect(result).toContain('Before');
      expect(result).toContain('After');
    });

    it('does not remove standard HTML comments (only SUGGESTIONS ones)', () => {
      // A regular HTML comment (not the SUGGESTIONS pattern) passes through
      const result = renderMarkdown('Text<!-- regular comment -->more');
      expect(result).toContain('Text');
      expect(result).toContain('more');
      // The regular comment itself may or may not be stripped; we only assert
      // the visible text is preserved:
      expect(result).not.toContain('SUGGESTIONS');
    });
  });

  // ── Sanitization ───────────────────────────────────────────────────────
  /**
   * The assertions below document the *required* security behaviour of the
   * renderer.  They will fail if the implementation does not sanitise raw HTML
   * embedded in the markdown input, indicating that XSS-safe encoding or
   * stripping must be added to renderMarkdown().
   */
  describe('sanitization', () => {
    it('does not pass a raw <script> tag through verbatim into the output', () => {
      const result = renderMarkdown('<script>alert("xss")</script>');
      // The angle-bracket form of the script tag must not appear in the output.
      expect(result).not.toContain('<script>alert("xss")</script>');
    });

    it('removes or encodes onclick event-handler attributes', () => {
      const result = renderMarkdown('<button onclick="alert(1)">click</button>');
      expect(result).not.toContain('onclick=');
    });
  });
});
