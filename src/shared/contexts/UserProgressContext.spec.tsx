import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { UserProgressProvider, useUserProgress } from './UserProgressContext';
import { useAuth } from './AuthContext';

jest.mock('./AuthContext');
jest.mock('@/infra/secondary/storage/AuthStorage', () => ({
    AuthStorage: {
        getItem: jest.fn(() => JSON.stringify({ currentVerse: 1, versesRead: 0, streak: 0 })),
        setItem: jest.fn(),
        removeItem: jest.fn(),
    },
}));

describe('UserProgressContext', () => {
    const mockUser = { id: '1', name: 'Alice', email: 'alice@test.com' };

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            user: mockUser,
        });
    });

    it('should provide initial progress', () => {
        const { result } = renderHook(() => useUserProgress(), {
            wrapper: UserProgressProvider,
        });

        expect(result.current.progress).toBeDefined();
    });

    it('should update progress', async () => {
        const { result } = renderHook(() => useUserProgress(), {
            wrapper: UserProgressProvider,
        });

        await act(async () => {
            result.current.updateProgress({ currentVerse: 5, versesRead: 10, streak: 2 });
        });

        expect(result.current.progress.currentVerse).toBe(5);
    });

    it('should reset progress', async () => {
        const { result } = renderHook(() => useUserProgress(), {
            wrapper: UserProgressProvider,
        });

        await act(async () => {
            result.current.resetProgress();
        });

        expect(result.current.progress.currentVerse).toBe(1);
        expect(result.current.progress.versesRead).toBe(0);
    });

    it('should throw error when used outside provider', () => {
        expect(() => {
            renderHook(() => useUserProgress());
        }).toThrow('useUserProgress must be used within a UserProgressProvider');
    });

    it('should handle corrupted progress data', () => {
        const AuthStorage = require('@/infra/secondary/storage/AuthStorage').AuthStorage;
        AuthStorage.getItem.mockReturnValueOnce('invalid-json');
        
        const { result } = renderHook(() => useUserProgress(), {
            wrapper: UserProgressProvider,
        });

        // Should still work with default progress
        expect(result.current.progress).toBeDefined();
    });
});
