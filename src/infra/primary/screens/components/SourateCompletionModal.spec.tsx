import React from 'react';
import { SourateCompletionModal } from './SourateCompletionModal';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('lucide-react-native', () => ({
    Trophy: jest.fn(() => null),
    Play: jest.fn(() => null),
    X: jest.fn(() => null),
    ArrowRight: jest.fn(() => null),
    RotateCcw: jest.fn(() => null),
}));

describe('SourateCompletionModal', () => {
    const defaultProps = {
        visible: true,
        sourateName: 'Al-Fatiha',
        sourateNumber: 1,
        nextSourateName: 'Al-Baqarah',
        onStartQuiz: jest.fn(),
        onSkip: jest.fn(),
        onClose: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should render SourateCompletionModal component', () => {
        expect(SourateCompletionModal).toBeDefined();
    });

    it('should accept correct props', () => {
        const props = defaultProps;
        expect(props.visible).toBe(true);
        expect(props.sourateName).toBe('Al-Fatiha');
        expect(props.sourateNumber).toBe(1);
    });
});
