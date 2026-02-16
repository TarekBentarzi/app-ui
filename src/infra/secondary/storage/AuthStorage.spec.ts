import { AuthStorage } from './AuthStorage';
import { UserDTO } from '@/application/dto/UserDTO';

const mockUser: UserDTO = { id: '1', name: 'Test', email: 'test@example.com' };

describe('AuthStorage', () => {

    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should save user to localStorage', () => {
        AuthStorage.saveUser(mockUser);
        expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
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

    it('should clear user from localStorage', () => {
        localStorage.setItem('user', JSON.stringify(mockUser));
        AuthStorage.clearUser();
        expect(localStorage.getItem('user')).toBeNull();
    });

    it('should handle environment without window gracefully', () => {
        jest.spyOn(AuthStorage, 'isBrowser').mockReturnValue(false);

        AuthStorage.saveUser(mockUser);
        expect(AuthStorage.getUser()).toBeNull();
        AuthStorage.clearUser();

        expect(localStorage.getItem('user')).toBeNull();
    });

    it('should handle get user when data is null', () => {
        localStorage.removeItem('user');
        expect(AuthStorage.getUser()).toBeNull();
    });

    it('should return true for isBrowser in test env', () => {
        expect(AuthStorage.isBrowser()).toBe(true);
    });

    it('should handle isBrowser errors gracefully', () => {
        // Mock localStorage to throw error when accessed
        const originalLocalStorage = (global as any).localStorage;
        Object.defineProperty(global, 'localStorage', {
            get: () => {
                throw new Error('localStorage is not defined');
            },
            configurable: true,
        });

        const result = AuthStorage.isBrowser();
        expect(result).toBe(false);

        // Restore localStorage
        Object.defineProperty(global, 'localStorage', {
            value: originalLocalStorage,
            configurable: true,
        });
    });
    
    it('should save and get token', () => {
        AuthStorage.saveToken('token123');
        expect(AuthStorage.getToken()).toBe('token123');
    });

    it('should clear token', () => {
        AuthStorage.saveToken('token123');
        AuthStorage.clearToken();
        expect(AuthStorage.getToken()).toBeNull();
    });

    it('should remove legacy keys when getting user', () => {
        localStorage.setItem('auth_user', 'legacy');
        localStorage.setItem('auth_token', 'legacy');
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        const result = AuthStorage.getUser();
        
        expect(result).toEqual(mockUser);
        expect(localStorage.getItem('auth_user')).toBeNull();
        expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('should handle corrupted user data gracefully', () => {
        localStorage.setItem('user', 'invalid-json');
        
        // JSON.parse va throw une erreur, donc on doit s'attendre à ce que ça throw
        expect(() => AuthStorage.getUser()).toThrow();
    });

    it('should handle setItem when not in browser', () => {
        jest.spyOn(AuthStorage, 'isBrowser').mockReturnValue(false);
        
        AuthStorage.setItem('test', 'value');
        
        expect(localStorage.getItem('test')).toBeNull();
    });

    it('should handle removeItem when not in browser', () => {
        localStorage.setItem('test', 'value');
        jest.spyOn(AuthStorage, 'isBrowser').mockReturnValue(false);
        
        AuthStorage.removeItem('test');
        
        // Value should still be there since isBrowser returned false
        expect(localStorage.getItem('test')).toBe('value');
    });
});