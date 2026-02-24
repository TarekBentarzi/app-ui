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
    if (!userId) {
      console.log('[useProgress] Pas de userId, skip fetch');
      setLoading(false);
      return;
    }

    try {
      console.log(`[useProgress] Chargement progression pour user: ${userId} (mode: ${mode})`);
      setLoading(true);
      setError(null);
      
      // Charger depuis le localStorage en priorité (par mode)
      const localProgress = await ProgressStorage.getProgress(userId, mode);
      if (localProgress) {
        console.log(`[useProgress] Chargement depuis localStorage (${mode}):`, localProgress);
        setProgress({
          id: 'local-' + userId,
          userId: localProgress.userId,
          sourateNumero: localProgress.sourateNumero,
          versetNumero: localProgress.versetNumero,
          lastReadAt: localProgress.lastUpdated,
          createdAt: localProgress.lastUpdated,
          updatedAt: localProgress.lastUpdated,
        });
        setLoading(false);
        return;
      }
      
      // Si pas dans localStorage, essayer l'API (note: l'API ne gère pas les modes séparés pour l'instant)
      const data = await progressService.getUserProgress(userId);
      console.log('[useProgress] Progression chargée depuis API:', data);
      
      if (data) {
        setProgress(data);
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
      if (!userId) {
        console.error('[useProgress] Tentative de sauvegarde sans userId');
        throw new Error('User ID is required');
      }

      try {
        console.log(`[useProgress] Sauvegarde (${mode}):`, { userId, sourateNumero, versetNumero });
        setSaving(true);
        setError(null);
        
        // TOUJOURS sauvegarder localement d'abord (instantané)
        await ProgressStorage.saveProgress(userId, sourateNumero, versetNumero, mode);
        console.log(`[useProgress] ✅ Sauvegarde locale réussie (${mode})`);
        
        // Mettre à jour l'état immédiatement
        const now = new Date().toISOString();
        const localData: UserSave = {
          id: 'local-' + userId,
          userId,
          sourateNumero,
          versetNumero,
          lastReadAt: now,
          createdAt: now,
          updatedAt: now,
        };
        setProgress(localData);
        
        // Puis essayer de sauvegarder sur l'API (en arrière-plan) SEULEMENT si on a un token
        const token = AuthStorage.getToken();
        if (token) {
          try {
            const data = await progressService.saveProgress(
              userId,
              sourateNumero,
              versetNumero
            );
            console.log('[useProgress] ✅ Sauvegarde API réussie:', data);
            setProgress(data);
            return data;
          } catch (apiError) {
            console.warn('[useProgress] ⚠️ Sauvegarde API échouée (local OK):', apiError);
            // Pas grave, on a déjà sauvegardé localement
            return localData;
          }
        } else {
          console.log('[useProgress] ℹ️ Pas de token, sauvegarde locale uniquement');
          return localData;
        }
      } catch (err) {
        console.error('[useProgress] ❌ Erreur sauvegarde:', err);
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

