/**
 * Test unitaire pour UserApplicationService
 * Couvre l'orchestration de la logique métier
 */

import { UserApplicationService } from './UserApplicationService';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { User } from '@/domain/entities/User';
import { UserDTO } from '../dto/UserDTO';

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
    } as jest.Mocked<IUserRepository>;

    service = new UserApplicationService(mockRepository);
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
      expect(result[1]).toEqual({
        id: '2',
        name: 'Bob',
        email: 'bob@example.com',
      });
    });

    it('should return empty array when no users', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await service.getAllUsers();

      expect(result).toEqual([]);
    });

    it('should propagate repository errors', async () => {
      mockRepository.findAll.mockRejectedValue(new Error('API Error'));

      await expect(service.getAllUsers()).rejects.toThrow('API Error');
    });

    it('should transform all user properties correctly', async () => {
      const mockUser: User = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date('2024-01-01'),
      };

      mockRepository.findAll.mockResolvedValue([mockUser]);

      const result = await service.getAllUsers();

      expect(result[0]).toHaveProperty('id', 'user-123');
      expect(result[0]).toHaveProperty('name', 'Test User');
      expect(result[0]).toHaveProperty('email', 'test@example.com');
      expect(result[0]).not.toHaveProperty('createdAt');
    });
  });
});
