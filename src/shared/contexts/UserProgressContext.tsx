import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UniversalStorage } from '@/infra/secondary/storage/UniversalStorage';
import { ProgressStorage } from '@/infra/secondary/storage/ProgressStorage';
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
            const effectiveUserId = user?.id || 'anonymous';
            
            // Charger currentSurah et currentVerse depuis ProgressStorage (mode verse par défaut)
            const savedPosition = await ProgressStorage.getProgress(effectiveUserId, 'verse');
            
            if (!user) {
                console.log('[UserProgressProvider] No user, loading anonymous progress');
                // Même en mode anonyme, charger la progression sauvegardée
                if (savedPosition) {
                    setProgress({
                        currentSurah: savedPosition.sourateNumero,
                        currentVerse: savedPosition.versetNumero,
                        versesRead: 0,
                        versesMemorized: 0,
                        pronunciationScore: 0,
                        streak: 0,
                    });
                } else {
                    setProgress(DEFAULT_PROGRESS);
                }
            } else {
                // Charger UNIQUEMENT les statistiques depuis user_progress (pas la position)
                const savedProgress = await UniversalStorage.getItem('user_progress');
                let stats = {
                    versesRead: 0,
                    versesMemorized: 0,
                    pronunciationScore: 0,
                    streak: 0,
                };
                
                if (savedProgress) {
                    try {
                        const parsed = JSON.parse(savedProgress);
                        stats = {
                            versesRead: parsed.versesRead || 0,
                            versesMemorized: parsed.versesMemorized || 0,
                            pronunciationScore: parsed.pronunciationScore || 0,
                            streak: parsed.streak || 0,
                        };
                    } catch (e) {
                        console.error('Failed to parse user progress', e);
                    }
                }
                
                // Position vient UNIQUEMENT de ProgressStorage, jamais de user_progress
                setProgress({
                    currentSurah: savedPosition?.sourateNumero || 1,
                    currentVerse: savedPosition?.versetNumero || 1,
                    ...stats,
                });
            }
        };
        
        loadProgress();
    }, [user]);

    const updateProgress = (updates: Partial<UserProgress>) => {
        setProgress(prev => {
            const newProgress = { ...prev, ...updates };
            
            // NE PAS sauvegarder currentSurah et currentVerse dans user_progress
            // Ces valeurs doivent UNIQUEMENT venir de ProgressStorage pour éviter les incohérences
            const { currentSurah, currentVerse, ...statsOnly } = newProgress;
            const currentStats = {
                versesRead: statsOnly.versesRead,
                versesMemorized: statsOnly.versesMemorized,
                pronunciationScore: statsOnly.pronunciationScore,
                streak: statsOnly.streak,
            };
            
            // Sauvegarder SEULEMENT les statistiques (pas la position)
            UniversalStorage.setItem('user_progress', JSON.stringify(currentStats)).catch(err => {
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
