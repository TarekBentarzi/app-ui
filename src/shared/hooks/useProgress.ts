import { useState, useEffect, useCallback } from 'react';
import { progressService, UserSave } from '../../infra/secondary/quran';
import { ProgressStorage, ReadingMode } from '../../infra/secondary/storage/ProgressStorage';
import { AuthStorage } from '../../infra/secondary/storage/AuthStorage';

export function useProgress(userId: string | null, mode: ReadingMode = 'verse') {
  const [progress, setProgress] = useState<UserSave | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchProgress = useCallback(async () => {
    // Support du mode anonyme (utilisateur non connecté)
    const effectiveUserId = userId || 'anonymous';
    
    try {
      console.log(`[useProgress] 🔵 FETCH START - user: ${effectiveUserId}, mode: ${mode}`);
      setLoading(true);
      setError(null);
      
      // Charger depuis le localStorage en priorité (par mode)
      const localProgress = await ProgressStorage.getProgress(effectiveUserId, mode);
      if (localProgress) {
        console.log(`[useProgress] ✅ LOCAL DATA FOUND:`, localProgress);
        setProgress({
          id: 'local-' + effectiveUserId,
          userId: localProgress.userId,
          sourateNumero: localProgress.sourateNumero,
          versetNumero: localProgress.versetNumero,
          lastReadAt: localProgress.lastUpdated,
          createdAt: localProgress.lastUpdated,
          updatedAt: localProgress.lastUpdated,
        });
        setLoading(false);
        return;
      } else {
        console.log(`[useProgress] ⚠️ NO LOCAL DATA for mode: ${mode}`);
      }
      
      // Si pas dans localStorage et utilisateur connecté, essayer l'API
      if (userId && userId !== 'anonymous') {
        const data = await progressService.getUserProgress(userId);
        console.log('[useProgress] Progression chargée depuis API:', data);
        
        if (data) {
          setProgress(data);
        }
      } else {
        console.log('[useProgress] Mode anonyme, pas de chargement API');
      }
    } catch (err) {
      console.error('[useProgress] Erreur chargement:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId, mode]);

  const saveProgress = useCallback(
    async (sourateNumero: number, versetNumero: number) => {
      const effectiveUserId = userId || 'anonymous';
      const isAnonymous = !userId || userId === 'anonymous';

      console.log(`[useProgress] 💾 SAVE START (${mode}) - user: ${effectiveUserId}, anonymous: ${isAnonymous}, position: ${sourateNumero}:${versetNumero}`);

      try {
        setSaving(true);
        setError(null);
        
        // TOUJOURS sauvegarder localement d'abord (instantané)
        await ProgressStorage.saveProgress(effectiveUserId, sourateNumero, versetNumero, mode);
        
        // Mettre à jour l'état immédiatement
        const now = new Date().toISOString();
        const localData: UserSave = {
          id: 'local-' + effectiveUserId,
          userId: effectiveUserId,
          sourateNumero,
          versetNumero,
          lastReadAt: now,
          createdAt: now,
          updatedAt: now,
        };
        setProgress(localData);
        
        // Sauvegarder sur l'API SEULEMENT si utilisateur connecté (pas anonyme)
        if (!isAnonymous) {
          const token = AuthStorage.getToken();
          if (token) {
            try {
              const data = await progressService.saveProgress(
                effectiveUserId,
                sourateNumero,
                versetNumero
              );
              setProgress(data);
              return data;
            } catch (apiError: any) {
              const is401 = apiError?.message?.includes('401');
              if (is401) {
                await AuthStorage.clearToken();
              }
              return localData;
            }
          } else {
            return localData;
          }
        } else {
          return localData;
        }
      } catch (err) {
        console.error('[useProgress] Erreur sauvegarde:', err);
        setError(err as Error);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [userId, mode]
  );

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    loading,
    error,
    saving,
    saveProgress,
    refetch: fetchProgress,
  };
}

