import { useEffect, useState } from 'react';

// A committee app is used on patchy mobile data. Saying so plainly, and saying
// that nothing was charged, is the difference between a member waiting and a
// member paying twice.
export function OfflineBanner() {
  const [offline, setOffline] = useState(() =>
    typeof navigator !== 'undefined' && navigator.onLine === false);
  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  if (!offline) return null;
  return <div className="offline-banner" role="status">No connection. Nothing is being charged.</div>;
}

export default OfflineBanner;
