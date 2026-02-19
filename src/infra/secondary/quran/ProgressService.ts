import { apiClient } from '@/infra/secondary/api/apiClient';
import { UserSave } from './types';

class ProgressService {
  /**
   * Configure le token d'authentification
   */
  setAuthToken(token: string) {
    apiClient.setToken(token);
  }

  /**
   * Récupère la progression de lecture d'un utilisateur
   */
  async getUserProgress(userId: string): Promise<UserSave | null> {
    try {
      const data = await apiClient.get(`/users/${userId}/save`);
      return data;
    } catch (error: any) {
      if (error.message?.includes('404')) {
        return null;
      }
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }

  /**
   * Sauvegarde ou met à jour la position de lecture
   */
  async saveProgress(
    userId: string,
    sourateNumero: number,
    versetNumero: number
  ): Promise<UserSave> {
    try {
      const data = await apiClient.put(`/users/${userId}/save`, {
        sourateNumero,
        versetNumero,
      });
      return data;
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  }
}

// Export singleton
export const progressService = new ProgressService();
