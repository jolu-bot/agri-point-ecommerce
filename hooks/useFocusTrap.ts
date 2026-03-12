'use client';

import { useEffect, useRef } from 'react';

/* All element types that can receive keyboard focus */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Traps keyboard focus inside a container while `active` is true.
 *
 * - Focuses the first focusable element when the trap opens
 * - Keeps Tab / Shift-Tab cycling inside the container
 * - Calls `onEscape` (if provided) when the user presses Escape
 * - Restores focus to the previously focused element when the trap closes
 *
 * Usage:
 *   const modalRef = useFocusTrap<HTMLDivElement>(isOpen, () => setIsOpen(false));
 *   <div ref={modalRef}>...</div>
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  onEscape?: () => void,
) {
  const ref        = useRef<T>(null);
  const savedFocus = useRef<HTMLElement | null>(null);

  /* Activate: save current focus, auto-focus first element, install trap */
  useEffect(() => {
    if (!active) return;

    savedFocus.current = document.activeElement as HTMLElement;

    const el = ref.current;
    if (!el) return;

    const getFocusable = () =>
      Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));

    /* Small delay so Framer Motion finishes mounting before we focus */
    const timer = setTimeout(() => getFocusable()[0]?.focus(), 30);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }
      if (e.key !== 'Tab') return;

      const items = getFocusable();
      if (!items.length) return;
      const first = items[0];
      const last  = items[items.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  /* Deactivate: restore focus to the element that was focused before */
  useEffect(() => {
    if (!active && savedFocus.current) {
      savedFocus.current.focus();
      savedFocus.current = null;
    }
  }, [active]);

  return ref;
}
