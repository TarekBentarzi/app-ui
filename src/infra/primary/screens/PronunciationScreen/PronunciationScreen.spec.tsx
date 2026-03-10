import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { PronunciationScreen } from './PronunciationScreen';

jest.mock('lucide-react-native', () => ({
    ArrowLeft: 'ArrowLeft',
    Mic: 'Mic',
    Volume2: 'Volume2',
    Award: 'Award',
    RotateCcw: 'RotateCcw',
}));

const mockUpdateProgress = jest.fn();

jest.mock('@/shared/contexts/UserProgressContext', () => ({
    useUserProgress: jest.fn(() => ({
        progress: { pronunciationScore: 0 },
        updateProgress: mockUpdateProgress,
    })),
}));

describe('PronunciationScreen', () => {
    const mockNavigation = {
        goBack: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    it('should render pronunciation screen', () => {
        const { toJSON } = render(<PronunciationScreen navigation={mockNavigation} />);
        expect(toJSON()).toBeDefined();
    });

    it('should render verse to practice', () => {
        const { toJSON } = render(<PronunciationScreen navigation={mockNavigation} />);
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('بِسْمِ اللَّهِ');
        expect(rendered).toContain('Bismillāhi r-raḥmāni r-raḥīm');
        expect(rendered).toContain('In the name of Allah');
    });

    it('should render tajweed rules', () => {
        const { toJSON } = render(<PronunciationScreen navigation={mockNavigation} />);
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('Key Tajweed Rules');
        expect(rendered).toContain('Rahmāni');
        expect(rendered).toContain('elongation');
    });

    it('should handle back button press', () => {
        const { getByTestId } = render(<PronunciationScreen navigation={mockNavigation} />);
        const backButton = getByTestId('back-button');
        fireEvent.press(backButton);
        
        expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    it('should show initial recording state', () => {
        const { toJSON } = render(<PronunciationScreen navigation={mockNavigation} />);
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('Tap to start recording');
        expect(rendered).toContain('Your Recording');
    });

    it('should handle recording button press to start', () => {
        const { getByTestId, toJSON } = render(<PronunciationScreen navigation={mockNavigation} />);
        const recordButton = getByTestId('record-button');
        
        // Start recording
        fireEvent.press(recordButton);
        
        let rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('Tap to stop recording');
    });

    it('should complete recording and show results', () => {
        jest.useFakeTimers();
        const { getByTestId, toJSON } = render(<PronunciationScreen navigation={mockNavigation} />);
        const recordButton = getByTestId('record-button');
        
        // Start recording
        act(() => {
            fireEvent.press(recordButton);
        });
        
        // Stop recording
        act(() => {
            fireEvent.press(recordButton);
            jest.runAllTimers();
        });
        
        // Check results are shown
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('Great Job!');
        expect(rendered).toContain('"88"');
        expect(rendered).toContain('Your pronunciation is very good');
        
        // Check updateProgress was called
        expect(mockUpdateProgress).toHaveBeenCalledWith({
            pronunciationScore: 88,
        });
        
        jest.useRealTimers();
    });

    it('should show recording again hint after first recording', () => {
        jest.useFakeTimers();
        const { getByTestId, toJSON } = render(<PronunciationScreen navigation={mockNavigation} />);
        const recordButton = getByTestId('record-button');
        
        // Complete one recording cycle
        act(() => {
            fireEvent.press(recordButton);
        });
        
        act(() => {
            fireEvent.press(recordButton);
            jest.runAllTimers();
        });
        
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('Tap to record again');
        
        jest.useRealTimers();
    });

    it('should show tajweed analysis with correct rules', () => {
        jest.useFakeTimers();
        const { getByTestId, toJSON } = render(<PronunciationScreen navigation={mockNavigation} />);
        const recordButton = getByTestId('record-button');
        
        // Complete recording to show results
        act(() => {
            fireEvent.press(recordButton);
        });
        
        act(() => {
            fireEvent.press(recordButton);
            jest.runAllTimers();
        });
        
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('Tajweed Analysis');
        expect(rendered).toContain('Ghunnah');
        expect(rendered).toContain('Nasal sound held for 2 counts');
        
        jest.useRealTimers();
    });

    it('should show tajweed analysis with incorrect rules', () => {
        jest.useFakeTimers();
        const { getByTestId, toJSON } = render(<PronunciationScreen navigation={mockNavigation} />);
        const recordButton = getByTestId('record-button');
        
        // Complete recording to show results
        act(() => {
            fireEvent.press(recordButton);
        });
        
        act(() => {
            fireEvent.press(recordButton);
            jest.runAllTimers();
        });
        
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('Madd');
        expect(rendered).toContain('Elongation - should be longer');
        
        jest.useRealTimers();
    });

    it('should show all tajweed rule types', () => {
        jest.useFakeTimers();
        const { getByTestId, toJSON } = render(<PronunciationScreen navigation={mockNavigation} />);
        const recordButton = getByTestId('record-button');
        
        // Complete recording
        act(() => {
            fireEvent.press(recordButton);
        });
        
        act(() => {
            fireEvent.press(recordButton);
            jest.runAllTimers();
        });
        
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('Qalqalah');
        expect(rendered).toContain('Echo/bouncing sound');
        expect(rendered).toContain('Idghaam');
        expect(rendered).toContain('Merging sounds');
        
        jest.useRealTimers();
    });

    it('should navigate back when continue button is pressed', () => {
        jest.useFakeTimers();
        const { getByTestId } = render(<PronunciationScreen navigation={mockNavigation} />);
        const recordButton = getByTestId('record-button');
        
        // Complete recording to show results
        act(() => {
            fireEvent.press(recordButton);
        });
        
        act(() => {
            fireEvent.press(recordButton);
            jest.runAllTimers();
        });
        
        // Press continue button
        const continueButton = getByTestId('continue-button');
        fireEvent.press(continueButton);
        
        expect(mockNavigation.goBack).toHaveBeenCalled();
        
        jest.useRealTimers();
    });

    it('should show retry button in results', () => {
        jest.useFakeTimers();
        const { getByTestId, toJSON } = render(<PronunciationScreen navigation={mockNavigation} />);
        const recordButton = getByTestId('record-button');
        
        // Complete recording
        act(() => {
            fireEvent.press(recordButton);
        });
        
        act(() => {
            fireEvent.press(recordButton);
            jest.runAllTimers();
        });
        
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('Try Again');
        
        jest.useRealTimers();
    });

    it('should show listen button', () => {
        const { toJSON } = render(<PronunciationScreen navigation={mockNavigation} />);
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('Listen to Correct Pronunciation');
    });

    it('should display score overview', () => {
        const { toJSON } = render(<PronunciationScreen navigation={mockNavigation} />);
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('Overall Accuracy');
        expect(rendered).toContain('85%');
    });

    it('should render tajweed rules in info box', () => {
        const { toJSON } = render(<PronunciationScreen navigation={mockNavigation} />);
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('Pay attention to the Madd');
        expect(rendered).toContain('Proper pronunciation');
        expect(rendered).toContain('Clear articulation');
    });

    it('should show score percentage in results', () => {
        jest.useFakeTimers();
        const { getByTestId, toJSON } = render(<PronunciationScreen navigation={mockNavigation} />);
        const recordButton = getByTestId('record-button');
        
        // Complete recording
        act(() => {
            fireEvent.press(recordButton);
        });
        
        act(() => {
            fireEvent.press(recordButton);
            jest.runAllTimers();
        });
        
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('"88"');
        expect(rendered).toContain('"%"');
        
        jest.useRealTimers();
    });
});
