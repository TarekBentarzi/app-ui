import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MemorizingScreen } from './MemorizingScreen';

jest.mock('lucide-react-native', () => ({
    ArrowLeft: 'ArrowLeft',
    Brain: 'Brain',
    Check: 'Check',
    X: 'X',
    Trophy: 'Trophy',
}));

const mockUpdateProgress = jest.fn();

jest.mock('@/shared/contexts/UserProgressContext', () => ({
    useUserProgress: jest.fn(() => ({
        progress: { versesMemorized: 0 },
        updateProgress: mockUpdateProgress,
    })),
}));

describe('MemorizingScreen', () => {
    const mockNavigation = {
        goBack: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render memorizing screen', () => {
        const { toJSON } = render(<MemorizingScreen navigation={mockNavigation} />);
        expect(toJSON()).toBeDefined();
    });

    it('should render exercise question', () => {
        const { toJSON } = render(<MemorizingScreen navigation={mockNavigation} />);
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('Complete the verse from Surah Al-Fatiha');
    });

    it('should render answer options', () => {
        const { toJSON } = render(<MemorizingScreen navigation={mockNavigation} />);
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('الْعَالَمِينَ');
    });

    it('should handle back button press', () => {
        const { getByTestId } = render(<MemorizingScreen navigation={mockNavigation} />);
        const backButton = getByTestId('back-button');
        fireEvent.press(backButton);
        
        expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    it('should handle correct answer selection', () => {
        const { getByTestId, toJSON } = render(<MemorizingScreen navigation={mockNavigation} />);
        
        // Select correct answer
        const correctOption = getByTestId('option-الْعَالَمِينَ');
        fireEvent.press(correctOption);
        
        // Check score updated (looking for "10" and "pts" separately)
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('"10"');
        expect(rendered).toContain('pts');
        
        // Check updateProgress was called
        expect(mockUpdateProgress).toHaveBeenCalledWith({
            versesMemorized: 1,
        });
        
        // Check feedback appears
        expect(rendered).toContain('Correct!');
    });

    it('should handle incorrect answer selection', () => {
        const { getByTestId, toJSON } = render(<MemorizingScreen navigation={mockNavigation} />);
        
        // Select incorrect answer (using one of the actual options from the exercise)
        const incorrectOption = getByTestId('option-الرَّحِيمِ');
        fireEvent.press(incorrectOption);
        
        // Check score not updated
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('"0"');
        
        // Check updateProgress was not called for incorrect answer
        expect(mockUpdateProgress).not.toHaveBeenCalled();
        
        // Check feedback appears
        expect(rendered).toContain('Not quite right');
    });

    it('should disable options after selection', () => {
        const { getByTestId } = render(<MemorizingScreen navigation={mockNavigation} />);
        
        // Select first option
        const firstOption = getByTestId('option-الْعَالَمِينَ');
        fireEvent.press(firstOption);
        
        // Try to select another option (should be disabled)
        const secondOption = getByTestId('option-الرَّحِيمِ');
        fireEvent.press(secondOption);
        
        // Only first selection should count
        expect(mockUpdateProgress).toHaveBeenCalledTimes(1);
    });

    it('should show continue button after answer', () => {
        const { getByTestId, toJSON } = render(<MemorizingScreen navigation={mockNavigation} />);
        
        // Select an option
        const option = getByTestId('option-الْعَالَمِينَ');
        fireEvent.press(option);
        
        // Check continue button appears
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('Continue');
    });

    it('should navigate back when continue button is pressed', () => {
        const { getByTestId } = render(<MemorizingScreen navigation={mockNavigation} />);
        
        // Select an option first
        const option = getByTestId('option-الْعَالَمِينَ');
        fireEvent.press(option);
        
        // Press continue button
        const continueButton = getByTestId('continue-button');
        fireEvent.press(continueButton);
        
        expect(mockNavigation.goBack).toHaveBeenCalled();
    });
});
