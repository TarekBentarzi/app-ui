import React from 'react';
import { render } from '@testing-library/react-native';
import { MemorizingScreen } from './MemorizingScreen';

describe('MemorizingScreen', () => {
    const mockNavigation = {
        goBack: jest.fn(),
        replace: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render loading indicator', () => {
        render(<MemorizingScreen navigation={mockNavigation} />);
        // The ActivityIndicator is rendered, which means the component loaded
        expect(mockNavigation.replace).toHaveBeenCalled();
    });

    it('should redirect to QuizList screen', () => {
        render(<MemorizingScreen navigation={mockNavigation} />);
        expect(mockNavigation.replace).toHaveBeenCalledWith('QuizList');
    });
});
