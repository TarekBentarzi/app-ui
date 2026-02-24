import { useState, useEffect, useCallback } from 'react';
import { BookmarkStorage, Bookmark } from '@/infra/secondary/storage/BookmarkStorage';

interface UseBookmarksResult {
  bookmarks: Bookmark[];
  isBookmarked: (sourateNumero: number, versetNumero: number) => Promise<boolean>;
  toggleBookmark: (sourateNumero: number, versetNumero: number, sourateNom: string) => Promise<void>;
  addBookmark: (sourateNumero: number, versetNumero: number, sourateNom: string, note?: string) => Promise<Bookmark | null>;
  removeBookmark: (sourateNumero: number, versetNumero: number) => Promise<void>;
  updateNote: (sourateNumero: number, versetNumero: number, note: string) => Promise<void>;
  clearAll: () => Promise<void>;
  loading: boolean;
}

/**
 * Hook pour gérer les marque-pages
 */
export function useBookmarks(userId: string | null): UseBookmarksResult {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les marque-pages au montage
  useEffect(() => {
    if (!userId) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    const loadBookmarks = async () => {
      setLoading(true);
      try {
        const data = await BookmarkStorage.getAllBookmarks(userId);
        setBookmarks(data);
        console.log(`[useBookmarks] ${data.length} marque-pages chargés`);
      } catch (error) {
        console.error('[useBookmarks] Erreur chargement:', error);
        setBookmarks([]);
      } finally {
        setLoading(false);
      }
    };

    loadBookmarks();
  }, [userId]);

  /**
   * Vérifie si un verset est marqué
   */
  const isBookmarked = useCallback(async (sourateNumero: number, versetNumero: number): Promise<boolean> => {
    if (!userId) return false;
    return await BookmarkStorage.isBookmarked(userId, sourateNumero, versetNumero);
  }, [userId]);

  /**
   * Toggle un marque-page (ajouter si absent, supprimer si présent)
   */
  const toggleBookmark = useCallback(async (sourateNumero: number, versetNumero: number, sourateNom: string) => {
    if (!userId) {
      console.warn('[useBookmarks] Utilisateur non connecté');
      return;
    }

    try {
      const alreadyBookmarked = await BookmarkStorage.isBookmarked(userId, sourateNumero, versetNumero);
      
      if (alreadyBookmarked) {
        await BookmarkStorage.removeBookmark(userId, sourateNumero, versetNumero);
        setBookmarks(prev => prev.filter(b => 
          !(b.sourateNumero === sourateNumero && b.versetNumero === versetNumero)
        ));
      } else {
        const newBookmark = await BookmarkStorage.addBookmark(userId, sourateNumero, versetNumero, sourateNom);
        setBookmarks(prev => [newBookmark, ...prev]);
      }
    } catch (error) {
      console.error('[useBookmarks] Erreur toggle:', error);
    }
  }, [userId]);

  /**
   * Ajoute un marque-page
   */
  const addBookmark = useCallback(async (sourateNumero: number, versetNumero: number, sourateNom: string, note?: string): Promise<Bookmark | null> => {
    if (!userId) {
      console.warn('[useBookmarks] Utilisateur non connecté');
      return null;
    }

    try {
      const newBookmark = await BookmarkStorage.addBookmark(userId, sourateNumero, versetNumero, sourateNom, note);
      setBookmarks(prev => {
        const exists = prev.some(b => b.id === newBookmark.id);
        if (exists) return prev;
        return [newBookmark, ...prev];
      });
      return newBookmark;
    } catch (error) {
      console.error('[useBookmarks] Erreur ajout:', error);
      return null;
    }
  }, [userId]);

  /**
   * Supprime un marque-page
   */
  const removeBookmark = useCallback(async (sourateNumero: number, versetNumero: number) => {
    if (!userId) return;

    try {
      await BookmarkStorage.removeBookmark(userId, sourateNumero, versetNumero);
      setBookmarks(prev => prev.filter(b => 
        !(b.sourateNumero === sourateNumero && b.versetNumero === versetNumero)
      ));
    } catch (error) {
      console.error('[useBookmarks] Erreur suppression:', error);
    }
  }, [userId]);

  /**
   * Met à jour la note d'un marque-page
   */
  const updateNote = useCallback(async (sourateNumero: number, versetNumero: number, note: string) => {
    if (!userId) return;

    try {
      await BookmarkStorage.updateNote(userId, sourateNumero, versetNumero, note);
      setBookmarks(prev => prev.map(b => 
        b.sourateNumero === sourateNumero && b.versetNumero === versetNumero
          ? { ...b, note }
          : b
      ));
    } catch (error) {
      console.error('[useBookmarks] Erreur mise à jour note:', error);
    }
  }, [userId]);

  /**
   * Supprime tous les marque-pages
   */
  const clearAll = useCallback(async () => {
    if (!userId) return;

    try {
      await BookmarkStorage.clearAllBookmarks(userId);
      setBookmarks([]);
    } catch (error) {
      console.error('[useBookmarks] Erreur suppression totale:', error);
    }
  }, [userId]);

  return {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    addBookmark,
    removeBookmark,
    updateNote,
    clearAll,
    loading,
  };
}
