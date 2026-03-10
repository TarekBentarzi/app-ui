import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QuizScreen } from './QuizScreen';
import { quizService } from '@/infra/secondary/quran';

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (params) {
        return `${key}_${JSON.stringify(params)}`;
      }
      return key;
    },
  }),
}));

jest.mock('lucide-react-native', () => ({
  ArrowLeft: 'ArrowLeft',
  Check: 'Check',
  X: 'X',
  Trophy: 'Trophy',
  RefreshCw: 'RefreshCw',
}));

jest.mock('@/shared/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
  })),
}));

jest.mock('@/shared/hooks', () => ({
  useSourates: jest.fn(() => ({
    sourates: [
      { numero: 1, nomTraduction: 'Al-Fatiha', nombre_versets: 7 },
      { numero: 2, nomTraduction: 'Al-Baqara', nombre_versets: 286 },
    ],
  })),
}));

jest.mock('@/infra/secondary/quran', () => ({
  quizService: {
    getNewQuestions: jest.fn(),
    getDailyQuiz: jest.fn(),
    submitAnswer: jest.fn(),
  },
  QuizQuestion: {},
}));

jest.mock('../components/QuizResultModal', () => ({
  QuizResultModal: 'QuizResultModal',
}));

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

const mockQuestions = [
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

describe('QuizScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (quizService.getNewQuestions as jest.Mock).mockResolvedValue(mockQuestions);
    (quizService.getDailyQuiz as jest.Mock).mockResolvedValue(mockQuestions);
    (quizService.submitAnswer as jest.Mock).mockResolvedValue({ success: true });
  });

  it('should render loading state initially', () => {
    const { toJSON } = render(
      <QuizScreen
        navigation={mockNavigation}
        route={{ params: { sourateNumero: 1, isNew: true } }}
      />
    );

    const rendered = JSON.stringify(toJSON());
    expect(rendered).toContain('quiz.loading_questions');
  });

  it('should load new questions when isNew is true', async () => {
    render(
      <QuizScreen
        navigation={mockNavigation}
        route={{ params: { sourateNumero: 1, isNew: true } }}
      />
    );

    await waitFor(() => {
      expect(quizService.getNewQuestions).toHaveBeenCalledWith('test-user-id', 1, 5);
    });
  });

  it('should load daily quiz when isNew is false', async () => {
    render(
      <QuizScreen
        navigation={mockNavigation}
        route={{ params: { sourateNumero: 1, isNew: false } }}
      />
    );

    await waitFor(() => {
      expect(quizService.getDailyQuiz).toHaveBeenCalledWith('test-user-id', 1);
    });
  });

  it('should display quiz questions after loading', async () => {
    const { toJSON } = render(
      <QuizScreen
        navigation={mockNavigation}
        route={{ params: { sourateNumero: 1, isNew: true } }}
      />
    );

    await waitFor(() => {
      const rendered = JSON.stringify(toJSON());
      expect(rendered).toContain(mockQuestions[0].texteWithBlank);
    });
  });

  it('should handle answer selection', async () => {
    const { getByTestId, getByText } = render(
      <QuizScreen
        navigation={mockNavigation}
        route={{ params: { sourateNumero: 1, isNew: true } }}
      />
    );

    await waitFor(() => {
      expect(getByText(mockQuestions[0].texteWithBlank)).toBeDefined();
    });

    const correctOption = getByTestId(`option-${mockQuestions[0].correctAnswer}`);
    fireEvent.press(correctOption);

    await waitFor(() => {
      expect(quizService.submitAnswer).toHaveBeenCalledWith(
        'test-user-id',
        mockQuestions[0].id,
        mockQuestions[0].correctAnswer
      );
    });
  });

  it('should update score when answer is correct', async () => {
    const { getByTestId, toJSON } = render(
      <QuizScreen
        navigation={mockNavigation}
        route={{ params: { sourateNumero: 1, isNew: true } }}
      />
    );

    await waitFor(() => {
      expect(JSON.stringify(toJSON())).toContain(mockQuestions[0].texteWithBlank);
    });

    expect(JSON.stringify(toJSON())).toContain('0 pts');
    
    const correctOption = getByTestId(`option-${mockQuestions[0].correctAnswer}`);
    fireEvent.press(correctOption);

    await waitFor(() => {
      expect(JSON.stringify(toJSON())).toContain('1 pts');
    });
  });

  it('should navigate back when back button is pressed', async () => {
    const { getByTestId } = render(
      <QuizScreen
        navigation={mockNavigation}
        route={{ params: { sourateNumero: 1, isNew: true } }}
      />
    );

    await waitFor(() => {
      const backButton = getByTestId('back-button');
      fireEvent.press(backButton);
    });

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('should show no questions message when quiz is empty', async () => {
    (quizService.getNewQuestions as jest.Mock).mockResolvedValue([]);

    const { toJSON } = render(
      <QuizScreen
        navigation={mockNavigation}
        route={{ params: { sourateNumero: 1, isNew: true } }}
      />
    );

    await waitFor(() => {
      const rendered = JSON.stringify(toJSON());
      expect(rendered).toContain('quiz.no_questions');
      expect(rendered).toContain('quiz.try_again_later');
    });
  });

  it('should handle quiz completion', async () => {
    const singleQuestionMock = [mockQuestions[0]];
    (quizService.getNewQuestions as jest.Mock).mockResolvedValue(singleQuestionMock);

    const { getByTestId } = render(
      <QuizScreen
        navigation={mockNavigation}
        route={{ params: { sourateNumero: 1, isNew: true } }}
      />
    );

    await waitFor(() => {
      const correctOption = getByTestId(`option-${singleQuestionMock[0].correctAnswer}`);
      fireEvent.press(correctOption);
    });

    // Quiz should be completed after answering the only question
    await waitFor(() => {
      expect(quizService.submitAnswer).toHaveBeenCalled();
    });
  });

  it('should handle error when loading quiz fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (quizService.getNewQuestions as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(
      <QuizScreen
        navigation={mockNavigation}
        route={{ params: { sourateNumero: 1, isNew: true } }}
      />
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading quiz:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('should handle error when submitting answer fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (quizService.submitAnswer as jest.Mock).mockRejectedValue(new Error('Submit error'));

    const { getByTestId } = render(
      <QuizScreen
        navigation={mockNavigation}
        route={{ params: { sourateNumero: 1, isNew: true } }}
      />
    );

    await waitFor(() => {
      const correctOption = getByTestId(`option-${mockQuestions[0].correctAnswer}`);
      fireEvent.press(correctOption);
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error submitting answer:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('should not allow selecting multiple answers', async () => {
    const { getByTestId } = render(
      <QuizScreen
        navigation={mockNavigation}
        route={{ params: { sourateNumero: 1, isNew: true } }}
      />
    );

    await waitFor(() => {
      const firstOption = getByTestId(`option-${mockQuestions[0].options[0]}`);
      fireEvent.press(firstOption);
    });

    await waitFor(() => {
      expect(quizService.submitAnswer).toHaveBeenCalledTimes(1);
    });

    // Try to select another option
    const secondOption = getByTestId(`option-${mockQuestions[0].options[1]}`);
    fireEvent.press(secondOption);

    // Should still be called only once
    expect(quizService.submitAnswer).toHaveBeenCalledTimes(1);
  });
});
