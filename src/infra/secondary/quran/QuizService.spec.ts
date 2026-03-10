import { quizService } from './QuizService';
import { apiClient } from '@/infra/secondary/api/apiClient';
import { QuizQuestion, QuizAttempt, SourateQuizStats } from './types';

// Mock apiClient
jest.mock('@/infra/secondary/api/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    setToken: jest.fn(),
  },
}));

const mockQuizStats: SourateQuizStats[] = [
  {
    sourateNumero: 1,
    totalVersets: 7,
    totalQuestions: 10,
    questionsAnswered: 8,
    correctAnswers: 8,
    lastAttemptDate: '2024-01-01T00:00:00.000Z',
    dailyQuestionsRemaining: 2,
  },
];

const mockQuizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    versetId: 'v1',
    versetNumero: 1,
    texteArabe: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    texteWithBlank: 'Au nom d\'Allah, le Tout ____, le Très Miséricordieux',
    correctAnswer: 'Miséricordieux',
    options: ['Miséricordieux', 'Puissant', 'Sage', 'Clément'],
    wordPosition: 4,
  },
  {
    id: 'q2',
    versetId: 'v2',
    versetNumero: 2,
    texteArabe: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    texteWithBlank: 'Louange à Allah, ____ des mondes',
    correctAnswer: 'Seigneur',
    options: ['Seigneur', 'Créateur', 'Maître', 'Roi'],
    wordPosition: 3,
  },
];

const mockQuizAttempt: QuizAttempt = {
  id: 'attempt1',
  userId: 'user1',
  sourateNumero: 1,
  questionId: 'q1',
  selectedAnswer: 'Miséricordieux',
  isCorrect: true,
  attemptedAt: '2024-01-01T00:00:00.000Z',
};

describe('QuizService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setAuthToken', () => {
    it('should set authentication token', () => {
      quizService.setAuthToken('test-token');
      expect(apiClient.setToken).toHaveBeenCalledWith('test-token');
    });
  });

  describe('getUserQuizStats', () => {
    it('should fetch user quiz stats', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockQuizStats);

      const result = await quizService.getUserQuizStats('user1');

      expect(apiClient.get).toHaveBeenCalledWith('/users/user1/quiz/stats');
      expect(result).toEqual(mockQuizStats);
    });

    it('should handle errors when fetching quiz stats', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('API error'));

      await expect(quizService.getUserQuizStats('user1')).rejects.toThrow('API error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching quiz stats:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getDailyQuiz', () => {
    it('should fetch daily quiz questions', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockQuizQuestions);

      const result = await quizService.getDailyQuiz('user1', 1);

      expect(apiClient.get).toHaveBeenCalledWith('/users/user1/quiz/sourate/1/daily');
      expect(result).toEqual(mockQuizQuestions);
    });

    it('should handle errors when fetching daily quiz', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('API error'));

      await expect(quizService.getDailyQuiz('user1', 1)).rejects.toThrow('API error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching daily quiz:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getNewQuestions', () => {
    it('should fetch new quiz questions with default count', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockQuizQuestions);

      const result = await quizService.getNewQuestions('user1', 1);

      expect(apiClient.get).toHaveBeenCalledWith('/users/user1/quiz/sourate/1/new?count=5');
      expect(result).toEqual(mockQuizQuestions);
    });

    it('should fetch new quiz questions with custom count', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockQuizQuestions);

      const result = await quizService.getNewQuestions('user1', 1, 10);

      expect(apiClient.get).toHaveBeenCalledWith('/users/user1/quiz/sourate/1/new?count=10');
      expect(result).toEqual(mockQuizQuestions);
    });

    it('should handle errors when fetching new questions', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('API error'));

      await expect(quizService.getNewQuestions('user1', 1)).rejects.toThrow('API error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching new questions:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('submitAnswer', () => {
    it('should submit quiz answer', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockQuizAttempt);

      const result = await quizService.submitAnswer('user1', 'q1', 'Miséricordieux');

      expect(apiClient.post).toHaveBeenCalledWith('/users/user1/quiz/answer', {
        questionId: 'q1',
        selectedAnswer: 'Miséricordieux',
      });
      expect(result).toEqual(mockQuizAttempt);
    });

    it('should handle errors when submitting answer', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('API error'));

      await expect(quizService.submitAnswer('user1', 'q1', 'Wrong')).rejects.toThrow('API error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error submitting quiz answer:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('unlockSourate', () => {
    it('should unlock a sourate', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({});

      await quizService.unlockSourate('user1', 1);

      expect(apiClient.post).toHaveBeenCalledWith('/users/user1/memorization/sourate/1/unlock', {});
    });

    it('should handle errors when unlocking sourate', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('API error'));

      await expect(quizService.unlockSourate('user1', 1)).rejects.toThrow('API error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error unlocking sourate:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('markSourateAsMemorized', () => {
    it('should mark sourate as memorized', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({});

      await quizService.markSourateAsMemorized('user1', 1);

      expect(apiClient.post).toHaveBeenCalledWith('/users/user1/memorization/sourate/1/complete', {});
    });

    it('should handle errors when marking sourate as memorized', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('API error'));

      await expect(quizService.markSourateAsMemorized('user1', 1)).rejects.toThrow('API error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error marking sourate as memorized:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getMemorizedSourates', () => {
    it('should fetch memorized sourates', async () => {
      const mockSourates = [1, 2, 3];
      (apiClient.get as jest.Mock).mockResolvedValue(mockSourates);

      const result = await quizService.getMemorizedSourates('user1');

      expect(apiClient.get).toHaveBeenCalledWith('/users/user1/memorization/sourates');
      expect(result).toEqual(mockSourates);
    });

    it('should handle errors when fetching memorized sourates', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('API error'));

      await expect(quizService.getMemorizedSourates('user1')).rejects.toThrow('API error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching memorized sourates:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });
});
