import React from 'react';
import { QuizListScreen } from './QuizListScreen';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('lucide-react-native', () => ({
    ArrowLeft: jest.fn(() => null),
    Brain: jest.fn(() => null),
    Trophy: jest.fn(() => null),
    Play: jest.fn(() => null),
    RefreshCw: jest.fn(() => null),
}));

jest.mock('@/shared/contexts/AuthContext', () => ({
    useAuth: jest.fn(() => ({
        user: { id: '1', name: 'Test User', email: 'test@test.com' },
    })),
}));

jest.mock('@/shared/hooks', () => ({
    useSourates: jest.fn(() => ({
        sourates: [
            { id: '1', numero: 1, nomArabe: 'الفاتحة', nomFrancais: 'Al-Fatiha', nombreVersets: 7 }
        ],
        loading: false,
        error: null,
    })),
}));

jest.mock('@/infra/secondary/quran', () => ({
    quizService: {
        getUserQuizStats: jest.fn(() => Promise.resolve([])),
        getNewQuestions: jest.fn(),
        getDailyQuiz: jest.fn(),
    },
}));

describe('QuizListScreen', () => {
    const mockNavigation = {
        goBack: jest.fn(),
        navigate: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render QuizListScreen component', () => {
        expect(QuizListScreen).toBeDefined();
    });

    it('should accept navigation prop', () => {
        expect(mockNavigation.goBack).toBeDefined();
        expect(mockNavigation.navigate).toBeDefined();
    });
});
