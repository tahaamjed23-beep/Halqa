import { useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// BACK OUT OF AN OVERLAY
//
// A screen that opens a sub-page or a sheet in component state is invisible to
// the browser: the URL does not change, so the hardware back button and the
// browser's own back arrow do nothing, and a member is stuck inside it with
// only the on-screen arrow to get out. Worse, navigating to the parent screen
// again lands you back in the sub-page you were already in.
//
// This pushes one history entry while the overlay is open and closes the
// overlay when that entry is popped. Back means back, everywhere.
//
// It used to re-arm on every render, because every caller passes a fresh
// arrow function as `close`. Re-arming stepped back off its own entry, and the
// pop that produced closed the overlay: every sheet in the app shut itself the
// moment anything behind it changed, such as a day being picked or a letter
// being typed. The overlay now arms once per opening and reads the latest
// `close` from a ref.
// ---------------------------------------------------------------------------

/** Back steps taken by this module itself, which no overlay may read as the member pressing back. */
let ownPops = 0;
let swallowing = false;
let seq = 0;
if (typeof window !== 'undefined') {
  // Registered first and on capture, so it has decided before any overlay listens.
  window.addEventListener('popstate', () => {
    swallowing = ownPops > 0;
    if (swallowing) ownPops -= 1;
  }, true);
}

type OverlayState = { halqaOverlay?: number } | null;
const current = () => (window.history.state as OverlayState)?.halqaOverlay;

export function useBackToClose(isOpen: boolean, close: () => void) {
  const closeRef = useRef(close);
  useEffect(() => { closeRef.current = close });

  useEffect(() => {
    if (!isOpen) return;
    const id = ++seq;
    let pushed = false;
    // Deferred by a tick. In development React mounts, unmounts and mounts
    // again at once; an entry pushed on the first mount would be stranded.
    const push = window.setTimeout(() => {
      window.history.pushState({ halqaOverlay: id }, '');
      pushed = true;
    }, 0);
    const onPop = () => {
      if (swallowing || !pushed) return;
      // Still on our own entry: something opened above us was closed instead.
      if (current() === id) return;
      pushed = false;
      closeRef.current();
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.clearTimeout(push);
      window.removeEventListener('popstate', onPop);
      if (!pushed) return;
      // Closed by the on-screen control: step back off our entry so the next
      // back press goes where the member expects. Only if our entry is still
      // the current one; when the close came with a move to another screen,
      // that screen's entry is current and must not be undone.
      window.setTimeout(() => {
        if (current() === id) { ownPops += 1; window.history.back() }
      }, 0);
    };
  }, [isOpen]);
}
