export type AIHealthCheckResponse = {
  status?: string;
  error?: string;
};

export type AITestStatus = {
  status: string;
  error: string;
  loading: boolean;
};
