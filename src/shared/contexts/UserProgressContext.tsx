import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UniversalStorage } from '@/infra/secondary/storage/UniversalStorage';
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
        const loadProgress = async () => {
            if (!user) {
                console.log('[UserProgressProvider] No user, resetting to default');
                setProgress(DEFAULT_PROGRESS);
            } else {
                // Reload progress when a user logs in
                const savedProgress = await UniversalStorage.getItem('user_progress');
                if (savedProgress) {
                    try {
                        setProgress(JSON.parse(savedProgress));
                    } catch (e) {
                        console.error('Failed to parse user progress', e);
                    }
                }
            }
        };
        
        loadProgress();
    }, [user]);

    const updateProgress = (updates: Partial<UserProgress>) => {
        setProgress(prev => {
            const newProgress = { ...prev, ...updates };
            // Save asynchronously (fire and forget)
            UniversalStorage.setItem('user_progress', JSON.stringify(newProgress)).catch(err => {
                console.error('Failed to save user progress', err);
            });
            return newProgress;
        });
    };

    const resetProgress = () => {
        setProgress(DEFAULT_PROGRESS);
        UniversalStorage.removeItem('user_progress').catch(err => {
            console.error('Failed to remove user progress', err);
        });
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
