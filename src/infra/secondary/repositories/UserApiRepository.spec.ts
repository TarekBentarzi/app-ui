/**
 * Test unitaire pour UserApiRepository
 * Couvre l'implémentation du repository avec API
 */

import { UserApiRepository } from './UserApiRepository';
import { apiClient } from '../api/apiClient';
import { User, CreateUserInput } from '@/domain/entities/User';

jest.mock('../api/apiClient');

describe('UserApiRepository', () => {
  let repository: UserApiRepository;
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    repository = new UserApiRepository();
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users from API', async () => {
      const mockUsers: User[] = [
        { id: '1', name: 'Alice', email: 'alice@example.com', createdAt: new Date() },
      ];
      mockApiClient.get.mockResolvedValue(mockUsers);

      const result = await repository.findAll();

      expect(mockApiClient.get).toHaveBeenCalledWith('/users');
      expect(result).toEqual(mockUsers);
    });

    it('should propagate API errors', async () => {
      mockApiClient.get.mockRejectedValue(new Error('API Error'));

      await expect(repository.findAll()).rejects.toThrow('API Error');
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const mockUser: User = {
        id: '1',
        name: 'Alice',
        email: 'alice@example.com',
        createdAt: new Date(),
      };
      mockApiClient.get.mockResolvedValue(mockUser);

      const result = await repository.findById('1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/users/1');
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Not found'));

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });

    it('should catch and handle any error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      const result = await repository.findById('1');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const input: CreateUserInput = { name: 'John', email: 'john@example.com' };
      const mockUser: User = {
        id: '3',
        ...input,
        createdAt: new Date(),
      };
      mockApiClient.post.mockResolvedValue(mockUser);

      const result = await repository.create(input);

      expect(mockApiClient.post).toHaveBeenCalledWith('/users', input);
      expect(result).toEqual(mockUser);
    });

    it('should propagate API errors on create', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Validation error'));

      await expect(
        repository.create({ name: 'John', email: 'john@example.com' })
      ).rejects.toThrow('Validation error');
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const updates = { name: 'Jane' };
      const mockUser: User = {
        id: '1',
        name: 'Jane',
        email: 'alice@example.com',
        createdAt: new Date(),
      };
      mockApiClient.post.mockResolvedValue(mockUser);

      const result = await repository.update('1', updates);

      expect(mockApiClient.post).toHaveBeenCalledWith('/users/1', updates);
      expect(result).toEqual(mockUser);
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      mockApiClient.get.mockResolvedValue(undefined);

      await repository.delete('1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/users/1');
    });

    it('should propagate errors on delete', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Delete failed'));

      await expect(repository.delete('1')).rejects.toThrow('Delete failed');
    });
  });
});
