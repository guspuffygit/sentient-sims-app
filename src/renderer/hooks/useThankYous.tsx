import log from 'electron-log';
import { SentientSimsAppClient } from 'main/sentient-sims/clients/SentientSimsAppClient';
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

const client = new SentientSimsAppClient();

export function useThankYous() {
  const [thankYous, setThankYous] = useState<ThankYou>({
    dev: [],
    tier1: [],
    tier2: [],
  });

  useEffect(() => {
    client.sentientSimulationsWebsite
      .getThankYous()
      .then((response) => setThankYous(response))
      .catch((err: unknown) => log.error(`Unable to fetch thank yous`, err));
  }, []);

  return thankYous;
}
