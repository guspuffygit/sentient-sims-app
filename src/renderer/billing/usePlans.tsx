import { useQuery } from '@tanstack/react-query';
import { fetchAuthSession } from 'aws-amplify/auth';
import { SentientSimsAppClient } from 'main/sentient-sims/clients/SentientSimsAppClient';
import { Plan } from 'main/sentient-sims/models/UserInfo';
import { useMembership } from 'renderer/hooks/useMembership';
import { defaultPlans, patreonPlans, STRIPE_ENABLED } from './membershipView';

const client = new SentientSimsAppClient();

async function fetchPlans(host: string): Promise<Plan[]> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) {
    return defaultPlans;
  }
  const response = await client.sentientSimsAiApi.getPlans(token, host);
  return response.plans.length ? response.plans : defaultPlans;
}

// The plans a new member can join. With Stripe on these are its live prices, and the
// defaults stand in while they load or when the server cannot answer.
export function usePlans() {
  const { endpoint } = useMembership();
  const query = useQuery({
    queryKey: ['billing_plans', endpoint],
    queryFn: () => fetchPlans(endpoint),
    staleTime: 10 * 60 * 1000,
    retry: 1,
    enabled: STRIPE_ENABLED,
  });
  if (!STRIPE_ENABLED) {
    return { plans: patreonPlans, live: true, loading: false };
  }
  return { plans: query.data ?? defaultPlans, live: query.isSuccess, loading: query.isLoading };
}
