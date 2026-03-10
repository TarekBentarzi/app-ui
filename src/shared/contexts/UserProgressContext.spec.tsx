import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { UserProgressProvider, useUserProgress } from './UserProgressContext';
import { useAuth } from './AuthContext';

jest.mock('./AuthContext');
jest.mock('@/infra/secondary/storage/ProgressStorage', () => ({
    ProgressStorage: {
        getProgress: jest.fn(() => Promise.resolve(null)),
        saveProgress: jest.fn(() => Promise.resolve()),
    },
}));
jest.mock('@/infra/secondary/storage/UniversalStorage', () => ({
    UniversalStorage: {
        getItem: jest.fn(() => Promise.resolve(null)),
        setItem: jest.fn(() => Promise.resolve()),
        removeItem: jest.fn(() => Promise.resolve()),
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

    it('should provide initial progress', async () => {
        const { result } = renderHook(() => useUserProgress(), {
            wrapper: UserProgressProvider,
        });

        await waitFor(() => {
            expect(result.current.progress).toBeDefined();
        });
    });

    it('should update progress', async () => {
        const { result } = renderHook(() => useUserProgress(), {
            wrapper: UserProgressProvider,
        });

        // Wait for initial load to complete
        await waitFor(() => {
            expect(result.current.progress.currentVerse).toBe(1);
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

        // Wait for initial load to complete
        await waitFor(() => {
            expect(result.current.progress).toBeDefined();
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

    it('should handle corrupted progress data', async () => {
        const UniversalStorage = require('@/infra/secondary/storage/UniversalStorage').UniversalStorage;
        UniversalStorage.getItem.mockResolvedValueOnce('invalid-json');
        
        const { result } = renderHook(() => useUserProgress(), {
            wrapper: UserProgressProvider,
        });

        // Wait for load to complete
        await waitFor(() => {
            // Should still work with default progress
            expect(result.current.progress).toBeDefined();
        });
    });
});
