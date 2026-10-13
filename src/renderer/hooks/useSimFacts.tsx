import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SentientSimsAppClient } from 'main/sentient-sims/clients/SentientSimsAppClient';
import { AddFactRequest, SimFactsResponse } from 'main/sentient-sims/clients/SimFactsClient';

const client = new SentientSimsAppClient();

export type SimFactsHook = {
  data?: SimFactsResponse;
  isLoading: boolean;
  error?: string;
  addFact: (request: AddFactRequest) => void;
  editFact: (factId: number, objectText: string) => void;
  retireFact: (factId: number) => void;
};

/**
 * One Sim's semantic facts (Phase 3.1 H4). No staleTime: facts change while the game runs
 * (a marriage, a promotion, something the Sim was just told), so reopening the dialog
 * should show what is true now rather than what was true when it was last opened.
 */
export function useSimFacts(simId?: string, history = false): SimFactsHook {
  const queryClient = useQueryClient();
  const queryKey = ['simFacts', simId, history];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => client.simFacts.getFacts(simId as string, { history }),
    enabled: simId !== undefined,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['simFacts', simId] });
  };

  const add = useMutation({
    mutationFn: (request: AddFactRequest) => client.simFacts.addFact(simId as string, request),
    onSuccess: invalidate,
  });

  const edit = useMutation({
    mutationFn: ({ factId, objectText }: { factId: number; objectText: string }) =>
      client.simFacts.editFact(simId as string, factId, { objectText }),
    onSuccess: invalidate,
  });

  const retire = useMutation({
    mutationFn: (factId: number) => client.simFacts.retireFact(simId as string, factId),
    onSuccess: invalidate,
  });

  const failure = error ?? add.error ?? edit.error ?? retire.error;

  return {
    data,
    isLoading,
    error: failure ? (failure instanceof Error ? failure.message : String(failure)) : undefined,
    addFact: (request: AddFactRequest) => {
      add.mutate(request);
    },
    editFact: (factId: number, objectText: string) => {
      edit.mutate({ factId, objectText });
    },
    retireFact: (factId: number) => {
      retire.mutate(factId);
    },
  };
}

export type FactVocabulary = {
  // The predicates whose value is plain text: the ones a player can type a value for
  attributes: string[];
  // What every predicate (edges included) means, in the player's words
  help: Record<string, string>;
};

/**
 * The fact vocabulary, served by the app so the UI never hardcodes it. Cached for the
 * session: unlike facts, the list only changes when the app itself does.
 */
export function useFactVocabulary(enabled = true): FactVocabulary {
  const { data } = useQuery({
    queryKey: ['factPredicates'],
    queryFn: () => client.simFacts.getPredicates(),
    enabled,
    staleTime: Infinity,
  });
  return useMemo(() => {
    const edges = new Set(data?.edges ?? []);
    return {
      attributes: (data?.predicates ?? []).filter((predicate) => !edges.has(predicate)),
      help: data?.help ?? {},
    };
  }, [data]);
}
