import { useState, useEffect, useCallback } from 'react';
import { quranService, Sourate } from '../../infra/secondary/quran';

export function useSourates() {
  const [sourates, setSourates] = useState<Sourate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSourates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quranService.getAllSourates();
      setSourates(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSourates();
  }, [fetchSourates]);

  return {
    sourates,
    loading,
    error,
    refetch: fetchSourates,
  };
}

export function useSourate(numero: number) {
  const [sourate, setSourate] = useState<Sourate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSourate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quranService.getSourateByNumero(numero);
      setSourate(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [numero]);

  useEffect(() => {
    if (numero) {
      fetchSourate();
    }
  }, [numero, fetchSourate]);

  return {
    sourate,
    loading,
    error,
    refetch: fetchSourate,
  };
}
