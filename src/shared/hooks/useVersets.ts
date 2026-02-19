import { useState, useEffect, useCallback } from 'react';
import { quranService, Verset, Sourate } from '../../infra/secondary/quran';

export function useVersets(sourateNumero: number) {
  const [versets, setVersets] = useState<Verset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVersets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quranService.getVersetsBySourate(sourateNumero);
      setVersets(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [sourateNumero]);

  useEffect(() => {
    if (sourateNumero) {
      fetchVersets();
    }
  }, [sourateNumero, fetchVersets]);

  return {
    versets,
    loading,
    error,
    refetch: fetchVersets,
  };
}

// Hook pour charger tout le Coran avec pagination progressive
export function useAllVersets() {
  const [versets, setVersets] = useState<Verset[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentSourate, setCurrentSourate] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sourates, setSourates] = useState<Sourate[]>([]);

  // Charger la liste des sourates
  useEffect(() => {
    const loadSourates = async () => {
      try {
        const data = await quranService.getAllSourates();
        setSourates(data);
      } catch (err) {
        console.error('Error loading sourates:', err);
      }
    };
    loadSourates();
  }, []);

  // Charger les versets de la première sourate
  useEffect(() => {
    const loadInitialVersets = async () => {
      try {
        setLoading(true);
        setError(null);
        // Charger les 5 premières sourates pour commencer
        const initialVersets: Verset[] = [];
        for (let i = 1; i <= Math.min(5, 114); i++) {
          const data = await quranService.getVersetsBySourate(i);
          initialVersets.push(...data);
        }
        setVersets(initialVersets);
        setCurrentSourate(6);
        setHasMore(6 <= 114);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialVersets();
  }, []);

  // Charger plus de versets (sourates suivantes)
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      // Charger 3 sourates à la fois
      const newVersets: Verset[] = [];
      const endSourate = Math.min(currentSourate + 2, 114);
      
      for (let i = currentSourate; i <= endSourate; i++) {
        const data = await quranService.getVersetsBySourate(i);
        newVersets.push(...data);
      }
      
      setVersets(prev => [...prev, ...newVersets]);
      setCurrentSourate(endSourate + 1);
      setHasMore(endSourate < 114);
    } catch (err) {
      console.error('Error loading more verses:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [currentSourate, loadingMore, hasMore]);

  return {
    versets,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    sourates,
  };
}

export function useVerset(sourateNumero: number, versetNumero: number) {
  const [verset, setVerset] = useState<Verset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVerset = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quranService.getVerset(sourateNumero, versetNumero);
      setVerset(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [sourateNumero, versetNumero]);

  useEffect(() => {
    if (sourateNumero && versetNumero) {
      fetchVerset();
    }
  }, [sourateNumero, versetNumero, fetchVerset]);

  return {
    verset,
    loading,
    error,
    refetch: fetchVerset,
  };
}
