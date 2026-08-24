import { useEffect } from 'react';

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
// ---------------------------------------------------------------------------
export function useBackToClose(isOpen: boolean, close: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    // A marker in the state, so we only respond to our own entry.
    window.history.pushState({ halqaOverlay: true }, '');
    const onPop = () => close();
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      // Closing by the on-screen control leaves our entry behind; drop it so
      // the next back press goes where the member expects.
      if ((window.history.state as { halqaOverlay?: boolean } | null)?.halqaOverlay) {
        window.history.back();
      }
    };
  }, [isOpen, close]);
}
