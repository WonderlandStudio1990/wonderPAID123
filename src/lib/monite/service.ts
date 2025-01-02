import { MoniteApiClient } from './api/client';

interface MoniteEntitySettings {
  currency: string;
  timezone: string;
}

interface MoniteEntityMetadata {
  user_id: string;
  email: string | null;
  created_at: string;
}

interface CreateEntityParams {
  name: string;
  type: 'individual' | 'organization';
  status: 'active' | 'inactive';
  metadata?: MoniteEntityMetadata;
  settings?: MoniteEntitySettings;
}

export class MoniteService {
  private readonly apiClient: MoniteApiClient;

  constructor(
    baseURL: string,
    clientId: string,
    clientSecret: string
  ) {
    this.apiClient = new MoniteApiClient({
      baseURL,
      clientId,
      clientSecret,
      timeout: 10000,
      maxRetries: 3
    });
  }

  async createEntity(params: CreateEntityParams) {
    return this.apiClient.request({
      method: 'POST',
      url: '/v1/entities',
      data: params
    });
  }

  async getEntity(entityId: string) {
    return this.apiClient.request({
      method: 'GET',
      url: `/v1/entities/${entityId}`
    });
  }

  async updateEntity(entityId: string, params: Partial<CreateEntityParams>) {
    return this.apiClient.request({
      method: 'PATCH',
      url: `/v1/entities/${entityId}`,
      data: params
    });
  }

  async deleteEntity(entityId: string) {
    return this.apiClient.request({
      method: 'DELETE',
      url: `/v1/entities/${entityId}`
    });
  }

  async listEntities() {
    return this.apiClient.request({
      method: 'GET',
      url: '/v1/entities'
    });
  }
}