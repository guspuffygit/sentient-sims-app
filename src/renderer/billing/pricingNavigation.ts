import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type PricingState = { backTo?: { pathname: string; tab?: string } };

// The Settings page keeps its tab in component state, so going back a history step would reopen it on the first tab
export function useOpenPricingFromPlan() {
  const navigate = useNavigate();
  return useCallback(() => {
    const state: PricingState = { backTo: { pathname: '/settings', tab: 'membership' } };
    void navigate('/pricing', { state });
  }, [navigate]);
}

export function usePricingBack() {
  const navigate = useNavigate();
  const location = useLocation();
  const backTo = (location.state as PricingState | null)?.backTo;
  return useCallback(() => {
    if (backTo) {
      void navigate(backTo.pathname, { state: { tab: backTo.tab } });
    } else {
      void navigate(-1);
    }
  }, [navigate, backTo]);
}
