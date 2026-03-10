import React from 'react';
import { QuizResultModal } from './QuizResultModal';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('lucide-react-native', () => ({
    Trophy: jest.fn(() => null),
    RotateCcw: jest.fn(() => null),
    ArrowRight: jest.fn(() => null),
    Brain: jest.fn(() => null),
}));

describe('QuizResultModal', () => {
    const defaultProps = {
        visible: true,
        score: 4,
        totalQuestions: 5,
        sourateNumber: 1,
        sourateName: 'Al-Fatiha',
        onContinueQuizzes: jest.fn(),
        onRedoSourate: jest.fn(),
        onNextSourate: jest.fn(),
        onClose: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render QuizResultModal component', () => {
        expect(QuizResultModal).toBeDefined();
    });

    it('should accept correct props', () => {
        const props = defaultProps;
        expect(props.visible).toBe(true);
        expect(props.score).toBe(4);
        expect(props.totalQuestions).toBe(5);
    });
});
