import { apiClient } from '@/infra/secondary/api/apiClient';
import { UserMemorization } from './types';

interface CreateMemorizationDto {
  versetId: string;
  sourateNumero: number;
  versetNumero: number;
}

interface UpdateMemorizationDto {
  statut?: 'en_cours' | 'memorise' | 'a_reviser';
  niveauMaitrise?: number;
  exercicesTotal?: number;
  exercicesReussis?: number;
  prochaineRevision?: string;
}

class MemorizationService {
  /**
   * Configure le token d'authentification
   */
  setAuthToken(token: string) {
    apiClient.setToken(token);
  }

  /**
   * Récupère tous les versets en mémorisation
   */
  async getUserMemorizations(userId: string): Promise<UserMemorization[]> {
    try {
      const data = await apiClient.get(`/users/${userId}/memorizations`);
      return data;
    } catch (error) {
      console.error('Error fetching memorizations:', error);
      throw error;
    }
  }

  /**
   * Récupère les versets à réviser
   */
  async getRevisionsForUser(userId: string): Promise<UserMemorization[]> {
    try {
      const data = await apiClient.get(`/users/${userId}/memorizations/revisions`);
      return data;
    } catch (error) {
      console.error('Error fetching revisions:', error);
      throw error;
    }
  }

  /**
   * Récupère une mémorisation spécifique
   */
  async getMemorization(userId: string, id: string): Promise<UserMemorization> {
    try {
      const data = await apiClient.get(`/users/${userId}/memorizations/${id}`);
      return data;
    } catch (error) {
      console.error('Error fetching memorization:', error);
      throw error;
    }
  }

  /**
   * Commence la mémorisation d'un nouveau verset
   */
  async createMemorization(
    userId: string,
    data: CreateMemorizationDto
  ): Promise<UserMemorization> {
    try {
      const result = await apiClient.post(`/users/${userId}/memorizations`, data);
      return result;
    } catch (error) {
      console.error('Error creating memorization:', error);
      throw error;
    }
  }

  /**
   * Met à jour la progression d'une mémorisation
   */
  async updateMemorization(
    userId: string,
    id: string,
    data: UpdateMemorizationDto
  ): Promise<UserMemorization> {
    try {
      const result = await apiClient.put(`/users/${userId}/memorizations/${id}`, data);
      return result;
    } catch (error) {
      console.error('Error updating memorization:', error);
      throw error;
    }
  }

  /**
   * Supprime une mémorisation
   */
  async deleteMemorization(userId: string, id: string): Promise<void> {
    try {
      await apiClient.delete(`/users/${userId}/memorizations/${id}`);
    } catch (error) {
      console.error('Error deleting memorization:', error);
      throw error;
    }
  }

  /**
   * Calcule la prochaine date de révision (algorithme de répétition espacée)
   */
  calculateNextRevision(
    currentLevel: number,
    successStreak: number
  ): Date {
    const now = new Date();
    let daysToAdd = 1;

    // Algorithme simplifié de répétition espacée
    if (successStreak === 1) daysToAdd = 1;
    else if (successStreak === 2) daysToAdd = 3;
    else if (successStreak === 3) daysToAdd = 7;
    else if (successStreak === 4) daysToAdd = 14;
    else if (successStreak >= 5) daysToAdd = 30;

    // Ajuster selon le niveau de maîtrise
    if (currentLevel >= 80) daysToAdd *= 2;
    else if (currentLevel < 50) daysToAdd = Math.max(1, Math.floor(daysToAdd / 2));

    now.setDate(now.getDate() + daysToAdd);
    return now;
  }
}

// Export singleton
export const memorizationService = new MemorizationService();
