/**
 * Storage local pour les marque-pages
 */
import { UniversalStorage } from './UniversalStorage';

export interface Bookmark {
  id: string; // userId:sourateNumero:versetNumero
  userId: string;
  sourateNumero: number;
  versetNumero: number;
  sourateNom: string;
  note?: string;
  createdAt: string;
}

const BOOKMARKS_KEY = '@qlearn:bookmarks';

export class BookmarkStorage {
  /**
   * Ajoute un marque-page
   */
  static async addBookmark(
    userId: string, 
    sourateNumero: number, 
    versetNumero: number,
    sourateNom: string,
    note?: string
  ): Promise<Bookmark> {
    try {
      const bookmarks = await this.getAllBookmarks(userId);
      
      const id = `${userId}:${sourateNumero}:${versetNumero}`;
      
      // Vérifier si le marque-page existe déjà
      const existingIndex = bookmarks.findIndex(b => b.id === id);
      if (existingIndex !== -1) {
        console.log('[BookmarkStorage] Marque-page existe déjà');
        return bookmarks[existingIndex];
      }

      const bookmark: Bookmark = {
        id,
        userId,
        sourateNumero,
        versetNumero,
        sourateNom,
        note,
        createdAt: new Date().toISOString(),
      };

      bookmarks.push(bookmark);
      
      const key = `${BOOKMARKS_KEY}:${userId}`;
      await UniversalStorage.setItem(key, JSON.stringify(bookmarks));
      console.log('[BookmarkStorage] ✅ Marque-page ajouté:', bookmark);

      return bookmark;
    } catch (error) {
      console.error('[BookmarkStorage] ❌ Erreur ajout marque-page:', error);
      throw error;
    }
  }

  /**
   * Supprime un marque-page
   */
  static async removeBookmark(userId: string, sourateNumero: number, versetNumero: number): Promise<void> {
    try {
      const bookmarks = await this.getAllBookmarks(userId);
      const id = `${userId}:${sourateNumero}:${versetNumero}`;
      
      const filtered = bookmarks.filter(b => b.id !== id);
      
      const key = `${BOOKMARKS_KEY}:${userId}`;
      await UniversalStorage.setItem(key, JSON.stringify(filtered));
      console.log('[BookmarkStorage] ✅ Marque-page supprimé:', id);
    } catch (error) {
      console.error('[BookmarkStorage] ❌ Erreur suppression marque-page:', error);
      throw error;
    }
  }

  /**
   * Vérifie si un verset est marqué
   */
  static async isBookmarked(userId: string, sourateNumero: number, versetNumero: number): Promise<boolean> {
    try {
      const bookmarks = await this.getAllBookmarks(userId);
      const id = `${userId}:${sourateNumero}:${versetNumero}`;
      return bookmarks.some(b => b.id === id);
    } catch (error) {
      console.error('[BookmarkStorage] Erreur vérification marque-page:', error);
      return false;
    }
  }

  /**
   * Récupère tous les marque-pages d'un utilisateur
   */
  static async getAllBookmarks(userId: string): Promise<Bookmark[]> {
    try {
      const key = `${BOOKMARKS_KEY}:${userId}`;
      const data = await UniversalStorage.getItem(key);
      
      if (!data) {
        return [];
      }

      const bookmarks = JSON.parse(data) as Bookmark[];
      return bookmarks.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('[BookmarkStorage] Erreur récupération marque-pages:', error);
      return [];
    }
  }

  /**
   * Supprime tous les marque-pages d'un utilisateur
   */
  static async clearAllBookmarks(userId: string): Promise<void> {
    try {
      const key = `${BOOKMARKS_KEY}:${userId}`;
      await UniversalStorage.removeItem(key);
      console.log('[BookmarkStorage] 🗑️ Tous les marque-pages supprimés');
    } catch (error) {
      console.error('[BookmarkStorage] Erreur suppression marque-pages:', error);
      throw error;
    }
  }

  /**
   * Met à jour la note d'un marque-page
   */
  static async updateNote(userId: string, sourateNumero: number, versetNumero: number, note: string): Promise<void> {
    try {
      const bookmarks = await this.getAllBookmarks(userId);
      const id = `${userId}:${sourateNumero}:${versetNumero}`;
      
      const bookmark = bookmarks.find(b => b.id === id);
      if (!bookmark) {
        console.warn('[BookmarkStorage] Marque-page non trouvé');
        return;
      }

      bookmark.note = note;
      
      const key = `${BOOKMARKS_KEY}:${userId}`;
      await UniversalStorage.setItem(key, JSON.stringify(bookmarks));
      console.log('[BookmarkStorage] ✅ Note mise à jour');
    } catch (error) {
      console.error('[BookmarkStorage] Erreur mise à jour note:', error);
      throw error;
    }
  }
}
