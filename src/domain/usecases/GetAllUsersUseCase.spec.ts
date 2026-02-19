/**
 * Test unitaire pour GetAllUsersUseCase
 * Couvre le domaine métier
 */

import { GetAllUsersUseCase } from './GetAllUsersUseCase';
import { IUserRepository } from '../repositories/IUserRepository';
import { User } from '../entities/User';

describe('GetAllUsersUseCase', () => {
  let useCase: GetAllUsersUseCase;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    // Mock du repository
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<IUserRepository>;

    useCase = new GetAllUsersUseCase(mockRepository);
  });

  it('should return all users', async () => {
    const mockUsers: User[] = [
      { id: '1', name: 'Alice', email: 'alice@example.com', createdAt: new Date() },
      { id: '2', name: 'Bob', email: 'bob@example.com', createdAt: new Date() },
    ];

    mockRepository.findAll.mockResolvedValue(mockUsers);

    const result = await useCase.execute();

    expect(result).toEqual(mockUsers);
    expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return empty array when no users exist', async () => {
    mockRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
    expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it('should propagate errors from repository', async () => {
    const error = new Error('Database connection failed');
    mockRepository.findAll.mockRejectedValue(error);

    await expect(useCase.execute()).rejects.toThrow('Database connection failed');
    expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
  });
});
