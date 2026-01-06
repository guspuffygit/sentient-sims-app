import { UpdateModResponse } from '../controllers/UpdateController';
import { ModUpdate } from '../services/UpdateService';
import { ApiClient } from './ApiClient';
import { axiosClient } from './AxiosClient';

export class UpdateClient extends ApiClient {
  async updateMod(modUpdate: ModUpdate): Promise<UpdateModResponse> {
    const response = await axiosClient.post(`${this.apiUrl}/update/mod`, modUpdate);
    return response.data;
  }
}
