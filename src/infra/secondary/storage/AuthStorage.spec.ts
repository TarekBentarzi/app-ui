import { AuthStorage } from './AuthStorage';
import { UserDTO } from '@/application/dto/UserDTO';

describe('AuthStorage', () => {
    const mockUser: UserDTO = { id: '1', name: 'Test', email: 'test@example.com' };

    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should save user to localStorage', () => {
        AuthStorage.saveUser(mockUser);
        expect(localStorage.getItem('auth_user')).toBe(JSON.stringify(mockUser));
    });

    it('should get user from localStorage', () => {
        localStorage.setItem('auth_user', JSON.stringify(mockUser));
        const result = AuthStorage.getUser();
        expect(result).toEqual(mockUser);
    });

    it('should return null if no user in localStorage', () => {
        const result = AuthStorage.getUser();
        expect(result).toBeNull();
    });

    it('should clear user from localStorage', () => {
        localStorage.setItem('auth_user', JSON.stringify(mockUser));
        AuthStorage.clearUser();
        expect(localStorage.getItem('auth_user')).toBeNull();
    });

    it('should handle environment without window gracefully', () => {
        jest.spyOn(AuthStorage, 'isBrowser').mockReturnValue(false);

        AuthStorage.saveUser(mockUser);
        expect(AuthStorage.getUser()).toBeNull();
        AuthStorage.clearUser();

        expect(localStorage.getItem('auth_user')).toBeNull();
    });

    it('should handle get user when data is null', () => {
        localStorage.removeItem('auth_user');
        expect(AuthStorage.getUser()).toBeNull();
    });

    it('should return true for isBrowser in test env', () => {
        expect(AuthStorage.isBrowser()).toBe(true);
    });
});
