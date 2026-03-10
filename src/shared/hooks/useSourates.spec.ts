import { renderHook, waitFor } from '@testing-library/react-native';
import { useSourates, useSourate } from './useSourates';
import { quranService } from '../../infra/secondary/quran';

jest.mock('../../infra/secondary/quran', () => ({
    quranService: {
        getAllSourates: jest.fn(),
        getSourateByNumero: jest.fn(),
    },
}));

describe('useSourates', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch sourates on mount', async () => {
        const mockSourates = [
            { id: '1', numero: 1, nomArabe: 'الفاتحة', nomFrancais: 'Al-Fatiha', nombreVersets: 7 }
        ];
        (quranService.getAllSourates as jest.Mock).mockResolvedValue(mockSourates);

        const { result } = renderHook(() => useSourates());

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.sourates).toEqual(mockSourates);
        expect(result.current.error).toBeNull();
    });

    it('should handle errors when fetching sourates', async () => {
        const mockError = new Error('Network error');
        (quranService.getAllSourates as jest.Mock).mockRejectedValue(mockError);

        const { result } = renderHook(() => useSourates());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toEqual(mockError);
        expect(result.current.sourates).toEqual([]);
    });

    it('should refetch sourates when refetch is called', async () => {
        const mockSourates = [
            { id: '1', numero: 1, nomArabe: 'الفاتحة', nomFrancais: 'Al-Fatiha', nombreVersets: 7 }
        ];
        (quranService.getAllSourates as jest.Mock).mockResolvedValue(mockSourates);

        const { result } = renderHook(() => useSourates());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        result.current.refetch();

        await waitFor(() => {
            expect(quranService.getAllSourates).toHaveBeenCalledTimes(2);
        });
    });
});

describe('useSourate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch a sourate by numero', async () => {
        const mockSourate = { id: '1', numero: 1, nomArabe: 'الفاتحة', nomFrancais: 'Al-Fatiha', nombreVersets: 7 };
        (quranService.getSourateByNumero as jest.Mock).mockResolvedValue(mockSourate);

        const { result } = renderHook(() => useSourate(1));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.sourate).toEqual(mockSourate);
        expect(result.current.error).toBeNull();
    });

    it('should handle errors when fetching a sourate', async () => {
        const mockError = new Error('Sourate not found');
        (quranService.getSourateByNumero as jest.Mock).mockRejectedValue(mockError);

        const { result } = renderHook(() => useSourate(1));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toEqual(mockError);
        expect(result.current.sourate).toBeNull();
    });

    it('should refetch sourate when refetch is called', async () => {
        const mockSourate = { id: '1', numero: 1, nomArabe: 'الفاتحة', nomFrancais: 'Al-Fatiha', nombreVersets: 7 };
        (quranService.getSourateByNumero as jest.Mock).mockResolvedValue(mockSourate);

        const { result } = renderHook(() => useSourate(1));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        result.current.refetch();

        await waitFor(() => {
            expect(quranService.getSourateByNumero).toHaveBeenCalledTimes(2);
        });
    });
});
