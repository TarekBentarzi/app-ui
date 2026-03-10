import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useProgress } from './useProgress';
import { progressService, UserSave } from '../../infra/secondary/quran';
import { ProgressStorage } from '../../infra/secondary/storage/ProgressStorage';
import { AuthStorage } from '../../infra/secondary/storage/AuthStorage';

// Mock dependencies
jest.mock('../../infra/secondary/quran', () => ({
  progressService: {
    getUserProgress: jest.fn(),
    saveProgress: jest.fn(),
  },
}));

jest.mock('../../infra/secondary/storage/ProgressStorage', () => ({
  ProgressStorage: {
    getProgress: jest.fn(),
    saveProgress: jest.fn(),
  },
}));

jest.mock('../../infra/secondary/storage/AuthStorage', () => ({
  AuthStorage: {
    getToken: jest.fn(),
    clearToken: jest.fn(),
  },
}));

const mockUserSave: UserSave = {
  id: 'save1',
  userId: 'user1',
  sourateNumero: 2,
  versetNumero: 10,
  lastReadAt: '2024-01-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('useProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ProgressStorage.getProgress as jest.Mock).mockResolvedValue(null);
    (progressService.getUserProgress as jest.Mock).mockResolvedValue(mockUserSave);
    (progressService.saveProgress as jest.Mock).mockResolvedValue(mockUserSave);
    (AuthStorage.getToken as jest.Mock).mockReturnValue('test-token');
  });

  it('should load progress from local storage first', async () => {
    const localProgress = {
      userId: 'user1',
      sourateNumero: 1,
      versetNumero: 5,
      lastUpdated: '2024-01-01T00:00:00.000Z',
    };
    (ProgressStorage.getProgress as jest.Mock).mockResolvedValue(localProgress);

    const { result } = renderHook(() => useProgress('user1', 'verse'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(ProgressStorage.getProgress).toHaveBeenCalledWith('user1', 'verse');
    expect(result.current.progress).toBeDefined();
    expect(result.current.progress?.sourateNumero).toBe(1);
  });

  it('should load progress from API when no local data', async () => {
    (ProgressStorage.getProgress as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useProgress('user1', 'verse'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(progressService.getUserProgress).toHaveBeenCalledWith('user1');
    expect(result.current.progress).toEqual(mockUserSave);
  });

  it('should use anonymous mode when userId is null', async () => {
    const { result } = renderHook(() => useProgress(null, 'verse'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(ProgressStorage.getProgress).toHaveBeenCalledWith('anonymous', 'verse');
  });

  it('should save progress locally and to API for logged in user', async () => {
    const { result } = renderHook(() => useProgress('user1', 'verse'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.saveProgress(3, 15);
    });

    expect(ProgressStorage.saveProgress).toHaveBeenCalledWith('user1', 3, 15, 'verse');
    expect(progressService.saveProgress).toHaveBeenCalledWith('user1', 3, 15);
  });

  it('should save progress only locally for anonymous user', async () => {
    const { result } = renderHook(() => useProgress(null, 'verse'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.saveProgress(3, 15);
    });

    expect(ProgressStorage.saveProgress).toHaveBeenCalledWith('anonymous', 3, 15, 'verse');
    expect(progressService.saveProgress).not.toHaveBeenCalled();
  });

  it('should handle API error when saving progress', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (progressService.saveProgress as jest.Mock).mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() => useProgress('user1', 'verse'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let savedData;
    await act(async () => {
      savedData = await result.current.saveProgress(3, 15);
    });

    // Should still save locally
    expect(ProgressStorage.saveProgress).toHaveBeenCalledWith('user1', 3, 15, 'verse');
    expect(savedData).toBeDefined();

    consoleErrorSpy.mockRestore();
  });

  it('should clear token on 401 error', async () => {
    (progressService.saveProgress as jest.Mock).mockRejectedValue({
      message: 'Error 401 Unauthorized',
    });

    const { result } = renderHook(() => useProgress('user1', 'verse'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.saveProgress(3, 15);
    });

    expect(AuthStorage.clearToken).toHaveBeenCalled();
  });

  it('should update progress state immediately after saving', async () => {
    const { result } = renderHook(() => useProgress('user1', 'verse'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.saveProgress(5, 20);
    });

    expect(result.current.progress?.sourateNumero).toBe(5);
    expect(result.current.progress?.versetNumero).toBe(20);
  });

  it('should handle errors when loading progress', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (ProgressStorage.getProgress as jest.Mock).mockRejectedValue(new Error('Load error'));

    const { result } = renderHook(() => useProgress('user1', 'verse'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    consoleErrorSpy.mockRestore();
  });

  it('should refetch progress', async () => {
    const { result } = renderHook(() => useProgress('user1', 'verse'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    jest.clearAllMocks();

    await act(async () => {
      await result.current.refetch();
    });

    expect(ProgressStorage.getProgress).toHaveBeenCalledWith('user1', 'verse');
  });

  it('should handle saving state correctly', async () => {
    const { result } = renderHook(() => useProgress('user1', 'verse'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.saving).toBe(false);

    const savePromise = act(async () => {
      await result.current.saveProgress(3, 15);
    });

    await savePromise;

    await waitFor(() => {
      expect(result.current.saving).toBe(false);
    });
  });
});
