import { LastExceptionFile } from '../services/LastExceptionService';
import { ApiClient } from './ApiClient';
import { axiosClient } from './AxiosClient';

export class FilesClient extends ApiClient {
  async getLastExceptionFiles(): Promise<LastExceptionFile[]> {
    const response = await axiosClient.get<LastExceptionFile[]>(`${this.apiUrl}/files/last-exception`);
    return response.data.map((file) => ({
      ...file,
      created: new Date(file.created),
    }));
  }

  async deleteLastExceptionFiles() {
    return axiosClient.delete(`${this.apiUrl}/files/last-exception`);
  }
}
