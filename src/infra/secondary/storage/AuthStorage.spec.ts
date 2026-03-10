import { AuthStorage } from './AuthStorage';
import { UserDTO } from '@/application/dto/UserDTO';

const mockUser: UserDTO = { id: '1', name: 'Test', email: 'test@example.com' };

// Mock UniversalStorage
jest.mock('./UniversalStorage', () => ({
    UniversalStorage: {
        setItem: jest.fn(),
        getItem: jest.fn(() => Promise.resolve(null)),
        removeItem: jest.fn(),
    },
}));

describe('AuthStorage', () => {

    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should get user from localStorage', () => {
        localStorage.setItem('user', JSON.stringify(mockUser));
        const result = AuthStorage.getUser();
        expect(result).toEqual(mockUser);
    });

    it('should return null if no user in localStorage', () => {
        const result = AuthStorage.getUser();
        expect(result).toBeNull();
    });

    it('should handle get user when data is null', () => {
        localStorage.removeItem('user');
        expect(AuthStorage.getUser()).toBeNull();
    });
    
    it('should get token from localStorage', () => {
        localStorage.setItem('token', 'token123');
        expect(AuthStorage.getToken()).toBe('token123');
    });

    it('should return null when no token in localStorage', () => {
        expect(AuthStorage.getToken()).toBeNull();
    });

    it('should handle error in getUser gracefully', () => {
        localStorage.setItem('user', 'invalid-json');
        const result = AuthStorage.getUser();
        expect(result).toBeNull();
    });

    it('should handle error in getToken gracefully', () => {
        // Mock console.error to suppress error output
        jest.spyOn(console, 'error').mockImplementation();
        
        const originalLocalStorage = (global as any).localStorage;
        Object.defineProperty(global, 'localStorage', {
            get: () => {
                throw new Error('localStorage not available');
            },
            configurable: true,
        });

        const result = AuthStorage.getToken();
        expect(result).toBeNull();

        // Restore localStorage
        Object.defineProperty(global, 'localStorage', {
            value: originalLocalStorage,
            configurable: true,
        });
    });
});