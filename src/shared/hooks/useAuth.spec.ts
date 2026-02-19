import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { UserApplicationService } from '@/application/services/UserApplicationService';
import { AuthStorage } from '@/infra/secondary/storage/AuthStorage';
import { UserDTO } from '@/application/dto/UserDTO';

jest.mock('@/infra/secondary/storage/AuthStorage');

describe('useAuth hook', () => {
    let mockUserService: jest.Mocked<UserApplicationService>;
    const mockUser: UserDTO = { id: '1', name: 'John', email: 'john@example.com' };

    beforeEach(() => {
        mockUserService = {
            register: jest.fn(),
        } as any;
        (AuthStorage.getUser as jest.Mock).mockReset();
        (AuthStorage.saveUser as jest.Mock).mockReset();
        (AuthStorage.clearUser as jest.Mock).mockReset();
        jest.clearAllMocks();
    });

    it('should load user from storage on mount', () => {
        (AuthStorage.getUser as jest.Mock).mockReturnValue(mockUser);

        const { result } = renderHook(() => useAuth(mockUserService));

        expect(AuthStorage.getUser).toHaveBeenCalled();
        expect(result.current.user).toEqual(mockUser);
    });

    it('should sign in successfully', async () => {
        mockUserService.register.mockResolvedValue(mockUser);

        const { result } = renderHook(() => useAuth(mockUserService));

        await act(async () => {
            await result.current.signIn({ name: 'John', email: 'john@example.com' });
        });

        expect(mockUserService.register).toHaveBeenCalled();
        expect(AuthStorage.saveUser).toHaveBeenCalledWith(mockUser);
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.loading).toBe(false);
    });

    it('should handle sign in failure', async () => {
        const error = new Error('Auth failed');
        mockUserService.register.mockRejectedValue(error);
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        const { result } = renderHook(() => useAuth(mockUserService));

        await act(async () => {
            await expect(result.current.signIn({ name: 'a', email: 'b' })).rejects.toThrow('Auth failed');
        });

        expect(result.current.user).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith('Sign in failed:', error);
        consoleSpy.mockRestore();
    });

    it('should sign out', () => {
        (AuthStorage.getUser as jest.Mock).mockReturnValue(mockUser);
        const { result } = renderHook(() => useAuth(mockUserService));

        act(() => {
            result.current.signOut();
        });

        expect(AuthStorage.clearUser).toHaveBeenCalled();
        expect(result.current.user).toBeNull();
    });
});
