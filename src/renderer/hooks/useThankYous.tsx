/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import { useEffect, useState } from 'react';

export type ThankYouUser = {
  name: string;
  avatar: string;
};

export type ThankYou = {
  tier1: ThankYouUser[];
  tier2: ThankYouUser[];
  dev: ThankYouUser[];
};

export function useThankYous() {
  const [thankYous, setThankYous] = useState<ThankYou>({
    dev: [],
    tier1: [],
    tier2: [],
  });

  useEffect(() => {
    fetch('https://www.sentientsimulations.com/thankyou.json')
      .then((res) => res.json())
      .then((response: ThankYou) => {
        setThankYous(response);
      });
  }, []);

  return thankYous;
}
