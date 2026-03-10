import { BookmarkStorage, Bookmark } from './BookmarkStorage';
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

const mockBookmarks: Bookmark[] = [
  {
    id: 'user1:1:1',
    userId: 'user1',
    sourateNumero: 1,
    versetNumero: 1,
    sourateNom: 'Al-Fatiha',
    note: 'Test note',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'user1:2:1',
    userId: 'user1',
    sourateNumero: 2,
    versetNumero: 1,
    sourateNom: 'Al-Baqara',
    createdAt: '2024-01-02T00:00:00.000Z',
  },
];

describe('BookmarkStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (UniversalStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockBookmarks));
  });

  describe('addBookmark', () => {
    it('should add a new bookmark', async () => {
      const result = await BookmarkStorage.addBookmark('user1', 3, 1, 'Ali Imran', 'My note');

      expect(result.id).toBe('user1:3:1');
      expect(result.sourateNumero).toBe(3);
      expect(result.versetNumero).toBe(1);
      expect(result.sourateNom).toBe('Ali Imran');
      expect(result.note).toBe('My note');
      expect(UniversalStorage.setItem).toHaveBeenCalled();
    });

    it('should return existing bookmark if already exists', async () => {
      const result = await BookmarkStorage.addBookmark('user1', 1, 1, 'Al-Fatiha');

      expect(result).toEqual(mockBookmarks[0]);
      expect(UniversalStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle errors when adding bookmark', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (UniversalStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(BookmarkStorage.addBookmark('user1', 3, 1, 'Test')).rejects.toThrow('Storage error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[BookmarkStorage] ❌ Erreur ajout marque-page:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('removeBookmark', () => {
    it('should remove a bookmark', async () => {
      await BookmarkStorage.removeBookmark('user1', 1, 1);

      expect(UniversalStorage.setItem).toHaveBeenCalledWith(
        '@qlearn:bookmarks:user1',
        expect.not.stringContaining('user1:1:1')
      );
    });

    it('should handle errors when removing bookmark', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (UniversalStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(BookmarkStorage.removeBookmark('user1', 1, 1)).rejects.toThrow('Storage error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[BookmarkStorage] ❌ Erreur suppression marque-page:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('isBookmarked', () => {
    it('should return true if bookmark exists', async () => {
      const result = await BookmarkStorage.isBookmarked('user1', 1, 1);
      expect(result).toBe(true);
    });

    it('should return false if bookmark does not exist', async () => {
      const result = await BookmarkStorage.isBookmarked('user1', 99, 99);
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (UniversalStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await BookmarkStorage.isBookmarked('user1', 1, 1);
      expect(result).toBe(false);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getAllBookmarks', () => {
    it('should return all bookmarks sorted by createdAt', async () => {
      const result = await BookmarkStorage.getAllBookmarks('user1');

      expect(result).toHaveLength(2);
      // Should be sorted by createdAt descending
      expect(result[0].createdAt).toBe('2024-01-02T00:00:00.000Z');
      expect(result[1].createdAt).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should return empty array if no bookmarks', async () => {
      (UniversalStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await BookmarkStorage.getAllBookmarks('user1');
      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (UniversalStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await BookmarkStorage.getAllBookmarks('user1');
      expect(result).toEqual([]);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('clearAllBookmarks', () => {
    it('should remove all bookmarks for a user', async () => {
      await BookmarkStorage.clearAllBookmarks('user1');

      expect(UniversalStorage.removeItem).toHaveBeenCalledWith('@qlearn:bookmarks:user1');
    });

    it('should handle errors when clearing bookmarks', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (UniversalStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(BookmarkStorage.clearAllBookmarks('user1')).rejects.toThrow('Storage error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[BookmarkStorage] Erreur suppression marque-pages:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('updateNote', () => {
    it('should update note of a bookmark', async () => {
      await BookmarkStorage.updateNote('user1', 1, 1, 'Updated note');

      const savedData = (UniversalStorage.setItem as jest.Mock).mock.calls[0][1];
      const bookmarks = JSON.parse(savedData);
      const updatedBookmark = bookmarks.find((b: Bookmark) => b.id === 'user1:1:1');
      expect(updatedBookmark.note).toBe('Updated note');
    });

    it('should warn if bookmark not found', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      await BookmarkStorage.updateNote('user1', 99, 99, 'Note');

      expect(consoleWarnSpy).toHaveBeenCalledWith('[BookmarkStorage] Marque-page non trouvé');
      consoleWarnSpy.mockRestore();
    });

    it('should handle errors when updating note', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (UniversalStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(BookmarkStorage.updateNote('user1', 1, 1, 'Note')).rejects.toThrow('Storage error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[BookmarkStorage] Erreur mise à jour note:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
