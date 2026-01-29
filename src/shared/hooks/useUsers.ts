/**
 * Infra/Primary Layer - Custom Hook
 * Encapsule la logique d'application pour les composants
 */

import { useState, useEffect } from 'react';
import { UserDTO } from '@/application/dto/UserDTO';

export const useUsers = (userService: any) => {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, error, refetch: loadUsers };
};
