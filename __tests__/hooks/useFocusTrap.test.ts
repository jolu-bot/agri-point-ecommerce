/**
 * Unit tests for the useFocusTrap hook.
 *
 * Strategy: renderHook() starts with active=false so the ref is null when
 * the effect first runs.  We then mutate ref.current to point at a real DOM
 * container (with real <button> children) before re-rendering with
 * active=true.  This simulates how the hook is used inside a React component
 * that mounts DOM nodes before the effect fires.
 *
 * Covers:
 *   - No listener is added when active=false
 *   - A keydown listener is added when active=true and the ref is attached
 *   - The listener is removed when active returns to false
 *   - Escape key calls the onEscape callback
 *   - Tab from the last focusable element wraps to the first
 *   - Shift+Tab from the first focusable element wraps to the last
 *   - The first focusable element is auto-focused after the 30 ms delay
 *   - Focus is restored to the previously-focused element on deactivation
 */
import { renderHook, act } from '@testing-library/react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

// Convenience alias for mutating a React ref in tests without fighting the
// readonly modifier on RefObject.current.
type WritableRef<T extends HTMLElement> = { current: T | null };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Container = {
  container: HTMLDivElement;
  btn1: HTMLButtonElement;
  btn2: HTMLButtonElement;
};

/**
 * Creates a <div> with two <button> children and appends it to document.body.
 * Buttons are the canonical focusable elements matched by the hook's selector.
 */
function makeContainer(): Container {
  const container = document.createElement('div');

  const btn1 = document.createElement('button');
  btn1.textContent = 'First Button';

  const btn2 = document.createElement('button');
  btn2.textContent = 'Last Button';

  container.appendChild(btn1);
  container.appendChild(btn2);
  document.body.appendChild(container);

  return { container, btn1, btn2 };
}

/**
 * Builds a renderHook result for useFocusTrap that starts inactive,
 * then wires the ref to `container` and activates the trap.
 */
function buildActiveTrap(
  container: HTMLDivElement,
  onEscape?: () => void,
) {
  const { result, rerender } = renderHook(
    ({ active }: { active: boolean }) =>
      useFocusTrap<HTMLDivElement>(active, onEscape),
    { initialProps: { active: false } },
  );

  // Wire the ref to the real DOM container before activating.
  // Cast through WritableRef to allow assignment on the readonly RefObject.
  (result.current as unknown as WritableRef<HTMLDivElement>).current = container;

  act(() => {
    rerender({ active: true });
  });

  return { result, rerender };
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('useFocusTrap', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    // Clean up any DOM nodes appended during the test
    document.body.innerHTML = '';
  });

  // ── Inactive state ─────────────────────────────────────────────────────

  describe('when active=false', () => {
    it('does not add a keydown event listener', () => {
      const addSpy = jest.spyOn(document, 'addEventListener');

      renderHook(() => useFocusTrap(false));

      const keydownCalls = addSpy.mock.calls.filter(
        ([event]) => event === 'keydown',
      );
      expect(keydownCalls).toHaveLength(0);

      addSpy.mockRestore();
    });

    it('does not call onEscape when a keydown event is dispatched', () => {
      const onEscape = jest.fn();
      renderHook(() => useFocusTrap(false, onEscape));

      act(() => {
        document.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
        );
      });

      expect(onEscape).not.toHaveBeenCalled();
    });
  });

  // ── Active state — listener lifecycle ──────────────────────────────────

  describe('when active=true', () => {
    it('attaches a keydown listener to document', () => {
      const addSpy = jest.spyOn(document, 'addEventListener');
      const { container } = makeContainer();

      buildActiveTrap(container);

      const keydownCalls = addSpy.mock.calls.filter(
        ([event]) => event === 'keydown',
      );
      expect(keydownCalls.length).toBeGreaterThanOrEqual(1);

      addSpy.mockRestore();
    });

    it('removes the keydown listener when active becomes false again', () => {
      const removeSpy = jest.spyOn(document, 'removeEventListener');
      const { container } = makeContainer();

      const { rerender } = buildActiveTrap(container);

      act(() => {
        rerender({ active: false });
      });

      const keydownRemovals = removeSpy.mock.calls.filter(
        ([event]) => event === 'keydown',
      );
      expect(keydownRemovals.length).toBeGreaterThanOrEqual(1);

      removeSpy.mockRestore();
    });
  });

  // ── Escape key ─────────────────────────────────────────────────────────

  describe('Escape key', () => {
    it('calls onEscape once when Escape is pressed while the trap is active', () => {
      const onEscape = jest.fn();
      const { container } = makeContainer();

      buildActiveTrap(container, onEscape);

      act(() => {
        document.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
        );
      });

      expect(onEscape).toHaveBeenCalledTimes(1);
    });

    it('does not throw if onEscape is not provided and Escape is pressed', () => {
      const { container } = makeContainer();
      buildActiveTrap(container); // no onEscape

      expect(() => {
        act(() => {
          document.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
          );
        });
      }).not.toThrow();
    });
  });

  // ── Tab cycling ────────────────────────────────────────────────────────

  describe('Tab key cycling', () => {
    it('wraps forward focus from the last element to the first on Tab', () => {
      const { container, btn1, btn2 } = makeContainer();
      buildActiveTrap(container);

      // Put focus on the last element
      btn2.focus();
      expect(document.activeElement).toBe(btn2);

      act(() => {
        document.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Tab',
            bubbles: true,
            cancelable: true,
          }),
        );
      });

      expect(document.activeElement).toBe(btn1);
    });

    it('does NOT redirect focus when Tab is pressed on a non-last element', () => {
      const { container, btn1, btn2 } = makeContainer();
      buildActiveTrap(container);

      // Focus the first button (not the last), so normal Tab should proceed
      btn1.focus();

      act(() => {
        document.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Tab',
            bubbles: true,
            cancelable: true,
          }),
        );
      });

      // Focus should NOT have been moved to btn1 programmatically
      // (btn1 is still focused — the browser would move it, but jsdom doesn't)
      expect(document.activeElement).toBe(btn1);
    });

    it('wraps backward focus from the first element to the last on Shift+Tab', () => {
      const { container, btn1, btn2 } = makeContainer();
      buildActiveTrap(container);

      // Put focus on the first element
      btn1.focus();
      expect(document.activeElement).toBe(btn1);

      act(() => {
        document.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Tab',
            shiftKey: true,
            bubbles: true,
            cancelable: true,
          }),
        );
      });

      expect(document.activeElement).toBe(btn2);
    });

    it('does NOT redirect focus on Shift+Tab when focus is not on the first element', () => {
      const { container, btn2 } = makeContainer();
      buildActiveTrap(container);

      // Focus the last button (not the first)
      btn2.focus();

      act(() => {
        document.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Tab',
            shiftKey: true,
            bubbles: true,
            cancelable: true,
          }),
        );
      });

      expect(document.activeElement).toBe(btn2);
    });
  });

  // ── Auto-focus ─────────────────────────────────────────────────────────

  describe('auto-focus on activation', () => {
    it('focuses the first focusable element after the 30 ms timer fires', () => {
      const { container, btn1 } = makeContainer();
      buildActiveTrap(container);

      // Timer has not fired yet
      expect(document.activeElement).not.toBe(btn1);

      act(() => {
        jest.runAllTimers();
      });

      expect(document.activeElement).toBe(btn1);
    });

    it('does NOT auto-focus when active is false', () => {
      const { container, btn1 } = makeContainer();

      // Only render with active=false — never activate
      const { result } = renderHook(() => useFocusTrap<HTMLDivElement>(false));
      (result.current as unknown as WritableRef<HTMLDivElement>).current = container;

      act(() => {
        jest.runAllTimers();
      });

      expect(document.activeElement).not.toBe(btn1);
    });
  });

  // ── Focus restoration ──────────────────────────────────────────────────

  describe('focus restoration on deactivation', () => {
    it('restores focus to the previously focused element when deactivated', () => {
      // Create an element outside the trap that holds focus initially
      const previousButton = document.createElement('button');
      previousButton.textContent = 'Outside Button';
      document.body.appendChild(previousButton);
      previousButton.focus();
      expect(document.activeElement).toBe(previousButton);

      const { container } = makeContainer();
      const { rerender, result } = renderHook(
        ({ active }: { active: boolean }) => useFocusTrap<HTMLDivElement>(active),
        { initialProps: { active: false } },
      );

      (result.current as unknown as WritableRef<HTMLDivElement>).current = container;

      // Activate — savedFocus captures previousButton as the prior active element
      act(() => {
        rerender({ active: true });
      });

      // Run the auto-focus timer so focus moves inside the trap
      act(() => {
        jest.runAllTimers();
      });

      // Deactivate — focus should be restored to previousButton
      act(() => {
        rerender({ active: false });
      });

      expect(document.activeElement).toBe(previousButton);
    });
  });
});
