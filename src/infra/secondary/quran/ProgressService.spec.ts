import { progressService } from './ProgressService';
import { apiClient } from '@/infra/secondary/api/apiClient';
import { UserSave } from './types';

// Mock apiClient
jest.mock('@/infra/secondary/api/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    put: jest.fn(),
    setToken: jest.fn(),
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

describe('ProgressService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setAuthToken', () => {
    it('should set authentication token', () => {
      progressService.setAuthToken('test-token');
      expect(apiClient.setToken).toHaveBeenCalledWith('test-token');
    });
  });

  describe('getUserProgress', () => {
    it('should fetch user progress', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      (apiClient.get as jest.Mock).mockResolvedValue(mockUserSave);

      const result = await progressService.getUserProgress('user1');

      expect(apiClient.get).toHaveBeenCalledWith('/users/user1/save');
      expect(result).toEqual(mockUserSave);
      expect(consoleLogSpy).toHaveBeenCalledWith('[ProgressService] GET /users/user1/save');
      expect(consoleLogSpy).toHaveBeenCalledWith('[ProgressService] Réponse:', mockUserSave);

      consoleLogSpy.mockRestore();
    });

    it('should return null when save not found (404)', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('404 Not Found'));

      const result = await progressService.getUserProgress('user1');

      expect(result).toBeNull();
      expect(consoleLogSpy).toHaveBeenCalledWith('[ProgressService] Pas de sauvegarde trouvée (404)');

      consoleLogSpy.mockRestore();
    });

    it('should throw error for non-404 errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('500 Server Error'));

      await expect(progressService.getUserProgress('user1')).rejects.toThrow('500 Server Error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ProgressService] Erreur GET progress:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('saveProgress', () => {
    it('should save user progress', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      (apiClient.put as jest.Mock).mockResolvedValue(mockUserSave);

      const result = await progressService.saveProgress('user1', 2, 10);

      expect(apiClient.put).toHaveBeenCalledWith('/users/user1/save', {
        sourateNumero: 2,
        versetNumero: 10,
      });
      expect(result).toEqual(mockUserSave);
      expect(consoleLogSpy).toHaveBeenCalledWith('[ProgressService] PUT /users/user1/save', {
        sourateNumero: 2,
        versetNumero: 10,
      });
      expect(consoleLogSpy).toHaveBeenCalledWith('[ProgressService] Sauvegarde réussie:', mockUserSave);

      consoleLogSpy.mockRestore();
    });

    it('should handle 401 errors gracefully', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      (apiClient.put as jest.Mock).mockRejectedValue(new Error('401 Unauthorized'));

      await expect(progressService.saveProgress('user1', 2, 10)).rejects.toThrow('401 Unauthorized');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[ProgressService] API non accessible (401) - sauvegarde locale uniquement'
      );

      consoleLogSpy.mockRestore();
    });

    it('should throw and log other errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (apiClient.put as jest.Mock).mockRejectedValue(new Error('500 Server Error'));

      await expect(progressService.saveProgress('user1', 2, 10)).rejects.toThrow('500 Server Error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ProgressService] Erreur PUT progress:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });
});
