import { Response } from 'express';
import { UsageLimitError } from '../exceptions/UsageLimitError';

export type UsageRejection = {
  rejected: true;
  reason: string;
};

export function usageRejection(err: unknown): UsageRejection | undefined {
  if (err instanceof UsageLimitError || (err instanceof Error && err.name === 'UsageLimitError')) {
    return { rejected: true, reason: err.message };
  }
  return undefined;
}

// The mod treats used-up usage as a quiet no, not a provider failure, so the
// answer is a 200 with rejected set and no error popup
export function respondUsageRejection(res: Response, err: unknown): boolean {
  const rejection = usageRejection(err);
  if (!rejection) {
    return false;
  }
  res.status(200).json(rejection);
  return true;
}
