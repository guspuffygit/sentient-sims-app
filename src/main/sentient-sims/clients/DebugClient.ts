import { SendLogsRequest } from '../models/SendLogsRequest';
import { SendLogsResponse } from '../models/SendLogsResponse';
import { ApiClient } from './ApiClient';
import { axiosClient } from './AxiosClient';

export class DebugClient extends ApiClient {
  /**
   * GET /debug/health
   * Simple application health check.
   */
  async checkHealth(): Promise<string> {
    const response = await axiosClient.get<string>(`${this.apiUrl}/debug/health`);
    return response.data;
  }

  /**
   * GET /debug/test-ai
   * Checks the health of the AI generation service.
   * Optionally accepts an apiKey to test a specific key.
   */
  async testAiService(apiKey?: string): Promise<any> {
    const params: Record<string, string> = {};
    if (apiKey) params.apiKey = apiKey;

    const response = await axiosClient.get<any>(`${this.apiUrl}/debug/test-ai`, { params });
    return response.data;
  }

  /**
   * POST /debug/send-logs
   * Sends debug logs to the configured webhook (Discord).
   */
  async sendDebugLogs(request: SendLogsRequest): Promise<SendLogsResponse> {
    const response = await axiosClient.post<any>(`${this.apiUrl}/debug/send-logs`, request);
    return response.data;
  }

  /**
   * POST /debug/interaction
   * Sends a bug report/interaction log.
   */
  async sendBugReport(reportData: any): Promise<any> {
    const response = await axiosClient.post<any>(`${this.apiUrl}/debug/interaction`, reportData);
    return response.data;
  }
}
