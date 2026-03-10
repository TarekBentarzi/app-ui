import { quranService } from './QuranService';
import { apiClient } from '@/infra/secondary/api/apiClient';

jest.mock('@/infra/secondary/api/apiClient', () => ({
    apiClient: {
        setToken: jest.fn(),
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    },
}));

describe('QuranService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('setAuthToken', () => {
        it('should set the auth token in apiClient', () => {
            const token = 'test-token-123';
            quranService.setAuthToken(token);
            expect(apiClient.setToken).toHaveBeenCalledWith(token);
        });
    });

    describe('getAllSourates', () => {
        it('should fetch all sourates', async () => {
            const mockSourates = [
                { id: '1', numero: 1, nomArabe: 'الفاتحة', nomFrancais: 'Al-Fatiha', nombreVersets: 7 }
            ];
           (apiClient.get as jest.Mock).mockResolvedValue(mockSourates);

            const result = await quranService.getAllSourates();
            
            expect(apiClient.get).toHaveBeenCalledWith('/sourates');
            expect(result).toEqual(mockSourates);
        });

        it('should handle errors when fetching sourates', async () => {
            const mockError = new Error('Network error');
            (apiClient.get as jest.Mock).mockRejectedValue(mockError);

            await expect(quranService.getAllSourates()).rejects.toThrow('Network error');
        });
    });

    describe('getSourateByNumero', () => {
        it('should fetch a sourate by number', async () => {
            const mockSourate = { id: '1', numero: 1, nomArabe: 'الفاتحة', nomFrancais: 'Al-Fatiha', nombreVersets: 7 };
            (apiClient.get as jest.Mock).mockResolvedValue(mockSourate);

            const result = await quranService.getSourateByNumero(1);
            
            expect(apiClient.get).toHaveBeenCalledWith('/sourates/1');
            expect(result).toEqual(mockSourate);
        });

        it('should handle errors when fetching a sourate', async () => {
            const mockError = new Error('Sourate not found');
            (apiClient.get as jest.Mock).mockRejectedValue(mockError);

            await expect(quranService.getSourateByNumero(1)).rejects.toThrow('Sourate not found');
        });
    });

    describe('getVersetsBySourate', () => {
        it('should fetch versets for a sourate', async () => {
            const mockVersets = [
                { id: '1', numero: 1, texteArabe: 'بِسْمِ اللَّهِ', traductionFrancaise: 'Au nom d\'Allah', sourateNumero: 1 }
            ];
            (apiClient.get as jest.Mock).mockResolvedValue(mockVersets);

            const result = await quranService.getVersetsBySourate(1);
            
            expect(apiClient.get).toHaveBeenCalledWith('/versets/sourate/1');
            expect(result).toEqual(mockVersets);
        });

        it('should handle errors when fetching versets', async () => {
            const mockError = new Error('Versets not found');
            (apiClient.get as jest.Mock).mockRejectedValue(mockError);

            await expect(quranService.getVersetsBySourate(1)).rejects.toThrow('Versets not found');
        });
    });

    describe('getVerset', () => {
        it('should fetch a specific verset', async () => {
            const mockVerset = { id: '1', numero: 1, texteArabe: 'بِسْمِ اللَّهِ', traductionFrancaise: 'Au nom d\'Allah', sourateNumero: 1 };
            (apiClient.get as jest.Mock).mockResolvedValue(mockVerset);

            const result = await quranService.getVerset(1, 1);
            
            expect(apiClient.get).toHaveBeenCalledWith('/versets/sourate/1/verset/1');
            expect(result).toEqual(mockVerset);
        });

        it('should handle errors when fetching a verset', async () => {
            const mockError = new Error('Verset not found');
            (apiClient.get as jest.Mock).mockRejectedValue(mockError);

            await expect(quranService.getVerset(1, 1)).rejects.toThrow('Verset not found');
        });
    });
});
