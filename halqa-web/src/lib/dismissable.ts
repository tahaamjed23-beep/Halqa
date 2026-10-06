// ---------------------------------------------------------------------------
// DISMISSING A LAYER
//
// Every sheet and dialog in the application needs the same four things, and
// getting any of them wrong is a different accessibility failure:
//
//   Escape closes it            WCAG 2.1.1, every function from a keyboard
//   Tab cycles inside it        WCAG 2.1.2, no keyboard trap behind the layer
//   The page behind cannot      so a member using a screen reader does not
//     scroll                    wander out of the dialog without knowing
//   Focus returns where it      WCAG 2.4.3, focus order stays meaningful
//     came from
//
// This was written once, inside system.tsx, and five other sheets did not use
// it: AddSource, ExitSheet, JoinSheet, LegalFooter and Receipt all closed on a
// click of the backdrop and on nothing else. A member on a keyboard had to find
// the close button, and a member on a screen reader could tab straight out of
// the dialog into the page behind it. It lives here now so there is one copy.
// ---------------------------------------------------------------------------
import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),'
  + 'textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function useDismissable(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const restore = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restore.current = document.activeElement as HTMLElement;
    const node = ref.current;
    // Focus moves into the layer, so the next Tab does not land behind it.
    const first = node?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? node)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key !== 'Tab' || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(el => el.offsetParent !== null);
      if (!items.length) return;
      const a = items[0], z = items[items.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      restore.current?.focus?.();
    };
  }, [open, onClose]);

  return ref;
}
