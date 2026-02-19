import { useState, useEffect, useCallback } from 'react';
import { progressService, UserSave } from '../../infra/secondary/quran';

export function useProgress(userId: string | null) {
  const [progress, setProgress] = useState<UserSave | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await progressService.getUserProgress(userId);
      setProgress(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const saveProgress = useCallback(
    async (sourateNumero: number, versetNumero: number) => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      try {
        setSaving(true);
        setError(null);
        const data = await progressService.saveProgress(
          userId,
          sourateNumero,
          versetNumero
        );
        setProgress(data);
        return data;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [userId]
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
