import { useEffect, useState } from 'react';
import { LAUNCH_BONUS } from './membershipView';

const TICK_MS = 60 * 1000;

// The current time, refreshed every minute while the launch offer is open and once more the moment it
// closes, so an app left open drops the offer at the cutoff
export function useLaunchOfferClock(): number {
  const [now, setNow] = useState(() => Date.now());
  const closesAt = Date.parse(LAUNCH_BONUS.joinBy);
  const open = now < closesAt;

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const tick = setInterval(() => {
      setNow(Date.now());
    }, TICK_MS);
    const close = setTimeout(
      () => {
        setNow(Date.now());
      },
      Math.max(0, closesAt - Date.now()) + 50,
    );
    return () => {
      clearInterval(tick);
      clearTimeout(close);
    };
  }, [open, closesAt]);

  return now;
}
