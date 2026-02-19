/**
 * Test unitaire pour UserApplicationService
 * Couvre l'orchestration de la logique métier
 */

import { UserApplicationService } from './UserApplicationService';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { User } from '@/domain/entities/User';
import { apiClient } from '@/infra/secondary/api/apiClient';
import { AuthStorage } from '@/infra/secondary/storage/AuthStorage';

jest.mock('@/infra/secondary/api/apiClient');
jest.mock('@/infra/secondary/storage/AuthStorage');
jest.mock('@/domain/usecases/LogoutUserUseCase', () => {
  return {
    LogoutUserUseCase: jest.fn().mockImplementation(() => {
      return {
        execute: jest.fn().mockResolvedValue(undefined),
      };
    }),
  };
});

describe('UserApplicationService', () => {
  let service: UserApplicationService;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    service = new UserApplicationService(mockRepository);
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return users as DTOs', async () => {
      const mockUsers: User[] = [
        { id: '1', name: 'Alice', email: 'alice@example.com', createdAt: new Date() },
        { id: '2', name: 'Bob', email: 'bob@example.com', createdAt: new Date() },
      ];

      mockRepository.findAll.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: '1',
        name: 'Alice',
        email: 'alice@example.com',
      });
    });
  });

  describe('register', () => {
    it('should register a user and return a DTO', async () => {
      const input = { name: 'John', email: 'john@example.com' };
      const mockUser: User = {
        id: '1',
        ...input,
        createdAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(mockUser);

      const result = await service.register(input);

      expect(mockRepository.create).toHaveBeenCalledWith(input);
      expect(result).toEqual({
        id: '1',
        name: 'John',
        email: 'john@example.com',
      });
    });
  });

  describe('login', () => {
    it('should call api and save token', async () => {
      const mockResponse = { user: { id: '1', name: 'N' }, access_token: 'tk' };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.login('e', 'p');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', { email: 'e', password: 'p' });
      expect(apiClient.setToken).toHaveBeenCalledWith('tk');
      expect(AuthStorage.saveToken).toHaveBeenCalledWith('tk');
      expect(result.user).toEqual(mockResponse.user);
    });
  });

  describe('logout', () => {
    it('should call logout use case and clear tokens', async () => {
      await service.logout();
      expect(apiClient.setToken).toHaveBeenCalledWith(null);
      expect(AuthStorage.clearToken).toHaveBeenCalled();
    });
  });
});
