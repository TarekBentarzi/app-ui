import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { AuthStorage } from '@/infra/secondary/storage/AuthStorage';

jest.mock('@/infra/secondary/storage/AuthStorage');
jest.mock('@/infra/secondary/api/apiClient', () => ({
    apiClient: {
        setToken: jest.fn(),
        post: jest.fn(),
    },
}));

jest.mock('@/application/services/UserApplicationService', () => {
    const mockRegister = jest.fn();
    const mockLogin = jest.fn();
    const mockLogout = jest.fn();
    
    return {
        UserApplicationService: jest.fn().mockImplementation(() => ({
            register: mockRegister,
            login: mockLogin,
            logout: mockLogout,
            getAllUsers: jest.fn(),
        })),
        __mockRegister: mockRegister,
        __mockLogin: mockLogin,
        __mockLogout: mockLogout,
    };
});

jest.mock('@/infra/secondary/repositories/UserApiRepository', () => ({
    UserApiRepository: jest.fn().mockImplementation(() => ({})),
}));

import { apiClient } from '@/infra/secondary/api/apiClient';

const { __mockRegister, __mockLogin, __mockLogout } = jest.requireMock('@/application/services/UserApplicationService');

describe('AuthContext', () => {
    const mockUser = { id: '1', name: 'Alice', email: 'alice@test.com' };

    beforeEach(() => {
        jest.clearAllMocks();
        (AuthStorage.getUser as jest.Mock).mockReturnValue(null);
        (AuthStorage.getToken as jest.Mock).mockReturnValue(null);
        (AuthStorage.saveUser as jest.Mock).mockReturnValue(undefined);
        (AuthStorage.saveToken as jest.Mock).mockReturnValue(undefined);
        (AuthStorage.clearUser as jest.Mock).mockReturnValue(undefined);
        (AuthStorage.clearToken as jest.Mock).mockReturnValue(undefined);
        
        __mockLogin.mockResolvedValue({ user: mockUser, token: 'token123' });
        __mockLogout.mockResolvedValue(undefined);
    });

    it('should provide initial null user', () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
        });

        expect(result.current.user).toBeNull();
        expect(result.current.loading).toBe(false);
    });

    it('should restore user from storage on mount', () => {
        (AuthStorage.getUser as jest.Mock).mockReturnValue(mockUser);
        (AuthStorage.getToken as jest.Mock).mockReturnValue('token123');
        (apiClient.setToken as jest.Mock).mockReturnValue(undefined);

        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
        });

        expect(result.current.user).toEqual(mockUser);
        expect(apiClient.setToken).toHaveBeenCalledWith('token123');
    });

    it('should clear storage when only user is saved without token', () => {
        (AuthStorage.getUser as jest.Mock).mockReturnValue(mockUser);
        (AuthStorage.getToken as jest.Mock).mockReturnValue(null);
        (AuthStorage.clearUser as jest.Mock).mockReturnValue(undefined);

        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
        });

        expect(AuthStorage.clearUser).toHaveBeenCalled();
        expect(result.current.user).toBeNull();
    });

    it('should clear storage when only token is saved without user', () => {
        (AuthStorage.getUser as jest.Mock).mockReturnValue(null);
        (AuthStorage.getToken as jest.Mock).mockReturnValue('token123');
        (AuthStorage.clearUser as jest.Mock).mockReturnValue(undefined);

        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
        });

        expect(AuthStorage.clearUser).toHaveBeenCalled();
        expect(result.current.user).toBeNull();
    });

    it('should sign in user', async () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
        });

        await act(async () => {
            await result.current.signIn('alice@test.com', 'password');
        });

        await waitFor(() => {
            expect(result.current.user).toEqual(mockUser);
            expect(__mockLogin).toHaveBeenCalledWith('alice@test.com', 'password');
            expect(AuthStorage.saveUser).toHaveBeenCalledWith(mockUser);
        });
    });

    it('should handle sign in error', async () => {
        const error = new Error('Invalid credentials');
        __mockLogin.mockRejectedValueOnce(error);

        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
        });

        await expect(async () => {
            await act(async () => {
                await result.current.signIn('wrong@test.com', 'wrong');
            });
        }).rejects.toThrow('Invalid credentials');

        expect(result.current.user).toBeNull();
    });

    it('should sign up user and auto-login', async () => {
        const fullUserResponse = { id: '1', name: 'Alice', email: 'alice@test.com' };
        __mockRegister.mockResolvedValueOnce(fullUserResponse);

        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
        });

        await act(async () => {
            await result.current.signUp({ name: 'Alice', email: 'alice@test.com', password: 'pass' });
        });

        await waitFor(() => {
            expect(result.current.user).toEqual(mockUser);
            expect(__mockRegister).toHaveBeenCalledWith({ name: 'Alice', email: 'alice@test.com', password: 'pass' });
            expect(__mockLogin).toHaveBeenCalledWith('alice@test.com', 'pass');
            expect(AuthStorage.saveUser).toHaveBeenCalledWith(mockUser);
        });
    });

    it('should handle sign up error', async () => {
        const error = new Error('Email already exists');
        __mockRegister.mockRejectedValueOnce(error);

        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
        });

        await expect(async () => {
            await act(async () => {
                await result.current.signUp({ name: 'Alice', email: 'alice@test.com', password: 'pass' });
            });
        }).rejects.toThrow('Email already exists');

        expect(result.current.user).toBeNull();
    });

    it('should sign out user', async () => {
        (AuthStorage.getUser as jest.Mock).mockReturnValue(mockUser);
        (AuthStorage.getToken as jest.Mock).mockReturnValue('token123');

        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
        });

        await act(async () => {
            result.current.signOut();
        });

        await waitFor(() => {
            expect(result.current.user).toBeNull();
            expect(__mockLogout).toHaveBeenCalled();
            expect(apiClient.setToken).toHaveBeenCalledWith(null);
        });
    });

    it('should handle sign out error gracefully', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        (AuthStorage.getUser as jest.Mock).mockReturnValue(mockUser);
        (AuthStorage.getToken as jest.Mock).mockReturnValue('token123');
        
        const error = new Error('Logout failed');
        __mockLogout.mockRejectedValueOnce(error);

        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
        });

        await act(async () => {
            result.current.signOut();
        });

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[AuthContext] signOut failed:',
                error
            );
        });

        consoleErrorSpy.mockRestore();
    });

    it.skip('should handle sign in error', async () => {
        const error = new Error('Invalid credentials');
        (apiClient.post as jest.Mock).mockRejectedValueOnce(error);

        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
        });

        let caughtError;
        try {
            await act(async () => {
                await result.current.signIn('wrong@test.com', 'wrong');
            });
        } catch (err) {
            caughtError = err;
        }

        expect(caughtError).toBeDefined();
        expect(caughtError).toEqual(error);
    });

    it('should throw error when used outside provider', () => {
        expect(() => {
            renderHook(() => useAuth());
        }).toThrow('useAuth must be used within an AuthProvider');
    });
});
