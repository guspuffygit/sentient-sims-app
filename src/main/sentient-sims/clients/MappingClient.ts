import { MappingReview, MappingReviewRequest } from '../models/MappingReview';
import { ApiClient } from './ApiClient';
import { axiosClient } from './AxiosClient';

export class MappingClient extends ApiClient {
  /**
   * POST /mappings/review
   * The template and its test samples read against the mapping guidelines. Resolves with the
   * app's own checks even when the reviewer model could not be asked (aiReviewed false, aiError).
   */
  async review(request: MappingReviewRequest): Promise<MappingReview> {
    const response = await axiosClient.post<MappingReview>(`${this.apiUrl}/mappings/review`, request);
    return response.data;
  }
}
