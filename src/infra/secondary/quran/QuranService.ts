import { apiClient } from '@/infra/secondary/api/apiClient';
import { Sourate, Verset } from './types';

class QuranService {
  /**
   * Configure le token d'authentification
   */
  setAuthToken(token: string) {
    apiClient.setToken(token);
  }

  /**
   * Récupère toutes les sourates
   */
  async getAllSourates(): Promise<Sourate[]> {
    try {
      const data = await apiClient.get('/sourates');
      return data;
    } catch (error) {
      console.error('Error fetching sourates:', error);
      throw error;
    }
  }

  /**
   * Récupère une sourate par son numéro
   */
  async getSourateByNumero(numero: number): Promise<Sourate> {
    try {
      const data = await apiClient.get(`/sourates/${numero}`);
      return data;
    } catch (error) {
      console.error(`Error fetching sourate ${numero}:`, error);
      throw error;
    }
  }

  /**
   * Récupère tous les versets d'une sourate
   */
  async getVersetsBySourate(sourateNumero: number): Promise<Verset[]> {
    try {
      const data = await apiClient.get(`/versets/sourate/${sourateNumero}`);
      return data;
    } catch (error) {
      console.error(`Error fetching versets for sourate ${sourateNumero}:`, error);
      throw error;
    }
  }

  /**
   * Récupère un verset spécifique
   */
  async getVerset(sourateNumero: number, versetNumero: number): Promise<Verset> {
    try {
      const data = await apiClient.get(
        `/versets/sourate/${sourateNumero}/verset/${versetNumero}`
      );
      return data;
    } catch (error) {
      console.error(`Error fetching verset ${sourateNumero}:${versetNumero}:`, error);
      throw error;
    }
  }
}

// Export singleton
export const quranService = new QuranService();
