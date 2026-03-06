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
      console.log('[ProgressService] GET /users/' + userId + '/save');
      const data = await apiClient.get(`/users/${userId}/save`);
      console.log('[ProgressService] Réponse:', data);
      return data;
    } catch (error: any) {
      if (error.message?.includes('404')) {
        console.log('[ProgressService] Pas de sauvegarde trouvée (404)');
        return null;
      }
      console.error('[ProgressService] Erreur GET progress:', error);
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
      console.log('[ProgressService] PUT /users/' + userId + '/save', { sourateNumero, versetNumero });
      const data = await apiClient.put(`/users/${userId}/save`, {
        sourateNumero,
        versetNumero,
      });
      console.log('[ProgressService] Sauvegarde réussie:', data);
      return data;
    } catch (error: any) {
      // Ne pas logger les 401 comme erreurs - c'est normal si non connecté ou localhost mobile
      if (error.message?.includes('401')) {
        console.log('[ProgressService] API non accessible (401) - sauvegarde locale uniquement');
      } else {
        console.error('[ProgressService] Erreur PUT progress:', error);
      }
      throw error;
    }
  }
}

// Export singleton
export const progressService = new ProgressService();
