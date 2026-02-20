import { apiClient } from '@/infra/secondary/api/apiClient';
import { QuizQuestion, QuizAttempt, SourateQuizStats } from './types';

class QuizService {
  /**
   * Configure le token d'authentification
   */
  setAuthToken(token: string) {
    apiClient.setToken(token);
  }

  /**
   * Récupère les statistiques des quiz pour toutes les sourates mémorisées
   */
  async getUserQuizStats(userId: string): Promise<SourateQuizStats[]> {
    try {
      const data = await apiClient.get(`/users/${userId}/quiz/stats`);
      return data;
    } catch (error) {
      console.error('Error fetching quiz stats:', error);
      throw error;
    }
  }

  /**
   * Obtient un nouveau quiz pour une sourate (5 questions aléatoires par jour)
   */
  async getDailyQuiz(
    userId: string,
    sourateNumero: number
  ): Promise<QuizQuestion[]> {
    try {
      const data = await apiClient.get(
        `/users/${userId}/quiz/sourate/${sourateNumero}/daily`
      );
      return data;
    } catch (error) {
      console.error('Error fetching daily quiz:', error);
      throw error;
    }
  }

  /**
   * Obtient un quiz personnalisé avec des questions non encore répondues
   */
  async getNewQuestions(
    userId: string,
    sourateNumero: number,
    count: number = 5
  ): Promise<QuizQuestion[]> {
    try {
      const data = await apiClient.get(
        `/users/${userId}/quiz/sourate/${sourateNumero}/new?count=${count}`
      );
      return data;
    } catch (error) {
      console.error('Error fetching new questions:', error);
      throw error;
    }
  }

  /**
   * Soumet une réponse à une question de quiz
   */
  async submitAnswer(
    userId: string,
    questionId: string,
    selectedAnswer: string
  ): Promise<QuizAttempt> {
    try {
      const data = await apiClient.post(`/users/${userId}/quiz/answer`, {
        questionId,
        selectedAnswer,
      });
      return data;
    } catch (error) {
      console.error('Error submitting quiz answer:', error);
      throw error;
    }
  }

  /**
   * Débloque une sourate pour le quiz (quand on l'a lue)
   */
  async unlockSourate(
    userId: string,
    sourateNumero: number
  ): Promise<void> {
    try {
      await apiClient.post(`/users/${userId}/memorization/sourate/${sourateNumero}/unlock`, {});
    } catch (error) {
      console.error('Error unlocking sourate:', error);
      throw error;
    }
  }

  /**
   * Marque une sourate comme complètement mémorisée
   */
  async markSourateAsMemorized(
    userId: string,
    sourateNumero: number
  ): Promise<void> {
    try {
      await apiClient.post(`/users/${userId}/memorization/sourate/${sourateNumero}/complete`, {});
    } catch (error) {
      console.error('Error marking sourate as memorized:', error);
      throw error;
    }
  }

  /**
   * Obtient la liste des sourates mémorisées par l'utilisateur
   */
  async getMemorizedSourates(userId: string): Promise<number[]> {
    try {
      const data = await apiClient.get(`/users/${userId}/memorization/sourates`);
      return data;
    } catch (error) {
      console.error('Error fetching memorized sourates:', error);
      throw error;
    }
  }
}

// Export singleton
export const quizService = new QuizService();
