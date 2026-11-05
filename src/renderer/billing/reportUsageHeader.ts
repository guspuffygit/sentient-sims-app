import { USAGE_HEADER } from 'main/sentient-sims/billing/usageHeader';

// Renderer fetches go straight to the server, so the usage header they get
// back is handed to the main process, which owns the usage state
export function reportUsageHeader(response: Response) {
  const value = response.headers.get(USAGE_HEADER);
  if (value) {
    window.electron.reportUsageHeader(value);
  }
}
