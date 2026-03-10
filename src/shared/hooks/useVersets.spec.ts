import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useVersets, useAllVersets, useVerset } from './useVersets';
import { quranService, Verset, Sourate } from '../../infra/secondary/quran';

// Mock quranService
jest.mock('../../infra/secondary/quran', () => ({
  quranService: {
    getVersetsBySourate: jest.fn(),
    getAllSourates: jest.fn(),
    getVerset: jest.fn(),
  },
}));

const mockVersets: Verset[] = [
  {
    id: 'v1',
    sourateNumero: 1,
    versetNumero: 1,
    texteArabe: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    traduction: 'Au nom d\'Allah, le Tout Miséricordieux, le Très Miséricordieux.',
    translitteration: 'Bismi Allahi alrrahmani alrraheemi',
    audioUrl: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'v2',
    sourateNumero: 1,
    versetNumero: 2,
    texteArabe: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    traduction: 'Louange à Allah, Seigneur des mondes,',
    translitteration: 'Alhamdu lillahi rabbi alAAalameena',
    audioUrl: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

const mockSourates: Sourate[] = [
  {
    id: 's1',
    numero: 1,
    nomArabe: 'الفاتحة',
    nomTranslitteration: 'Al-Fatiha',
    nomTraduction: 'Al-Fatiha',
    nombreVersets: 7,
    revelation: 'mecquoise',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 's2',
    numero: 2,
    nomArabe: 'البقرة',
    nomTranslitteration: 'Al-Baqara',
    nomTraduction: 'Al-Baqara',
    nombreVersets: 286,
    revelation: 'medinoise',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

describe('useVersets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (quranService.getVersetsBySourate as jest.Mock).mockResolvedValue(mockVersets);
  });

  it('should load versets for a sourate', async () => {
    const { result } = renderHook(() => useVersets(1));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(quranService.getVersetsBySourate).toHaveBeenCalledWith(1);
    expect(result.current.versets).toEqual(mockVersets);
    expect(result.current.error).toBeNull();
  });

  it('should not load versets when sourateNumero is 0', async () => {
    const { result } = renderHook(() => useVersets(0));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(quranService.getVersetsBySourate).not.toHaveBeenCalled();
    expect(result.current.versets).toEqual([]);
  });

  it('should handle errors when loading versets', async () => {
    (quranService.getVersetsBySourate as jest.Mock).mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() => useVersets(1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.versets).toEqual([]);
  });

  it('should refetch versets', async () => {
    const { result } = renderHook(() => useVersets(1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    jest.clearAllMocks();

    await act(async () => {
      await result.current.refetch();
    });

    expect(quranService.getVersetsBySourate).toHaveBeenCalledWith(1);
  });

  it('should reload when sourateNumero changes', async () => {
    const { result, rerender } = renderHook<any, { sourateNumero: number }>(
      ({ sourateNumero }) => useVersets(sourateNumero),
      {
        initialProps: { sourateNumero: 1 },
      }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    jest.clearAllMocks();

    rerender({ sourateNumero: 2 });

    await waitFor(() => {
      expect(quranService.getVersetsBySourate).toHaveBeenCalledWith(2);
    });
  });
});

describe('useAllVersets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (quranService.getAllSourates as jest.Mock).mockResolvedValue(mockSourates);
    (quranService.getVersetsBySourate as jest.Mock).mockResolvedValue(mockVersets);
  });

  it('should load initial versets (first 5 sourates)', async () => {
    const { result } = renderHook(() => useAllVersets());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(quranService.getVersetsBySourate).toHaveBeenCalledTimes(5);
    expect(result.current.versets.length).toBeGreaterThan(0);
    expect(result.current.hasMore).toBe(true);
  });

  it('should load sourates list', async () => {
    const { result } = renderHook(() => useAllVersets());

    await waitFor(() => {
      expect(result.current.sourates).toEqual(mockSourates);
    });

    expect(quranService.getAllSourates).toHaveBeenCalled();
  });

  it('should load more versets', async () => {
    const { result } = renderHook(() => useAllVersets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    jest.clearAllMocks();

    await act(async () => {
      await result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.loadingMore).toBe(false);
    });

    expect(quranService.getVersetsBySourate).toHaveBeenCalled();
  });

  it('should not load more when already loading', async () => {
    const { result } = renderHook(() => useAllVersets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    jest.clearAllMocks();

    // Start loading more
    const promise1 = act(async () => {
      await result.current.loadMore();
    });

    // Try to load more again immediately
    const promise2 = act(async () => {
      await result.current.loadMore();
    });

    await Promise.all([promise1, promise2]);

    // Should only call once because of loadingMore check
    await waitFor(() => {
      expect(result.current.loadingMore).toBe(false);
    });
  });

  it('should load specific sourate range', async () => {
    const { result } = renderHook(() => useAllVersets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    jest.clearAllMocks();

    await act(async () => {
      await result.current.loadSourateRange(10);
    });

    await waitFor(() => {
      expect(result.current.loadingMore).toBe(false);
    });

    // Should load sourates 8-12 (target ±2)
    expect(quranService.getVersetsBySourate).toHaveBeenCalled();
  });

  it('should handle errors when loading more versets', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useAllVersets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    (quranService.getVersetsBySourate as jest.Mock).mockRejectedValue(new Error('Load error'));

    await act(async () => {
      await result.current.loadMore();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading more verses:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });
});

describe('useVerset', () => {
  const mockVerset: Verset = {
    id: 'v1',
    sourateNumero: 1,
    versetNumero: 1,
    texteArabe: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    traduction: 'Au nom d\'Allah, le Tout Miséricordieux, le Très Miséricordieux.',
    translitteration: 'Bismi Allahi alrrahmani alrraheemi',
    audioUrl: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (quranService.getVerset as jest.Mock).mockResolvedValue(mockVerset);
  });

  it('should load a specific verset', async () => {
    const { result } = renderHook(() => useVerset(1, 1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(quranService.getVerset).toHaveBeenCalledWith(1, 1);
    expect(result.current.verset).toEqual(mockVerset);
  });

  it('should handle errors when loading verset', async () => {
    (quranService.getVerset as jest.Mock).mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() => useVerset(1, 1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.verset).toBeNull();
  });

  it('should refetch verset', async () => {
    const { result } = renderHook(() => useVerset(1, 1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    jest.clearAllMocks();

    await act(async () => {
      await result.current.refetch();
    });

    expect(quranService.getVerset).toHaveBeenCalledWith(1, 1);
  });

  it('should reload when verset numbers change', async () => {
    const { result, rerender } = renderHook<any, { sourateNumero: number; versetNumero: number }>(
      ({ sourateNumero, versetNumero }) => useVerset(sourateNumero, versetNumero),
      {
        initialProps: { sourateNumero: 1, versetNumero: 1 },
      }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    jest.clearAllMocks();

    rerender({ sourateNumero: 1, versetNumero: 2 });

    await waitFor(() => {
      expect(quranService.getVerset).toHaveBeenCalledWith(1, 2);
    });
  });
});
