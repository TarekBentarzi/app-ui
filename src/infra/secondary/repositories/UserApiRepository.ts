/**
 * Infra/Secondary Layer - Repository Implémentation
 * Implémente l'interface du domain avec de vrais appels API
 */

import { User, CreateUserInput } from '@/domain/entities/User';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { apiClient } from '../api/apiClient';

export class UserApiRepository implements IUserRepository {
  async findAll(): Promise<User[]> {
    return apiClient.get('/users');
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await apiClient.get(`/users/${id}`);
    } catch {
      return null;
    }
  }

  async create(input: CreateUserInput): Promise<User> {
    return apiClient.post('/users', input);
  }

  async update(id: string, input: Partial<User>): Promise<User> {
    return apiClient.post(`/users/${id}`, input);
  }

  async delete(id: string): Promise<void> {
    await apiClient.get(`/users/${id}`);
  }
}
