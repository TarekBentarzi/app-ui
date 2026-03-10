import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useBookmarks } from './useBookmarks';
import { BookmarkStorage, Bookmark } from '@/infra/secondary/storage/BookmarkStorage';

// Mock BookmarkStorage
jest.mock('@/infra/secondary/storage/BookmarkStorage', () => ({
  BookmarkStorage: {
    getAllBookmarks: jest.fn(),
    isBookmarked: jest.fn(),
    addBookmark: jest.fn(),
    removeBookmark: jest.fn(),
    updateNote: jest.fn(),
    clearAllBookmarks: jest.fn(),
  },
}));

const mockBookmarks: Bookmark[] = [
  {
    id: 'b1',
    userId: 'user1',
    sourateNumero: 1,
    versetNumero: 1,
    sourateNom: 'Al-Fatiha',
    note: 'Test note',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'b2',
    userId: 'user1',
    sourateNumero: 2,
    versetNumero: 1,
    sourateNom: 'Al-Baqara',
    createdAt: '2024-01-02T00:00:00.000Z',
  },
];

describe('useBookmarks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (BookmarkStorage.getAllBookmarks as jest.Mock).mockResolvedValue(mockBookmarks);
    (BookmarkStorage.isBookmarked as jest.Mock).mockResolvedValue(false);
    (BookmarkStorage.addBookmark as jest.Mock).mockResolvedValue(mockBookmarks[0]);
  });

  it('should load bookmarks on mount', async () => {
    const { result } = renderHook(() => useBookmarks('user1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(BookmarkStorage.getAllBookmarks).toHaveBeenCalledWith('user1');
    expect(result.current.bookmarks).toEqual(mockBookmarks);
  });

  it('should return empty bookmarks when userId is null', async () => {
    const { result } = renderHook(() => useBookmarks(null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.bookmarks).toEqual([]);
    expect(BookmarkStorage.getAllBookmarks).not.toHaveBeenCalled();
  });

  it('should check if a verse is bookmarked', async () => {
    (BookmarkStorage.isBookmarked as jest.Mock).mockResolvedValue(true);
    const { result } = renderHook(() => useBookmarks('user1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const isBookmarked = await result.current.isBookmarked(1, 1);
    expect(isBookmarked).toBe(true);
    expect(BookmarkStorage.isBookmarked).toHaveBeenCalledWith('user1', 1, 1);
  });

  it('should add a bookmark', async () => {
    const newBookmark: Bookmark = {
      id: 'b3',
      userId: 'user1',
      sourateNumero: 3,
      versetNumero: 1,
      sourateNom: 'Ali Imran',
      createdAt: new Date().toISOString(),
    };
    (BookmarkStorage.addBookmark as jest.Mock).mockResolvedValue(newBookmark);

    const { result } = renderHook(() => useBookmarks('user1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let addedBookmark: Bookmark | null = null;
    await act(async () => {
      addedBookmark = await result.current.addBookmark(3, 1, 'Ali Imran', 'My note');
    });

    expect(addedBookmark).toEqual(newBookmark);
    expect(BookmarkStorage.addBookmark).toHaveBeenCalledWith('user1', 3, 1, 'Ali Imran', 'My note');
    expect(result.current.bookmarks).toContainEqual(newBookmark);
  });

  it('should toggle bookmark (add when not bookmarked)', async () => {
    (BookmarkStorage.isBookmarked as jest.Mock).mockResolvedValue(false);
    const newBookmark: Bookmark = {
      id: 'b3',
      userId: 'user1',
      sourateNumero: 3,
      versetNumero: 1,
      sourateNom: 'Ali Imran',
      createdAt: new Date().toISOString(),
    };
    (BookmarkStorage.addBookmark as jest.Mock).mockResolvedValue(newBookmark);

    const { result } = renderHook(() => useBookmarks('user1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.toggleBookmark(3, 1, 'Ali Imran');
    });

    expect(BookmarkStorage.addBookmark).toHaveBeenCalledWith('user1', 3, 1, 'Ali Imran');
    expect(result.current.bookmarks).toContainEqual(newBookmark);
  });

  it('should toggle bookmark (remove when bookmarked)', async () => {
    (BookmarkStorage.isBookmarked as jest.Mock).mockResolvedValue(true);

    const { result } = renderHook(() => useBookmarks('user1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialLength = result.current.bookmarks.length;

    await act(async () => {
      await result.current.toggleBookmark(1, 1, 'Al-Fatiha');
    });

    expect(BookmarkStorage.removeBookmark).toHaveBeenCalledWith('user1', 1, 1);
    expect(result.current.bookmarks.length).toBe(initialLength - 1);
  });

  it('should remove a bookmark', async () => {
    const { result } = renderHook(() => useBookmarks('user1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialLength = result.current.bookmarks.length;

    await act(async () => {
      await result.current.removeBookmark(1, 1);
    });

    expect(BookmarkStorage.removeBookmark).toHaveBeenCalledWith('user1', 1, 1);
    expect(result.current.bookmarks.length).toBe(initialLength - 1);
  });

  it('should update note on a bookmark', async () => {
    const { result } = renderHook(() => useBookmarks('user1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateNote(1, 1, 'Updated note');
    });

    expect(BookmarkStorage.updateNote).toHaveBeenCalledWith('user1', 1, 1, 'Updated note');
    const updatedBookmark = result.current.bookmarks.find(
      (b) => b.sourateNumero === 1 && b.versetNumero === 1
    );
    expect(updatedBookmark?.note).toBe('Updated note');
  });

  it('should clear all bookmarks', async () => {
    const { result } = renderHook(() => useBookmarks('user1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.clearAll();
    });

    expect(BookmarkStorage.clearAllBookmarks).toHaveBeenCalledWith('user1');
    expect(result.current.bookmarks).toEqual([]);
  });

  it('should handle errors when loading bookmarks', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (BookmarkStorage.getAllBookmarks as jest.Mock).mockRejectedValue(new Error('Load error'));

    const { result } = renderHook(() => useBookmarks('user1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('[useBookmarks] Erreur chargement:', expect.any(Error));
    expect(result.current.bookmarks).toEqual([]);

    consoleErrorSpy.mockRestore();
  });

  it('should not add bookmark when userId is null', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useBookmarks(null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const addedBookmark = await result.current.addBookmark(1, 1, 'Test');
    expect(addedBookmark).toBeNull();
    expect(consoleWarnSpy).toHaveBeenCalledWith('[useBookmarks] Utilisateur non connecté');

    consoleWarnSpy.mockRestore();
  });

  it('should not toggle bookmark when userId is null', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useBookmarks(null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.toggleBookmark(1, 1, 'Test');
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith('[useBookmarks] Utilisateur non connecté');
    expect(BookmarkStorage.addBookmark).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });
});
