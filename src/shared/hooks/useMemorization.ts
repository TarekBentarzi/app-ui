import { useState, useEffect, useCallback } from 'react';
import { memorizationService, UserMemorization } from '../../infra/secondary/quran';

export function useMemorizations(userId: string | null) {
  const [memorizations, setMemorizations] = useState<UserMemorization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMemorizations = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await memorizationService.getUserMemorizations(userId);
      setMemorizations(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMemorizations();
  }, [fetchMemorizations]);

  return {
    memorizations,
    loading,
    error,
    refetch: fetchMemorizations,
  };
}

export function useRevisions(userId: string | null) {
  const [revisions, setRevisions] = useState<UserMemorization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRevisions = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await memorizationService.getRevisionsForUser(userId);
      setRevisions(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRevisions();
  }, [fetchRevisions]);

  return {
    revisions,
    loading,
    error,
    refetch: fetchRevisions,
  };
}

export function useMemorization() {
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createMemorization = useCallback(
    async (
      userId: string,
      versetId: string,
      sourateNumero: number,
      versetNumero: number
    ) => {
      try {
        setCreating(true);
        setError(null);
        const data = await memorizationService.createMemorization(userId, {
          versetId,
          sourateNumero,
          versetNumero,
        });
        return data;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setCreating(false);
      }
    },
    []
  );

  const updateMemorization = useCallback(
    async (
      userId: string,
      id: string,
      updates: {
        statut?: 'en_cours' | 'memorise' | 'a_reviser';
        niveauMaitrise?: number;
        exercicesTotal?: number;
        exercicesReussis?: number;
      }
    ) => {
      try {
        setUpdating(true);
        setError(null);
        const data = await memorizationService.updateMemorization(userId, id, updates);
        return data;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setUpdating(false);
      }
    },
    []
  );

  const deleteMemorization = useCallback(async (userId: string, id: string) => {
    try {
      setDeleting(true);
      setError(null);
      await memorizationService.deleteMemorization(userId, id);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, []);

  return {
    creating,
    updating,
    deleting,
    error,
    createMemorization,
    updateMemorization,
    deleteMemorization,
  };
}
