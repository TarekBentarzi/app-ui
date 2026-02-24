/**
 * Storage local pour la progression de lecture
 * Fallback si l'API n'est pas disponible
 */
import { UniversalStorage } from './UniversalStorage';

export type ReadingMode = 'verse' | 'page' | 'mushaf';

interface LocalProgress {
  userId: string;
  sourateNumero: number;
  versetNumero: number;
  mode: ReadingMode;
  lastUpdated: string;
}

const PROGRESS_KEY = '@qlearn:progress';

export class ProgressStorage {
  /**
   * Sauvegarde la progression localement
   */
  static async saveProgress(userId: string, sourateNumero: number, versetNumero: number, mode: ReadingMode = 'verse'): Promise<void> {
    try {
      const progress: LocalProgress = {
        userId,
        sourateNumero,
        versetNumero,
        mode,
        lastUpdated: new Date().toISOString(),
      };
      
      const key = `${PROGRESS_KEY}:${mode}:${userId}`;
      await UniversalStorage.setItem(key, JSON.stringify(progress));
      console.log(`[ProgressStorage] Sauvegarde locale réussie (${mode}):`, progress);
    } catch (error) {
      console.error('[ProgressStorage] Erreur sauvegarde locale:', error);
    }
  }

  /**
   * Récupère la progression locale
   */
  static async getProgress(userId: string, mode: ReadingMode = 'verse'): Promise<LocalProgress | null> {
    try {
      const key = `${PROGRESS_KEY}:${mode}:${userId}`;
      const data = await UniversalStorage.getItem(key);
      
      if (!data) {
        console.log(`[ProgressStorage] Aucune progression locale trouvée (${mode})`);
        return null;
      }

      const progress = JSON.parse(data) as LocalProgress;
      console.log(`[ProgressStorage] Progression locale chargée (${mode}):`, progress);
      return progress;
    } catch (error) {
      console.error('[ProgressStorage] Erreur chargement local:', error);
      return null;
    }
  }

  /**
   * Supprime la progression locale pour un mode spécifique ou tous les modes
   */
  static async clearProgress(userId: string, mode?: ReadingMode): Promise<void> {
    try {
      if (mode) {
        // Supprimer un mode spécifique
        const key = `${PROGRESS_KEY}:${mode}:${userId}`;
        await UniversalStorage.removeItem(key);
        console.log(`[ProgressStorage] Progression locale supprimée (${mode})`);
      } else {
        // Supprimer tous les modes
        const modes: ReadingMode[] = ['verse', 'page', 'mushaf'];
        await Promise.all(modes.map(async m => {
          const key = `${PROGRESS_KEY}:${m}:${userId}`;
          await UniversalStorage.removeItem(key);
        }));
        console.log('[ProgressStorage] Toutes les progressions locales supprimées');
      }
    } catch (error) {
      console.error('[ProgressStorage] Erreur suppression locale:', error);
    }
  }

  /**
   * Récupère toutes les progressions locales (pour sync future)
   */
  static async getAllProgress(): Promise<LocalProgress[]> {
    const progressList: LocalProgress[] = [];
    
    try {
      const keys = await UniversalStorage.getAllKeys();
      const progressKeys = keys.filter(key => key.startsWith(PROGRESS_KEY));
      
      for (const key of progressKeys) {
        const data = await UniversalStorage.getItem(key);
        if (data) {
          try {
            progressList.push(JSON.parse(data));
          } catch (e) {
            console.error('[ProgressStorage] Erreur parsing:', e);
          }
        }
      }
    } catch (error) {
      console.error('[ProgressStorage] Erreur récupération globale:', error);
    }
    
    return progressList;
  }
}
