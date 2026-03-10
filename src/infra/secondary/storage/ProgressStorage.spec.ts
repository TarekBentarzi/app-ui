import { ProgressStorage } from './ProgressStorage';
import { UniversalStorage } from './UniversalStorage';

// Mock UniversalStorage
jest.mock('./UniversalStorage', () => ({
  UniversalStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    getAllKeys: jest.fn(),
  },
}));

const mockProgress = {
  userId: 'user1',
  sourateNumero: 2,
  versetNumero: 10,
  mode: 'verse' as const,
  lastUpdated: '2024-01-01T00:00:00.000Z',
};

describe('ProgressStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('saveProgress', () => {
    it('should save progress to local storage', async () => {
      await ProgressStorage.saveProgress('user1', 2, 10, 'verse');

      expect(UniversalStorage.setItem).toHaveBeenCalledWith(
        '@qlearn:progress:verse:user1',
        expect.stringContaining('"sourateNumero":2')
      );
    });

    it('should use verse mode by default', async () => {
      await ProgressStorage.saveProgress('user1', 2, 10);

      expect(UniversalStorage.setItem).toHaveBeenCalledWith(
        '@qlearn:progress:verse:user1',
        expect.any(String)
      );
    });

    it('should save progress for different modes', async () => {
      await ProgressStorage.saveProgress('user1', 2, 10, 'page');

      expect(UniversalStorage.setItem).toHaveBeenCalledWith(
        '@qlearn:progress:page:user1',
        expect.any(String)
      );
    });

    it('should handle errors when saving', async () => {
      (UniversalStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      // Should not throw, just log error
      await expect(ProgressStorage.saveProgress('user1', 2, 10, 'verse')).resolves.not.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        '[ProgressStorage] ❌ Erreur sauvegarde locale:',
        expect.any(Error)
      );
    });
  });

  describe('getProgress', () => {
    it('should get progress from local storage', async () => {
      (UniversalStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockProgress));

      const result = await ProgressStorage.getProgress('user1', 'verse');

      expect(UniversalStorage.getItem).toHaveBeenCalledWith('@qlearn:progress:verse:user1');
      expect(result).toEqual(mockProgress);
    });

    it('should return null if no progress found', async () => {
      (UniversalStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await ProgressStorage.getProgress('user1', 'verse');

      expect(result).toBeNull();
    });

    it('should use verse mode by default', async () => {
      (UniversalStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockProgress));

      await ProgressStorage.getProgress('user1');

      expect(UniversalStorage.getItem).toHaveBeenCalledWith('@qlearn:progress:verse:user1');
    });

    it('should handle errors when loading', async () => {
      (UniversalStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await ProgressStorage.getProgress('user1', 'verse');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        '[ProgressStorage] ❌ Erreur chargement local:',
        expect.any(Error)
      );
    });
  });

  describe('clearProgress', () => {
    it('should clear progress for specific mode', async () => {
      await ProgressStorage.clearProgress('user1', 'verse');

      expect(UniversalStorage.removeItem).toHaveBeenCalledWith('@qlearn:progress:verse:user1');
    });

    it('should clear progress for all modes when mode not specified', async () => {
      await ProgressStorage.clearProgress('user1');

      expect(UniversalStorage.removeItem).toHaveBeenCalledTimes(3);
      expect(UniversalStorage.removeItem).toHaveBeenCalledWith('@qlearn:progress:verse:user1');
      expect(UniversalStorage.removeItem).toHaveBeenCalledWith('@qlearn:progress:page:user1');
      expect(UniversalStorage.removeItem).toHaveBeenCalledWith('@qlearn:progress:mushaf:user1');
    });

    it('should handle errors when clearing', async () => {
      (UniversalStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      // Should not throw, just log error
      await expect(ProgressStorage.clearProgress('user1', 'verse')).resolves.not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getAllProgress', () => {
    it('should get all progress from storage', async () => {
      (UniversalStorage.getAllKeys as jest.Mock).mockResolvedValue([
        '@qlearn:progress:verse:user1',
        '@qlearn:progress:page:user1',
        '@qlearn:other:key',
      ]);
      (UniversalStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockProgress));

      const result = await ProgressStorage.getAllProgress();

      expect(result).toHaveLength(2); // Only progress keys
      expect(result[0]).toEqual(mockProgress);
    });

    it('should return empty array if no progress found', async () => {
      (UniversalStorage.getAllKeys as jest.Mock).mockResolvedValue([]);

      const result = await ProgressStorage.getAllProgress();

      expect(result).toEqual([]);
    });

    it('should handle errors when getting all progress', async () => {
      (UniversalStorage.getAllKeys as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await ProgressStorage.getAllProgress();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        '[ProgressStorage] Erreur récupération globale:',
        expect.any(Error)
      );
    });

    it('should skip invalid JSON data', async () => {
      (UniversalStorage.getAllKeys as jest.Mock).mockResolvedValue([
        '@qlearn:progress:verse:user1',
        '@qlearn:progress:page:user1',
      ]);
      (UniversalStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(mockProgress))
        .mockResolvedValueOnce('invalid json');

      const result = await ProgressStorage.getAllProgress();

      expect(result).toHaveLength(1);
      expect(console.error).toHaveBeenCalledWith('[ProgressStorage] Erreur parsing:', expect.any(Error));
    });
  });
});
