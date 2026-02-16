import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthStorage } from '@/infra/secondary/storage/AuthStorage';
import { useAuth } from './AuthContext';

interface UserProgress {
    currentSurah: number;
    currentVerse: number;
    versesRead: number;
    versesMemorized: number;
    pronunciationScore: number;
    streak: number;
}

interface UserProgressContextType {
    progress: UserProgress;
    updateProgress: (updates: Partial<UserProgress>) => void;
    resetProgress: () => void;
}

const DEFAULT_PROGRESS: UserProgress = {
    currentSurah: 1,
    currentVerse: 1,
    versesRead: 0,
    versesMemorized: 0,
    pronunciationScore: 0,
    streak: 0,
};

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

export const UserProgressProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);

    // Reset progress in memory when user changes or logs out
    useEffect(() => {
        if (!user) {
            console.log('[UserProgressProvider] No user, resetting to default');
            setProgress(DEFAULT_PROGRESS);
        } else {
            // Reload progress when a user logs in
            const savedProgress = AuthStorage.getItem('user_progress');
            if (savedProgress) {
                try {
                    setProgress(JSON.parse(savedProgress));
                } catch (e) {
                    console.error('Failed to parse user progress', e);
                }
            }
        }
    }, [user]);

    const updateProgress = (updates: Partial<UserProgress>) => {
        setProgress(prev => {
            const newProgress = { ...prev, ...updates };
            AuthStorage.setItem('user_progress', JSON.stringify(newProgress));
            return newProgress;
        });
    };

    const resetProgress = () => {
        setProgress(DEFAULT_PROGRESS);
        AuthStorage.removeItem('user_progress');
    };

    return (
        <UserProgressContext.Provider value={{ progress, updateProgress, resetProgress }}>
            {children}
        </UserProgressContext.Provider>
    );
};

export const useUserProgress = () => {
    const context = useContext(UserProgressContext);
    if (context === undefined) {
        throw new Error('useUserProgress must be used within a UserProgressProvider');
    }
    return context;
};
