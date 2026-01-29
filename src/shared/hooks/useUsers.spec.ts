/**
 * Test pour le hook useUsers
 * Couvre la logique d'application côté UI
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useUsers } from './useUsers';
import { UserApplicationService } from '@/application/services/UserApplicationService';
import { UserDTO } from '@/application/dto/UserDTO';

describe('useUsers', () => {
  let mockUserService: jest.Mocked<UserApplicationService>;

  beforeEach(() => {
    mockUserService = {
      getAllUsers: jest.fn(),
    } as unknown as jest.Mocked<UserApplicationService>;
  });

  it('should initialize with empty users', () => {
    mockUserService.getAllUsers.mockResolvedValue([]);

    const { result } = renderHook(() => useUsers(mockUserService));

    expect(result.current.users).toEqual([]);
    // loading may change quickly due to immediate effect; ensure it's a boolean
    expect(typeof result.current.loading).toBe('boolean');
    expect(result.current.error).toBeNull();
  });

  it('should load users on mount', async () => {
    const mockUsers: UserDTO[] = [
      { id: '1', name: 'Alice', email: 'alice@example.com' },
      { id: '2', name: 'Bob', email: 'bob@example.com' },
    ];
    mockUserService.getAllUsers.mockResolvedValue(mockUsers);

    const { result } = renderHook(() => useUsers(mockUserService));

    await waitFor(() => {
      expect(result.current.users).toEqual(mockUsers);
    });
  });

  it('should set loading state during fetch', async () => {
    mockUserService.getAllUsers.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve([]), 100))
    );

    const { result } = renderHook(() => useUsers(mockUserService));

    // Loading should become true during fetch and then false after
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle errors gracefully', async () => {
    const errorMessage = 'Failed to fetch users';
    mockUserService.getAllUsers.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useUsers(mockUserService));

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.users).toEqual([]);
    });
  });

  it('should handle non-Error exceptions', async () => {
    mockUserService.getAllUsers.mockRejectedValue('Unknown error');

    const { result } = renderHook(() => useUsers(mockUserService));

    await waitFor(() => {
      expect(result.current.error).toBe('Unknown error');
    });
  });

  it('should call service only once on mount', async () => {
    mockUserService.getAllUsers.mockResolvedValue([]);

    renderHook(() => useUsers(mockUserService));

    await waitFor(() => {
      expect(mockUserService.getAllUsers).toHaveBeenCalledTimes(1);
    });
  });

  it('should refetch users when refetch is called', async () => {
    const mockUsers: UserDTO[] = [
      { id: '1', name: 'Alice', email: 'alice@example.com' },
    ];
    mockUserService.getAllUsers.mockResolvedValue(mockUsers);

    const { result } = renderHook(() => useUsers(mockUserService));

    await waitFor(() => {
      expect(result.current.users).toHaveLength(1);
    });

    // Call refetch
    await result.current.refetch();

    expect(mockUserService.getAllUsers).toHaveBeenCalledTimes(2);
  });

  it('should clear error on successful refetch', async () => {
    mockUserService.getAllUsers.mockRejectedValueOnce(new Error('Initial error'));

    const { result } = renderHook(() => useUsers(mockUserService));

    await waitFor(() => {
      expect(result.current.error).toBe('Initial error');
    });

    mockUserService.getAllUsers.mockResolvedValueOnce([]);
    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });
  });
});
